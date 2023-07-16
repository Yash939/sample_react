import React, { useEffect, useMemo, useState } from 'react';
import POSTable from "../../../_commons/components/POSTable";
import { useTaskMasterUIContext } from "../TaskMasterUIContext";
import { reducerInfo, taskMasterActions } from "../_redux/TaskMasterRedux";
import { sortCaret } from '../../../../../_metronic/_helpers';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { operationalConfigMasterActions } from '../../../Masters/OperationalConfig/_redux/OperationalConfigRedux';
import { taskStatusMasterActions } from '../../../Masters/TaskStatusMaster/_redux/TaskStatusMasterRedux';
import { toAbsoluteUrl } from '../../../../../_metronic/_helpers';
import SVG from 'react-inlinesvg'
import { Field, Form, Formik } from 'formik';
import { AutoCompleteMultiSelect } from '../../../../../_metronic/_partials/controls';
import { components } from "react-select";
import { Spinner } from 'react-bootstrap';
import CancelNotesModal from './CancelNotesModal';
// import filterFactory, { selectFilter, FILTER_TYPES, customFilter, textFilter } from 'react-bootstrap-table2-filter';
// import BootstrapTable from 'react-bootstrap-table-next';
// import ProductFilter from './ProductFilter'
// import Multiselect from "multiselect-react-dropdown";


const MainTable = ({ cancelBtnRef }) => {
    const uiContext = useTaskMasterUIContext()
    const uiProps = useMemo(() => {
        return { openEditPage: uiContext.editRecordBtnClick }
    }, [uiContext])

    const dispatch = useDispatch()
    const [expanded, setExpanded] = useState(false)
    const [dbData, setDbData] = useState([])
    const [filteredData, setFilteredData] = useState([])
    const [selectedRows, setSelectedRows] = useState([])
    const [cancelError, setCancelError] = useState()
    const [nonSelectableRows, setNonSelectableRows] = useState([])
    const [modal, setModal] = useState(null)
    const [initVal, setInitVal] = useState({
        taskStatus: [],
        project: [],
        customer: [],
        planDateTime: [],
        city: [],
        country: []
    })

    const location = useLocation()
    const history = useHistory()

    const { operationalConfigMasterState, taskStatusMasterState, currentState } = useSelector(state => ({
        operationalConfigMasterState: state.operationalConfigMaster,
        taskStatusMasterState: state.taskStatusMaster,
        currentState: state[reducerInfo.name]
    }), shallowEqual)


    const days = useMemo(() => {

        if (operationalConfigMasterState?.entities && operationalConfigMasterState.entities.length > 0) {
            return operationalConfigMasterState.entities[0]['dueInDays']
        }

        return ''

    }, [operationalConfigMasterState])

    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }

    const handleChange = (event) => {
        setExpanded(!expanded)
    };

    let filter = useQuery().get("filter");
    let dashboard = useQuery().get("dashboard");
    let statusId = useQuery().get("status");


    useEffect(() => {
        if (dashboard) {
            dispatch(operationalConfigMasterActions.getAllActive())
        }
        if (statusId) {
            dispatch(taskStatusMasterActions.getAllActive())
        }
    }, [dashboard, statusId])

    const action = useMemo(() => {

        document.title = "Tickets"

        if (dashboard?.toLowerCase() === "coordinator") {
            if (filter) {
                if (filter === "running-tasks") {
                    document.title = "Running Tickets"
                } else if (filter === "todays-task") {
                    document.title = "Today's Tickets"
                } else if (filter === "tomorrows-task") {
                    document.title = "Tomorrows's Tickets"
                } else if (filter === "overdue-tasks") {
                    document.title = "Over Due Tickets"
                } else if (filter === "due-tasks") {
                    document.title = "Due in " + days + " Days Tickets"
                }

                return taskMasterActions.getCordinatorFilteredDataPaginated(filter)
            } else if (statusId) {
                const statusName = taskStatusMasterState?.entities?.filter(x => x.id.toString() === statusId)?.[0]?.taskStatusName
                if (statusName) {
                    document.title = statusName + " Tickets"
                }
                return taskMasterActions.getTaksByStatusIdPaginated(dashboard, statusId)
            }
        } else if (dashboard?.toLowerCase() === "tech") {
            if (filter) {
                return taskMasterActions.getTechFilteredData(filter)
            } else if (statusId) {
                return taskMasterActions.getTaksByStatusIdPaginated(dashboard, statusId)
            }
        } else if (dashboard?.toLowerCase() === "manager") {
            if (filter) {
                return taskMasterActions.getManagerFilteredData(filter)
            } else if (statusId) {
                const statusName = taskStatusMasterState?.entities?.filter(x => x.id.toString() === statusId)?.[0]?.taskStatusName
                if (statusName) {
                    document.title = statusName + " Tickets"
                }
                return taskMasterActions.getTaksByStatusIdPaginated(dashboard, statusId)
            }
        } else if (filter === "Open" || filter === "WIP" || filter === "Closed" || filter === "Assigned" || filter === "Confirmed" || filter === "Main" || filter === "All" || filter === "Cancelled") {
            uiContext.pageNumber = 1
            uiContext.pageSize = 20
            uiContext.queryParams.pageNumber = 1
            document.title = filter + " Tickets"
            return taskMasterActions.getTaskByStatusPaginated(filter)
        }

        return taskMasterActions.getTaskByStatus("All")
    }, [filter, dashboard, statusId, days, taskStatusMasterState])

    useEffect(() => {
        dispatch(action)
    }, [action])

    useEffect(() => {
        if (currentState?.entities) {
            setDbData(currentState.entities)
            if (location.state) {
                const tmpState = { ...location.state }
                delete tmpState?.prevPath
                setInitVal(tmpState)
                filterData(tmpState, currentState.entities)
            } else {
                setFilteredData(currentState.entities)
            }
            // setFilteredData(currentState.entities)
            setNonSelectableRows(currentState.entities.filter(x => x.taskStatus !== "Open" && x.taskStatus !== "Assigned" && x.taskStatus !== "Pending").map(x => x.id))
        }
    }, [currentState])


    const getColumns = (values) => {
        return [
            {
                dataField: "taskCode",
                text: "Ticket Code",
                sort: true,
                sortCaret: sortCaret,
                headerStyle: { whiteSpace: 'nowrap' },
                formatter: (cell, row) => {
                    return (
                        <Link  target={'_blank'} to={{
                            pathname: `/ticket/${row.id}/edit`,
                        }} rel="noopener noreferrer" >
                            <label style={{ cursor: 'pointer' }}>{cell} </label>
                        </Link>

                    )
                }
            },
            {
                dataField: "taskStatus",
                text: "Status",
                sort: true,
                sortCaret: sortCaret,
                headerStyle: { whiteSpace: 'nowrap' },
                // filter: customFilter({
                //     type: FILTER_TYPES.MULTISELECT
                // }),
                // filterRenderer: (onFilter, column) =>
                //     <ProductFilter onFilter={onFilter} column={column} />
                // filter: textFilter()

            },
            {
                dataField: "project",
                text: "Project",
                sort: true,
                sortCaret: sortCaret,
                headerStyle: { whiteSpace: 'nowrap' }
            },
            {
                dataField: "customer",
                text: "Customer",
                sort: true,
                sortCaret: sortCaret,
                headerStyle: { whiteSpace: 'nowrap' }
            },
            {
                dataField: "planDateTime",
                text: "Schedule Date",
                sort: true,
                sortCaret: sortCaret,
                headerStyle: { whiteSpace: 'nowrap' },
            },
            {
                dataField: "city",
                text: "City",
                sort: true,
                sortCaret: sortCaret,
                headerStyle: { whiteSpace: 'nowrap' }
            },
            {
                dataField: "country",
                text: "Country",
                sort: true,
                sortCaret: sortCaret,
                headerStyle: { whiteSpace: 'nowrap' }
            },
            {
                dataField: "action",
                text: "Actions",
                formatter: (cellContent, row, rowIndex,
                    { openEditPage, idFieldName, values, location }) => {
                    const tmpValues = { ...values, "prevPath": location.pathname + location.search }
                    return <a
                        title="Edit this record"
                        className="btn btn-icon btn-light btn-hover-warning btn-sm mx-3"
                        onClick={() => openEditPage(row[idFieldName], tmpValues)}
                    >
                        <span className="svg-icon svg-icon-md svg-icon-dark">
                            <SVG
                                src={toAbsoluteUrl("/media/svg/icons/Communication/Write.svg")}
                                title='Edit'
                            />
                        </span>
                    </a>
                },
                formatExtraData: {
                    openEditPage: uiProps.openEditPage,
                    idFieldName: reducerInfo.idFieldName,
                    values: values,
                    location: location
                },
                classes: "text-center pr-0",
                headerClasses: "text-center pr-3",
                headerStyle: { width: "1px" },
            }
        ];
    }

    const getFilterFieldData = (fieldName, values) => {
        let tmpData = [...dbData]
        if (values) {

            Object.keys(values).map(key => {
                if (key !== fieldName) {
                    if (values[key] && values[key].length > 0) {
                        const tmpList = values[key].map(x => x.value)
                        tmpData = tmpData.filter(x => tmpList.includes(x[key]))
                    }
                }
            })
        }
        const uniqValues = [... new Set(tmpData?.map(x => x[fieldName]))]
        return uniqValues?.map(y => ({ label: y, value: y }))
    }

    const MultiValue = props => (
        <components.SingleValue  {...props}>
            {props.selectProps.value.length} Selected
        </components.SingleValue >
    );

    const Option = props => {
        return (
            <div>
                <components.Option {...props}>
                    <input
                        type="checkbox"
                        checked={props.isSelected}
                        onChange={() => null}
                    />{" "}
                    <label>{props.label}</label>
                </components.Option>
            </div>
        );
    };

    const handleClearFilter = (resetForm) => {
        history.replace({ ...location, state: undefined });
        setFilteredData(dbData)
        setInitVal({
            taskStatus: [],
            project: [],
            customer: [],
            planDateTime: [],
            city: [],
            country: []
        })
        // resetForm()
    }

    const handleCancelTickets = (resetForm) => {

        setCancelError(null)

        if (selectedRows?.length > 0) {

            const cancelNotesModal = <CancelNotesModal
                closeModalHandler={() => setModal(null)}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                action={action}
                setCancelError={setCancelError}
                resetForm={resetForm}
            />
            setModal(cancelNotesModal)

        } else {
            alert("Please select atleast one ticket to Cancel")
            return
        }
    }

    const filterData = (values, data) => {

        let tmpFilterData = [...data]

        Object.keys(values).map(key => {
            if (values[key] && values[key].length > 0) {
                const tmpList = values[key].map(x => x.value)
                tmpFilterData = tmpFilterData.filter(x => tmpList.includes(x[key]))
            }
        })

        setFilteredData(tmpFilterData)
    }


    return (<>
        {modal ? modal : null}
        <Formik
            enableReinitialize={true}
            initialValues={initVal}
            onSubmit={(values) => {

                const tmpValues = { ...values, "prevPath": location.pathname + location.search }

                history.replace({ ...location, state: tmpValues });
                setInitVal(values)
                filterData(values, dbData)
            }}
        >
            {({
                values,
                handleSubmit,
                resetForm,
            }) => (
                <Form className="form form-label-right">
                    {cancelError ? <div style={{ color: 'red' }}>Error in Cancel Ticket: {cancelError?.userMessage}</div> : null}
                    {currentState?.actionLoading || currentState?.listLoading ?
                        <div className="text-center">
                            <Spinner animation="grow" variant="warning" /> &nbsp;
                            <Spinner animation="grow" variant="dark" /> &nbsp;
                            <Spinner animation="grow" variant="warning" /> &nbsp;
                        </div> : <>
                            <div className="card" style={{ boxShadow: "0px 0px 2px #555", marginBottom: '10px' }}>
                                <h6
                                    className="card-header p-0"
                                    style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                                >
                                    <div>
                                        <div style={{ float: 'left', cursor: 'pointer' }} onClick={() => handleChange()}>
                                            {expanded ?
                                                <button
                                                    type="button"
                                                    onClick={() => handleChange()}
                                                    className="btn"
                                                >
                                                    <SVG src={toAbsoluteUrl("/media/svg/icons/Code/Minus.svg")} />
                                                </button> :
                                                <button
                                                    type="button"
                                                    // onClick={() => handleChange()}
                                                    className="btn"
                                                >
                                                    <SVG src={toAbsoluteUrl("/media/svg/icons/Code/Plus.svg")} />
                                                </button>}
                                            Filters
                                        </div>
                                        <div style={expanded ? { display: 'flex', float: 'right' } : { display: 'none' }}>
                                            <button
                                                type="submit"
                                                onSubmit={() => handleSubmit()}
                                                className="btn"
                                            >
                                                <i className="fa fa-filter" style={{ color: 'green' }}></i>
                                                Apply Filter
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleClearFilter(resetForm)}
                                                className="btn"
                                            >
                                                {/* <i class="fa-solid fa-filter-slash"></i> */}
                                                <i className="fa fa-filter" style={{ color: 'red' }}></i>
                                                Clear Filter
                                            </button>
                                        </div>
                                    </div>
                                </h6>
                                <div className="card-body" style={expanded ? { paddingTop: '0px' } : { display: 'none' }}>
                                    <div className='row'>
                                        <div className="col-md-3">
                                            <Field
                                                name="taskStatus"
                                                component={AutoCompleteMultiSelect}
                                                label="Status"
                                                options={getFilterFieldData("taskStatus", values)}
                                                components={{ Option, MultiValue }}
                                                closeMenuOnSelect={false}
                                                hideSelectedOptions={false}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <Field
                                                name="customer"
                                                component={AutoCompleteMultiSelect}
                                                label="Customer"
                                                options={getFilterFieldData("customer", values)}
                                                components={{ Option, MultiValue }}
                                                closeMenuOnSelect={false}
                                                hideSelectedOptions={false}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <Field
                                                name="project"
                                                component={AutoCompleteMultiSelect}
                                                label="Project"
                                                options={getFilterFieldData("project", values)}
                                                components={{ Option, MultiValue }}
                                                closeMenuOnSelect={false}
                                                hideSelectedOptions={false}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <Field
                                                name="country"
                                                component={AutoCompleteMultiSelect}
                                                label="Country"
                                                options={getFilterFieldData("country", values)}
                                                components={{ Option, MultiValue }}
                                                closeMenuOnSelect={false}
                                                hideSelectedOptions={false}
                                            />
                                        </div>
                                    </div>
                                    <div className='row'>
                                        <div className="col-md-3">
                                            <Field
                                                name="city"
                                                component={AutoCompleteMultiSelect}
                                                label="City"
                                                options={getFilterFieldData("city", values)}
                                                components={{ Option, MultiValue }}
                                                closeMenuOnSelect={false}
                                                hideSelectedOptions={false}
                                            />
                                        </div>
                                        <div className="col-md-3">
                                            <Field
                                                name="planDateTime"
                                                component={AutoCompleteMultiSelect}
                                                label="Schedule Date"
                                                options={getFilterFieldData("planDateTime", values)}
                                                components={{ Option, MultiValue }}
                                                closeMenuOnSelect={false}
                                                hideSelectedOptions={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                style={{ display: "none" }}
                                ref={cancelBtnRef}
                                onClick={() => handleCancelTickets(resetForm)}
                            />

                            <POSTable
                                uiContext={uiContext}
                                extraUIProps={{}}
                                reducerInfo={reducerInfo}
                                columns={getColumns(values)}
                                // customActions={action}
                                paginated
                                customState={currentState}
                                customData={filteredData}
                                selectRow={{
                                    mode: 'checkbox',
                                    selected: selectedRows,
                                    nonSelectable: nonSelectableRows,
                                    hideSelectAll: true,
                                    hideSelectColumn: filter === "All" ? false : true,
                                    onSelect: (row, isSelect, rowIndex, e) => {
                                        if (row.taskStatus === "Open" || row.taskStatus === "Assigned" || row.taskStatus === "Pending") {
                                            if (isSelect) {
                                                setSelectedRows([...selectedRows, row.id])
                                            } else {
                                                setSelectedRows(selectedRows.filter(x => x !== row.id))
                                            }
                                            return true
                                        }
                                        return false
                                    },
                                }}
                            />
                        </>
                    }
                </Form>
            )}
        </Formik>
    </>)
};

// const selectOptions = [
//     { value: 0, label: 'good' },
//     { value: 1, label: 'Bad' },
//     { value: 2, label: 'unknown' }
// ];

// const columns1 = [{
//     dataField: 'id',
//     text: 'Product ID'
// }, {
//     dataField: 'name',
//     text: 'Product Name',
//     // formatter: cell => {
//     //     return productState.map(x => x.name).map(y => ({[y] : y}))[cell]},
//     filter: selectFilter({
//         options: productState.map(x => x.name).map(y => ({ label: y, value: y }))
//     })
// }, {
//     dataField: 'quality',
//     text: 'Product Quailty',
//     formatter: cell => selectOptions.filter(opt => opt.value === cell)[0]?.label || '',
//     filter: customFilter({
//         type: FILTER_TYPES.MULTISELECT
//     }),
//     filterRenderer: (onFilter, column) =>
//         <ProductFilter onFilter={onFilter} column={column} />
// }];



export default MainTable;