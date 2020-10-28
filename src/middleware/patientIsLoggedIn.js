const jwt = require('jsonwebtoken')
const Patient = require('../models/patient')

const isLoggedIn = async (req, res, next) => {
    try{
        const token = req.cookies.auth.replace('Bearer ', '')
        const tokenData = jwt.verify(token, process.env.JWT_KEY)
        const patient = await Patient.findOne({ _id: tokenData._id, 'authTokens.token': token})

        if(!patient){
            throw new Error()
        }

        req.patient = patient
        req.token = token

        res.redirect('/patient')
    } catch(e){
        next()
    }
}

module.exports = isLoggedIn