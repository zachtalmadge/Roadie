const User = require('./user.schema')
const { Festivals } = require('../festivals/festivals.schema')

exports.findUserEvents = async (req, res) => {
    try {
        let user = await User.findOne()
        res.json(user.events)
    } catch(e) {
        console.log(e)
        res.status(400).end()
    }
}

exports.addUserEvent = async (req, res) => {
    const [ user, festival ] = await Promise.all([ User.findOne(), Festivals.findOne({_id: req.params.festivalID}) ])
    user.events.push(festival)
    festival.added = true
    festival.save()
        .then(() => {
            user.save()
                .then(() => {
                    res.sendStatus(200)
                })
                .catch(e => {
                    console.log(e)
                    res.status(400).end()
                })
        })
        .catch(e => {
            console.log(e)
            res.status(400).end()
        })
}

exports.deleteUserEvent = async (req, res) => {
    const [ user, festival ] = await Promise.all([ User.findOne(), Festivals.findOne({_id: req.params.festivalID}) ])
    festival.added = false
    festival.save()
        .then(() => {
            user.events.id(req.params.festivalID).remove()
            user.save()
                .then(() => {
                    res.sendStatus(200)
                })
                .catch(e => {
                    console.log(e)
                    res.status(400).end()
                })

        })
        .catch(e => {
            console.log(e)
            res.status(400).end()
        })
}