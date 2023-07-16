import { Field, Form, Formik } from 'formik';
import React, { useMemo, useState } from 'react'
import { Modal } from 'react-bootstrap';
import { Input } from '../../../../_metronic/_partials/controls';
import * as Yup from "yup";
import { shallowEqual, useSelector } from 'react-redux';
import { changePassword } from '../_redux/authCrud';
import { customServerErrorMessageFormatter, errorMessageFormatter } from '../../_commons/Utils';
import { useHistory } from 'react-router-dom';

const ChangePasswordModal = ({ closeModalHandler }) => {

    const { authState } = useSelector(state => ({
        authState: state.auth,
    }), shallowEqual)

    const [error, setError] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const history = useHistory();

    const iniVal = {
        id: authState?.user?.id,
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    }

    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            oldPassword: Yup.string().nullable().required("Old Password required"),
            newPassword: Yup.string().nullable().required("New Password required"),
            confirmPassword: Yup.string()
                .test('passwords-match', 'New Password and Confirm Password must be same', function (value) {
                    return this.parent.newPassword === value
                }),
        });
    }, []);

    return (
        <Modal
            style={{ backgroundColor: 'rgba(0,0,0,.3)' }}
            show={true}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >

            <Formik
                enableReinitialize={true}
                initialValues={iniVal}
                validationSchema={validationSchema}
                onSubmit={(values) => {

                    setSubmitting(true)
                    changePassword(values).then(res => {
                        if (res?.data.status) {
                            setSubmitting(false)
                            closeModalHandler()
                            const toggle = document.getElementById("kt_quick_user_toggle");
                            if (toggle) {
                                toggle.click();
                            }
                            history.push("/logout");
                        } else {
                            setError(errorMessageFormatter(res.data))
                            setSubmitting(false)
                        }

                    }).catch(err => {
                        setError(customServerErrorMessageFormatter(err.response))
                        setSubmitting(false)
                    })
                }}
            >
                {
                    ({ handleSubmit, handleReset, values }) => (
                        <Form className="form form-label-right">
                            <Modal.Header closeButton className="p-2" style={{ position: 'sticky', top: 0, backgroundColor: '#f7f7f7', zIndex: '99999' }}>
                                <Modal.Title bsPrefix="h6 mt-2">
                                    Change Password
                                </Modal.Title>
                            </Modal.Header>

                            <Modal.Body>
                                {error ? <div className="text-center text-danger mb-3">
                                    Error : {error}
                                </div> : ""}
                                <div className="changePasswordModel" >
                                    <div className="form-group row">
                                        <div className="col-12">
                                            <Field
                                                name="oldPassword"
                                                component={Input}
                                                placeholder="Enter Old Password"
                                                label="Old Password"
                                                isrequired
                                                type="password"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <div className="col-12">
                                            <Field
                                                name="newPassword"
                                                component={Input}
                                                placeholder="Enter New Password"
                                                label="New Password"
                                                isrequired
                                                type="password"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group row">
                                        <div className="col-12">
                                            <Field
                                                name="confirmPassword"
                                                component={Input}
                                                placeholder="Enter Confirm Password"
                                                label="Confirm Password"
                                                isrequired
                                                type="password"
                                            />
                                        </div>
                                    </div>
                                </div>

                            </Modal.Body>

                            <Modal.Footer className="p-1" bsPrefix="text-center modal-footer text-center" style={{ position: 'sticky', bottom: 0, backgroundColor: "#efefef", borderTop: '2px solid #ccc' }}>

                                <div className="w-100">
                                    <button style={{ width: '200px', margin: '0px 10px' }} className="btn pinaple-black-btn" disabled={submitting} onClick={() => closeModalHandler()}> Cancel</button>
                                    <button type="submit" style={{ width: '200px', margin: '0px 10px' }} disabled={submitting} className="btn pinaple-yellow-btn saveMobileBtn" onClick={() => handleSubmit()}> Save</button>
                                </div>
                            </Modal.Footer>
                        </Form>
                    )
                }
            </Formik>

        </Modal>
    )
}

export default ChangePasswordModal;