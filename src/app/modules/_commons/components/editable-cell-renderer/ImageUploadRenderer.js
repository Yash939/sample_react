import React from 'react'

const ImageUploadRenderer = (editorProps) => {

    const getValue = (event) => {
        // alert(event.target.files)
        return event.target.files[0]
        // return <img style={{width:'20px',height:'30px'}} src={URL.createObjectURL(event.target.files[0])} alt="" /> 
    }

    return (
        <input type="file" accept="image/jpg,image/jpeg,image/gif,image/png" onChange = {(e) => editorProps.onUpdate(getValue(e))}/>
    )
}

export default ImageUploadRenderer;