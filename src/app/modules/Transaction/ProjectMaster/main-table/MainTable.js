import React, { useEffect, useMemo, useState } from 'react';
import POSTable from "../../../_commons/components/POSTable";
import { useProjectMasterUIContext } from "../ProjectMasterUIContext";
import { reducerInfo, projectMasterActions } from "../_redux/ProjectMasterRedux";
import { sortCaret } from '../../../../../_metronic/_helpers';
import { ActionsColumnFormatter } from '../../../_commons/components/col-formattors/ActionsColumnFormatter';
import { Link,useLocation } from 'react-router-dom';
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { operationalConfigMasterActions } from '../../../Masters/OperationalConfig/_redux/OperationalConfigRedux';
import { toAbsoluteUrl } from '../../../../../_metronic/_helpers';
import SVG from 'react-inlinesvg'
import { Field, Form, Formik } from 'formik';
import { AutoCompleteMultiSelect } from '../../../../../_metronic/_partials/controls';
import { components } from "react-select";

const MainTable = () => {

    const uiContext = useProjectMasterUIContext()
    const dispatch = useDispatch()
    const [expanded, setExpanded] = useState(false)
    const [dbData, setDbData] = useState([])
    const [filteredData, setFilteredData] = useState([])

    const uiProps = useMemo(() => {
        return {
            openEditPage: uiContext.editRecordBtnClick
        }
    }, [uiContext])

    const { authState, operationalConfigMasterState, currentState } = useSelector(state => ({
        authState: state.auth,
        operationalConfigMasterState: state.operationalConfigMaster,
        currentState: state[reducerInfo.name]
    }), shallowEqual)

    const handleChange = (event) => {
        setExpanded(!expanded)
    };

    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }

    let filter = useQuery().get("filter");
    let dashboard = useQuery().get("dashboard");
    
    // let filter = location?.query?.filter
    // let dashboard = location?.query?.dashboard

    const days = useMemo(() => {

        if (operationalConfigMasterState?.entities && operationalConfigMasterState.entities.length > 0) {
            return operationalConfigMasterState.entities[0]['projectDueInDays']
        }

        return ''

    }, [operationalConfigMasterState])

    useEffect(() => {
        dispatch(operationalConfigMasterActions.getAllActive())
    }, [])

    const action = useMemo(() => {

        document.title = "Project"

        if (dashboard?.toLowerCase() === "manager") {
            if (filter) {
                if (filter === "projects-allocated") {
                    document.title = "Projects Allocated"
                } else if (filter === "project-expiry") {
                    document.title = "Projects Expiry in "+ days + " Days"
                }
                return projectMasterActions.getManagerFilteredDataPaginated(filter)
            }
        }

        return projectMasterActions.getPaginated()

    }, [filter, dashboard, days])
    
    useEffect(() => {
        dispatch(action)
    }, [action])

    useEffect(() => {
        if (currentState?.entities) {
            setDbData(currentState.entities)
            setFilteredData(currentState.entities)
        }
    }, [currentState])

    const columns = [
        {
            dataField: "projectCode",
            text: "Project Code",
            sort: true,
            sortCaret: sortCaret,
            formatter: (cell, row) => {
                return (
                    <Link target={'_blank'} to={{
                        pathname: `/project/${row.id}/edit`,
                    }} rel="noopener noreferrer" >
                        <label style={{ cursor: 'pointer' }}>{cell} </label>
                    </Link>

                )
            },
            headerStyle: { whiteSpace: 'nowrap', }
          
        },
        {
            dataField: "projectName",
            text: "Project Name",
            sort: true,
            sortCaret: sortCaret,
        },
        {
            dataField: "customerName",
            text: "Customer",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "startDate",
            text: "Start Date",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "endDate",
            text: "End Date",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { whiteSpace: 'nowrap' }
        },
        {
            dataField: "projectStatusType",
            text: "Status",
            sort: true,
            sortCaret: sortCaret,
            formatter: (cell) => {
                if (cell) {
                    if (cell === "ACTIVE")
                        return <span className="label label-lg label-light-warning label-inline">
                            Active
                        </span>
                    else if (cell === "CLOSE")
                        return <span className="label label-lg label-light-danger label-inline">
                            Close
                        </span>
                }
                return ""
            }
        },
        // {
        //     dataField: "active",
        //     text: "Status",
        //     sort: true,
        //     sortCaret: sortCaret,
        //     formatter: StatusColumnFormatter,
        //     classes: "text-center",
        //     headerClasses: "text-center",
        //     headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        // },
        {
            dataField: "action",
            text: "Actions",
            formatter: ActionsColumnFormatter,
            formatExtraData: {
                openEditPage: uiProps.openEditPage,
                idFieldName: reducerInfo.idFieldName,
            },
            classes: "text-center pr-0",
            headerClasses: "text-center pr-3",
            headerStyle: { width: "1px" },
        }
    ];

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

    const initValues = {
        customerName: [],
        endDate: [],
        projectStatusType: [],
        startDate: [],
    }

    const handleClearFilter = (resetForm) => {
        setFilteredData(dbData)
        resetForm()
    }

    return (<>
        <Formik
            enableReinitialize={true}
            initialValues={initValues}
            onSubmit={(values) => {

                let tmpFilterData = [...dbData]

                Object.keys(values).map(key => {
                    if (values[key] && values[key].length > 0) {
                        const tmpList = values[key].map(x => x.value)
                        tmpFilterData = tmpFilterData.filter(x => tmpList.includes(x[key]))
                    }
                })

                setFilteredData(tmpFilterData)
            }}
        >
            {({
                values,
                handleSubmit,
                resetForm,
            }) => (
                <Form className="form form-label-right">
                    <div className="card" style={{ boxShadow: "0px 0px 2px #555", marginBottom: '10px' }}>
                        <h6
                            className="card-header p-0"
                            style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                        >
                            <div>
                                <div style={{ float: 'left', cursor:'pointer' }} onClick={() => handleChange()}>
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
                                        </button> }
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
                        <div className="card-body" style={expanded ? { display: 'flex', paddingTop: '0px' } : { display: 'none' }}>
                            <div className="col-md-3">
                                <Field
                                    name="customerName"
                                    component={AutoCompleteMultiSelect}
                                    label="Customer"
                                    options={getFilterFieldData("customerName", values)}
                                    components={{ Option, MultiValue }}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                />
                            </div>
                            <div className="col-md-3">
                                <Field
                                    name="startDate"
                                    component={AutoCompleteMultiSelect}
                                    label="Start Date"
                                    options={getFilterFieldData("startDate", values)}
                                    components={{ Option, MultiValue }}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                />
                            </div>
                            <div className="col-md-3">
                                <Field
                                    name="endDate"
                                    component={AutoCompleteMultiSelect}
                                    label="End Date"
                                    options={getFilterFieldData("endDate", values)}
                                    components={{ Option, MultiValue }}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                />
                            </div>
                            <div className="col-md-3">
                                <Field
                                    name="projectStatusType"
                                    component={AutoCompleteMultiSelect}
                                    label="Status"
                                    options={getFilterFieldData("projectStatusType", values)}
                                    components={{ Option, MultiValue }}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                />
                            </div>
                        </div>
                    </div>
                    <POSTable
                        uiContext={uiContext}
                        extraUIProps={{}}
                        reducerInfo={reducerInfo}
                        columns={columns}
                        // customActions={action}
                        paginated
                        customState={currentState}
                        customData={filteredData}
                    />
                </Form>
            )}
        </Formik>
    </>)
};

export default MainTable;