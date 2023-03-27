import React, { useState } from 'react'
import { useInput } from '../../hooks/hooks'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const ArtistForm = () => {

    // states for modal
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true)

    // state for modal content
    const [success, setSuccess] = useState(true)

    //state for form inputs
    const [nameProp, resetName] = useInput('')
    const [genreProp, resetGenre] = useInput('')
    const [labelProp, resetLabel] = useInput('')
    const [album1, resetAlbum1] = useInput('')
    const [album2, resetAlbum2] = useInput('')
    const [album3, resetAlbum3] = useInput('')
    const [single1, resetSingle1] = useInput('')
    const [single2, resetSingle2] = useInput('')
    const [single3, resetSingle3] = useInput('')
    const [bio, resetBio] = useInput('')

    function resetFormValues() {
        resetName()
        resetBio()
        resetGenre()
        resetLabel()
        resetAlbum1()
        resetAlbum2()
        resetAlbum3()
        resetSingle1()
        resetSingle2()
        resetSingle3()
    }

    const submit = async e => {
        e.preventDefault()
        let data = {
            name: nameProp.value,
            bio: bio.value,
            genre: genreProp.value,
            label: labelProp.value,
            albums: [album1.value, album2.value, album3.value],
            singles: [single1.value, single2.value, single3.value]
        }
        const body = JSON.stringify(data)
        const headers = {"Content-type": "application/json"}
        let response = await fetch('http://localhost:3000/artists', {method: 'POST', body, headers})
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

    return (
        <>
        <h1 className="display-1 text-center mt-5" style={{fontFamily: "Futura, Arial"}}>Add an Artist</h1>
            <p className="lead text-center">Are we missing out on an artist? Fill out the form below to add them to our database!</p>
        <Form onSubmit={submit}>
            <Form.Group controlId="name">
                <Form.Label>Name of Artist</Form.Label>
                <Form.Control {...nameProp} size="lg" type="text" placeholder="Enter Name of Artist" />
            </Form.Group>
            <Row className="mt-3">
                <Col lg={6}>
                    <Form.Group controlId="genre">
                        <Form.Label>Genre</Form.Label>
                        <Form.Control {...genreProp} size="lg" type="text" placeholder="Enter Genre" required />
                    </Form.Group>
                </Col>
                <Col lg={6}>
                    <Form.Group controlId="music label">
                        <Form.Label>Music Label</Form.Label>
                        <Form.Control {...labelProp} size="lg" type="text" placeholder="Enter Music Label" required />
                    </Form.Group>
                </Col>
            </Row>
            <Row>
                <Col lg={6}>
                    <Form.Group controlId="albums" className="mt-3">
                        <Form.Label>Albums</Form.Label>
                        <Form.Control {...album1} size="lg" type="text" placeholder="Enter Album 1" required />
                        <Form.Control {...album2} className="mt-3" size="lg" type="text" placeholder="Enter Album 2" required />
                        <Form.Control {...album3} className="mt-3" size="lg" type="text" placeholder="Enter Album 3" required />
                    </Form.Group>
                </Col>
                <Col lg={6}>
                    <Form.Group controlId="singles" className="mt-3">
                        <Form.Label>Singles</Form.Label>
                        <Form.Control {...single1} size="lg" type="text" placeholder="Enter Single 1" required />
                        <Form.Control {...single2} className="mt-3" size="lg" type="text" placeholder="Enter Single 2" required />
                        <Form.Control {...single3} className="mt-3" size="lg" type="text" placeholder="Enter Single 3" required />
                    </Form.Group>
                </Col>
            </Row>
            <Row className="mt-4">
                <Col>
                    <Form.Group controlId="bio">
                        <Form.Label>Bio</Form.Label>
                        <Form.Control as="textarea" size="lg"{...bio} rows="5" placeholder="Enter a short bio" />
                    </Form.Group>
                </Col>
            </Row>
            <Row className="row text-center my-5">
                <Col>
                    <button className="ui button teal massive" type="submit">Submit</button>
                </Col>
            </Row>
        </Form>

        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{success ? "Artist Added!" : "An error has occured."}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{success ? "You have successfully added an artist to our database!" : "Something went wrong:( Please try again."}</Modal.Body>
            <Modal.Footer>
            <button className="ui button" onClick={handleClose}>
                Close
            </button>
            </Modal.Footer>
        </Modal>
        </>
    ) 
}

export default ArtistForm