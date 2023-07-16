import { convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import moment from 'moment-timezone';
import React, { useRef, useMemo } from 'react'
import { Modal } from 'react-bootstrap';
import * as css from '../CustomDialog.css'

const NotesHistoryModal = ({ closeModalHandler, data }) => {

    const timezone = moment.tz.guess(true)

    const values = useMemo(() => {
        return data?.filter(x => x.notes !== null)?.map(x => ({
            ...x,
            modifiedOn: moment.tz(x.modifiedOn, "utc").tz(timezone).format('YYYY-MM-DD HH:mm')
        }))?.slice()?.sort(function (a, b) {
            return new Date(b.modifiedOn) - new Date(a.modifiedOn);
        }) ?? []
    }, [data])

    // const htmlDecode = (input) => {
    //     var e = document.createElement('div');
    //     e.innerHTML = input;
    //     return e.childNodes.length === 0 ? "" : e.childNodes[0].nodeValue;
    // }

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
                    Notes History
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {values.map((x,index) => {
                    const editorData = EditorState.createWithContent(convertFromRaw(JSON.parse(x.notes)))
                    /* dangerouslySetInnerHTML={{ __html: htmlDecode(draftToHtml(convertToRaw(editorData.getCurrentContent()))) }} */
                    return (<div key={index} style={{ backgroundColor: '#F3F6F9', borderRadius: '10px', marginBottom: '10px' }}>
                        <div style={{ padding: '4px', fontWeight:'bold' }}>
                            {x.modifiedOn} &nbsp;&nbsp;
                            User:&nbsp;
                            {x?.createdByUser?.userName}
                        </div>
                        <div style={{ padding: '4px' }} >
                            {editorData.getCurrentContent().getPlainText()}
                        </div>
                    </div>)
                })}
            </Modal.Body>

            <Modal.Footer className="p-1" bsPrefix="text-center modal-footer text-center" style={{ position: 'sticky', bottom: 0, backgroundColor: "#efefef", borderTop: '2px solid #ccc' }}>
                <div className="w-100">
                    <button style={{ width: '200px', margin: '0px 10px' }} className="btn pinaple-black-btn" onClick={() => closeModalHandler()}> Cancel</button>
                </div>
            </Modal.Footer>

        </Modal>
    )
}

export default NotesHistoryModal;