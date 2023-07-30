const socket = io()

const messageForm = document.querySelector('#message-form')
const inputTextSpace = document.querySelector('#message')
const sendMessageButton = document.querySelector('#sendMessage')
const locationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const { username, room } = Qs.parse(location.search, {ignoreQueryPrefix:true})

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
            alert(error)
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

const autoScroll = ()=>{
    //New element
    const newMessage = messages.lastElementChild

    //Height of the new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    //Visible height
    const visibleHeight = messages.offsetHeight

    //Height of the message container
    const containerHeight = messages.scrollHeight
    
    //How far have I scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messageTemplate, {
        "message": message.text,
        "createdAt": moment(message.createdAt).format('hh:mm a'),
        "username": message.username
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate, {
        "url": message.url,
        "createdAt": moment(message.createdAt).format('hh:mm a'),
        "username": message.username
    })
    messages.insertAdjacentHTML('beforeend', html)
})

socket.on('roomData', ({ room, users })=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

socket.emit('join', {username, room}, (error)=>{
    if(error)
    {
        alert(error)
        location.href = '/'
    }
})