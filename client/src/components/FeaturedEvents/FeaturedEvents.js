import React from 'react'
import { Link } from 'react-router-dom'

const FeaturedEvents = () => (
    <div className="ui vertical stripe segment mt-5">
      <div className="ui text container">
        <h3 className="ui header">Ultra Music Festival</h3>
        <img src="./images/ultra.jpeg" className="ui large bordered rounded image mb-3"/>
        <p>Ultra Music Festival is an annual outdoor electronic music festival that takes place during March in the city of Miami, Florida at Bayfront Park. It is home to seven stages which include the Main Stage, the Live Stage, the Mega Structure, the WorldWide Stage, the UMF Radio stage the Resistance stage and the Oasis stage. 
        <br/>
        <br/>
        Headliners include <b>Hardwell</b>, <b>Martin Garrix</b>, <b>The Chainsmokers</b>, <b>Carl Cox</b> and <b>Deadmau5</b>
        </p>
        <Link to="/allEvents">
          <button className="ui huge button ">Learn More</button>
        </Link>
        <div className="ui horizontal header divider">
          <h4 className="text-success">Featured Events</h4>
        </div>
        <h3 className="ui header">Electric Zoo</h3>
        <img src="./images/eZoo.jpeg" className="ui large bordered rounded image mb-3"/>
        <p>Electric Zoo is a 3 day electronic music festival held over Labor Day weekend in New York City on Randall's Island. The festival represents all genres of electronic music, bringing top international DJs and live acts from multiple countries to four stages. 
        <br/>
        <br/>
        Headliners include <b>Porter Robinson</b>, <b>Bassnectar</b>, <b>Tiesto</b>, <b>G Jones</b> and <b>Flux Pavilion</b>   
        </p>
        <Link to="/allEvents">
          <button className="ui huge button  mb-5 ">Learn more</button>
        </Link>
      </div>
    </div>
)

export default FeaturedEvents