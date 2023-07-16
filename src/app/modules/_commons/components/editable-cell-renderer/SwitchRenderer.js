import { Switch } from '@material-ui/core'
import React from 'react'

const SwitchRenderer = (editorProps) => {

    const getValue = (event) => {
        return event.target.checked;
    }

    return (
        <Switch
            checked={editorProps.defaultValue}
            onChange = {(e) => editorProps.onUpdate(getValue(e))}
        ></Switch>
    )
} 

export default SwitchRenderer;