const Artists  = require('./artists.schema')

exports.getArtists = async (req,res) => {
    try{
        let artists = await Artists.find().sort({name: 1})
        res.json(artists)

    } catch(e) {
        console.log(e)
        res.status(400).end()
    }
}

exports.addArtist = (req, res) => {
    const { name, genre, label, albums, singles, bio } = req.body
    let artist = new Artists({
        name, genre, label, albums, singles, bio
    })
    artist.save()
          .then(() => { res.sendStatus(200)})
          .catch(e => {
              console.log(e)
              res.status(400).end()
          })
}

exports.artistDetails = async (req, res) => {
    try {
        const artist = await Artists.findOne({_id: req.params.id}, {_id: 0})
        res.json(artist)
    } catch(e) {
        console.log(e)
        res.status(400).end()
    }
}