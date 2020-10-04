const express = require('express')
const authenticate = require('../middleware/authenticatePatients')

const diseaseData = require("../../assets/data/diseases")
const symptomsData = require('../../assets/data/symptoms')
const Doctor = require('../models/doctor')

const Route = express.Router({ mergeParams: true })

Route.get('/search', authenticate, async (req, res) =>{
    try{
        res.status(200).render('./diseases/search', {symptoms: symptomsData})
    } catch(e){
        res.status(500).render('./error')
    }
})

Route.post('/symptoms', authenticate, async (req, res) => {
    try {
        let maxMatches = 0
        let doctorType = {}

        for (let i in diseaseData){
            let count = 0
            for(let j of req.body.symptoms){
                if(diseaseData[i].symptoms.includes(j)){
                    count++
                }
            }
            if(count > maxMatches){
                maxMatches = count
                doctorType = {}
                doctorType[diseaseData[i].doctor] = 1
            } else if(count === maxMatches){
                if(doctorType[diseaseData[i].doctor]){
                    doctorType[diseaseData[i].doctor]++
                } else {
                    doctorType[diseaseData[i].doctor] = 1
                }
            }
        }

        let doctors = Object.entries(doctorType)
        doctors.sort((a, b) => a[1] - b[1])
        doctors.reverse()

        doctors = Object.fromEntries(doctors)
        doctors = Object.keys(doctors)

        const searchResults = await Doctor.find({ speciality: doctors })

        res.status(200).send(searchResults)
    } catch (e) {
        res.status(500).send()
    }
})

module.exports = Route
