import React, { useEffect, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import { AutoCompleteSelect, Input, Switch } from '../../../../../_metronic/_partials/controls';
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { stateMasterActions } from '../_redux/StateMasterRedux';
import { countryMasterActions } from '../../CountryMaster/_redux/CountryMasterRedux';

const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
    const dispatch = useDispatch()
    const { currentState,countryMasterState } = useSelector((state) =>
    ({
        currentState: state.stateMaster,
        countryMasterState: state.countryMaster
    }),
        shallowEqual
    )

    useEffect(() => {
        if (currentState.totalCount === 0 && !currentState.listLoading && !currentState.error) {
            dispatch(stateMasterActions.getAll())
        }
        dispatch(countryMasterActions.getAll())
    }, [])

    //code unique validation
    const editId = currentState?.entityForEdit?.id ?? 0;
    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            stateName: Yup.string().required("State Name required"),
            // stateCode: Yup.string().required("State Code required"),
            countryMSTId: Yup.number().min(1, "Country required")
        });
    }, [currentState.entities, editId])
    return (
        <Formik
            enableReinitialize={true}
            initialValues={enitity}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                saveRecord(values);
            }}
        >
            {
                ({ handleSubmit, handleReset, values }) => (
                    <Form className="form form-label-right">
                        <div className="form-group row">
                            <div className="col-lg-3">
                                <Field
                                    name="stateName"
                                    component={Input}
                                    placeholder="Enter State Name"
                                    label="State Name"
                                    isrequired
                                />
                            </div>
                            <div className="col-lg-3">
                                <Field
                                    name="countryMSTId"
                                    component={AutoCompleteSelect}
                                    customOptions={{
                                        records: countryMasterState?.entities,
                                        labelField: "countryName",
                                        valueField: "id",
                                    }}
                                    isLoading={countryMasterState.listLoading}
                                    loadingMessage="Fetching records..."
                                    placeholder="Select Country"
                                    isrequired
                                    label="Country Name"
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