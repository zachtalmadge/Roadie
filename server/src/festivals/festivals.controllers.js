const { Festivals } = require('./festivals.schema')

exports.findFestivals = async (req, res) => {
    try {
        // send festivals in order by startDate
        let festivals = await Festivals.find().sort({startDate: 1})
        res.json(festivals)
    } catch(e) {
        console.log(e)
        res.status(400).end()
    }
}

exports.findOneFestival = async (req, res) => {
    try{
        let festival = await Festivals.findOne({_id: req.params.id})
        res.json(festival)
    } catch(e) {
        console.log(e)
        res.status(400).end()
    }
}

exports.createFestival = async (req, res) => {
    const { name, venue, location, startDate, endDate, headliners, camping, attendance  } = req.body
    let festival = new Festivals({
        name, venue, location, startDate, endDate, headliners, added: false, camping, attendance
    })
    festival.save()
            .then(() => {
                res.sendStatus(200)
            })
            .catch(e => {
                res.status(400).end()
            })
}