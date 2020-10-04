$(document).ready(function(){
    symptomsData = JSON.parse(symptomsData)
    let symptoms = []

    $('#search-input').on('keydown', (event) => {
        let keyCode = event.keyCode? event.keyCode: event.which
        if(keyCode === 13){
            symptoms.push(event.target.value)
            $("#search-list").append(`
                <div style="border: 1px solid #222831; display: inline-block; border-radius: 5%; padding: 5px; margin: 10px;">
                    <span style="font-family: 'Abel', cursive;">${event.target.value}</span>
                </div>
            `)
            event.target.value = ''
        }
        let matchexp = new RegExp(`^${event.target.value}`, 'gi')
        let matchValues = symptomsData.filter((symptom) => {
            return symptom.match(matchexp)
        })

        if(event.target.value === ''){
            matchValues = []
        }

        let html = matchValues.map((val) => {
            return `
                <div style="text-align: center; border: 2px solid #222931; background-color: #eeeeee;">
                    <span style="font-family: 'Abel', cursive; font-size: 18px;">${val}</span>
                </div>
            `
        })

        html = html.join(' ')
        $('#search-live-list').html(html)
    })

    $('#search-button').on('click', function(){
        fetch('/diseases/symptoms', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                symptoms
            })
        }).then((res) => {
            return res.json()
        }).then((data) => {
            data.forEach((entry) => {
                let val = `
                    <div class="search-doctor">
                        <p><strong>name: </strong>${entry.name}</p>
                        <p><strong>speciality: </strong>${entry.speciality}</p>
                        <a href="/doctor/${entry._id}"><button class="search-connect-btn">Connect</button></a>
                    </div>
                    <hr>
                `
                $('.search-doctors').append(val)
            })
        }).catch((e) => {
            $('#search-doctors').append("Some error occured")
        })
    })
})