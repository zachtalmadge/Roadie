import React from 'react'
import { useFetch } from '../../hooks/hooks'
import { useParams } from 'react-router-dom'
import EventInfo from '../../components/EventInfo'

const EventDetails = () => {

    const { id } = useParams()
    const { loading, data, error } = useFetch(`http://localhost:3000/festivals/${id}`)

    if (loading) return(<h1>Loading...</h1>)
    if (error) return(<pre>{JSON.stringify(error, null, 2)}</pre>)

    return(<EventInfo {...data}/>)
}

export default EventDetails