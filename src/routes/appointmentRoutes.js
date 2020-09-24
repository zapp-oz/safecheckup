const express = require('express')

const Patient = require('../models/patient')
const Doctor = require('../models/doctor')
const Appointment = require('../models/appointments')
const patientAuthenticate = require('../middleware/authenticatePatients')
const doctorAuthenticate = require('../middleware/authenticateDoctors') 

const Route = express.Router({mergeParams: true})

//get appointments for doctor


//get appointments for patient
Route.get('/patient', patientAuthenticate, async (req, res) => {
    try{
        const patientRef = await Patient
        .findById(req.patient._id)
        .populate([
            {
                path: 'appointments',
                model: 'Appointment'
            }
        ])
        
        let appointmentSchedules = []

        let patient = patientRef.toObject()
        patient.appointments = patient.appointments.filter((appointment) => {
            if(appointmentSchedules.includes(appointment._id.toString())){
                return false
            } else {
                appointmentSchedules.push(appointment._id.toString())
                return true
            }
        })

        let list = []
        for(let i of patient.appointments){
            for(let j of i.doctors){
                for(let k of j.appointments){
                    if(k.patient !== null && k.patient.equals(req.patient._id)){
                        list = [...list, {slot: k, doctor: j.doctor}]
                    }
                }
            }
        }


        // const patient = await Patient
        // .findOne({_id: req.patient._id})
        // .populate([
        //     {
        //         path: 'doctors',
        //         model: 'Doctor',
        //         select: '_id'                
        //     }
        // ])

        // let patientCopy = patient.toObject()
        
        // patientCopy.doctors = patientCopy.doctors.map((doctor) => {
        //     delete doctor.patients
        //     return doctor
        // })
        
        // delete patientCopy.password
        // delete patientCopy.authTokens
        // delete patientCopy.id


        res.status(200).send(list)
    } catch(e){
        console.log(e)
        res.status(500).send()
    }
})

//create appointment
Route.post('/book/:id', patientAuthenticate, async (req, res) => {
    try{
        const appointments = await Appointment.findOne({
            'doctors.appointments._id': req.params.id
        })

        if(!appointments){
            return res.status(400).send()
        }

        let appointmentFind = null
        let doctorFound = null
        appointments.doctors.some((doctor) => {
            const appointment = doctor.appointments.find((appointment) => {
                return appointment._id.equals(req.params.id)
            })
            if(!appointment){
                return false
            } else {
                appointmentFind = appointment
                doctorFound = doctor.doctor
                return true
            }
        })

        if(!appointmentFind){
            return res.status(400).send()
        }

        const doctor = await Doctor.findById(doctorFound)
        const existence = doctor.patients.some(patient => patient.patient.equals(req.patient._id))
        if(!existence){
            doctor.patients = [...doctor.patients, {
                patient: req.patient._id
            }]
            await doctor.save()
        }

        appointmentFind.patient = req.patient._id
        await appointments.save()

        res.status(200).send()
    } catch(e){
        res.status(500).send()
    }
})

//get available appointments
Route.get('/:id', patientAuthenticate, async (req, res) => {
    try{
        const appointments = await Appointment.find({
            'doctors.doctor': req.params.id
        })

        if(!appointments){
            return res.status(400).send()
        }

        let availableAppointments = []
        const finalAppointments = [...appointments]
        finalAppointments.forEach((appointment) => {
            availableAppointments = [...availableAppointments, 
                ...appointment.doctors.filter((doctor) => doctor.doctor.equals(req.params.id))]
        })
        
        availableAppointments.forEach((appointment) => {
            appointment.appointments = appointment.appointments.filter((slot) => {
                return slot.patient === null
            })
        })

        res.status(200).send(availableAppointments)
    } catch(e){
        res.status(500).send()
    }
})

module.exports = Route
