const express = require("express")
const Doctor = require("../models/doctor")
const authenticate = require("../middleware/authenticateDoctors")

const Route = express.Router({mergeParams: true})

Route.post("/signUp", async (req, res) => {
    try{
        const doctor = new Doctor(req.body.doctor)
        await doctor.save()
        const token = await doctor.generateWebTokens()

        res.setHeader("Authorization", "Bearer " + token)
        res.status(201).send(doctor)
    } catch(e){
        res.status(500).send(e)
    }
})

Route.post("/login", async (req, res) => {
    try{
        const doctor = await Doctor.findByCredentials(req.body.doctor.email, req.body.doctor.password)

        const token = await doctor.generateWebTokens()
        res.setHeader("Authorization", "Bearer " + token)

        res.status(200).send(doctor)
    } catch(e){
        res.status(401).send(e)
    }
})

Route.get("/logout", authenticate, async (req, res) => {
    try{
        const authTokens = req.doctor.authTokens.filter(token => token.token !== req.token)
        
        req.doctor.authTokens = authTokens

        await req.doctor.save()
        res.status(200).send()
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

Route.get("/", authenticate, async (req, res) => {
    try{
        res.status(200).send(req.doctor)
    } catch(e){
        res.status(500).send()
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

module.exports = Route