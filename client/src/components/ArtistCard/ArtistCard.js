import React from 'react'
import { Link } from 'react-router-dom'
import Col from 'react-bootstrap/Col'
import Card from 'react-bootstrap/Card'
import ListGroup from 'react-bootstrap/ListGroup'

const ArtistCard = ({ _id, name, genre, label }) => (

    <Col lg={3} md={4} className="my-5">
        <Card className="shadow">
        <Card.Img src="./images/placeholder.png" alt="Festival Image Placeholder"/>
            <Card.Body>
                <Card.Title><b>{name}</b></Card.Title>
            </Card.Body>
            <ListGroup variant="flush">
                <ListGroup.Item><i className="icon music"></i>{genre}</ListGroup.Item>
                <ListGroup.Item><i className="icon bookmark outline"></i><b>{label}</b></ListGroup.Item>
            </ListGroup>
            <Card.Body>
                <Link to={`/artist/${_id}`} className="ui button teal right labeled icon">
                    <i className="ui icon info circle"></i>
                    More Info
                </Link>
            </Card.Body>
        </Card>
    </Col>
)

export default ArtistCard