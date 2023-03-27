import React, { useEffect } from 'react'

const Error404 = () => {
    
    useEffect(() => {
        document.title = "Page Not Found"
        return () => document.title = "Roadie"
    })

    return(
        <div className="container text-center">
            <div className="row py-5">
                <p style={{fontSize: 200}}>🤷‍♂️</p>
                <h1 className="display-4">Whoops! Looks like nothing is here.</h1>
                <h1 className="display-6">Page Not Found</h1>
            </div>
        </div>
    )
}

export default Error404