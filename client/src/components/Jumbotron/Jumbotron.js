import React from 'react'
import { Link } from 'react-router-dom'
import "./Jumbotron.css"

const Jumbotron = () => (
    <div className="text-center jumbotron-fluid py-5 text-light d-flex flex-column justify-content-center">
        <div className="row">
            <div className="col-lg-6 mb-5 pb-5">
            <h1 className="display-1" style={{textShadow:"1px 1px 20px black"}}>Roadie</h1>
            <p className="lead" style={{textShadow:"1px 1px 20px black"}}><i>The premier event planning app.</i></p>
            <Link to="allEvents">
            <button className="ui button inverted huge">View Events <i className="fa fa-arrow-right"></i></button>
            </Link>
            </div>
        </div>
    </div>
)

export default Jumbotron