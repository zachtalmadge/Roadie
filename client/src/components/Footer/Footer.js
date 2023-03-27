import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
    return( 
    <footer className="ui inverted vertical footer segment">
      <div className="ui container">
        <div className="ui stackable inverted divided equal height stackable grid">
            <div className="three wide column">
              <h4 className="ui inverted header">Learn More</h4>
              <div className="ui inverted link list">
                <a href="https://wikipedia.tlm.cloud/wikipedia_en_computer_2017-04/A/Electronic_music.html" className="item">Electronic Music</a>
                <a href="https://wikipedia.tlm.cloud/wikipedia_en_computer_2017-04/A/Music_festival.html" className="item">Music Festivals</a>
                <a href="https://wikipedia.tlm.cloud/wikipedia_en_computer_2017-04/A/Disc_jockey.html" className="item">Disc Jockey</a>
                <a href="https://wikipedia.tlm.cloud/wikipedia_en_computer_2017-04/A/Rave_music.html" className="item">Rave Music</a>
              </div>
            </div>
            <div className="three wide column">
              <h4 className="ui inverted header">Sitemap</h4>
              <div className="ui inverted link list">
                <Link to="/myEvents">
                  <a className="item d-block">My Schedule</a>
                </Link>
                <Link to="/allEvents">
                  <a className="item d-block">All Festivals</a>
                </Link>
                <Link to="/allArtists">
                  <a className="item d-block">All Artists</a>
                </Link>
                <Link to="/createEvent">
                  <a className="item d-block">Create Event</a>
                </Link>
                <Link to="/addArtist">
                  <a className="item d-block">Add Artist</a>
                </Link>
              </div>
            </div>
            <div className="seven wide column">
              <h4 className="ui inverted header">&copy; Zachary Talmadge 2023</h4>
              <p>Thank you to The Last Mile for teaching me the MERN stack!</p>
              <div className="ui inverted link list">
                <a href="#" className="item">Back to Top</a>
              </div>
          </div>
        </div>
      </div>
    </footer>
    )
}

export default Footer