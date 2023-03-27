const { mongoose, Schema } = require('mongoose')
const { FestivalSchema } = require('../festivals/festivals.schema')

const UserSchema = new Schema({
    events: [FestivalSchema]
})

const User = mongoose.model('user', UserSchema)

module.exports = User