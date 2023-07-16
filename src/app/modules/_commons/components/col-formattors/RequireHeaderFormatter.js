import React from 'react'

const isDanger = <span className="text-danger font-weight-bold">*</span>

export const requireHeaderFormatter = (column, colIndex) => {
    return (<span>{column.text}{isDanger}</span>)
}