const express = require("express")
const Patient = require("../models/patient")
const authenticate = require("../middleware/authenticatePatients")
const patientIsLoggedIn = require('../middleware/patientIsLoggedIn')

const Route = express.Router({mergeParams: true})

Route.get('/signUp', patientIsLoggedIn, async (req, res) => {
    try{
        res.status(200).render('./patient/signUp', {type: 'patient'})
    } catch(e){
        res.status(500).render('./error')
    }
})

Route.post("/signUp", patientIsLoggedIn, async (req, res) => {
    try{
        const patient = new Patient(req.body.patient)
        await patient.save()
        const token = await patient.generateWebTokens()

        res.cookie('auth', 'Bearer ' + token, {
            httpOnly: true,
            maxAge: 2.5e+8
        })

        res.status(201).redirect('/patient')
    } catch(e){
        res.status(500).render('./error')
    }
})

Route.get('/login', patientIsLoggedIn, async (req, res) => {
    try{
        res.status(200).render('./patient/login', {type: 'patient'})
    } catch(e){
        res.status(500).render('./error')
    }
})

Route.post("/login", patientIsLoggedIn, async (req, res) => {
    try{
        const patient = await Patient.findByCredentials(req.body.patient.email, req.body.patient.password)

        const token = await patient.generateWebTokens()
        res.cookie('auth', 'Bearer ' + token, {
            httplOnly: true, 
            maxAge: 2.5e+8
        })

        res.status(200).redirect('/patient')
    } catch(e){
        res.status(401).render('./error')
    }
})

Route.get("/logout", authenticate, async (req, res) => {
    try{
        const authTokens = req.patient.authTokens.filter(token => token.token !== req.token)
        
        req.patient.authTokens = authTokens

        await req.patient.save()
        res.status(200).redirect('/')
    } catch(e){
        res.status(500).redirect('/')
    }
})

Route.get("/logoutAll", authenticate, async (req, res) => {
    try{
        req.patient.authTokens = []
        await req.patient.save()

        res.status(200).redirect('/')
    } catch(e){
        res.status(500).redirect('/')
    }
})

Route.get("/", authenticate, async (req, res) => {
    try{
        let patient = await Patient.findById(req.patient._id).populate([
            {
                path: 'doctors',
                model: 'Doctor',
                select: 'name email _id'
            }
        ])
        
        patient.doctors = patient.doctors.map((doctor) => {
            doctor.patients = []
            return doctor
        })

        let p = patient.toObject()
        delete p.password
        delete p.authTokens

        res.status(200).render('./patient/profile', {patient: p})
    } catch(e){
        res.status(500).render('./error')
    }
})

Route.patch("/", authenticate, async (req, res) => {
    try{
        const allowedUpdates =  ["password"]
        const updates = Object.keys(req.body.patient)

        const finalUpdates = updates.filter(update => allowedUpdates.includes(update))

        finalUpdates.forEach((update) => {
            req.patient[update] = req.body.patient[update]
        })

        await req.patient.save()

        res.status(200).send()
    } catch(e){
        res.status(500).send()
    }
})

Route.delete("/", authenticate, async (req, res) => {
    try{
        const patient = await req.patient.remove()
        res.status(200).send(patient)
    } catch(e){
        res.status(500).send()
    }
})

//getDoctors

module.exports = Route