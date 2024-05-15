const users = [

]

//add user

const addUser = ({ id, username, room }) => {
    //clean Data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    if (!username || !room) {
        return {
            error: 'username and room are required'
        }
    }

    //check for exiting user
    const exitingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    //error validate username
    if (exitingUser) {
        return {
            error: 'username is alredy taken'
        }
    }

    //store users
    const user = { id, username, room }
    users.push(user)
    return {
        user
    }
}

//remove user

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}


//getuser
const getUser = (id) => {

    return users.find((user) => user.id === id)

    // const user = users.find((user) => {
    //     return user.id === id
    // })

    // if (!user) {
    //     return {
    //         error: 'user not found'
    //     }
    // }

    // return {
    //     user: user
    // }
}

//getuser in room

const getUserInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}