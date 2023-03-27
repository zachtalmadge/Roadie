import React from 'react'

const UiCard = ({header, data = [] }) => (
    <div className="ui card">
        <h6 className="ui top attatched label" style={{fontSize: 15}}>{header}</h6>
        {typeof data === 'string'
            ? 
            <p className="lead">{data}</p> 
            : 
            data.map((item, i) => <p key={i} className="content" style={{fontSize:18}} >{item}</p>)}
    </div>
)

export default UiCard