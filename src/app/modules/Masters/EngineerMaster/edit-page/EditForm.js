import React, { useEffect, useMemo, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { AutoCompleteSelect, Input, Switch, TextArea } from '../../../../../_metronic/_partials/controls';
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { engineerMasterActions } from '../_redux/EngineerMasterRedux';
import { countryMasterActions } from '../../CountryMaster/_redux/CountryMasterRedux';
import { stateMasterActions } from '../../StateMaster/_redux/StateMasterRedux';
import { cityMasterActions } from '../../CityMaster/_redux/CityMasterRedux';
import { currencyMasterActions } from '../../CurrencyMaster/_redux/CurrencyMasterRedux';
import { PhoneNumberUtil } from 'google-libphonenumber';
import { isValidContactForCountry, isValidZipCode } from '../../../_commons/Utils';
import { Link } from "react-router-dom";
import { useHistory } from 'react-router';
import { AutoCompleteSelectWindow } from '../../../../../_metronic/_partials/controls/forms/AutoCompleteSelectWindow';

const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
    const dispatch = useDispatch()
    const history = useHistory()
    const { currentState,
        countryMasterState,
        stateMasterState,
        cityMasterState,
        currencyMasterState
    } = useSelector((state) =>
    ({
        currentState: state.engineerMaster,
        countryMasterState: state.countryMaster,
        stateMasterState: state.stateMaster,
        cityMasterState: state.cityMaster,
        currencyMasterState: state.currencyMaster,
    }), shallowEqual)

    const [hasManualError, setHasManualError] = useState(false);
    const [checkErr, setCheckErr] = useState("")
    const [openProject, setOpenProject] = useState()
    const [openTicket, setOpenTicket] = useState()
    const [dupEngineer, setDupEngineer] = useState()

    useEffect(() => {
        if (currentState.totalCount === 0 && !currentState.listLoading && !currentState.error) {
            dispatch(engineerMasterActions.getAll())
        }
        dispatch(countryMasterActions.getAllActive())
        // dispatch(stateMasterActions.getAllActive())
        // dispatch(cityMasterActions.getAllActive())
        dispatch(currencyMasterActions.getAllActive())
    }, [])

    //code unique validation
    const editId = currentState?.entityForEdit?.id ?? 0;
    const contactRegExp = /^[\d ()+-]+$/
    const linkedInURLRegEx = /^https:\/\/([\w]+\.)?linkedin\.com\/[A-z0-9_-]+\/?/
    // const linkedInURLRegEx = /((https?:\/\/)?((www|\\w\\w)\\.)?linkedin\/.com\/)((([\\w]{2,3})?)|([^\\/]+\\/(([w|d-&#?=])+\\/?){1,}))$/

    Yup.addMethod(Yup.mixed, "isValidZipCode", isValidZipCode);
    Yup.addMethod(Yup.mixed, "isValidContactForCountry", isValidContactForCountry);

    const digitRegex = /\D/g

    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            engineerName: Yup.string().required("Engineer Name required"),
            primaryEmailId: Yup.string().required("E-mail Required").email("Invalid e-mail"),
            secondaryEmailId: Yup.string().nullable().email("Invalid e-mail"),
            // primaryContactNumber: Yup.string().required("Mobile# Required"),//.matches(contactRegExp, 'Invalid Mobile#'),
            // secondaryContactNumber: Yup.string().nullable().matches(contactRegExp, 'Invalid Alternate Phone'),
            countryMSTId: Yup.number().min(1, 'Country Required'),
            pointOfContactId: Yup.number().min(1, 'Point of Contact Required'),
            skillSet: Yup.string().required("Skill Set required"),
            linkedinURL: Yup.string().nullable().matches(linkedInURLRegEx, 'Invalid LinkedIn URL'),
            ratePerHour: Yup.number().min(0, 'Rate Per Hour must be positive'),
            zipCode: Yup.mixed().isValidZipCode(Yup.ref('countryCode'), "Invalid Zip Code"),
            primaryContactNumber: Yup.mixed().required("Mobile# Required").isValidContactForCountry(Yup.ref('countryCode'), "Mobile# & Alternate Phone can't be same"),
            secondaryContactNumber: Yup.string().nullable().matches(contactRegExp, 'Invalid Alternate Phone')
                .test("max-check", "Alternate Phone should be of 4 to 15 characters", (val) => {
                    if (val && val !== "" && val !== undefined) {
                        if (val.replace(digitRegex, "").length < 4 || val.replace(digitRegex, "").length > 15) {
                            return false
                        }
                    }
                    return true
                }),
            // secondaryContactNumber: Yup.mixed().isValidContactForCountry(Yup.ref('countryCode'),"Mobile# & Alternate Phone can't be same"),
        });
    }, [currentState.entities, editId])

    let entity = useMemo(() => {

        let tmpEntity = { ...enitity }

        if (editId) {
            tmpEntity.countryCode = countryMasterState?.entities?.filter(x => x.id === tmpEntity?.countryMSTId)?.[0]?.countryCode
            dispatch(stateMasterActions.getByCountry(tmpEntity?.countryMSTId))

            if (tmpEntity.stateMSTId && tmpEntity.countryMSTId && tmpEntity.stateMSTId > 0) {
                dispatch(cityMasterActions.getByCountryAndState(tmpEntity.countryMSTId, tmpEntity.stateMSTId))
            } else {
                if (tmpEntity.countryMSTId > 0) {
                    dispatch(cityMasterActions.getByCountry(tmpEntity.countryMSTId))
                }
            }
        }

        return tmpEntity

    }, [enitity, editId, countryMasterState])


    const isValidMobileNumber = (number, countryCode) => {
        let valid = false
        try {
            const phoneUtil = PhoneNumberUtil.getInstance();
            valid = phoneUtil.isValidNumberForRegion(phoneUtil.parse(number, countryCode), countryCode);
        } catch (e) {
            valid = false;
        }
        return valid
    }
    useEffect(() => {
        if (currentState?.error?.customError) {

            let error = currentState?.error?.customError
            setCheckErr(true)
            if (currentState?.error?.userMessage === "Duplicate Engineer") {
                let ticket = []
                if (error?.length) {
                    error.map((dl) => {
                        if (dl.ticketId) {
                            ticket.push(dl)
                        }
                    })
                    if (ticket?.length) { setDupEngineer(ticket) }
                }
            } else {
                let ticket = []
                let project = []
                if (error?.length) {
                    error.map((dl) => {
                        if (dl.ticketId) {
                            ticket.push(dl)
                        } else {
                            project.push(dl)
                        }
                    })
                    if (project?.length) { setOpenProject(project) }
                    if (ticket?.length) { setOpenTicket(ticket) }
                }
                console.log(error);
            }

        }
    }, [currentState])

    return (
        <Formik
            enableReinitialize={true}
            initialValues={entity}
            validationSchema={validationSchema}
            onSubmit={(values) => {

                if (hasManualError) {
                    return
                }
                let val = { ...values }

                delete val.pointOfContact
                delete val?.cityMST
                delete val?.countryMST
                delete val?.currencyMST
                delete val?.stateMST
                // saveRecord(val);

                setOpenProject("")
                setOpenTicket("")
                setCheckErr("")
                if (val.id) {
                    dispatch(engineerMasterActions.updateCustom(val))
                        .then(res => {
                            dispatch(engineerMasterActions.fetchEntity(res.id)).then(res1 => {
                            })
                        }).catch(err => {
                            console.log(err?.userMessage)
                        })
                } else {
                    dispatch(engineerMasterActions.createCustom(values)).then(res => {
                        history.push(`/engineer/${res.id}/edit`)
                    }).catch(err => {
                        console.log(err?.userMessage)
                    })
                }
            }}
        >
            {
                ({ values, handleSubmit, handleReset, setFieldValue, setFieldError, setFieldTouched }) => (
                    <Form className="form form-label-right">

                        {checkErr ?
                            <div className='text-danger d-flex flex-wrap' >
                                {/* <div className="d-flex ml-3"> */}
                                {openProject ?
                                    <div className="ml-3"> Open Projects :-
                                        {openProject?.map(el => {
                                            return (<Link to={`/project/${el.projectId}/edit`} target='_blank'><span>{`${el.projectCode},`}</span> </Link>);
                                        })
                                        }
                                    </div>
                                    : ""}
                                {openTicket ?
                                    <div className="ml-3">
                                        Open Tickets :-
                                        {openTicket?.map(el => {
                                            return (<Link to={`/ticket/${el.ticketId}/edit`} target='_blank' ><span>{`${el.ticketCode},`} </span></Link>);
                                        })
                                        }
                                    </div>
                                    : ""}
                                {dupEngineer ?
                                    <div className="ml-3">
                                        Engineers List :-
                                        {dupEngineer?.map(el => {
                                            return (<Link to={`/engineer/${el.ticketId}/edit`} target='_blank'><span>{`${el.ticketCode},`} </span></Link>);
                                        })
                                        }
                                    </div>
                                    : ""}
                                {/* </div>   */}
                            </div>
                            : ""}
                        <div className="form-group row">
                            <div className="col-lg-3">
                                <Field
                                    name="engineerName"
                                    component={Input}
                                    placeholder="Enter Engineer Name"
                                    label="Engineer Name"
                                    isrequired
                                />
                            </div>
                            <div className="col-lg-3">
                                <Field
                                    name="primaryEmailId"
                                    component={Input}
                                    placeholder="Enter Email"
                                    label="Email"
                                    isrequired
                                />
                            </div>
                            <div className="col-lg-3">
                                <Field
                                    name="secondaryEmailId"
                                    component={Input}
                                    placeholder="Enter Alternate Email"
                                    label="Alternate Email"
                                />
                            </div>
                            <div className="col-lg-2">
                                <Field
                                    name="active"
                                    component={Switch}
                                    label="Active"
                                    color="primary"
                                />
                            </div>
                        </div>

                        <div className="form-group row">
                            <div className="col-12 col-md-3 ">
                                <Field
                                    name="countryMSTId"
                                    label="Country"
                                    component={AutoCompleteSelect}
                                    customOptions={{
                                        records: countryMasterState?.entities,
                                        labelField: "countryName",
                                        valueField: "id"
                                    }}
                                    isrequired
                                    isLoading={countryMasterState?.listLoading}
                                    loadingMessage="Fetching records..."
                                    placeholder="Select Country"
                                    onChange={(option) => {
                                        let countryMSTId = option?.value ?? null
                                        // if(countryMSTId) {
                                        //     setFieldError("countryMSTId", null)
                                        //     setHasManualError(false)
                                        // } else {
                                        //     setFieldError("countryMSTId", "Country Required")
                                        //     setHasManualError(true)
                                        // }
                                        const countryMST = countryMasterState?.entities?.filter(x => x.id === countryMSTId)?.[0]
                                        setFieldValue("countryMST", countryMST)
                                        dispatch(stateMasterActions.getByCountry(countryMSTId))
                                        dispatch(cityMasterActions.getByCountry(countryMSTId))
                                        setFieldValue("countryCode", countryMST?.countryCode)

                                        setFieldValue("countryMSTId", countryMSTId)

                                    }}
                                />
                            </div>

                            <div className="col-12 col-md-3">
                                <Field
                                    name="stateMSTId"
                                    component={AutoCompleteSelect}
                                    label="State"
                                    customOptions={{
                                        records: stateMasterState?.entities,
                                        labelField: "stateName",
                                        valueField: "id"
                                    }}
                                    isLoading={stateMasterState?.listLoading}
                                    loadingMessage="Fetching records..."
                                    placeholder="Select State"
                                    onChange={(option) => {
                                        let stateMSTId = option?.value ?? null
                                        if (stateMSTId && values.countryMSTId) {
                                            dispatch(cityMasterActions.getByCountryAndState(values.countryMSTId, stateMSTId))
                                        } else {
                                            dispatch(cityMasterActions.getByCountry(values.countryMSTId))
                                        }
                                        setFieldValue("stateMSTId", stateMSTId)
                                    }}
                                />
                            </div>

                            <div className="col-12 col-md-3">
                                <Field
                                    name="cityMSTId"
                                    label="City"
                                    component={AutoCompleteSelectWindow}
                                    customOptions={{
                                        records: cityMasterState?.entities,
                                        labelField: "cityName",
                                        valueField: "id"
                                    }}
                                    isLoading={cityMasterState?.listLoading}
                                    loadingMessage="Fetching records..."
                                    placeholder="Select City"
                                    onChange={(option) => {
                                        setFieldValue("cityMSTId", option?.value ?? null)
                                    }}
                                />
                            </div>

                            <div className="col-12 col-md-3">
                                <Field
                                    name="zipCode"
                                    label="Zip Code"
                                    component={Input}
                                    placeholder="Enter Zip Code"
                                />
                            </div>
                        </div>

                        <div className="form-group row">

                            <div className="col-12 col-md-2">
                                <Field
                                    name="address"
                                    component={TextArea}
                                    label="Address"
                                />
                            </div>
                            <div className=" col-12 col-md-1">
                                <Field
                                    name="countryMST.dialingCode"
                                    component={Input}
                                    label="Code"
                                    isrequired
                                    disabled
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <Field
                                    name="primaryContactNumber"
                                    component={Input}
                                    placeholder="Enter Mobile#"
                                    label="Mobile#"
                                    isrequired
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <Field
                                    name="secondaryContactNumber"
                                    component={Input}
                                    placeholder="Enter Alternate Phone"
                                    label="Alternate Phone"
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <Field
                                    name="pointOfContactId"
                                    label="Point of Contact"
                                    component={AutoCompleteSelect}
                                    customOptions={{
                                        records: currentState?.entities?.filter(x => x.id !== values?.id),
                                        labelField: "engineerName",
                                        valueField: "id"
                                    }}
                                    isrequired
                                    isLoading={currentState?.listLoading}
                                    loadingMessage="Fetching records..."
                                    placeholder="Select POC"
                                />
                            </div>
                        </div>

                        <div className="form-group row">
                            <div className="col-12 col-md-3">
                                <Field
                                    name="linkedinURL"
                                    component={Input}
                                    placeholder="Enter LinkedIn URL"
                                    label="LinkedIn URL"
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <Field
                                    name="ratePerHour"
                                    component={Input}
                                    placeholder="Enter Rate Per Hour"
                                    label="Rate Per Hour"
                                    type="number"
                                    min="0"
                                    step="any"
                                    onBlur={() => {
                                        const val = values.ratePerHour === null || values.ratePerHour === "" ? 0 : values.ratePerHour
                                        setFieldValue("ratePerHour", parseFloat(val).toFixed(2))
                                        setFieldTouched("ratePerHour", true)
                                    }}
                                />
                            </div>
                            <div className="col-12 col-md-3" >
                                <Field
                                    name="currencyMSTId"
                                    label="Currency"
                                    component={AutoCompleteSelect}
                                    customOptions={{
                                        records: currencyMasterState?.entities,
                                        labelField: "currencyName",
                                        valueField: "id"
                                    }}
                                    isLoading={currencyMasterState?.listLoading}
                                    loadingMessage="Fetching records..."
                                    placeholder="Select Currency"
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <Field
                                    name="skillSet"
                                    component={TextArea}
                                    placeholder="Enter Skill Set"
                                    label="Skill Set"
                                    isrequired
                                />
                            </div>
                        </div>
                        <div className="form-group row">
                            <div className="col-6">
                                <Field
                                    name="notes"
                                    component={TextArea}
                                    placeholder="Enter Notes"
                                    label="Notes"
                                />
                            </div>
                        </div>
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