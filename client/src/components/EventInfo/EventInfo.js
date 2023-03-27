import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Image from 'react-bootstrap/Image'
import UiArtistSegment from '../UiArtistSegment'
import './EventInfo.css'

const EventInfo = ({ _id, name, venue, location, headliners, startDate, endDate, added, attendance, camping }) => {  

    // states for modal
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true)

    const add = async e => {
        const festivalID = e.target.dataset.festival
        
        let response = await fetch(`http://localhost:3000/user/${festivalID}`, {method: "PUT"})
        if (response.status === 200) {
            e.target.disabled = true
            handleShow()
        }   
        else {
            alert('something went wrong :((')
        }
    }

    //formatted dates
    const month = new Intl.DateTimeFormat('en-US', {month: 'long'}).format(new Date(startDate))
    const start = new Date(startDate).getDay()
    const end = new Date(endDate).getDay()
    const year = new Date(endDate).getFullYear()


    return (
        <>
        <Container className="container my-5 pb-0">
            <Row className="mt-5 mb-2 text-center">
                <h1 className="display-1" style={{fontFamily:"Futura"}}>{name}</h1>
            </Row>
            <Row className="mt-3 pt-0 mb-4">
                <p className="text-center lead">{venue} | {month} {start} - {end}, {year} | {location}</p>
            </Row>
            <Row>
                <Col lg={6}>
                    <Image src="../images/placeholder.png" className="shadow" rounded fluid />
                </Col >
                <Col lg={6} className="d-flex flex-column justify-content-around">
                        <UiArtistSegment header='Headliners' artists={headliners}/>
                        <UiArtistSegment header="Supporting Artists (In Alphabetical Order)" artists="TBA"/>
                    <Row className="my-4">
                        <Col lg={6}> 
                            <h6 className="display-6 text-center"><i className="fa fa-campground"></i>Camping</h6>
                            <p className="lead text-center"><i className={camping ? "check green icon large " : "x red icon large " }></i>{camping ? "Yes" : "No"}</p>
                        </Col>
                        <Col lg={6}> 
                            <h6 className="display-6 text-center"><i className="circular users icon"></i> {attendance}+</h6>
                        </Col>
                    </Row>
                    <div className="ui buttons">
                        <button disabled className="ui button large">Official Website</button>
                        <button disabled className="ui button large right labeled icon yellow">Tickets <i className="icon ticket"></i></button>
                    </div>
                </Col>
            </Row>
            <div className="row text-center mt-5 pt-5">
                <div className="col">
                    <Link to="/allEvents" className="ui button huge mt-3">
                        All Festivals
                    </Link>
                    <button 
                        data-festival={_id} 
                        onClick={e => add(e)} 
                        disabled={added ? true : false} 
                        className="ui button teal huge right labeled icon mt-3">
                            <i className="icon add"></i>
                            Add to Schedule
                    </button>
                    <Link to="/myEvents" className="ui button huge mt-3">
                        My Schedule
                    </Link>
                </div>
            </div>
        </Container>
        
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Event Added!</Modal.Title>
            </Modal.Header>
            <Modal.Body>{name} has been added to your schedule.</Modal.Body>
            <Modal.Footer>
                <button className="ui button" onClick={handleClose}>
                    Close
                </button>
            </Modal.Footer>
        </Modal>
        </>
    )
}

export default EventInfo