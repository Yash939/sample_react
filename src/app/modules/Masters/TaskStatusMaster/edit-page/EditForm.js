import React, { useEffect, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import { Input, Switch } from '../../../../../_metronic/_partials/controls';
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { taskStatusMasterActions } from '../_redux/TaskStatusMasterRedux';

const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
    const dispatch = useDispatch()
    const { currentState } = useSelector((state) =>
    ({
        currentState: state.taskStatusMaster
    }),
        shallowEqual
    )

    useEffect(() => {
        if (currentState.totalCount === 0 && !currentState.listLoading && !currentState.error) {
            dispatch(taskStatusMasterActions.getAll())
        }
    }, [])

    //code unique validation
    const editId = currentState?.entityForEdit?.id ?? 0;
    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            taskStatusName: Yup.string().required("Status Name required"),
            sortOrder: Yup.number().min(1, "Sort Order should be greater than zero")
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
                                    name="taskStatusName"
                                    component={Input}
                                    placeholder="Enter Status Name"
                                    label="Status Name"
                                    isrequired
                                />
                            </div>
                            <div className="col-lg-3">
                                <Field
                                    name="sortOrder"
                                    component={Input}
                                    placeholder="Enter Status Name"
                                    type="number"
                                    label="Sort Order"
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

                        <div className="form-group row">
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="defaultFlag"
                                    component={Switch}
                                    label="Default Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="closeFlag"
                                    component={Switch}
                                    label="Close Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="confirmFlag"
                                    component={Switch}
                                    label="Confirm Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="payOutFlag"
                                    component={Switch}
                                    label="Payout Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="payInFlag"
                                    component={Switch}
                                    label="Payin Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="reopenFlag"
                                    component={Switch}
                                    label="Re-Open Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="penaltyFlag"
                                    component={Switch}
                                    label="Penalty Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="autoCloseFlag"
                                    component={Switch}
                                    label="Auto Close Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="assignedFlag"
                                    component={Switch}
                                    label="Assigned Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="wipFlag"
                                    component={Switch}
                                    label="WIP Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="cancelFlag"
                                    component={Switch}
                                    label="Cancel Flag"
                                    color="primary"
                                />
                            </div>
                            <div className="col-lg-2 col-md-3" style={{ marginRight: '-50px' }}>
                                <Field
                                    name="pendingFlag"
                                    component={Switch}
                                    label="Pending Flag"
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