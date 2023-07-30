const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const Filter = require("bad-words")
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
    } = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const PORT = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on("connection", (socket)=>{

    socket.on('join', ({username, room}, callback) =>{
        const { error, user } = addUser({ id: socket.id, username, room })

        if(error){
            return callback(error)
        }
        socket.join(user.room)
        socket.emit('message', generateMessage("Admin",'Welcome!'))
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`))

        callback()
    })
    socket.on('sendMessage', (message, callback)=>{
        const user = getUser(socket.id)
        if(!user)
        {
            return callback("User not found")
        }

        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback("Profanity is not allowed")
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()
    })

    socket.on('sendLocation', (location, callback)=>{
        const user = getUser(socket.id)
        if(!user)
        {
            return callback("User not found")
        }

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${location.latitude},${location.longitude}`))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        if(user)
        {
            io.emit('message', generateMessage("Admin", `${user.username} has left`))
        }
    })
})

server.listen(PORT, ()=>{
    console.log(`Server is running at port ${PORT}`)
})