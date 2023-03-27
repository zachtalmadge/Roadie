import React from 'react'
import { useParams } from 'react-router-dom'
import { useFetch } from '../../hooks/hooks'
import ArtistInfo from '../../components/ArtistInfo'

const ArtistDetails = () => {

    const { artistID } = useParams()
    const { data, loading, error } = useFetch(`http://localhost:3000/artists/${artistID}`)

    if (loading) return <h1>Loading...</h1>
    if (error) return <h1>There has been an error :(</h1>

    return ( <ArtistInfo {...data} /> )
}

export default ArtistDetails