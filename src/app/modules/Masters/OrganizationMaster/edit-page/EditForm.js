import React, { useEffect, useMemo, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { AutoCompleteSelect, Input, Switch, TextArea } from '../../../../../_metronic/_partials/controls';
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { organizationMasterActions } from '../_redux/OrganizationMasterRedux';
import { countryMasterActions } from '../../CountryMaster/_redux/CountryMasterRedux';
import { stateMasterActions } from '../../StateMaster/_redux/StateMasterRedux';
import { cityMasterActions } from '../../CityMaster/_redux/CityMasterRedux';
import POSEditableTable from '../../../_commons/components/POSEditableTable'
import { StatusColumnFormatter } from '../../../_commons/components/col-formattors/StatusColumnFormatter'
import { requireHeaderFormatter } from '../../../_commons/components/col-formattors/RequireHeaderFormatter'
import SwitchRenderer from '../../../_commons/components/editable-cell-renderer/SwitchRenderer'
import TabularView from '../../../_commons/components/TabularView';
import { reducerInfo as branchDtl_reducerInfo } from "../_redux/OrganizationBranchRedux";
import { postcodeValidator, postcodeValidatorExistsForCountry } from 'postcode-validator';
import { useLoggedInUserRoleCode } from '../../../_commons/Utils';
import {Link} from "react-router-dom";
import { useHistory } from 'react-router';
import BranchDetailModal from './BranchDetailModal';
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from '../../../../../_metronic/_helpers';

const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
    const dispatch = useDispatch()
    const { currentState, countryMasterState, stateMasterState, cityMasterState } = useSelector((state) =>
    ({
        currentState: state.organizationMaster,
        countryMasterState: state.countryMaster,
        stateMasterState: state.stateMaster,
        cityMasterState: state.cityMaster,
    }),
        shallowEqual
    )
    const history = useHistory()
    const roleCode = useLoggedInUserRoleCode()

    const [validationError, setValidationError] = useState("")
    const [modal, setModal] = useState(false)
    const [checkErr, setCheckErr] = useState(false)
    const [openProject, setOpenProject] = useState()
    const [openTicket, setOpenTicket] = useState()

    useEffect(() => {
        if (currentState.totalCount === 0 && !currentState.listLoading && !currentState.error) {
            dispatch(organizationMasterActions.getAll())
        }
        dispatch(countryMasterActions.getAllActive())
        // dispatch(stateMasterActions.getAllActive())
        // dispatch(cityMasterActions.getAllActive())
    }, [])

    const organizationTypes = [
        { label: 'Self', value: 'SELF' },
        { label: 'Partner', value: 'PARTNER' },
        { label: 'Customer', value: 'CUSTOMER' },
    ]

    const openBranchDetailModal = (id, values, setFieldValue, row, editable) => {

        const branchDetailModal = <BranchDetailModal
            closeModalHandler={() => setModal(null)}
            values={values}
            setFieldValue={setFieldValue}
            initialValues={row ? row : branchDtl_reducerInfo.initialEnitity}
            editable={editable}
            id={id}
        />
        setModal(branchDetailModal)
    }

    //code unique validation
    const editId = currentState?.entityForEdit?.id ?? 0;

    const contactRegExp = /^[\d ()+-]+$/
    const websiteRegExp = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/

    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            organizationName: Yup.string().required("Required"),
            organizationType: Yup.string().required("Required"),
            emailId: Yup.string().required("Required").email("Invalid e-mail"),
            primaryContact: Yup.string().required("Required")//.isValidPhoneNumberGeneric("Invalid Primary Contact#"),
                .matches(contactRegExp, 'Invalid Primary Contact#')
                .test('match', 'Primary Contact# & Secondary Contact# must not be same', function (value) {
                    return this.parent.secondaryContact !== value
                }),
            secondaryContact: Yup.string().nullable().matches(contactRegExp, "Invalid Contact#")
                .test('match', 'Primary Contact# & Secondary Contact# must not be same', function (value) {
                    return this.parent.primaryContact !== value
                }),
            website: Yup.string().nullable().matches(websiteRegExp, "Invalid website"),
            primaryContactName: Yup.string().required("Required")
                .test('match', 'Primary Contact Name & Secondary Contact Name must not be same', function (value) {
                    let primaryName = value ?? ""
                    let secondaryName = this.parent.secondaryContactName ?? ""

                    primaryName = primaryName.toLowerCase()
                    secondaryName = secondaryName.toLowerCase()
                    return primaryName !== secondaryName
                }),
            secondaryContactName: Yup.string().nullable()
                .test('match', 'Primary Contact Name & Secondary Contact Name must not be same', function (value) {
                    let primaryName = this.parent.primaryContactName ?? ""
                    let secondaryName = value ?? ""

                    primaryName = primaryName.toLowerCase()
                    secondaryName = secondaryName.toLowerCase()
                    return primaryName !== secondaryName
                }),
            primaryContactEmail: Yup.string().required("Required").email("Invalid e-mail")
                .test('match', 'Primary Contact Email & Secondary Contact Email must not be same', function (value) {
                    return this.parent.secondaryContactEmail !== value
                }),
            secondaryContactEmail: Yup.string().nullable().email("Invalid e-mail")
                .test('match', 'Primary Contact Email & Secondary Contact Email must not be same', function (value) {
                    return this.parent.primaryContactEmail !== value
                }),
            supportTeamContact: Yup.string().nullable().matches(contactRegExp, "Invalid Contact#"),
            projectTeamContact: Yup.string().nullable().matches(contactRegExp, "Invalid Contact#"),
            supportTeamEmail: Yup.string().nullable().email("Invalid e-mail"),
            projectTeamEmail: Yup.string().nullable().email("Invalid e-mail"),
        });
    }, [currentState.entities, editId])

    const entity = useMemo(() => {
        let tmp = { ...enitity }
        tmp.organizationBranchDTLList = tmp.organizationBranchDTLList.map((x, i) => ({
            ...x,
            countryCode: x?.countryMST?.countryCode,
            keyField: i,
        }))
        tmp.keyField = tmp?.organizationBranchDTLList?.length + 1
        return tmp;
    }, [enitity])

    const submitValidations = (values) => {

        for (let i = 0; i < values.organizationBranchDTLList.length; i++) {
            const element = values.organizationBranchDTLList[i];

            if (!element.branchName) {
                setValidationError("Branch Name Required")
                return false
            } else if (!element.countryMSTId) {
                setValidationError("Country Required")
                return false
            } else if (!element.cityMSTId) {
                setValidationError("City Required")
                return false
            }

            if (element.zipCode) {
                const refValue = countryMasterState?.entities?.filter(x => x.id.toString() === element?.countryMSTId?.toString())?.[0]?.countryCode
                if (refValue) {
                    if (postcodeValidatorExistsForCountry(refValue)) {
                        if (!postcodeValidator(element.zipCode, refValue)) {
                            setValidationError("Invalid Zip Code")
                            return false
                        }
                    } else {
                        if (!postcodeValidator(element.zipCode, 'INTL')) {
                            setValidationError("Invalid Zip Code")
                            return false
                        }
                    }
                } else {
                    if (!postcodeValidator(element.zipCode, 'INTL')) {
                        setValidationError("Invalid Zip Code")
                        return false
                    }
                }
            }
        }

        return true
    }

    useEffect(() => {
        if(currentState?.error?.customError){
            
            let error=currentState?.error?.customError
            setCheckErr(true)
            let ticket =[]
            let project =[]
            if(error?.length){
                error.map((dl)=>{
                        if(dl.ticketId){
                            ticket.push(dl)
                        }else{
                            project.push(dl)
                        }
                })
                if(project?.length){setOpenProject(project)}
                if(ticket?.length){setOpenTicket(ticket)}
            }
        }
    }, [currentState])
    
    return (
        <Formik
            enableReinitialize={true}
            initialValues={entity}
            validationSchema={validationSchema}
            onSubmit={(values) => {

                if (!roleCode.includes("admin")) {
                    window.alert("You are not Authorized to Save the Customer")
                    return
                }
                if (!submitValidations(values)) {
                    return
                }
                setValidationError("")
                setOpenProject("")
                setOpenTicket("")
                setCheckErr("")
                // saveRecord(values);
                
                if(values.id){
                    dispatch(organizationMasterActions.updateCustom(values))
                    .then(res => {
                        dispatch(organizationMasterActions.fetchEntity(res.id)).then(res1 => {
                        })
                    }).catch(err => {
                        console.log(err?.userMessage)
                    })
                }else{
                    dispatch(organizationMasterActions.create(values)).then(res => {
                        history.push(`/customer/${res.id}/edit`)
                    }).catch(err => {
                        console.log(err?.userMessage)
                    })
                }
            }}
        >
            {
                ({ handleSubmit, handleReset, values, setFieldValue }) => (
                    <Form className="form form-label-right">
                        {modal ? modal : null}
                       { checkErr ?
                            <div className='text-danger d-flex flex-wrap' >
                                {openProject ?
                                    <div className="ml-3"> Open Projects :-
                                        { openProject?.map(el=>{
                                            return (<Link to={`/project/${el.projectId}/edit`} ><span>{`${el.projectCode},`} </span></Link>);
                                        })
                                        }
                                    </div>
                                :""}
                                {openTicket ?
                                <div className="ml-3">
                                    Open Tickets :-
                                    { openTicket?.map(el=>{
                                        return (<Link to={`/ticket/${el.ticketId}/edit`} ><span>{`${el.ticketCode},`}</span></Link>);
                                    })
                                    }
                                </div>
                                :""}
                             </div> 
                        :""}
                       <div className="form-group row">
                            <div className="col-md-3">
                                <Field
                                    name="organizationName"
                                    component={Input}
                                    placeholder="Enter Customer Name"
                                    label="Customer Name"
                                    isrequired
                                />
                            </div>
                            <div className="col-md-3">
                                <Field
                                    name="organizationType"
                                    component={AutoCompleteSelect}
                                    placeholder="Enter Customer Type"
                                    label="Customer Type"
                                    isrequired
                                    options={organizationTypes}
                                />
                            </div>
                            <div className="col-md-3 ">
                                <Field
                                    name="emailId"
                                    component={Input}
                                    placeholder="Enter Email"
                                    label="Email"
                                    isrequired
                                />
                            </div>
                            <div className="col-md-2">
                                <Field
                                    name="active"
                                    component={Switch}
                                    label="Active"
                                    color="primary"
                                />
                            </div>
                        </div>


                        <TabularView
                            tabs={[
                                {
                                    key: "details",
                                    title: "Details",
                                    content: (<>
                                        <div className="form-group row ">
                                            <div className="col-md-3 ">
                                                <Field
                                                    name="primaryContactName"
                                                    component={Input}
                                                    placeholder="Enter Name"
                                                    label="Primary Contact Name"
                                                    isrequired
                                                />
                                            </div>
                                            <div className="col-md-3 ">
                                                <Field
                                                    name="primaryContactEmail"
                                                    component={Input}
                                                    placeholder="Enter Email"
                                                    label="Primary Contact Email"
                                                    isrequired
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <Field
                                                    name="primaryContact"
                                                    component={Input}
                                                    placeholder="Enter Contact#"
                                                    label="Primary Contact#"
                                                    isrequired
                                                />
                                            </div>
                                            <div className="col-md-3 ">
                                                <Field
                                                    name="secondaryContactName"
                                                    component={Input}
                                                    placeholder="Enter Name"
                                                    label="Secondary Contact Name"
                                                />
                                            </div>

                                        </div>
                                        <div className="form-group row">
                                            <div className="col-md-3 ">
                                                <Field
                                                    name="secondaryContactEmail"
                                                    component={Input}
                                                    placeholder="Enter Email"
                                                    label="Secondary Contact Email"
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <Field
                                                    name="secondaryContact"
                                                    component={Input}
                                                    placeholder="Enter Contact#"
                                                    label="Secondary Contact#"
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <Field
                                                    name="supportTeamContact"
                                                    component={Input}
                                                    placeholder="Enter Contact#"
                                                    label="Support Team Contact#"
                                                />
                                            </div>
                                            <div className="col-md-3 ">
                                                <Field
                                                    name="supportTeamEmail"
                                                    component={Input}
                                                    placeholder="Enter Email"
                                                    label="Support Team Email"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-md-3">
                                                <Field
                                                    name="projectTeamContact"
                                                    component={Input}
                                                    placeholder="Enter Contact#"
                                                    label="Project Team Contact#"
                                                />
                                            </div>
                                            <div className="col-md-3 ">
                                                <Field
                                                    name="projectTeamEmail"
                                                    component={Input}
                                                    placeholder="Enter Email"
                                                    label="Project Team Email"
                                                />
                                            </div>
                                            <div className="col-md-3">
                                                <Field
                                                    name="website"
                                                    component={Input}
                                                    placeholder="Enter Website"
                                                    label="Website"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-group row">
                                            <div className="col-md-12">
                                                <Field
                                                    name="specialNotes"
                                                    component={TextArea}
                                                    placeholder="Enter Special Notes"
                                                    label="Special Notes"
                                                />
                                            </div>
                                        </div>

                                        <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                                            <h5
                                                className="card-header text-center p-1"
                                                style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                                            >
                                                Branch Details
                                            </h5>
                                            {validationError ?
                                                <div style={{ color: 'red', paddingBottom: '15px' }}>
                                                    {validationError}
                                                </div>
                                                : null
                                            }
                                            <div className="card-body pt-0 px-2 pb-10 mt-7">
                                                <div style={{ float: 'right', paddingBottom: '10px' }}>
                                                    <button
                                                        onClick={() => openBranchDetailModal(null, values, setFieldValue)}
                                                        type="button" className="btn pinaple-yellow-btn col-xs-12"
                                                        style={{ float: 'right' }}>+ Add</button>
                                                </div>
                                                <POSEditableTable
                                                    data={values.organizationBranchDTLList}
                                                    columns={[
                                                        {
                                                            dataField: "branchName",
                                                            text: "Branch Name",
                                                            headerFormatter: (column, columnIndex) => requireHeaderFormatter(column, columnIndex),
                                                            editable: false
                                                        },
                                                        {
                                                            dataField: "address",
                                                            text: "Address",
                                                            editable: false
                                                        },
                                                        {
                                                            dataField: "zipCode",
                                                            text: "Zip Code",
                                                            editable: false
                                                        },
                                                        {
                                                            dataField: "countryMST.countryName",
                                                            text: "Country",
                                                            headerFormatter: (column, columnIndex) => requireHeaderFormatter(column, columnIndex),
                                                            editable: false
                                                        },
                                                        {
                                                            dataField: "stateMST.stateName",
                                                            text: "State",
                                                            editable: false
                                                        },
                                                        {
                                                            dataField: "cityMST.cityName",
                                                            text: "City",
                                                            headerFormatter: (column, columnIndex) => requireHeaderFormatter(column, columnIndex),
                                                            editable: false
                                                        },
                                                        {
                                                            dataField: "edit",
                                                            text: "Edit",
                                                            headerStyle: { whiteSpace: 'nowrap' },
                                                            formatExtraData: values,
                                                            formatter: (cell, row, rowIndex, values) => {
                                                                return <a
                                                                    title="Edit this record"
                                                                    className="btn btn-icon btn-light btn-hover-warning btn-sm mx-3"
                                                                    onClick={() => {
                                                                        openBranchDetailModal(row.id, values, setFieldValue, row, true)
                                                                    }}
                                                                >
                                                                    <span className="svg-icon svg-icon-md svg-icon-dark">
                                                                        <SVG
                                                                            src={toAbsoluteUrl("/media/svg/icons/Communication/Write.svg")}
                                                                            title='Edit'
                                                                        />
                                                                    </span>
                                                                </a>
                                                            },
                                                            editable: false
                                                        },
                                                        {
                                                            dataField: "active",
                                                            text: "Active",
                                                            formatter: StatusColumnFormatter,
                                                            editorRenderer: (editorProps) => SwitchRenderer(editorProps),
                                                            style: { width: "2%" },
                                                            editorClasses: 'form-control-sm',
                                                            classes: "text-center",
                                                            headerClasses: "text-center",
                                                            editable: false
                                                        },
                                                    ]}
                                                    deleteRowBtnHandler={(key, data) => {
                                                        let newData = []
                                                        data.forEach(row => {
                                                            if (row.keyField === key) {
                                                                if (row.id) {
                                                                    row.active = false
                                                                    newData = [...newData, row]
                                                                }
                                                            } else
                                                                newData = [...newData, row]
                                                        })
                                                        setFieldValue("organizationBranchDTLList", newData)
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </>)
                                },
                            ]}
                        />
                        <button
                            type="submit"
                            style={{ display: "none" }}
                            ref={submitBtnRef}
                            onSubmit={() => handleSubmit()}
                        />
                        <button
                            type="reset"
                            style={{ display: "none" }}
                            ref={resetBtnRef}
                            onSubmit={() => handleReset()}
                        />
                    </Form>
                )
            }
        </Formik>
    );
};

export default EditForm;