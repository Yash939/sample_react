import React, { useEffect, useMemo, useState } from 'react';
import POSTable from "../../../_commons/components/POSTable";
import { useEngineerMasterUIContext } from "../EngineerMasterUIContext";
import { reducerInfo, engineerMasterActions } from "../_redux/EngineerMasterRedux";
import { sortCaret, toAbsoluteUrl } from '../../../../../_metronic/_helpers';
import { StatusColumnFormatter } from '../../../_commons/components/col-formattors/StatusColumnFormatter';
import { ActionsColumnFormatter } from '../../../_commons/components/col-formattors/ActionsColumnFormatter';
import SVG from "react-inlinesvg";
import { useHistory } from 'react-router';
import { Field, Form, Formik } from 'formik';
import { AutoCompleteMultiSelect } from '../../../../../_metronic/_partials/controls';
import { components } from "react-select";
import { shallowEqual, useDispatch, useSelector } from 'react-redux';

const MainTable = () => {
    const uiContext = useEngineerMasterUIContext()
    const dispatch = useDispatch()
    const uiProps = useMemo(() => {
        return {
            openEditPage: uiContext.editRecordBtnClick
        }
    }, [uiContext])

    const history = useHistory()
    const [expanded, setExpanded] = useState(false)
    const [dbData, setDbData] = useState([])
    const [filteredData, setFilteredData] = useState([])

    const { currentState } = useSelector(state => ({
        currentState: state[reducerInfo.name]
    }), shallowEqual)

    const handleChange = (event) => {
        setExpanded(!expanded)
    };

    const action = useMemo(() => {
        document.title = "Engineer List"
        return engineerMasterActions.getPaginated()
    }, [])

    useEffect(() => {
        dispatch(action)
    }, [action])

    useEffect(() => {
        if (currentState?.entities) {
            const data = currentState.entities.map(x => ({
                ...x,
                country: x?.countryMST?.countryName,
                state: x?.stateMST?.stateName,
                city: x?.cityMST?.cityName,
                POC: x?.pointOfContact?.engineerName
            }))
            setDbData(data)
            setFilteredData(data)
        }
    }, [currentState])


    const columns = [
        {
            dataField: "code",
            text: "Engineer Code",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "engineerName",
            text: "Engineer Name",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "countryMST.countryName",
            text: "Country",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "primaryEmailId",
            text: "Email",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "primaryContactNumber",
            text: "Mobile#",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "pointOfContact.engineerName",
            text: "POC",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "active",
            text: "Status",
            sort: true,
            sortCaret: sortCaret,
            formatter: StatusColumnFormatter,
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "action",
            text: "Actions",
            formatter: ActionsColumnFormatter,
            formatExtraData: {
                openEditPage: uiProps.openEditPage,
                idFieldName: reducerInfo.idFieldName,
            },
            classes: "text-center pr-0",
            headerClasses: "text-center pr-0",
            headerStyle: { width: "1px" },
            headerFormatter: (column, columnIndex) => {
                return (
                    <a
                        title="Bulk Edit"
                        className="btn btn-icon btn-light btn-hover-warning btn-sm mx-3"
                        onClick={() => history.push(`/masters/engineer/master/bulk-edit`)}
                    >
                        <span className="svg-icon svg-icon-md svg-icon-dark">
                            <SVG
                                src={toAbsoluteUrl("/media/svg/icons/Communication/Write.svg")}
                                title='Bulk Edit'
                            />
                        </span>
                    </a>
                );
            }
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
        country: [],
        state: [],
        city: [],
        POC: [],
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
                resetForm
            }) => (
                <Form className="form form-label-right">
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
                        <div className="card-body" style={expanded ? { display: 'flex', paddingTop: '0px' } : { display: 'none' }}>
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
                            <div className="col-md-3">
                                <Field
                                    name="state"
                                    component={AutoCompleteMultiSelect}
                                    label="State"
                                    options={getFilterFieldData("state", values)}
                                    components={{ Option, MultiValue }}
                                    closeMenuOnSelect={false}
                                    hideSelectedOptions={false}
                                />
                            </div>
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
                                    name="POC"
                                    component={AutoCompleteMultiSelect}
                                    label="POC"
                                    options={getFilterFieldData("POC", values)}
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

    // return (<>
    //     <POSTable
    //         uiContext={uiContext}
    //         extraUIProps={{}}
    //         reducerInfo={reducerInfo}
    //         // actions={engineerMasterActions}
    //         columns={columns}
    //         customActions={action}
    //         paginated
    //     />
    // </>)
};

export default MainTable;