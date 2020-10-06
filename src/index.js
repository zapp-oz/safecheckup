const server = require('./app')
const socketio = require('socket.io')
const io = socketio(server)

const PORT = process.env.PORT

io.on('connection', (socket) => {
    socket.on('join', ({username, room}, cb) => {
        try{
            socket.join(room)
            socket.emit('recieve-message', 'Welcome to the chat!', 'bot')
            socket.broadcast.to(room).emit('recieve-message', `${username} has joined the chat!`, 'bot')
        } catch(e){
            cb()
        }
    })

    socket.on('recieve-message', ({message, username, room}, cb) => {
        try{
            socket.broadcast.to(room).emit('recieve-message', message, username)
        } catch(e){
            cb()
        }
    })
})

server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})