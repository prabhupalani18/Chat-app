const socket = io()

const formEvent = document.querySelector('#message-form')

const location_buttion = document.querySelector('#send-location')

formEvent.addEventListener('submit',(e)=>{
    e.preventDefault()
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error)=>{
        if(error)
        {
            return console.log(error)
        }
        console.log("Message sent")
    })
})

location_buttion.addEventListener('click', ()=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        console.log(position.coords)
        const { latitude, longitude } = position.coords
        const location = {
            "latitude": latitude,
            "longitude": longitude
        }
        socket.emit('sendLocation', location, ()=>{
            console.log("Location shared")
        })
    })
})

socket.on('welcome', (data)=>{
    console.log(data)
})

socket.on('joinMessage', (joinMessage)=>{
    console.log(joinMessage)
})

socket.on('leftMessage', (leftMessage=>{
    console.log(leftMessage)
}))

socket.on('chat',(message)=>{
    console.log(message)
})

socket.on('locationMessage', (message, ca)=>{
    console.log(message)
})