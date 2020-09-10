const mongoose = require("mongoose")
const express = require("express")
const authenticate = require("../middleware/authenticatePatients")

let diseaseData = require("../assets/diseases")

const Route = express.Router({mergeParams: true})

Route.post("/symptoms", authenticate, async (req, res) => {
    try{
        let maxMatches = 0
        let doctorType = {}

        for(let i in diseaseData){
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

        
        res.status(200).send()
        
    } catch(e){
        res.status(500).send()
    }
})

module.exports = Route
