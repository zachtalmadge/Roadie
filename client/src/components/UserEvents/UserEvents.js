import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from 'react-bootstrap/Modal'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'


const UserEvent = ({ _id, name, startDate, endDate, venue, location, onRemove = f => f }) => {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true)

    //formatted dates
    startDate = new Date(startDate).toLocaleDateString().replace(/\/202(3||4)/, '')
    endDate = new Date(endDate).toLocaleDateString().replace(/\/202(3||4)/, '')

    return (
        <>
        <Col xl={4} className="my-5">
            <Card className="shadow">
                <Card.Img variant="top" src="./images/placeholder.png" alt="Festival Image Placeholder" />
                <Card.Body>
                    <Card.Title ><b>{name}</b></Card.Title>
                </Card.Body>
                <ListGroup variant="flush">
                    <ListGroup.Item><i className="calendar outline icon"></i>{startDate} - {endDate}</ListGroup.Item>
                    <ListGroup.Item><i className="fa fa-map-marker-alt" style={{color: "orangered"}}></i> {venue} | {location}</ListGroup.Item>
                </ListGroup>
                <Card.Body>
                    <button onClick={() => handleShow()}  className="ui button large labeled icon mt-3"><i className="icon trash"></i>Remove</button>
                    <Link to={`eventDetails/${_id}`} className="ui teal large button">View Details</Link>
                </Card.Body>
            </Card>
        </Col>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Are you sure?</Modal.Title>
            </Modal.Header>
            <Modal.Body>Please confirm if you would like to remove this event from your schedule.</Modal.Body>
            <Modal.Footer>
            <button className="ui button" onClick={handleClose}>
                Cancel
            </button>
            <button className="ui button teal" data-festival={_id} onClick={() => onRemove(_id, name, handleClose())}>
                Confirm
            </button>
            </Modal.Footer>
        </Modal>
        </>
    )
}

export default UserEvent