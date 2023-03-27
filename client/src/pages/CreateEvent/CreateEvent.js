import React from 'react'
import EventForm from '../../components/EventForm'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const CreateEvent = () => {

    return(
        <Container className="pb-5 mb-5">
            <Row>
                <Col className="col">
                    <EventForm/>
                </Col>
            </Row>
        </Container>
    )
}

export default CreateEvent