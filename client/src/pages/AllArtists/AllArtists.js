import React from 'react'
import { Link } from 'react-router-dom'
import ArtistCard from '../../components/ArtistCard'
import { useFetch } from '../../hooks/hooks'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const AllArtists = () => {

    const { data } = useFetch('http://localhost:3000/artists')

    return(
        <>
        <Container>
            <Row className="text-center">
                <h1 className="display-1 mt-5" style={{fontFamily: "Futura, Arial"}}>All Artists</h1>
                <p className="lead"><i>Please view our collection of world class DJ's</i></p>
            </Row>
            <Row className="text-center">
                {data.map((artist, i) => <ArtistCard key={i} {...artist}/>)}
            </Row>
            <Row className="text-center my-5">
                <Col>
                    <Link to="/addArtist">
                        <button className="ui button right labeled icon massive"><i className="ui icon add"></i>Add Artist</button>
                    </Link>
                </Col>
            </Row>
        </Container>
        </>
    )

}

export default AllArtists