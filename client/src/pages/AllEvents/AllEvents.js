import React from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/hooks'
import EventCard from '../../components/EventCard'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const AllEvents= () => {

   const { data, loading, error } = useFetch('http://localhost:3000/festivals')
   if (loading) return <h1>Loading....</h1>
   if (error) return <h1>Whoops! There has been an error...</h1>

    return(
        <Container>
            <Row className="text-center mt-5">
                <h1 className="display-1" style={{fontFamily: "Futura, Arial"}}>All Festivals</h1>
                <p classlist="lead"><i>Browse our selection of curated events below. You can view more details about a particular event or add them to your schedule right away</i></p>
            </Row>
            <Row>
                {data.map((event, i) => <EventCard key={i} {...event}/> )}
            </Row>
            <Row className="text-center my-5">
                <Col>
                    <Link to="/createEvent">
                        <button className="ui button right labeled icon massive"><i className="ui icon add"></i>Create Event</button>
                    </Link>
                </Col>
            </Row>
        </Container>
    )
}

export default AllEvents