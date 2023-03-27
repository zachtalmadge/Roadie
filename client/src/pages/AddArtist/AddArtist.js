import React from 'react'
import ArtistForm from '../../components/ArtistForm'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

const AddArtist = () => {
    return(
        <Container>
            <Row>
                <ArtistForm/>
            </Row>
        </Container>
    )
}

export default AddArtist