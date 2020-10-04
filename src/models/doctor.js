const mongoose = require("mongoose")
const validator = require("validator")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken") 

const doctorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    doctorId: {
        type: Number,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate: (val) => {
            if(val<10000 && val>99999){
                throw new Error("Invalid Id!")
            }
        }
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
                throw new Error("Password should be min 8 char long.")
            }
        }
    },
    speciality: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
        // validate: (val) => {
            //Add speciality value check over here
        // }   
    },
    authTokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ],
    patients: [
        {
            patient: {
                type: mongoose.Schema.Types.ObjectId,
                required: true,
                ref: 'Patient'
            }
        }
    ]
})

doctorSchema.set('toJSON', {virtuals: true})
doctorSchema.set('toObject', {virtuals: true})

doctorSchema.virtual('appointments', {
    ref: 'Appointment',
    localField: '_id',
    foreignField: 'doctors.doctor'
})

doctorSchema.methods.toJSON = function(){
    const user = this.toObject()

    delete user.password
    delete user.authTokens
    // delete user.patients

    return user
}

doctorSchema.methods.generateWebTokens = async function(){
    const token = jwt.sign({_id: this._id.toString()}, process.env.JWT_KEY, {
        expiresIn: 259200
    })
    this.authTokens = [...this.authTokens, {token}]
    await this.save()
    return token
}

doctorSchema.statics.findByCredentials = async (email, password) => {
    const doctor = await Doctor.findOne({email})

    if(!doctor){
        throw new Error("Invalid Credentials!")
    }

    const check = await bcrypt.compare(password, doctor.password)

    if(!check){
        throw new Error("Invalid Credentials!")
    }

    return doctor
}

doctorSchema.pre("save", async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 8)
    }

    next()
})

const Doctor = mongoose.model("Doctor", doctorSchema)

module.exports = Doctor