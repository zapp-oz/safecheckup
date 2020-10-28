const express = require('express')
const path = require('path')
const mongoose = require('mongoose')
const cron = require('cron')
const cookieParser = require('cookie-parser')
const http = require('http')

const doctorRoutes = require("./routes/doctorRoutes")
const patientRoutes = require("./routes/patientRoutes")
const diseaseRoutes = require("./routes/diseaseRoutes")
const appointmentRoutes = require('./routes/appointmentRoutes')

const appointmentScheduler = require('./scheduledJobs/appointmentScheduler')
const deleteAuthTokens = require('./scheduledJobs/deleteAuthTokens')

mongoose.connect("mongodb://localhost:27017/doctorApp", {useCreateIndex: true,
useNewUrlParser: true, useUnifiedTopology: true})
const app = express()
const server = http.createServer(app)

const public = path.join(__dirname, "../public")

app.use(express.static(public))
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({extended: true}))
app.set('view engine', 'ejs')

const cronJob = new cron.CronJob('* 0 0 * * *', () => {
    appointmentScheduler()
    deleteAuthTokens()
})
cronJob.start()

app.get("/", async (req, res) => {
    try{
        res.status(200).render('')
    } catch(e){
        res.status(500).render('error')
    }
})  

app.get('/chat', async (req, res) => {
    try{
        res.render('./chat/main', {username: req.query.username, room: req.query.room})
    } catch(e){
        res.render('./error')
    }
})

app.use("/doctor", doctorRoutes)
app.use("/patient", patientRoutes)
app.use("/diseases", diseaseRoutes)
app.use('/appointments', appointmentRoutes)

module.exports = server


