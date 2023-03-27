const { mongoose, Schema } = require('mongoose')

const FestivalSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    venue: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    headliners: {
        type: [String],
        required: true
    },
    added: Boolean,

    attendance: String,
    
    camping: Boolean
})

const Festivals = mongoose.model('festival', FestivalSchema)

module.exports = { Festivals, FestivalSchema }