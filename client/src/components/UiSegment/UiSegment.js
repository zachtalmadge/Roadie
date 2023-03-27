import React from 'react'

const UiSegment = ({header, data}) => (
    <div style={{minHeight: "8rem"}} className="ui segment">
        <div className="ui top attached label" style={{fontSize:15}}>{header}</div>
        <p>{data}</p>
    </div>
)

export default UiSegment