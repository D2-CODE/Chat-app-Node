const socket = io()


const mesaageForm = document.querySelector('#message-form')
const mesaageInput = mesaageForm.querySelector('input')
const mesaageButton = mesaageForm.querySelector('button')
const locationSendButton = document.querySelector('#send-location')
const AllMessage = document.querySelector('#allMessage')
const Sidebar = document.querySelector('#sidebar')
//templetes
const messageTemplete = document.querySelector('#message-template').innerHTML
const locationTemplete = document.querySelector('#location-template').innerHTML
const sidebarTemplete = document.querySelector('#sidebar-template').innerHTML


//options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })


//autoscroll
const autoscroll = () => {
    const newMessage = AllMessage.lastElementChild

    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    const visibleHeight = AllMessage.offsetHeight

    const containerHeight = AllMessage.scrollHeight

    const scrollOffset = AllMessage.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        AllMessage.scrollTop = AllMessage.scrollHeight
    }
}


//print messages that are send by client
socket.on('message', (message) => {
    console.log(message);

    const html = Mustache.render(messageTemplete, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    AllMessage.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('location', (location) => {
    console.log(location);

    const html = Mustache.render(locationTemplete, {
        username: location.username,
        url: location.text,
        createdAt: moment(location.createdAt).format('h:mm a')
    })

    AllMessage.insertAdjacentHTML('beforeend', html)
    autoscroll
})



socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplete, {
        room,
        users
    })

    Sidebar.innerHTML = html
})


mesaageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    //disabling button 
    mesaageButton.setAttribute('disabled', 'disabled')

    // const message = document.getElementById('message').value
    const message = e.target.elements.message.value

    //it will send mesaage with mesage.value and callback will recive that mesg delivred or not
    socket.emit('sendMessage', message, (error) => {

        mesaageButton.removeAttribute('disabled')
        mesaageInput.value = ''
        mesaageInput.focus()
        if (error) {
            return console.log(error);
        }
        console.log('message delivered');
    })

})


locationSendButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('your browser not support geolocation ')
    }

    locationSendButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        // console.log(position);

        locationSendButton.removeAttribute('disabled')
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error) => {
            if (error) {
                console.log(error);
            }
            console.log('location delevered');
        })
    })
})


//joinroom

socket.emit('join', { username, room }, (error) => {
    if (error) {
        location.href = '/'
        alert(error)
    }
})




// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count);
// })

// document.querySelector('#increment').addEventListener('click', () => {
//     console.log('click');
//     socket.emit('increment')
// })