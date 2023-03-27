import React from 'react'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Home from '../pages/Home'
import MyEvents from '../pages/MyEvents'
import AllEvents from '../pages/AllEvents'
import EventDetails from '../pages/EventDetails'
import CreateEvent from '../pages/CreateEvent'
import AllArtists from '../pages/AllArtists'
import AddArtist from '../pages/AddArtist'
import ArtistDetails from '../pages/ArtistDetails'
import Error404 from '../pages/Error404'
import Footer from '../components/Footer'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
    return(
        <Router>
            <Navbar/>
            <Switch>
                <Route exact path="/">
                    <Home/>
                </Route>

                <Route path="/myEvents">
                    <MyEvents/>
                </Route>

                <Route path="/allEvents">
                    <AllEvents/>
                </Route>

                <Route path="/eventDetails/:id">
                    <EventDetails/>
                </Route>

                <Route path="/allArtists">
                    <AllArtists/>
                </Route>

                <Route path="/artist/:artistID">
                    <ArtistDetails/>
                </Route>

                <Route path="/createEvent">
                    <CreateEvent/>
                </Route>

                <Route path="/addArtist">
                    <AddArtist/>
                </Route>

                <Route path="*">
                    <Error404/>
                </Route>

            </Switch>
            <Footer/>
        </Router>
    )
}

export default App