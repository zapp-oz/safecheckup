getPatientName = (entry, patientList) => {
    let name = ''
    const check = patientList.some((patient) => {
        if(patient.patient._id === entry.patient){
            name = patient.patient.name
            return true
        }
    })

    if(check){
        return name
    } else {
        return 'Not Found'
    }
}

$(document).ready(function(){
    doctor = JSON.parse(doctor)

    $('#profile-get-appointments').on('click', () => {
        fetch('/appointments/doctor')
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            data.forEach((appointment) => {
                appointment.doctors[0].appointments.forEach((entry) => {
                    if(entry.patient !== null){
                        const patient = getPatientName(entry, doctor.patients)
                        let appointmentElement = `
                            <div style="width: 30%; border: 2px solid #222831; padding: 10px; background-color: #eeeeee" class="my-3">
                                <p class="profile-data"><strong>date: </strong> ${moment(entry.startTime).format("ddd, Do MMM'YY ")}</p>
                                <p class="profile-data"><strong>start time: </strong> ${moment(entry.startTime).format('HH:mm')} hrs</p>
                                <p class="profile-data"><strong>end time: </strong> ${moment(entry.endTime).format('HH:mm')} hrs</p>
                                <p class="profile-data"><strong>patient: </strong> ${patient}</p>
                            </div>
                        `
                        $('#profile-appointments').append(appointmentElement)
                    }
                })
            })
        })
        .catch((err) => {
            
        })
    })
})