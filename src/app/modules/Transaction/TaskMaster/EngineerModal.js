import React, { useRef, useState } from 'react'
import { Modal } from 'react-bootstrap';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import EditForm from '../../Masters/EngineerMaster/edit-page/EditForm'
import { engineerMasterActions, reducerInfo } from '../../Masters/EngineerMaster/_redux/EngineerMasterRedux';
import * as css from './CustomDialog.css'

const EngineerModal = ({ closeModalHandler }) => {

    const submitBtnRef = useRef()
    const dispatch = useDispatch()
    const { currentState } = useSelector((state) =>
    ({
        currentState: state.engineerMaster,
    }), shallowEqual)

    const saveButtonClicked = () => {
        if (submitBtnRef && submitBtnRef.current) {
            submitBtnRef.current.click()
        }
    }

    const saveRecord = (value) => {
        dispatch(engineerMasterActions.create(value)).then(e => {
            dispatch(engineerMasterActions.getAllActive())
            closeModalHandler()
        }).catch(e => console.log(e));
    }

    return (
        <Modal
            style={{ backgroundColor: 'rgba(0,0,0,.3)' }}
            show={true}
            // size={entity.length < 22 ? "md" : "lg"}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            dialogClassName='custom-engineer-modal'
        >
            <Modal.Header closeButton className="p-2" style={{ position: 'sticky', top: 0, backgroundColor: '#f7f7f7', zIndex: '99999' }}>
                <Modal.Title bsPrefix="h6 mt-2">
                    Add Engineer
                </Modal.Title>
                {currentState?.error ?
                    <div className="text-center text-danger mb-3">
                        Error: {currentState?.error.userMessage}
                    </div> : null}
            </Modal.Header>

            <Modal.Body>
                <EditForm enitity={reducerInfo.initialEnitity} submitBtnRef={submitBtnRef} saveRecord={saveRecord} />
            </Modal.Body>

            <Modal.Footer className="p-1" bsPrefix="text-center modal-footer text-center" style={{ position: 'sticky', bottom: 0, backgroundColor: "#efefef", borderTop: '2px solid #ccc' }}>
                <div className="w-100">
                    <button style={{ width: '200px', margin: '0px 10px' }} className="btn pinaple-black-btn" onClick={() => closeModalHandler()}> Cancel</button>
                    <button style={{ width: '200px', margin: '0px 10px' }} className="btn pinaple-yellow-btn " disabled={currentState.actionLoading} onClick={saveButtonClicked}>Save</button>
                </div>
            </Modal.Footer>

        </Modal>
    )
}

export default EngineerModal;