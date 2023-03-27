const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()

const UserRoutes = require('./src/user/user.routes')
const FestivalRoutes = require('./src/festivals/festivals.routes')
const ArtistRoutes = require('./src/artists/artists.routes')

app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(bodyParser.json())
app.use(express.static('public'))

mongoose.connect('mongodb://localhost/roadie')
    .then(() => console.log('===== Successfully connected to MongoDB ====='))
    .catch(e => console.log(e))

UserRoutes(app)
FestivalRoutes(app)
ArtistRoutes(app)

app.listen(3000, () => console.log('===== Express app listening on port 3000 ====='))