import React from 'react'
import { Link } from 'react-router-dom'
import './Navbar.css'
import Container from 'react-bootstrap/Container'


const Navbar = () => (

    <Container fluid style={{backgroundColor: "rgb(25, 26, 27)"}}>
        <div className="navbar navbar-dark navbar-expand-md ui inverted menu py-0">
            <Container>
                <Link to="/" className="item header py-3">Roadie</Link>
                <button 
                    className="navbar-toggler" 
                    type="button"
                    data-toggle="collapse" 
                    data-target="#TogglerNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="TogglerNav">
                    <div className="navbar-nav ml-auto ">
                        <Link to="/myEvents" className="item">My Schedule</Link>
                        <Link to="/allEvents" className="item">Festivals</Link>
                        <Link to="/allArtists" className="item">Artists</Link>
                        <Link to="/createEvent" style={{cursor:"default"}}>
                            <button id="buttons" className="ui button inverted mx-2 my-2">Create Event</button>
                        </Link>
                        <Link to="/addArtist" style={{cursor:"default"}}>
                            <button className="ui button inverted mx-2 my-2">Add Artist</button>
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    </Container>
)

export default Navbar