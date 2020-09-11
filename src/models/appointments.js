const mongoose = require("mongoose")

const appointmentsSchema = new mongoose.Schema({
    date: {
        type: mongoose.Schema.Types.Date,
        required: true
    },
    doctors: [{
        doctor: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Doctor"
        },
        appointments:[{
            slot: {
                startTime: {
                    type: mongoose.Schema.Types.Date,
                    required: true
                },
                endTime: {
                    type: mongoose.Schema.Types.Date,
                    required: true
                },
                patient: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Patient"
                }
            }
        }]
    }]
})

const Appointment = mongoose.model("appointment", appointmentsSchema)

module.exports = Appointment
