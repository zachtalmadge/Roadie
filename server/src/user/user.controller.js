const User = require('./user.schema')
const { Festivals } = require('../festivals/festivals.schema')

exports.findUserEvents = async (req, res) => {
    try {
        const user = await User.findOne()
        
        // Handle case where no user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        res.json(user.events)
    } catch(e) {
        console.log(e)
        res.status(400).json({ error: 'Failed to retrieve user events' })
    }
}

exports.addUserEvent = async (req, res) => {
    try {
        // Fetch user and festival in parallel
        const [ user, festival ] = await Promise.all([
            User.findOne(),
            Festivals.findOne({_id: req.params.festivalID})
        ])
        
        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        // Check if festival exists
        if (!festival) {
            return res.status(400).json({ error: 'Festival not found' })
        }
        
        // Add festival to user's events
        user.events.push(festival)
        festival.added = true
        
        // Save both documents
        await festival.save()
        await user.save()
        
        res.sendStatus(200)
        
    } catch(e) {
        console.log(e)
        
        // Handle invalid ObjectId format
        if (e.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid festival ID format' })
        }
        
        res.status(400).json({ error: 'Failed to add festival to schedule' })
    }
}

exports.deleteUserEvent = async (req, res) => {
    try {
        // Fetch user and festival in parallel
        const [ user, festival ] = await Promise.all([
            User.findOne(),
            Festivals.findOne({_id: req.params.festivalID})
        ])
        
        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }
        
        // Check if festival exists
        if (!festival) {
            return res.status(400).json({ error: 'Festival not found' })
        }
        
        // Update festival and remove from user's events
        festival.added = false
        await festival.save()
        
        user.events.id(req.params.festivalID).remove()
        await user.save()
        
        res.sendStatus(200)
        
    } catch(e) {
        console.log(e)
        
        // Handle invalid ObjectId format
        if (e.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid festival ID format' })
        }
        
        res.status(400).json({ error: 'Failed to remove festival from schedule' })
    }
}