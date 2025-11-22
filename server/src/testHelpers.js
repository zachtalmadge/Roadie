const Artist = require('./artists/artists.schema.js');
const { Festivals } = require('./festivals/festivals.schema.js');
const User = require('./user/user.schema.js');

// Test seed data
const seedFestivals = [
  {
    name: "Electric Forest",
    venue: "Double JJ Ranch",
    location: "Rothbury, MI",
    startDate: "2023-06-22T00:00:00Z",
    endDate: "2023-06-25T00:00:00Z",
    headliners: ["Bassnectar", "The String Cheese Incident", "GRiZ", "Major Lazer", "STS9"],
    added: false,
    camping: true,
    attendance: "60,000"
  },
  {
    name: "Coachella",
    venue: "Empire Polo Club",
    location: "Indio, CA",
    startDate: "2023-04-14T00:00:00Z",
    endDate: "2023-04-16T00:00:00Z",
    headliners: ["Doja Cat", "Megan Thee Stalion", "Daft Punk", "Beyonce", "Taylor Swift"],
    added: false,
    camping: true,
    attendance: "126,000"
  },
  {
    name: "Lollapalooza",
    venue: "Grant Park",
    location: "Chicago, IL",
    startDate: "2023-06-02T00:00:00Z",
    endDate: "2023-06-04T00:00:00Z",
    headliners: ["Cage The Elephant", "Marshmello", "Coldplay", "Mac Miller", "A$AP Rocky"],
    added: false,
    camping: false,
    attendance: "90,000"
  },
  {
    name: "Ultra Music Festival",
    venue: "Bayfront Park",
    location: "Miami, FL",
    startDate: "2023-03-22T00:00:00Z",
    endDate: "2023-03-24T00:00:00Z",
    headliners: ["Hardwell", "Martin Garrix", "The Chainsmokers", "Carl Cox", "Tiesto"],
    added: false,
    camping: false,
    attendance: "120,000"
  },
  {
    name: "Lost Lands",
    venue: "Legend Valley",
    location: "Acron, OH",
    startDate: "2023-09-15T00:00:00Z",
    endDate: "2023-09-17T00:00:00Z",
    headliners: ["Excision", "Datsik", "Zomboy", "Zeds Dead", "Destroid"],
    added: false,
    camping: true,
    attendance: "60,000"
  }
];

const seedArtists = [
  {
    name: "Bassnectar",
    bio: "Lorin Ashton, better known under his stage name Bassnectar, is an American DJ and record producer.",
    genre: "Alternative Bass",
    label: "Amorphous",
    albums: ["Timestretch", "Divergent Spectrum", "Vava Voom"],
    singles: ["Bass Head", "The Matrix", "Dive"]
  },
  {
    name: "Skrillex",
    bio: "Sonny John Moore, known professionally as Skrillex, is an American electronic dance music producer.",
    genre: "Dubstep",
    label: "OWSLA",
    albums: ["Recess", "Scary Monsters & Sprites", "Skrillex & Diplo Present: Jack U"],
    singles: ["Red Lips (remix)", "Purple Lamborghini", "Burial (remix)"]
  },
  {
    name: "Marshmello",
    bio: "Marshmello is an electronic dance music producer and DJ.",
    genre: "Future Bass",
    label: "Monstercat",
    albums: ["Joytime", "n/a", "n/a"],
    singles: ["Alone", "Ritual", "Want U 2"]
  }
];

// Reset database (delete all data)
const resetDatabase = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not allowed in production' });
    }

    await Artist.deleteMany({});
    await Festivals.deleteMany({});
    
    // Reset user schedule to empty array
    await User.updateMany({}, { $set: { events: [] } });

    res.status(200).json({ 
      message: 'Database reset successfully',
      reset: {
        artists: 'cleared',
        festivals: 'cleared',
        userSchedule: 'cleared'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Seed database with test data
const seedDatabase = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not allowed in production' });
    }

    const festivals = await Festivals.insertMany(seedFestivals);
    const artists = await Artist.insertMany(seedArtists);

    res.status(200).json({ 
      message: 'Database seeded successfully',
      seeded: {
        festivals: festivals.length,
        artists: artists.length
      },
      festivalIds: festivals.map(f => ({ id: f._id, name: f.name }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reset and seed in one call (MAIN FUNCTION FOR TESTS)
const resetAndSeed = async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: 'Not allowed in production' });
    }

    // Delete all festivals and artists
    await Artist.deleteMany({});
    await Festivals.deleteMany({});
    
    // Clear user's schedule (reset events array to empty)
    await User.updateMany({}, { $set: { events: [] } });

    // Insert fresh seed data
    const festivals = await Festivals.insertMany(seedFestivals);
    const artists = await Artist.insertMany(seedArtists);

    res.status(200).json({ 
      message: 'Database reset and seeded successfully',
      reset: {
        userSchedule: 'cleared'
      },
      seeded: {
        festivals: festivals.length,
        artists: artists.length
      },
      festivalIds: festivals.map(f => ({ id: f._id, name: f.name }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { resetDatabase, seedDatabase, resetAndSeed };