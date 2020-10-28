const express = require("express")
const Doctor = require("../models/doctor")
const authenticate = require("../middleware/authenticateDoctors")
const patientAuthenticate = require("../middleware/authenticatePatients")
const isLoggedIn = require('../middleware/doctorIsLoggedIn')

const Route = express.Router({mergeParams: true})

Route.get('/signUp', isLoggedIn, async (req, res) => {
    try{
        res.status(200).render('./doctor/signUp', {type: 'doctor'})
    } catch(e){
        res.status(500).render('./error')
    }
})

Route.post("/signUp", isLoggedIn, async (req, res) => {
    try{
        const doctor = new Doctor(req.body.doctor)
        await doctor.save()
        const token = await doctor.generateWebTokens()

        res.cookie('auth', 'Bearer '+ token, {
            // secure: process.env.NODE_ENV === 'production'? true: false,
            httpOnly: true,
            maxAge: 2.5e+8
        })
        res.status(201).redirect('/doctor')
    } catch(e){
        res.status(500).render('./error')
    }
})

Route.get('/login', isLoggedIn, async (req, res) => {
    try{
        res.status(200).render('./doctor/login', {type: 'doctor'})
    } catch(e){
        res.status(500).render('./error')
    }
})

Route.post("/login", isLoggedIn, async (req, res) => {
    try{
        const doctor = await Doctor.findByCredentials(req.body.doctor.email, req.body.doctor.password)
        const token = await doctor.generateWebTokens()
        res.cookie('auth', 'Bearer ' + token, {
            maxAge: 2.5e+8,
            httpOnly: true
        })

        res.status(200).redirect('/doctor')
    } catch(e){
        res.status(401).render('./error')
    }
})

Route.get("/logout", authenticate, async (req, res) => {
    try{
        const authTokens = req.doctor.authTokens.filter(token => token.token !== req.token)
    
        req.doctor.authTokens = authTokens
        
        await req.doctor.save()
        res.status(200).redirect('/')
    } catch(e){
        res.status(500).send()
    }
})

Route.get("/logoutAll", authenticate, async (req, res) => {
    try{
        req.doctor.authTokens = []
        await req.doctor.save()

        res.status(200).send()
    } catch(e){
        res.status(500).send()
    }
})

Route.get("/:id", patientAuthenticate, async (req, res) => {
    try{
        const doctor = await Doctor.findById(req.params.id)

        if(!doctor){
            return res.status(400).render('./error')
        }

        doctorCopy = doctor.toObject()
        delete doctorCopy.email
        delete doctorCopy.patients
        delete doctorCopy.authTokens
        delete doctorCopy.password

        res.status(200).render('./doctor/connect', {doctor: doctorCopy, patient: req.patient})
    } catch(e){
        res.status(500).render('./error')
    }
})

// Route.get('/list', patientAuthenticate, async (req, res) => {
//     try{
//         res.render('./doctor/list')
//     } catch(e){
//         res.render()
//     }
// })

Route.get("/", authenticate, async (req, res) => {
    try{
        let doctor = req.doctor.toObject()
        doctor = await Doctor.findById(doctor._id).populate([
            {
                path: 'patients.patient',
                model: 'Patient',
                select: 'name'
            }
        ])

        res.status(200).render('./doctor/profile', {doctor})
    } catch(e){
        res.status(500).render('./error')
    }
})

Route.patch("/", authenticate, async (req, res) => {
    try{
        const allowedUpdates =  ["password", "speciality"]
        const updates = Object.keys(req.body.doctor)

        const finalUpdates = updates.filter(update => allowedUpdates.includes(update))

        finalUpdates.forEach((update) => {
            req.doctor[update] = req.body.doctor[update]
        })

        await req.doctor.save()

        res.status(200).send()
    } catch(e){
        res.status(500).send()
    }
})

Route.delete("/", authenticate, async (req, res) => {
    try{
        const doctor = await req.doctor.remove()
        res.status(200).send(doctor)
    } catch(e){
        res.status(500).send()
    }
})

//getpatients

module.exports = Route