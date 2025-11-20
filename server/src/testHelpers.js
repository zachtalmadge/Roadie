const Artist = require('./artists/artists.schema.js');
const { Festivals } = require('./festivals/festivals.schema.js');

// Add these debug lines
console.log('Artist:', typeof Artist);
console.log('Festivals:', typeof Festivals);
console.log('Festivals.deleteMany:', typeof Festivals.deleteMany);

const resetDatabase = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not allowed in production' });
    }

    // Delete all test data
    console.log('About to delete artists...');
    await Artist.deleteMany({});
    
    console.log('About to delete festivals...');
    await Festivals.deleteMany({});

    res.status(200).json({ 
      message: 'Database reset successfully',
      deleted: {
        artists: await Artist.countDocuments(),
        festivals: await Festivals.countDocuments()
      }
    });
  } catch (error) {
    console.error('Error in resetDatabase:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { resetDatabase };