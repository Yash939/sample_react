import React, { useEffect, useMemo, useState } from 'react';
import validations from "../../../_commons/CommonValidations";
import { Formik, Form, Field } from 'formik';
import { Input, Switch } from '../../../../../_metronic/_partials/controls';
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { countryMasterActions } from '../_redux/CountryMasterRedux';
import CheckboxGroup from "react-checkbox-group";

const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
    const dispatch = useDispatch()
    const { currentState } = useSelector((state) =>
    ({
        currentState: state.countryMaster
    }),
        shallowEqual
    )

    const [weekendDays, setWeekendDays] = useState([]);

    useEffect(() => {
        if (currentState.totalCount === 0 && !currentState.listLoading && !currentState.error) {
            dispatch(countryMasterActions.getAll())
        }
    }, [])

    //code unique validation
    const editId = currentState?.entityForEdit?.id ?? 0;
    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            countryName: Yup.string().required("Country Name required"),
            countryCode: Yup.string().required("Country Code required"),
            dialingCode: Yup.string().required("Dialing Code Required")
        });
    }, [currentState.entities, editId])

    useMemo(() => {
        if(editId) {
            setWeekendDays(enitity?.weekendDays ? enitity?.weekendDays?.split(","): [])
        }
    }, [editId, enitity]);

    return (
        <Formik
            enableReinitialize={true}
            initialValues={enitity}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                let val = { ...values };
                val.weekendDays = weekendDays?.join(",")
                saveRecord(val);
            }}
        >
            {
                ({ handleSubmit, handleReset, values }) => (
                    <Form className="form form-label-right">
                        <div className="form-group row">
                            <div className="col-lg-3">
                                <Field
                                    name="countryCode"
                                    component={Input}
                                    placeholder="Enter Country Code"
                                    label="Country Code"
                                    isrequired
                                />
                            </div>
                            <div className="col-lg-3">
                                <Field
                                    name="countryName"
                                    component={Input}
                                    placeholder="Enter Country Name"
                                    label="Country Name"
                                    isrequired
                                />
                            </div>
                            <div className="col-lg-3">
                                <Field
                                    name="dialingCode"
                                    component={Input}
                                    placeholder="Enter Dialing Code"
                                    label="Dialing Code"
                                    isrequired
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
                        <div className="form-group row mt-10">
                            <div className="col-12 col-md-2">
                                <label className="justify-content-start">
                                    Weekend Days
                                </label>
                            </div>
                            <div className="col-12 col-md-9">
                                <CheckboxGroup
                                    name="weekendDays"
                                    value={weekendDays}
                                    onChange={(data) => {
                                        setWeekendDays(data)
                                    }}
                                >
                                    {(Checkbox) => (
                                        <>
                                            <label>
                                                <Checkbox value="1" />
                                                &nbsp; Monday
                                            </label>
                                            &nbsp; &nbsp; &nbsp;
                                            <label>
                                                <Checkbox value="2" />
                                                &nbsp; Tuesday
                                            </label>
                                            &nbsp; &nbsp; &nbsp;
                                            <label>
                                                <Checkbox value="3" />
                                                &nbsp; Wednesday
                                            </label>
                                            &nbsp; &nbsp; &nbsp;
                                            <label>
                                                <Checkbox value="4" />
                                                &nbsp; Thursday
                                            </label>
                                            &nbsp; &nbsp; &nbsp;
                                            <label>
                                                <Checkbox value="5" />
                                                &nbsp; Friday
                                            </label>
                                            &nbsp; &nbsp; &nbsp;
                                            <label>
                                                <Checkbox value="6" />
                                                &nbsp; Saturday
                                            </label>
                                            &nbsp; &nbsp; &nbsp;
                                            <label>
                                                <Checkbox value="7" />
                                                &nbsp; Sunday
                                            </label>
                                        </>
                                    )}
                                </CheckboxGroup>
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