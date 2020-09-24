const mongoose = require("mongoose")
const validator = require("validator")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        validate: (val) => {
            if(!validator.isEmail(val)){
                throw new Error("Invalid Email!")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate: (val) => {
            if(val.length < 8){
                throw new Error("Password should be min 8 char long!")
            }
        }
    },
    age: {
        type: Number,
        required: true
    },
    authTokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
})

patientSchema.set('toJSON', {virtuals: true})
patientSchema.set('toObject', {virtuals: true})

patientSchema.virtual('doctors', {
    ref: 'Doctor',
    localField: '_id',
    foreignField: 'patients.patient'
})

patientSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'doctors.appointments.patient'
})

patientSchema.methods.toJSON = function(){
    const patient = this.toObject()

    delete patient.authTokens
    delete patient.password

    return patient
}

patientSchema.methods.generateWebTokens = async function(){
    const token = jwt.sign({_id: this._id}, process.env.JWT_KEY)
    this.authTokens = [...this.authTokens, {token}]
    await this.save()
    return token
}

patientSchema.statics.findByCredentials = async (email, password) => {
    const patient = await Patient.findOne({email})

    if(!patient){
        throw new Error ("Invalid Credentials!")
    }

    const check = await bcrypt.compare(password, patient.password)

    if(!check){
        throw new Error("Invalid Credentials!")
    }

    return patient
}

patientSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

const Patient = mongoose.model("Patient", patientSchema)

module.exports = Patient