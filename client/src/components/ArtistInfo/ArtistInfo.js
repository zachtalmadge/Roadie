import React from 'react'
import { Link } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import MusicStreamingButtons from '../MusicStreamingButtons'
import UiCard from '../UiCard'
import UiSegment from '../UiSegment'

const ArtistInfo = ({ name, bio, genre, label, albums, singles }) => (

        <Container className="my-5">
            <Row className="row text-center">
                <h1 className="display-1 mb-4" style={{fontFamily: "Futura"}}>{name}</h1>
            </Row>
            <Row>
                <Col lg={6}>
                    <img src="../images/placeholder.png" className="img-fluid rounded mb-3 shadow"/>
                </Col>
                <Col lg={6} className="d-flex flex-column justify-content-around text-center">
                    <UiSegment header='Biography' data={bio} />
                <Row className="mb-5">
                    <Col lg={6}>
                        <UiCard header="Genre" data={genre} />
                    </Col>
                    <Col lg={6}>
                        <UiCard header="Label" data={label} />
                    </Col>  
                    </Row>
                    <Row>
                        <Col lg={6}>
                            <UiCard header="Singles" data={singles} />
                        </Col>
                        <Col lg={6}>
                            <UiCard header="Albums" data={albums} />
                        </Col>
                    </Row>
                </Col>
            </Row>
            <Row className="text-center mt-5">
                <MusicStreamingButtons/>
            </Row>
            <Row className="text-center my-5">
                <Col>
                    <Link to="/allArtists" className="ui button huge labeled icon">
                        Back To Artists <i className="ui arrow left icon"></i>
                    </Link>
                </Col>
            </Row>
        </Container>
)

export default ArtistInfo