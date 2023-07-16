import React from 'react'
import Select from "react-select";

const SelectRenderer = ({ editorProps, options }) => {

    const getValue = (option) => {
        return option?.value ?? null
    }

    return (
        <Select
            options={options}
            onChange={(option) => editorProps.onUpdate(getValue(option))}
            value={editorProps?.defaultValue ?? ''}
        >

        </Select>
    )

}

export default SelectRenderer;