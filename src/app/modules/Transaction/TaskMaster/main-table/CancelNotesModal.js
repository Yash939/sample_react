import React, { useMemo, useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap';
import { Field, Form, Formik } from 'formik';
import { useDispatch } from 'react-redux';
import { HTMLEditorField } from '../../../../../_metronic/_partials/controls/forms/HTMLEditorField';
import { taskMasterActions } from '../_redux/TaskMasterRedux';
import { convertFromRaw, EditorState } from 'draft-js';

const CancelNotesModal = ({ selectedRows, setSelectedRows, action, resetForm, closeModalHandler }) => {

    const dispatch = useDispatch()
    const [cancelError, setCancelError] = useState(null)

    const initValue = {
        notes: null
    }

    return (
        <Modal
            style={{ backgroundColor: 'rgba(0,0,0,.3)' }}
            show={true}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            dialogClassName='custom-modal'

        >
            <Formik
                enableReinitialize={true}
                initialValues={initValue}
                onSubmit={(values) => {

                    if (values.notes) {
                        const editorData = EditorState.createWithContent(convertFromRaw(JSON.parse(values.notes)))

                        if (editorData.getCurrentContent().getPlainText() !== "") {
                            let val = {
                                notes: values.notes,
                                notesText: editorData.getCurrentContent().getPlainText(),
                                taskMSTIds: selectedRows
                            }

                            dispatch(taskMasterActions.startCall())
                            
                            taskMasterActions.cancelMultiple(val).then(res => {
                                dispatch(taskMasterActions.stopCall())
                                setSelectedRows([])
                                dispatch(action)
                                resetForm()
                                closeModalHandler(true)
                            }).catch(err => {
                                dispatch(taskMasterActions.stopCall())
                                setCancelError(err)
                            })
                            
                        } else {
                            alert("Please add cancellation note")
                        }

                    } else {
                        alert("Please add cancellation note")
                    }


                }}
            >
                {
                    ({ handleSubmit, handleReset, values, setFieldValue }) => (

                        <Form>
                            <Modal.Header closeButton className="p-2" style={{ position: 'sticky', top: 0, backgroundColor: '#f7f7f7', zIndex: '99999' }}>
                                <Modal.Title bsPrefix="h6 mt-2">
                                    Add Cancellation Note
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                            {cancelError ? <div style={{ color: 'red' }}>Error in Cancel Ticket: {cancelError?.userMessage}</div> : null}
                                <div className="form-group row">
                                    <div className="col-12">
                                        <Field
                                            name="notes"
                                            component={HTMLEditorField}
                                            placeholder="Add your Note here...."
                                        />
                                    </div>
                                </div>

                            </Modal.Body>

                            <Modal.Footer className="p-1" bsPrefix="text-center modal-footer text-center" style={{ position: 'sticky', bottom: 0, backgroundColor: "#efefef", borderTop: '2px solid #ccc' }}>
                                <div className="w-100">
                                    <button style={{ width: '200px', margin: '0px 10px' }} type="button" className="btn pinaple-black-btn" onClick={() => closeModalHandler()}>Close</button>
                                    <button style={{ width: '200px', margin: '0px 10px' }} type='submit' className="btn pinaple-yellow-btn " onSubmit={() => handleSubmit()}>Save</button>
                                </div>
                            </Modal.Footer>
                        </Form>
                    )
                }
            </Formik >
        </Modal>
    )
}

export default CancelNotesModal;