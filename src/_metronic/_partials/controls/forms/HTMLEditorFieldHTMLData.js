import React, { useEffect, useState } from "react";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import { ContentState, convertFromHTML, convertFromRaw, convertToRaw } from 'draft-js';
import { EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';

export function HTMLEditorFieldHTMLData({
    field,
    form,
    lable,
    customFeedbackLabel,
    isrequired = false,
    toolbarCustomButtons,
    ...props
}) {

    const blocksFromHTML = convertFromHTML(field.value ? field.value : "<p></p>\n");
    const state = ContentState.createFromBlockArray(
        blocksFromHTML.contentBlocks,
        blocksFromHTML.entityMap,
    );

    const [editorState, setEditorState] = useState(EditorState.createWithContent(state))
    const [tmp, setTmp] = useState(true)

    useEffect(() => {
        if (field.value && tmp) {
            const blocksFromHTML = convertFromHTML(field.value);
            const state = ContentState.createFromBlockArray(
                blocksFromHTML.contentBlocks,
                blocksFromHTML.entityMap,
            );

            setEditorState(EditorState.createWithContent(state))
        }
    }, [field.value,tmp])

    return (
        <>
            {lable && <label className="mt-4">{lable}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
            <div>
                <Editor
                    editorState={editorState}
                    onEditorStateChange={editorState => {
                        setTmp(false)
                        setEditorState(editorState)
                        form.setFieldValue(field.name, editorState ? draftToHtml(convertToRaw(editorState.getCurrentContent())) : null);
                    }}
                    editorStyle={props.readOnly ? { backgroundColor: "#f2f2f2" } : {}}
                    onBlur={() => form.setFieldTouched(field.name, true)}
                    {...props}
                    toolbarCustomButtons={toolbarCustomButtons ? toolbarCustomButtons : null}
                />
            </div>

            {form.errors[field.name] && form.touched[field.name] && (
                <div className="invalid-datepicker-feedback" style={{ color: 'red' }}>
                    {form.errors[field.name].toString()}
                </div>
            )}
        </>
    );
}
