const socket = io()

const $message = $('#input-box')
const $send_btn = $('#send-btn')

socket.emit('join', {username: cred.user, room: cred.room}, () => {
    window.close()
})

socket.on('recieve-message', (message, username) => {
    let messageHtml = `
        <div style="text-align: left;">    
            <div style="background-color: #eeeeee; color: #222931; width: fit-content; padding: 3px; max-width: 35%; display: flex; flex-wrap: wrap; align-items: flex-end;" class="my-2">
                <div style="font-family: 'Abel', cursive; font-size: 18px;">${message}</div>
                <div style="font-family: 'Abel', cursive; font-size: 14px;">~ ${username}</div>
            </div>
        </div>
    `
    $('#chat-messages').append(messageHtml)
})

$message.on('keydown', (event) => {
    setTimeout(() => {
        if($message.val() !== ''){
            $send_btn.attr('disabled', false)
        } else {
            $send_btn.attr('disabled', true)
        }
    }, 5)

    if(event.keyCode === 13){
        $send_btn.click()
    }
})

$send_btn.on('click', () => {

    let messageHtml = `
        <div style="display: flex;">
            <div style="margin-left: auto; background-color: #eeeeee; color: #222931; width: fit-content; padding: 3px; max-width: 35%; display: flex; flex-wrap: wrap; align-items: flex-end;" class="my-2">
                <div style="font-family: 'Abel', cursive; font-size: 18px;">${$message.val()}</div>
                <div style="font-family: 'Abel', cursive; font-size: 14px;">~ ${cred.user}</div>
            </div>
        </div>
    `
    $('#chat-messages').append(messageHtml)

    socket.emit('recieve-message', {message: $message.val(), username: cred.user, room: cred.room}, () => {
        alert('Some error occured!')
    })
    $message.val("")
}) 

