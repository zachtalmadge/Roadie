import React from 'react'

const UiArtistSegment = ({header, artists}) => (
    <div style={{minHeight: "8rem"}} className="ui segment text-center">
        <div className="ui top attached label" style={{fontSize: 15}}>{header}</div>
        {artists instanceof Array 
        ? 
        <p className="lead" style={{fontSize: 25}}>{artists.join('   ▪ ️ ')}</p> 
        : 
        <p className="lead" style={{fontSize: 25}}>TBA</p>}
    </div>
)

export default UiArtistSegment