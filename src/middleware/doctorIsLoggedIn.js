const jwt = require('jsonwebtoken')
const Doctor = require('../models/doctor')

const isLoggedIn = async (req, res, next) => {
    try{
        const token = req.cookies.auth.replace('Bearer ', '')
        const tokenData = jwt.verify(token, process.env.JWT_KEY)
        const doctor = await Doctor.findOne({_id: tokenData._id, 'authTokens.token': token})

        if(!doctor){
            throw new Error()
        }

        req.doctor = doctor
        req.token = token

        res.redirect('/doctor')
    } catch(e){
        next()
    }
}

module.exports = isLoggedIn