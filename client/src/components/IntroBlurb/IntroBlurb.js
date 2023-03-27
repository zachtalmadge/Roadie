import React from 'react'
import { Link } from 'react-router-dom'

const IntroBlurb = () => {
    return(
      <div className="ui vertical stripe segment mt-5 pb-5">
        <div className="ui middle aligned stackable grid container">
          <div className="row">
            <div className="eight wide column">
              <h2 className="ui header">Your Favorite Events, All In One Place.</h2>
              <p>Roadie has all the hottest festivals and events making it easy for you to plan out your year. Browse our listings or view your schedule to see what you have coming up!</p>
              <Link to="/myEvents">
                <button className="ui large button right labeled  icon "><i className="ui icon list"></i>My Schedule</button>
              </Link>
              <h2 className="ui header">Discover And Learn More About Today's Top Artists.</h2>
              <p>Finding new music can be hard. Roadie makes it easy by showcasing our favorite DJ's and providing the most up-to-date information about new Artists.</p>
              <Link to="/allArtists">
                <button className="ui large button right labeled teal icon "><i className="ui icon music"></i>View Artists</button>
              </Link>
            </div>
            <div className="six wide right floated column">
              <img src="./images/turntable.jpeg" className="ui large bordered rounded image shadow"/>
            </div>
          </div>
        </div>
      </div>
    )
}

export default IntroBlurb