const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocationMessage } = require('./utils/messages')
const { addUser, getUser, getUserInRoom, removeUser } = require('./utils/users')



const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')


// let count = 0

//socket variable contail all detail about current connected client // io.on connection one time run for each client

io.on('connection', (socket) => {
    console.log('new web socket connected');


    socket.on('join', (options, callback) => {

        const { user, error } = addUser({ id: socket.id, ...options })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        // socket.emit('message', 'welcome to chat-app')
        socket.emit('message', generateMessage('Admin', 'welcome'))

        //broadcast send messsge all user execpt current user
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined!`))

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUserInRoom(user.room)
        })

        callback()
        //socket.emit , io.emit , socket.broadcast.emit

        //for room -> io.to.emit : emits the event to a specific room ,
        //socket.broadcast.to.emit: emit the event to specific room expect that //user
    })





    // send message to all client
    //callback is to acknowledgement to client
    socket.on('sendMessage', (mesage, callback) => {

        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(mesage)) {
            return callback('Profanity is not allowed')
        }

        io.to(user.room).emit('message', generateMessage(user.username, mesage))
        callback()//value will passed to client
    })


    //send location to all clients
    socket.on('sendLocation', ({ latitude, longitude }, callback) => {

        const user = getUser(socket.id)
        io.to(user.room).emit('location', generateLocationMessage(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })



    //disconnected 
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left!!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }


    })

})


app.use(express.static(publicDirectoryPath))

server.listen(port, () => {
    console.log(`Server is running on ${port}`)
})