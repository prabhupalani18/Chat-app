const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")
const { generateMessage, generateLocationMessage } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on("connection", (socket)=>{

    socket.emit('message', generateMessage('Welcome to my space!'))

    socket.broadcast.emit('message', generateMessage('New person joined in chat'))

    socket.on('sendMessage', (message, callback)=>{
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Profanity is not allowed")
        }
        io.emit('message', generateMessage(message))
        callback()
    })

    socket.on('disconnect', ()=>{
        io.emit('message', generateMessage('A user has left the chat'))
    })

    socket.on('sendLocation', (location, callback)=>{
        io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })
})

server.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`)
})