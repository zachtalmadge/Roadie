import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from 'react-bootstrap/Modal'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'
import Col from 'react-bootstrap/Col'

const EventCard = ({ _id, name, headliners, venue, location, startDate, endDate, added }) => {

    // states for modal
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true)


    // add event to 'My Schedule'
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

    // formatted dates
    startDate = new Date(startDate).toLocaleDateString().replace(/\/202(3||4)/, '')
    endDate = new Date(endDate).toLocaleDateString()

    return (
        <>
       <Col lg={3} md={4} sm={6} className="my-5">
            <Card className="shadow">
                <Card.Img variant='top' src="./images/placeholder.png" alt="Festival Image Placeholder" />
                <Card.Body>
                    <Card.Title><b>{name}</b></Card.Title>
                    <Card.Text>{headliners.join(' ▪️ ')}</Card.Text>
                </Card.Body>
                <ListGroup variant="flush">
                    <ListGroup.Item><i className="fa fa-map-marker-alt" style={{color: "orangered"}}></i> {venue} | {location}</ListGroup.Item>
                    <li className="list-group-item"><i className="calendar outline icon"></i>{startDate} - {endDate}</li>
                </ListGroup>
                <Card.Body>
                    <Link to={`eventDetails/${_id}`} className="ui tiny button">View Details</Link>
                    <button data-festival={_id} onClick={e => add(e)} disabled={added ? true : false} className="ui button teal tiny right labeled icon mt-3"><i className="icon add"></i>Add to Schedule</button>
                </Card.Body>
            </Card>
       </Col>
       
       <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Event Added!</Modal.Title>
            </Modal.Header>
            <Modal.Body>{name} has been added to your schedule.</Modal.Body>
            <Modal.Footer>
                <Link to="/myEvents">
                    <button className="ui button teal" onClick={handleClose}>
                        View My Schedule
                    </button>
                </Link>
                <button className="ui button" onClick={handleClose}>
                    Close
                </button>
            </Modal.Footer>
        </Modal>
       </>
    )
}

export default EventCard