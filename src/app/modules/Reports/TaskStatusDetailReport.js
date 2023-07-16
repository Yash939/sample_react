import { Field, Formik } from 'formik'
import React, { useEffect, useMemo, useState } from 'react'
import { Form, Spinner } from 'react-bootstrap';
import { sortCaret, toAbsoluteUrl } from '../../../_metronic/_helpers';
import { AutoCompleteSelect, Card, CardBody, CardHeader, CardHeaderToolbar } from '../../../_metronic/_partials/controls';
import { KeyboardDatePickerField } from '../../../_metronic/_partials/controls/forms/KeyboardDatePickerField';
import SVG from "react-inlinesvg";
import BootstrapTable from 'react-bootstrap-table-next';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { reportsActions } from './_redux/ReportsRedux';
import { Link } from 'react-router-dom';
import { exportToCsv, searchInArray } from '../_commons/Utils';
import * as Yup from "yup";
import moment from 'moment';

const headerButtonStyles = {
    minWidth: "85px",
    whiteSpace: 'nowrap'
}

const TaskStatusDetailReport = () => {

    const [searchText, setSearchText] = useState("")
    const dispatch = useDispatch()
    const [filterData, setFilterData] = useState([])
    const [filterDataError, setFilterDataError] = useState("")

    const { actionLoading, listLoading, error, entities, loadingMessage } = useSelector((state) => ({
        actionLoading: state.reports.actionLoading,
        listLoading: state.reports.listLoading,
        error: state.reports.error,
        entities: state.reports.entities,
        loadingMessage: state.reports.loadingMessage
    }), shallowEqual)

    const initialVals = useMemo(() => {
        return {
            fromDate: null,
            toDate: null,
            organizationId: null,
            projectId: null,
            statusId: null,
            userId: null,
        };
    }, []);

    const actualHoursFormatter = (value) => {
        if (value) {
            let tmpMin = value
            let tmpHours = Math.floor(value / 60);
            let tmpMins = tmpMin % 60;
            tmpMins = tmpMins === 0 ? "00" : tmpMins
            tmpHours = tmpHours < 10 ? "0" + tmpHours : tmpHours
            return tmpHours + ":" + String("0" + tmpMins).slice(-2)
        }
        return "00:00"
    }
    const cols = [
        {
            dataField: "countryName",
            text: "Country",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "stateName",
            text: "State",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "cityName",
            text: "City",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "zipCode",
            text: "Zip Code",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "customerName",
            text: "Customer",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "projectName",
            text: "Project",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "taskCode",
            text: "Ticket Code",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' },
            formatter: (cell, row) => {
                return (
                    <Link to={{
                        pathname: `/ticket/${row.taskId}/edit/readonly`,
                    }} rel="noopener noreferrer" >
                        <label style={{ cursor: 'pointer' }}> {row.taskCode}</label>
                    </Link>

                )
            },
        },
        {
            dataField: "taskType",
            text: "Ticket Type",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' },
            // formatter: (cell) => cell === 1 ? 'Onsite' : cell === 2 ? 'Online' : "",
            // exportFormatter: (cell) => cell === 1 ? 'Onsite' : cell === 2 ? 'Online' : "",
        },
        {
            dataField: "taskUser",
            text: "Assigned Engineer",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "startDate",
            text: "Start Date - Time",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "endDate",
            text: "End Date - Time",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "actualHours",
            text: "Actual Hours",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' },
            formatter: (cell) => actualHoursFormatter(cell)
        },
        {
            dataField: "statusName",
            text: "Status",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        // {
        //     dataField: "",
        //     text: "View",
        //     headerStyle: { whiteSpace: 'nowrap',position: 'sticky' },
        //     style:{ position: 'sticky'},
        //     formatter: (cell, row) => {
        //         return (
        //             <Link to={{
        //                 pathname: `/ticket/${row.taskId}/edit/readonly`,
        //             }} target="_blank" rel="noopener noreferrer" >
        //                 <img
        //                     src={toAbsoluteUrl("/media/svg/icons/General/Eye.svg")}
        //                     alt=""
        //                     style={{ cursor: 'pointer' }}
        //                     title="View Ticket"
        //                 />
        //             </Link>

        //         )
        //     },
        // },
    ]

    const GetPropertyValue = (obj1, dataToRetrieve) => {
        return dataToRetrieve
            .split('.') // split string based on `.`
            .reduce(function (o, k) {
                return o && o[k]; // get inner property if `o` is defined else get `o` and return
            }, obj1) // set initial value as object
    }

    const rows = useMemo(() => {

        if (!Array.isArray(entities))
            return []
        try {
            let rTmp = entities?.map((x, i) => ({ ...x, keyField: i })) ?? []

            let qObj = {}
            if (searchText)
                cols.forEach(col => {
                    // console.log("------------------------------------------")
                    // console.log(col.dataField)
                    // console.log(GetPropertyValue(rTmp,col.dataField))
                    qObj[col.dataField] = searchText
                });
            return searchInArray(rTmp, qObj, [])
        } catch (error) {
            console.log(error)
            return []
        }
    }, [entities, searchText, cols])

    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            fromDate: Yup.string().nullable().required("From Date Required"),
            toDate: Yup.string().nullable().required("To Date Required"),
        });
    }, [entities])

    useEffect(() => {
        document.title = "Ticket Status Detail Report"
        setFilterDataError("")
        dispatch(reportsActions.reIniState())
        dispatch(reportsActions.getTaskStatusFilterData()).then(res => {
            setFilterData(res)
        }).catch(err => setFilterDataError(err))
    }, [])

    return (
        <Formik
            enableReinitialize={true}
            initialValues={initialVals}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                dispatch(reportsActions.getData("taskDetail", values, "post"))
            }}
        >
            {
                ({ handleSubmit, handleReset, setFieldValue, values }) => (
                    <Form className="form form-label-right">
                        <Card>
                            <CardHeader title="Ticket Status Detail Report">
                                <CardHeaderToolbar>
                                    {(
                                        <>
                                            <button
                                                type="button"
                                                style={headerButtonStyles}
                                                className="btn btn-light ml-2"
                                                onClick={() => exportToCsv(cols,rows)}
                                            >
                                                <i className="fa fa-table" style={{ color: "#777" }}></i>
                                                Export CSV
                                            </button>

                                            <button
                                                type="submit"
                                                style={headerButtonStyles}
                                                className="btn pinaple-yellow-btn ml-2"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    handleSubmit()
                                                }}
                                            >
                                                <i className="fa fa-database" style={{ color: "#777" }}></i>
                                                Get Data
                                            </button>
                                        </>
                                    )}
                                </CardHeaderToolbar>
                            </CardHeader>
                            <CardBody id="summary-report">
                                {
                                    actionLoading || listLoading ?
                                        <div className="text-center">
                                            <Spinner animation="grow" variant="warning" /> &nbsp;
                                            <Spinner animation="grow" variant="dark" /> &nbsp;
                                            <Spinner animation="grow" variant="warning" /> &nbsp;
                                            {loadingMessage ? <><br /><br />{loadingMessage}</> : ''}
                                        </div> :

                                        <div className="text-center text-danger mb-3">
                                            {error ? (
                                                <div className="text-center text-danger mb-3">
                                                    Error: {error.userMessage}
                                                    {/* <small>({error.error.message})</small> */}
                                                </div>
                                            ) : ""}
                                        </div>
                                }
                                {
                                    <div className="text-center text-danger mb-3">
                                        {filterDataError ? (
                                            <div className="text-center text-danger mb-3">
                                                Error: {filterDataError.userMessage}
                                            </div>
                                        ) : ""}
                                    </div>
                                }
                                <div style={{ display: actionLoading || listLoading ? 'none' : 'initial' }}>
                                    <div className="form-group row">
                                        <div className="col-12 col-md-3">
                                            <Field
                                                name="fromDate"
                                                component={KeyboardDatePickerField}
                                                placeholder="Select From Date"
                                                lable="From Date"
                                                format="YYYY-MM-DD"
                                                isrequired
                                                maxDate={moment().format("yyyy-MM-DD")}
                                            />
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <Field
                                                name="toDate"
                                                component={KeyboardDatePickerField}
                                                placeholder="Select To Date"
                                                lable="To Date"
                                                format="YYYY-MM-DD"
                                                isrequired
                                                maxDate={moment().format("yyyy-MM-DD")}
                                            />
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <Field
                                                name="organizationId"
                                                component={AutoCompleteSelect}
                                                options={filterData?.organization?.map(x => ({ label: x.name, value: x.id })) ?? []}
                                                placeholder="Select Customer"
                                                label="Customer"
                                            />
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <Field
                                                name="projectId"
                                                component={AutoCompleteSelect}
                                                options={filterData?.project?.map(x => ({ label: x.name, value: x.id })) ?? []}
                                                placeholder="Select Project"
                                                label="Project"
                                            />
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <Field
                                                name="userId"
                                                component={AutoCompleteSelect}
                                                options={filterData?.user?.map(x => ({ label: x.name, value: x.id })) ?? []}
                                                placeholder="Select User"
                                                label="User"
                                            />
                                        </div>
                                        <div className="col-12 col-md-3">
                                            <Field
                                                name="statusId"
                                                component={AutoCompleteSelect}
                                                options={filterData?.status?.map(x => ({ label: x.name, value: x.id })) ?? []}
                                                placeholder="Select Status"
                                                label="Status"
                                            />
                                        </div>
                                    </div>

                                    <hr />
                                    <div className="row mb-2">
                                        <div className="col-lg-12">
                                            <div className="input-group">
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
                                                    values={searchText}
                                                    onChange={(e) => {
                                                        setSearchText(e.target.value)
                                                    }}
                                                />
                                            </div>
                                            {/* <small className="form-text text-muted">
                                        <b>Search</b> in all fields
                                    </small> */}
                                        </div>
                                    </div>

                                    <BootstrapTable
                                        keyField="keyField"
                                        columns={cols}
                                        data={rows}
                                        noDataIndication={<div className="text-center bg-light p-2">No Records Found</div>}
                                        style={{ backgroundColor: "#000" }}
                                    />
                                </div>
                            </CardBody>
                        </Card>
                    </Form>
                )
            }
        </Formik >
    )
}

export default TaskStatusDetailReport;