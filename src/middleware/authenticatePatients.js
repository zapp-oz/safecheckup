const jwt = require("jsonwebtoken")
const Patient = require("../models/patient")

const authenticate = async (req, res, next) => {
    try{
        const token = req.cookies.auth.replace('Bearer ', '')
        const tokenData = jwt.verify(token, process.env.JWT_KEY) 
        const patient = await Patient.findOne({_id: tokenData._id, "authTokens.token": token})

        if(!patient){
            throw new Error("Please authenticate!")
        }

        req.patient = patient
        req.token = token

        next()
    }catch(e){
        res.status(401).render('./error')
    }
}

module.exports = authenticate