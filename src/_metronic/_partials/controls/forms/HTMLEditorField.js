import React, { useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { convertFromRaw, convertToRaw } from 'draft-js';
import { EditorState } from 'draft-js';

export function HTMLEditorField({
    field,
    form,
    lable,
    customFeedbackLabel,
    isrequired = false,
    toolbarCustomButtons,
    disabled,
    ...props
}) {

    const [tmp, setTmp] = useState(true)
    let [editorState, setEditorState] = useState(field.value ? EditorState.createWithContent(convertFromRaw(JSON.parse(field.value))) : EditorState.createEmpty())
    useEffect(() => {
        if(field.value === null) {
            setTmp(true)
        }
    }, [field.value])
    useEffect(() => {
       if(tmp){
        setEditorState(field.value ? EditorState.createWithContent(convertFromRaw(JSON.parse(field.value))) : EditorState.createEmpty())
       }
    }, [field.value,tmp])

    

//here
const MAX_LENGTH = "5500"
const currentContent = editorState.getCurrentContent();
    const currentContentLength = currentContent.getPlainText('').length
const _handleBeforeInput = () => {
    // console.log('print content length', currentContentLength)
    localStorage.setItem('contentLength', currentContentLength)
  
    if (currentContentLength > MAX_LENGTH - 1) {
      return 'handled';
    }
  }

//here

    return (
        <>
            {lable && <label className="mt-4">{lable}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
            <div name={field.name}>
                <Editor
            
                editorClassName="my-editorContainer"
                readOnly={disabled}
                editorState={editorState}
                onChange ={_handleBeforeInput}
                onEditorStateChange={editorState => {
                    setTmp(false)
                    setEditorState(editorState)
                    form.setFieldValue(field.name, editorState ? JSON.stringify(convertToRaw(editorState.getCurrentContent())) : null);
                }}
                editorStyle={props.readOnly ? {backgroundColor : "#f2f2f2"} : {border: "1px solid #F1F1F1"}}
                onBlur={() => form.setFieldTouched(field.name, true)}
                {...props}
                toolbarCustomButtons={toolbarCustomButtons ? toolbarCustomButtons : null}
                />
            </div>

            {form.errors[field.name] && form.touched[field.name] && (
                <div className="invalid-datepicker-feedback" style={{color:'red'}}>
                    {form.errors[field.name].toString()}
                </div>
            )}
            {currentContentLength>MAX_LENGTH-1 ? <div className="text-danger">Scope of Work cannot exceed 5500 charcaters.</div>:null}
        </>
    );
}
