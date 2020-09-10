const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
require("dotenv").config()

const doctorRoutes = require("./routes/doctorRoutes")
const patientRoutes = require("./routes/patientRoutes")
const diseaseRoutes = require("./routes/diseaseRoutes")

mongoose.connect("mongodb://localhost:27017/doctorApp", {useCreateIndex: true,
useNewUrlParser: true, useUnifiedTopology: true})
const app = express()
const PORT = process.env.PORT || 3000
const public = path.join(__dirname, "../public")

app.use(express.static(public))
app.use(express.json())

// app.get("/", async (req, res) => {

// })

app.use("/doctor", doctorRoutes)
app.use("/patient", patientRoutes)
app.use("/diseases", diseaseRoutes)

app.listen(PORT, () => {
    console.log("Server is listening on port 3000")
})