const socket = io()

const messageForm = document.querySelector('#message-form')
const inputTextSpace = document.querySelector('#message')
const sendMessageButton = document.querySelector('#sendMessage')
const locationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML

messageForm.addEventListener('submit',(e)=>{
    e.preventDefault()
    sendMessageButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage', message, (error)=>{
        sendMessageButton.removeAttribute('disabled')
        inputTextSpace.value = ''
        inputTextSpace.focus()

        if(error)
        {
            return console.log(error)
        }
        console.log("Message sent")
    })
})

locationButton.addEventListener('click', ()=>{
    if(!navigator.geolocation)
    {
        return alert('Geolocation is not supported by your browser')
    }

    locationButton.setAttribute('disabled', 'disabled')
    navigator.geolocation.getCurrentPosition((position)=>{
        const { latitude, longitude } = position.coords
        const location = {
            "latitude": latitude,
            "longitude": longitude
        }
        socket.emit('sendLocation', location, ()=>{
            locationButton.removeAttribute('disabled')
            console.log("Location shared")
        })
    })
})

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        "message": message.text,
        "createdAt": moment(message.createdAt).format('hh:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
})

socket.on('locationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        "url": message.url,
        "createdAt": moment(message.createdAt).format('hh:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
})