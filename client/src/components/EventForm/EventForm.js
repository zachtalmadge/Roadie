import React, { useState } from 'react'
import { useInput } from '../../hooks/hooks'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const EventForm = () => {

    // states for modal
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true)

    // state for modal content
    const [success, setSuccess] = useState(false)

    // form inputs
    const [nameProp, resetName] = useInput('')
    const [venueProp, resetVenue] = useInput('')
    const [locationProp, resetLocation] = useInput('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [artist1, resetArtist1] = useInput('')
    const [artist2, resetArtist2] = useInput('')
    const [artist3, resetArtist3] = useInput('')
    const [artist4, resetArtist4] = useInput('')
    const [artist5, resetArtist5] = useInput('')
    const [artist6, resetArtist6] = useInput('')
    const [attendanceProp, resetAttendance] = useInput('')

    function resetFormValues() {
        resetName()
        resetVenue()
        resetLocation()
        setStartDate('')
        setEndDate('')
        resetArtist1()
        resetArtist2()
        resetArtist3()
        resetArtist4()
        resetArtist5()
        resetArtist6()
        resetAttendance()
    }

    const submit = async e => {
        e.preventDefault()
        let data = {
                name: nameProp.value,
                venue: venueProp.value,
                location: locationProp.value,
                startDate,
                endDate,
                headliners: [artist1.value, artist2.value, artist3.value, artist4.value, artist5.value],
                attendance: attendanceProp.value,
                camping: e.target.elements.camping.value
        }

        const body = JSON.stringify(data)
        const headers = {'Content-type': 'application/json'}

        let response = await fetch('http://localhost:3000/festivals', { method: "POST", body, headers })
        if (response.status === 200) {
                setSuccess(true)
                handleShow()
                resetFormValues()
        }
        else {
                setSuccess(false)
                handleShow()
        }
    }

    return(
        <>
        <Form onSubmit={submit}>
            <h2 className="text-center mt-5 mt-2 display-1" style={{fontFamily:"Futura, Arial"}}>Create an Event</h2>
            <p className="lead text-center">Don't see an event you know of? Fill out the form below to add it to our database!</p>

            <Form.Group controlId="name" className="my-3">
                <Form.Label>Name of Event</Form.Label>
                <Form.Control {...nameProp} size="lg" type="text" 
                              placeholder="Enter Name of Event" required />
            </Form.Group>
            <Row>
                <Col lg={6}>
                    <Form.Group controlId="venue" className="my-3">
                        <Form.Label>Venue</Form.Label>
                        <Form.Control {...venueProp} size="lg" type="text"
                                      placeholder="Enter Name of Venue" required />
                    </Form.Group>
                </Col>
                <Col lg={6}>
                    <Form.Group controlId="location" className="my-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control {...locationProp} size="lg" type="text" 
                                      placeholder="Enter (City, State Abbreviation)" required />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col lg={6}>
                    <Form.Group controlId="start-date">
                        <Form.Label>Start Date</Form.Label>
                        <Form.Control value={ startDate } onChange={e => setStartDate(e.target.value)} 
                                      size="lg" type="date" required />
                    </Form.Group>
                </Col>
                <Col lg={6}>
                    <Form.Group controlId="end-date">
                        <Form.Label>end Date</Form.Label>
                        <Form.Control value={ endDate } onChange={e => setEndDate(e.target.value)} 
                                      size="lg" type="date" required />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <h4 className="mt-5 text-center">Headlining Artists</h4>
                <Col lg={4}>
                    <Form.Control {...artist1} className="my-3" placeholder="Artist 1" required />
                </Col>
                <Col lg={4}>
                    <Form.Control {...artist2} className="my-3" placeholder="Artist 2" required />
                </Col>
                <Col lg={4}>
                    <Form.Control {...artist3} className="my-3" placeholder="Artist 3" required />
                </Col>
            </Row>
            <Row>
                <Col lg={4}>
                    <Form.Control {...artist4} className="my-3" placeholder="Artist 4" required />
                </Col>
                <Col lg={4}>
                    <Form.Control {...artist5} className="my-3" placeholder="Artist 5" required />
                </Col>
                <Col lg={4}>
                    <Form.Control {...artist6} className="my-3" placeholder="Artist 6" required />
                </Col>
            </Row>
            <Row>
                <Col sm={6}>
                    <Form.Group controlId="attendance">
                        <Form.Label>Estimated Attendance</Form.Label>
                        <Form.Control {...attendanceProp} type="text" required />
                    </Form.Group>
                </Col>
                <Col sm={6}>
                    <Form.Group controlId="camping">
                        <Form.Label>Camping</Form.Label>
                        <Form.Check type="radio" name="camping" label="Yes" value="true"/>
                        <Form.Check type="radio" name="camping" label="None" value="false"/>
                    </Form.Group>
                </Col>
            </Row>
            <div className="text-center">
                <button className="ui teal button massive mt-5" type="submit">Submit</button>
            </div>
        </Form>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{success ? "Event Added" : "An error has occurred:("}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{success ? "An event has been added to our database!" : "Something went wrong. Please try again."}</Modal.Body>
            <Modal.Footer>
            <button className="ui button" onClick={handleClose}>
                Close
            </button>
            </Modal.Footer>
        </Modal>
        </>
    )
}

export default EventForm