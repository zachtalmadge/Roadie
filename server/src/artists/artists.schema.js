const { mongoose, Schema } = require('mongoose')

const ArtistSchema = new Schema({

    name: {
        type: String,
        unique: true
    },
    bio: String,
    
    genre: String,

    label: String,

    albums: [String],

    singles: [String],

})

const Artists = mongoose.model('artist', ArtistSchema)

module.exports = Artists