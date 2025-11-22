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
    
// suppress warnings on tests
mongoose.set('strictQuery', false);

UserRoutes(app)
FestivalRoutes(app)
ArtistRoutes(app)

// Test helpers endpoints (only in non-production)
if (process.env.NODE_ENV !== 'production') {
  const { resetDatabase, seedDatabase, resetAndSeed } = require('./src/testHelpers');
  app.post('/api/test/reset', resetDatabase);
  app.post('/api/test/seed', seedDatabase);
  app.post('/api/test/reset-and-seed', resetAndSeed);
  console.log('✅ Test endpoints available: /api/test/reset, /api/test/seed, /api/test/reset-and-seed');
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`===== Express app listening on port ${PORT} =====`));
}


// Export app for testing (must be at the end)
module.exports = app;