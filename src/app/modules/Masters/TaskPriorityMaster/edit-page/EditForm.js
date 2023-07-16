import React, { useEffect, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import { Input, Switch } from '../../../../../_metronic/_partials/controls';
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { taskPriorityMasterActions } from '../_redux/TaskPriorityMasterRedux';

const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
    const dispatch = useDispatch()
    const { currentState} = useSelector((state) =>
    ({
        currentState: state.taskPriorityMaster
    }),
        shallowEqual
    )

    useEffect(() => {
        if (currentState.totalCount === 0 && !currentState.listLoading && !currentState.error) {
            dispatch(taskPriorityMasterActions.getAll())
        }
    }, [])

    //code unique validation
    const editId = currentState?.entityForEdit?.id ?? 0;
    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            taskPriorityName: Yup.string().required("Priority Name required"),
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
                                    name="taskPriorityName"
                                    component={Input}
                                    placeholder="Enter Priority Name"
                                    label="Priority Name"
                                    isrequired
                                />
                            </div>
                            <div className="col-lg-2" style={{marginRight:'-50px'}}>
                                <Field
                                    name="taskDefaultFlag"
                                    component={Switch}
                                    label="Default Flag"
                                    color="primary"
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