import React, { useMemo, useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap';
import { Field, Form, Formik } from 'formik';
import * as Yup from "yup";
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { stateMasterActions } from '../../../Masters/StateMaster/_redux/StateMasterRedux';
import { cityMasterActions } from '../../../Masters/CityMaster/_redux/CityMasterRedux';
import { AutoCompleteSelect, TextArea, Input, Switch } from '../../../../../_metronic/_partials/controls';
import { isValidContactForCountry, isValidZipCode, mergeArrayWithObject } from '../../../_commons/Utils';
import { AutoCompleteSelectWindow } from '../../../../../_metronic/_partials/controls/forms/AutoCompleteSelectWindow';

const BranchDetailModal = ({ id, closeModalHandler, values, setFieldValue, initialValues, editable, setSelectedRows ,checkPco}) => {

    let tmpInitValue = initialValues ? { ...initialValues } : {}
    const keyField = values?.keyField ? values.keyField : 1
    const dispatch = useDispatch()

    const {
        countryMasterState,
        stateMasterState,
        cityMasterState,
    } = useSelector((state) =>
    ({
        countryMasterState: state.countryMaster,
        stateMasterState: state.stateMaster,
        cityMasterState: state.cityMaster,
    }), shallowEqual)

    useEffect(() => {
        if(tmpInitValue?.countryMSTId && tmpInitValue.countryMSTId !== 0) {
            dispatch(stateMasterActions.getByCountry(tmpInitValue?.countryMSTId))
            if(tmpInitValue?.stateMSTId && tmpInitValue.stateMSTId !== 0) {
                dispatch(cityMasterActions.getByCountryAndState(tmpInitValue.countryMSTId, tmpInitValue.stateMSTId))
            } else {
                dispatch(cityMasterActions.getByCountry(tmpInitValue.countryMSTId))
            }
        }
    }, [])

    Yup.addMethod(Yup.mixed, "isValidZipCode", isValidZipCode);
    Yup.addMethod(Yup.mixed, "isValidContactForCountry", isValidContactForCountry);

    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            branchName: Yup.string().required("Branch Name Required"),
            countryMSTId: Yup.number().min(1, 'Country Required'),
            cityMSTId: Yup.number().min(1, 'City Required'),
            email: Yup.string().nullable().email("Invalid Email"),
            zipCode: Yup.mixed().isValidZipCode(Yup.ref('countryCode'), "Invalid Zip Code"),
            contactNumber: Yup.mixed().isValidContactForCountry(Yup.ref('countryCode'), "Invalid Contact Number"),
        });
    }, [])


    return (
        <Modal
            style={{ backgroundColor: 'rgba(0,0,0,.3)' }}
            show={true}
            // size={entity.length < 22 ? "md" : "lg"}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            dialogClassName='custom-modal'

        >
            <Formik
                enableReinitialize={true}
                initialValues={tmpInitValue}
                validationSchema={validationSchema}
                onSubmit={(formValues) => {

                    let val = { ...formValues }
                    let projectBranchDTLList = values?.projectBranchDTLList ?? []

                    let validated = true

                    projectBranchDTLList.filter(x => x?.keyField !== val?.keyField).forEach(x => {
                        if(x?.branchName?.toLowerCase() === val?.branchName?.toLowerCase()) {
                            alert("Duplicate Branch Name")
                            validated = false
                            return
                        }
                    })
                    if(!validated) {
                        return
                    }

                    if (editable) {

                        const tmpProjectBranchDTLList = mergeArrayWithObject(projectBranchDTLList ?? [], val, "keyField")
                        setFieldValue("projectBranchDTLList", tmpProjectBranchDTLList)

                    } else {
                        // if(projectBranchDTLList.length === 0) {
                        //     val.selected = true
                        //     setSelectedRows([keyField])
                        // }
                        if(projectBranchDTLList.length === 1) {
                            setFieldValue("projectTaskUserId", null)
                            projectBranchDTLList.forEach(x => x.selected = false)
                            setSelectedRows([])
                        }
                        setFieldValue("projectBranchDTLList", [
                            ...projectBranchDTLList,
                            {
                                ...val,
                                keyField: keyField
                            }
                        ])
                        setFieldValue("keyField", keyField + 1)
                    }
                    closeModalHandler(true)
                }}
            >
                {
                    ({ handleSubmit, handleReset, values, setFieldValue }) => (

                        <Form>

                            <Modal.Header closeButton className="p-2" style={{ position: 'sticky', top: 0, backgroundColor: '#f7f7f7', zIndex: '99999' }}>
                                <Modal.Title bsPrefix="h6 mt-2">
                                    {id ? "Edit Branch" : "Add Branch"}
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                <div className="form-group row">
                                    <div className="col-md-3">
                                        <Field
                                            name="branchName"
                                            component={Input}
                                            label="Branch"
                                            isrequired
                                            disabled={checkPco}
                                        />
                                    </div>
                                    <div className="col-md-3">
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
                                                let countryMST = countryMasterState?.entities?.find(x => x.id === countryMSTId)
                                                if (countryMST) {
                                                    setFieldValue("countryCode", countryMST?.countryCode)
                                                    setFieldValue("countryMST", countryMST)
                                                }
                                                dispatch(stateMasterActions.getByCountry(countryMSTId))
                                                dispatch(cityMasterActions.getByCountry(countryMSTId))

                                                setFieldValue("stateMST", null)
                                                setFieldValue("stateMSTId", 0)

                                                setFieldValue("cityMST", null)
                                                setFieldValue("cityMSTId", 0)

                                                setFieldValue("countryMSTId", countryMSTId)
                                            }}
                                            nonEditable={checkPco}
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
                                                let stateMST = stateMasterState?.entities?.find(x => x.id === stateMSTId)
                                                if (stateMST) {
                                                    setFieldValue("stateMST", stateMST)
                                                }
                                                setFieldValue("cityMST", null)
                                                setFieldValue("cityMSTId", 0)
                                                
                                                setFieldValue("stateMSTId", stateMSTId)
                                            }}
                                            nonEditable={checkPco}
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
                                            isrequired
                                            onChange={(option) => {
                                                let cityMSTId = option?.value ?? null
                                                let cityMST = cityMasterState?.entities?.find(x => x.id === cityMSTId)
                                                if (cityMST) {
                                                    setFieldValue("cityMST", cityMST)
                                                }
                                                setFieldValue("cityMSTId", cityMSTId)
                                            }}
                                            nonEditable={checkPco}
                                        />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <div className="col-md-3">
                                        <Field
                                            name="address"
                                            component={TextArea}
                                            label="Address"
                                            disabled={checkPco}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <Field
                                            name="zipCode"
                                            component={Input}
                                            label="Zip Code"
                                            disabled={checkPco}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <Field
                                            name="contactName"
                                            component={Input}
                                            label="Contact Name"
                                            disabled={checkPco}
                                        />
                                    </div>
                                    <div className="col-md-3">
                                        <Field
                                            name="contactNumber"
                                            component={Input}
                                            label="Contact Number"
                                            disabled={checkPco}
                                        />
                                    </div>

                                </div>
                                <div className="form-group row">
                                    <div className="col-md-3">
                                        <Field
                                            name="email"
                                            component={Input}
                                            label="Email"
                                            disabled={checkPco}
                                        />
                                    </div>
                                    <div className="col-md-2">
                                        <Field
                                            name="active"
                                            component={Switch}
                                            label="Active"
                                            color="primary"
                                            disabled={checkPco}
                                        />
                                    </div>
                                </div>


                            </Modal.Body>

                            <Modal.Footer className="p-1" bsPrefix="text-center modal-footer text-center" style={{ position: 'sticky', bottom: 0, backgroundColor: "#efefef", borderTop: '2px solid #ccc' }}>
                                <div className="w-100">
                                    <button style={{ width: '200px', margin: '0px 10px' }} type="button" className="btn pinaple-black-btn" onClick={() => closeModalHandler()}> Cancel</button>
                                    <button style={{ width: '200px', margin: '0px 10px' }} type='submit' className="btn pinaple-yellow-btn " onSubmit={() => handleSubmit()}>Save</button>
                                </div>
                            </Modal.Footer>
                        </Form>
                    )
                }
            </Formik >
        </Modal>
    )
}

export default BranchDetailModal;