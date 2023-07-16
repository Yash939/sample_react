import React, { useEffect, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import { AutoCompleteSelect, Input, Switch } from '../../../../../_metronic/_partials/controls';
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { countryMasterActions } from '../../CountryMaster/_redux/CountryMasterRedux';
import { cityMasterActions } from '../_redux/CityMasterRedux';
import { stateMasterActions } from '../../StateMaster/_redux/StateMasterRedux';
import { useHistory } from 'react-router';

const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
    const dispatch = useDispatch()
    const history = useHistory()
    const { currentState, stateMasterState, countryMasterState } = useSelector((state) =>
    ({
        currentState: state.cityMaster,
        stateMasterState: state.stateMaster,
        countryMasterState: state.countryMaster
    }),
        shallowEqual
    )

    useEffect(() => {
        if (currentState.totalCount === 0 && !currentState.listLoading && !currentState.error) {
            dispatch(cityMasterActions.getAll())
        }
        dispatch(countryMasterActions.getAll())
        dispatch(stateMasterActions.getAll())
    }, [])

    //code unique validation
    const editId = currentState?.entityForEdit?.id ?? 0;
    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            cityName: Yup.string().required("City Name required"),
            // cityCode: Yup.string().required("City Code required"),
            countryMSTId: Yup.number().min(1, "Country required"),
        });
    }, [currentState.entities, editId])
    return (
        <Formik
            enableReinitialize={true}
            initialValues={enitity}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                let val = {...values}
                delete val?.stateMST

                if(val.id && val.id !== 0){
                    dispatch(cityMasterActions.update(val))
                    .then(res => {
                        dispatch(cityMasterActions.fetchEntity(res.id)).then(res1 => {
                        })
                    }).catch(err => {
                        console.log(err?.userMessage)
                    })
                }else{
                    dispatch(cityMasterActions.create(val)).then(res => {
                        history.push(`/settings/masters/city/master/${res.id}/edit`)
                    }).catch(err => {
                        console.log(err?.userMessage)
                    })
                }
            }}
        >
            {
                ({ handleSubmit, handleReset, values }) => (
                    <Form className="form form-label-right">
                        <div className="form-group row">
                            
                            <div className="col-lg-2">
                                <Field
                                    name="cityName"
                                    component={Input}
                                    placeholder="Enter City Name"
                                    label="City Name"
                                    isrequired
                                />
                            </div>
                            <div className="col-lg-3">
                                <Field
                                    name="stateMSTId"
                                    component={AutoCompleteSelect}
                                    customOptions={{
                                        records: stateMasterState?.entities,
                                        labelField: "stateName",
                                        valueField: "id",
                                    }}
                                    isLoading={stateMasterState.listLoading}
                                    loadingMessage="Fetching records..."
                                    placeholder="Select State"
                                    label="State"
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
                                    label="Country"
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