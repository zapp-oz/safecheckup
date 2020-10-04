$(document).ready(function(){
    $('#connect-appointments-btn').on('click', (event) => {
        fetch(`/appointments/${event.target.getAttribute('data-id')}`)
        .then((res) => {
            return res.json()
        })
        .then((data) => {
            data.forEach((date) => {
                date.appointments.forEach((appointment) => {
                    const appointmentElement = `
                        <div style="width: 30%; border: 2px solid #222831; padding: 10px; background-color: #eeeeee" class="my-3">
                            <p class="connect-data"><strong>date: </strong> ${moment(appointment.startTime).format("ddd, Do MMM'YY ")}</p>
                            <p class="connect-data"><strong>start time: </strong> ${moment(appointment.startTime).format('HH:mm')} hrs</p>
                            <p class="connect-data"><strong>end time: </strong> ${moment(appointment.endTime).format('HH:mm')} hrs</p>
                            <button data-id="${appointment._id}" class="connect-book-btn">Book</button>
                        </div>
                    `
                    $('#connect-appointments').append(appointmentElement)
                })
            })
        })
        .catch((err) => {
            console.log(err)
        })

        setTimeout(() => {
            $('.connect-book-btn').each((i, el) => {
                $(`button[data-id="${el.getAttribute("data-id")}"]`).on('click', (event) => {
                    fetch(`/appointments/book/${event.target.getAttribute('data-id')}`)
                    .then((res) => {
                        window.location.replace('/patient/')
                    })
                    .catch((err) => {
                        window.location.replace('/patient/')
                    })
                })
            })
        }, 500)
    })
})