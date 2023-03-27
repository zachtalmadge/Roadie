import React from 'react'
import Jumbotron from '../../components/Jumbotron'
import IntroBlurb from '../../components/IntroBlurb'
import Testimonials from '../../components/Testimonials'
import FeaturedEvents from '../../components/FeaturedEvents'

const Home = () => {
    return(
        <>
        <Jumbotron/>
        <IntroBlurb/>
        <Testimonials/>
        <FeaturedEvents/>
        </>
    )
}

export default Home