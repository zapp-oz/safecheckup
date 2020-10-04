const jwt = require("jsonwebtoken")
const Doctor = require("../models/doctor")

const authenticateDoctors = async (req, res, next) => {
    try{
        let token = req.cookies.auth.replace("Bearer ", "")
        const tokenData = jwt.verify(token, process.env.JWT_KEY)
        const doctor = await Doctor.findOne({_id: tokenData._id, "authTokens.token": token})

        if(!doctor){
            throw new Error("Please Authenticate!")
        }
        
        req.doctor = doctor
        req.token = token

        next()
    } catch(e){
        res.status(401).render('./error')
    }
}

module.exports = authenticateDoctors