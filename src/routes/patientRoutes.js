const express = require("express")
const Patient = require("../models/patient")
const authenticate = require("../middleware/authenticatePatients")

const Route = express.Router({mergeParams: true})

Route.post("/signUp", async (req, res) => {
    try{
        const patient = new Patient(req.body.patient)
        await patient.save()
        const token = await patient.generateWebTokens()

        res.setHeader("Authorization", "Bearer " + token)

        res.status(201).send(patient)
    } catch(e){
        res.status(500).send(e)
    }
})

Route.post("/login", async (req, res) => {
    try{
        const patient = await Patient.findByCredentials(req.body.patient.email, req.body.patient.password)

        const token = await patient.generateWebTokens()
        res.setHeader("Authorization", "Bearer " + token)

        res.status(200).send(patient)
    } catch(e){
        res.status(401).send(e)
    }
})

Route.get("/logout", authenticate, async (req, res) => {
    try{
        const authTokens = req.patient.authTokens.filter(token => token.token !== req.token)
        
        req.patient.authTokens = authTokens

        await req.patient.save()
        res.status(200).send()
    } catch(e){
        res.status(500).send()
    }
})

Route.get("/logoutAll", authenticate, async (req, res) => {
    try{
        req.patient.authTokens = []
        await req.patient.save()

        res.status(200).send()
    } catch(e){
        res.status(500).send()
    }
})

Route.get("/", authenticate, async (req, res) => {
    try{
        res.status(200).send(req.patient)
    } catch(e){
        res.status(500).send()
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