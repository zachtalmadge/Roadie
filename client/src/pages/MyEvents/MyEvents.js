import React from 'react'
import { Link } from 'react-router-dom'
import { useFetch } from '../../hooks/hooks'
import UserEvent from '../../components/UserEvents'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

const MyEvents = () => {
    let { data, setData } = useFetch('http://localhost:3000/user')

    function byDate(a,b) {
        return a.startDate > b.startDate ? 1 : -1
    }

    async function removeEvent(e) {
        let festivalID = e
        let response = await fetch(`http://localhost:3000/user/${festivalID}`, {method: "DELETE"})
        if (response.status === 200) {
            data = data.filter(event => event._id !== festivalID)
            setData(data)
        }
        else {
            alert('something went wrong :(')
        }
    }

    return(
        <Container className="container">
            <Row className="text-center mt-4">
                <h1 className="display-2" style={{fontFamily: "Futura, Arial"}}>My Schedule</h1>
                {data.length === 0 
                ? ( <>
                    <p className="text-center lead">There are no currently no events on your schedule. View "All Festivals" to add to your schedule!</p> 
                    <Link to="/allEvents"><button className="ui button large right labeled icon teal mb-4"><i className="ui icon right arrow"></i>All Festivals</button></Link>
                    </> 
                ) : 
                data.sort(byDate).map((event, i) => <UserEvent key={i} {...event} onRemove={removeEvent}/>)}
            </Row>
        </Container>
    )
}

export default MyEvents