const Doctor = require('../models/doctor')
const Patient = require('../models/patient')
const jwt = require('jsonwebtoken')

const deleteAuthTokens = async () => {
    try{
        const doctors = await Doctor.find({})
        const patients = await Patient.find({})

        doctors.forEach((doctor) => {
            doctor.authTokens.filter((token) => {
                try{
                    jwt.verify(token, process.env.JWT_KEY)
                    return true
                } catch(e){
                    if(e.name === 'TokenExpiredError'){
                        return false
                    }
                }
            })
        })

        patients.forEach((patient) => {
            patient.authTokens.filter((token) => {
                try{
                    jwt.verify(token, process.env.JWT_KEY)
                    return true
                } catch(e){
                    if(e.name === 'TokenExpiredError'){
                        return false
                    }
                }
            })
        })
    } catch(e){
        console.log(e)
    }
}

module.exports = deleteAuthTokens