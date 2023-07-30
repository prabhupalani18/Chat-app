const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on("connection", (socket)=>{

    socket.emit('welcome', 'Welcome to my space!')

    socket.broadcast.emit('joinMessage', 'New person joined in chat')

    socket.on('disconnect', ()=>{
        io.emit('leftMessage','A user has left the chat')
    })

    socket.on('sendLocation', (location)=>{
        io.emit('locationMessage', `https://google.com/maps?q=${location.latitude},${location.longitude}`)
    })
})

server.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`)
})