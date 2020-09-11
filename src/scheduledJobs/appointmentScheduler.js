const mongoose = require("mongoose")
const moment = require("moment")

const Doctor = require("../models/doctor")
const Appointment = require("../models/appointments")

mongoose.connect("mongodb://127.0.0.1:27017/doctorApp", {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true})

const appointmentUpdate = async () => {
    const appointments = await Appointment.find({})
    const doctors = await Doctor.find({})
    let todayG = moment().utcOffset("+05:30").startOf("date")
    
    if(appointments.length === 0){
        console.log("hello1")
        for(let t = 0; t<2; t++){
            let doctorsSlots = []
            let start = null
            if(t === 0){
                start = todayG.clone().add(9, 'h') 
            } else if (t === 1){
                start = todayG.clone().add(24*t + 9, 'h')
            }
            for(let i of doctors){
                let appointments = []
                for(let i = 0; i<10; i++){
                    appointments = [...appointments, {
                        slot: {
                            startTime: new Date(start.valueOf()),
                            endTime: new Date(start.add(30, 'm').valueOf()),
                            patient: null
                        }
                    }]
                    start.add(30, 'm')
                }

                doctorsSlots = [...doctorsSlots, {
                    doctor: i._id,
                    appointments
                }]
            }

            const appointment = new Appointment({
                date: new Date(todayG.clone().add(24*t, 'h').valueOf()),
                doctors: doctorsSlots
            })

            await appointment.save()
        }
    } else {
        console.log("hello2")
        for(let t of appointments){
            const date = moment(t.date)
            if(date.isBefore(todayG, 'date')){
                await t.remove()

                let doctorsSlots = []
                let start = todayG.clone().add(24 + 9, 'h')
                for(let i of doctors){
                    let appointments = []
                    for(let i = 0; i<10; i++){
                        appointments = [...appointments, {
                            slot: {
                                startTime: new Date(start.valueOf()),
                                endTime: new Date(start.add(30, 'm').valueOf()),
                                patient: null
                            }
                        }]
                        start.add(30, 'm')
                    }

                    doctorsSlots = [...doctorsSlots, {
                        doctor: i._id,
                        appointments
                    }]
                }

                const appointment = new Appointment({
                    date: new Date(todayG.clone().add(24, 'h').valueOf()),
                    doctors: doctorsSlots
                })

                await appointment.save()
                break;
            }
        }   
    }

    return await Appointment.find({})
}

appointmentUpdate().then((res) => {
    console.log(res)
}).catch((e) => {
    console.log(e)
})