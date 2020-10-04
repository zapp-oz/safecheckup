getDoctorName = (appointment, doctorList) => {
    console.log(appointment, doctorList)
    let name = ''
    const check = doctorList.some((doctor) => {
        if(doctor._id === appointment.doctor){
            name = doctor.name
            return true
        }
    })

    if(check === true){
        return name
    } else {
        return 'Not Found'
    }
}


$(document).ready(function(){
    $('#profile-get-appointments').on("click", () => {
        fetch('/appointments/patient')
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            data.forEach((appointment) => {
                const doctorName = getDoctorName(appointment, JSON.parse(patientData).doctors)
                let appointmentElement = `
                <div style="width: 30%; border: 2px solid #222831; padding: 10px; background-color: #eeeeee" class="my-3">
                    <p class="profile-data"><strong>date: </strong> ${moment(appointment.slot.startTime).format("ddd, Do MMM'YY ")}</p>
                    <p class="profile-data"><strong>start time: </strong> ${moment(appointment.slot.startTime).format('HH:mm')} hrs</p>
                    <p class="profile-data"><strong>end time: </strong> ${moment(appointment.slot.endTime).format('HH:mm')} hrs</p>
                    <p class="profile-data"><strong>doctor: </strong> ${doctorName}</p>
                </div>
                `

                $('#profile-appointments').append(appointmentElement)
            })
        })
        .catch((err) => {
            console.log(err)
        })
    })
})