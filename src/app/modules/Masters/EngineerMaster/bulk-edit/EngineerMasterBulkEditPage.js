import { Form, Formik } from 'formik';
import React, { useEffect, useMemo, useState } from 'react';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { sortCaret } from '../../../../../_metronic/_helpers';
import {
    Card,
    CardHeader,
    CardHeaderToolbar,
    CardBody
} from "../../../../../_metronic/_partials/controls/Card";
import { StatusColumnFormatter } from '../../../_commons/components/col-formattors/StatusColumnFormatter';
// import POSTableFilter from '../../_commons/components/POSTableFilter';
import POSEditableTable from '../../../_commons/components/POSEditableTable'
import { searchInArray } from '../../../_commons/Utils';
import { engineerMasterActions } from '../_redux/EngineerMasterRedux';
const headerButtonStyles = {
    minWidth: "85px",
    whiteSpace: 'nowrap'
}

const EngineerMasterBulkEditPage = () => {
    const dispatch = useDispatch()
    const history = useHistory()

    const { engineerMasterState } = useSelector((state) =>
    ({
        engineerMasterState: state.engineerMaster
    }), shallowEqual)

    const [selectedRows, setSelectedRows] = useState([])
    const [selectedRowsIDs, setSelectedRowsIDs] = useState([])
    const [searchText, setSearchText] = useState("")
    const [bulkOption, setBulkOption] = useState("ACTIVE")
    const [saveError, setSaveError] = useState("")

    const columns = [
        {
            dataField: "engineerName",
            text: "Engineer Name",
            sort: true,
            sortCaret: sortCaret,
            editable: false
        },
        {
            dataField: "countryName",
            text: "Country",
            sort: true,
            sortCaret: sortCaret,
            editable: false
        },
        {
            dataField: "primaryEmailId",
            text: "Email",
            sort: true,
            sortCaret: sortCaret,
            editable: false
        },
        {
            dataField: "primaryContactNumber",
            text: "Mobile#",
            sort: true,
            sortCaret: sortCaret,
            editable: false
        },
        {
            dataField: "POC",
            text: "POC",
            sort: true,
            sortCaret: sortCaret,
            editable: false
        },
        {
            dataField: "active",
            text: "Status",
            sort: true,
            sortCaret: sortCaret,
            formatter: StatusColumnFormatter,
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' },
            editable: false
        }
    ];

    useEffect(() => {
        dispatch(engineerMasterActions.getAll())
    }, [])

    const entities = useMemo(() => {
        if (engineerMasterState?.entities) {
            if (bulkOption === "ACTIVE") {
                const tmpData = engineerMasterState?.entities?.filter(x => x.active === true).map((x, index) => ({ ...x, 
                    keyField: index,
                    countryName: x?.countryMST?.countryName,
                    POC: x?.pointOfContact?.engineerName
                 }))
                return tmpData
            } else {
                const tmpData = engineerMasterState?.entities?.filter(x => x.active === false).map((x, index) => ({ ...x, 
                    keyField: index,
                    countryName: x?.countryMST?.countryName,
                    POC: x?.pointOfContact?.engineerName
                }))
                return tmpData
            }

        }
        return []
    }, [engineerMasterState, bulkOption])

    const data = useMemo(() => {

        if (!Array.isArray(entities))
            return []
        try {
            let qObj = {}
            if (searchText)
                columns.forEach(col => {
                    qObj[col.dataField] = searchText
                });
            return searchInArray(entities, qObj, [])
        } catch (error) {
            console.log(error)
            return []
        }
    }, [entities, searchText, columns])

    return (
        <Formik
            enableReinitialize={true}
            initialValues={data}
            onSubmit={(values) => {
                setSaveError("")
                let message = ""

                if(bulkOption === "ACTIVE") {
                    message = "Are you sure you want to inactive selected Rows?"
                } else {
                    message = "Are you sure you want to active selected Rows?"
                }

                if (!window.confirm(message)) {
                    return
                }

                let val = []
                if(bulkOption === "ACTIVE") {
                    val = selectedRowsIDs.map(x => ({"id": x, "isActive": false}))
                } else {
                    val = selectedRowsIDs.map(x => ({"id": x, "isActive": true}))
                }

                engineerMasterActions.updateMultiple(val).then(res => {
                    history.goBack()
                }).catch(err => {
                    setSaveError(err?.userMessage)
                })
                
            }}
            onReset={(values) => {
                setSaveError("")
                setSelectedRows([])
                setSelectedRowsIDs([])
            }}
        >
            {
                ({ handleSubmit, handleReset, values }) => (
                    <Form className="form form-label-right">
                        <Card>
                            <CardHeader title={
                                <input
                                    type="text"
                                    className="form-control"
                                    name="searchText"
                                    placeholder="Search in all fields"
                                    values={searchText}
                                    onChange={(e) => {
                                        setSearchText(e.target.value)
                                    }}
                                />
                            }>
                                <CardHeaderToolbar>
                                    <button
                                        type="button"
                                        onClick={() => history.goBack()}
                                        className="btn btn-light"
                                        style={headerButtonStyles}
                                    >
                                        <i className="fa fa-arrow-left"></i>
                                        Back
                                    </button>
                                    <button
                                        className="btn btn-light ml-2"
                                        style={headerButtonStyles}
                                        type="reset"
                                    // onClick={() => handleReset()}
                                    >
                                        <i className="fa fa-redo"></i>
                                        Reset
                                    </button>
                                    <button
                                        type="submit"
                                        style={headerButtonStyles}
                                        className="btn pinaple-yellow-btn smbtn"
                                    // onClick={() => handleSubmit()}
                                    >
                                        <i className="fa fa-save" style={{ color: "#777" }}></i>
                                        Save
                                    </button>
                                </CardHeaderToolbar>
                            </CardHeader>
                            <CardBody>
                                {saveError ? <div style={{color:'red', textAlign:'center',paddingBottom:'5px'}}>{saveError}</div> : null}

                                <div style={{ paddingBottom: '5px' }} onChange={(event) => {
                                    setBulkOption(event.target.value)
                                    setSelectedRows([])
                                    setSelectedRowsIDs([])
                                }}>
                                    <input type="radio" value="ACTIVE" name="bulkEdit" defaultChecked /> Active&nbsp;&nbsp;&nbsp;
                                    <input type="radio" value="INACTIVE" name="bulkEdit" /> Inactive
                                </div>
                                <POSEditableTable
                                    data={values}
                                    columns={columns}
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
                                        onSelectAll: (isSelect, rows, e) => {
                                            if (isSelect) {
                                                setSelectedRows(rows.map(x => x.keyField))
                                                setSelectedRowsIDs(rows.map(x => x.id))
                                            } else {
                                                setSelectedRows([])
                                                setSelectedRowsIDs([])
                                            }
                                        }
                                    }}
                                />
                            </CardBody>
                        </Card>
                    </Form>
                )
            }
        </Formik>
    );
};

export default EngineerMasterBulkEditPage;