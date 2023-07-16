import React, { useState } from 'react'
import { Modal } from 'react-bootstrap';
import { sortCaret, toAbsoluteUrl } from '../../../../../_metronic/_helpers';
import POSEditableTable from '../../../_commons/components/POSEditableTable';
import SVG from "react-inlinesvg";
import { payOutInFieldsMapping, searchInArray } from '../../../_commons/Utils';
import { taskMasterActions } from '../_redux/TaskMasterRedux';
import { useDispatch } from 'react-redux';

const AssignEngineerModal = ({ closeModalHandler, data, values, setTimingsData, setUpdateError, convertBlankToNull }) => {

    const [selectedRowsIDs, setSelectedRowsIDs] = useState([])
    const [searchText, setSearchText] = useState("")
    const tableData = data?.map((x, index) => ({ ...x, keyField: index }))
    const engineersList = values?.engineersList ?? []
    const dispatch = useDispatch()

    let tmpSelectedRows = tableData.filter(x => engineersList.includes(x.id))?.map(x => x.keyField)

    const [selectedRows, setSelectedRows] = useState(tmpSelectedRows ? tmpSelectedRows : [])

    const saveButtonClicked = (e) => {

        let val = { ...values }
        setTimingsData(val, values)

        const colArray = ["abhPayinRate", "abhPayoutRate", "obhPayinRate", "obhPayoutRate", "rbhPayinRate", "rbhPayoutRate", "weekendPayInFlatRate", "weekendPayInMultiplier", "weekendPayOutFlatRate", "weekendPayOutMultiplier", "travelChargesPayIn", "materialChargesPayIn", "parkingChargesPayIn", "otherChargesPayIn", "travelCharges", "materialCharges", "parkingCharges", "otherCharges", "minHoursPayIn", "minHoursPayOut", "fullDayRatesPayIn", "fullDayRatesPayOut"]

        for (let index = 0; index < colArray.length; index++) {
            const col = colArray[index];
            if (val[col] === "") {
                if (val[payOutInFieldsMapping[col]] === "") {
                    alert("Please fill Rates/Hour details first")
                    return
                }
            }
        }

        if (!val.payOutCurrencyId) {
            alert("Please fill Rates/Hour details first")
            return
        } else if(val.payOutCurrencyId <= 0) {
            alert("Please fill Rates/Hour details first")
            return
        }

        convertBlankToNull(val)

        if (!window.confirm("This will create " + selectedRowsIDs.length + " tickets. Do you want to continue?")) {
            return
        }

        val.engineersList = selectedRowsIDs

        delete val?.taskDTLList
        delete val?.taskLogs
        delete val?.projectMST
        delete val?.cityMST
        delete val?.countryMST
        delete val?.currentUser
        delete val?.organizationMST
        delete val?.taskDetails
        delete val?.taskStatusMST
        delete val?.taskUser
        delete val?.taskPriorityMST
        delete val?.taskAttachments
        delete val?.payInCurrency
        delete val?.payOutCurrency
        delete val?.stateMST
        delete val?.settlementMST
        delete val?.projectManager
        delete val?.projectCoOrdinator
        delete val?.projectBranchDTL


        val.minHoursPayIn = val.minHoursPayIn !== null ? val.minHoursPayIn * 60 : null
        val.minHoursPayOut = val.minHoursPayOut !== null ? val.minHoursPayOut * 60 : null

        closeModalHandler()

        dispatch(taskMasterActions.startCall())
        dispatch(taskMasterActions.updateCustom(val)).then(res1 => {
            dispatch(taskMasterActions.fetchEntity(res1.id)).then(res3 => {

            })
        }).catch(err => {
            dispatch(taskMasterActions.stopCall())
            setUpdateError(err?.userMessage)
        })

    }

    const searchData = (rows) => {
        try {
            let qObj = {}
            if (searchText)
                qObj = { 'engineerName': searchText }
            return searchInArray(rows, qObj, [])
        } catch (error) {
            return []
        }
    }

    return (
        <Modal
            style={{ backgroundColor: 'rgba(0,0,0,.3)' }}
            show={true}
            // size={entity.length < 22 ? "md" : "lg"}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton className="p-2" style={{ position: 'sticky', top: 0, backgroundColor: '#f7f7f7', zIndex: '99999' }}>
                <Modal.Title bsPrefix="h6 mt-2">
                    Assign Engineers
                </Modal.Title>
                <Modal.Title bsPrefix="h6 mt-2 pl-5 w-80" style={{ flex: 'max-content' }}>
                    <div className="input-group float-right" style={{ maxWidth: '300px' }}>
                        <div className="input-group-prepend">
                            <div className="input-group-text">
                                <span className="svg-icon svg-icon-md svg-icon-dark">
                                    <SVG
                                        src={toAbsoluteUrl(
                                            "/media/svg/icons/General/Search.svg"
                                        )}
                                    />
                                </span>
                            </div>
                        </div>
                        <input
                            type="text"
                            className="form-control"
                            name="searchText"
                            placeholder="Search in all fields"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                        />
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <POSEditableTable
                    data={searchData(tableData, searchText)}
                    columns={[
                        {
                            dataField: "engineerName",
                            text: "Engineer Name",
                            sort: true,
                            sortCaret: sortCaret,
                            editable: false
                        },
                    ]}
                    selectRow={{
                        mode: 'checkbox',
                        selected: selectedRows,
                        onSelect: (row, isSelect, rowIndex, e) => {
                            if (isSelect) {
                                setSelectedRows([...selectedRows, row.keyField])
                                setSelectedRowsIDs([...selectedRowsIDs, row.id])
                            } else {
                                setSelectedRows(selectedRows.filter(x => x !== row.keyField))
                                setSelectedRowsIDs(selectedRowsIDs.filter(x => x !== row.id))
                            }
                        },
                        hideSelectAll: true
                    }}
                />
            </Modal.Body>

            <Modal.Footer className="p-1" bsPrefix="text-center modal-footer text-center" style={{ position: 'sticky', bottom: 0, backgroundColor: "#efefef", borderTop: '2px solid #ccc' }}>
                <div className="w-100">
                    <button style={{ width: '200px', margin: '0px 10px' }} className="btn pinaple-black-btn" onClick={() => closeModalHandler()}> Cancel</button>
                    <button style={{ width: '200px', margin: '0px 10px' }} className="btn pinaple-yellow-btn " onClick={saveButtonClicked}>Save</button>
                </div>
            </Modal.Footer>

        </Modal>
    )
}

export default AssignEngineerModal;