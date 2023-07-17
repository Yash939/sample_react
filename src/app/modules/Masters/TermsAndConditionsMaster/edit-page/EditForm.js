// src\app\modules\Masters\TermsAndConditionsMaster\EditForm.js

import React, { useEffect } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useSelector, shallowEqual } from "react-redux";
import { Input } from '../../../../../_metronic/_partials/controls';
import { HTMLEditorFieldHTMLData } from "../../../../../_metronic/_partials/controls/forms/HTMLEditorFieldHTMLData";
import HTMLEditorPlaceHolder from "../../../../../_metronic/_partials/controls/forms/HTMLEditorPlaceHolder";
import { termsAndConditionsMasterActions, reducerInfo } from "../_redux/TermsAndConditionsMasterRedux";

const isDanger = <span className="text-danger font-weight-bold">*</span>;

const EditForm = ({ entity, saveRecord, submitBtnRef, resetBtnRef }) => {
  const { currentState } = useSelector(
    (state) => ({
      currentState: state.termsAndConditionsMaster, // Replace with your actual reducer
    }),
    shallowEqual
  );

  useEffect(() => {
    document.title = "Terms and Conditions Master"
  }, []);

  return (
    <Formik
      enableReinitialize={true}
      initialValues={entity}
      validationSchema={Yup.object().shape({
        templateName: Yup.string().required("Template Name is required"),
        template: Yup.string().required("Template is required"),
      })}
      onSubmit={(values) => {
        saveRecord(values);
      }}
    >
      {({ handleSubmit }) => (
        <>
          <Form className="form form-label-right">
            <div className="form-group row">
              <div className="col-lg-4">
                <Field
                  name="templateName"
                  component={Input}
                  placeholder="Template Name"
                  label={`Template Name ${isDanger}`}
                />
              </div>
              <div className="col-lg-4">
                <Field
                  name="template"
                  component={HTMLEditorFieldHTMLData}
                  placeholder={HTMLEditorPlaceHolder}
                  label={`Template ${isDanger}`}
                />
              </div>
            </div>
            <button
                            type="submit"
                            style={{ display: "none" }}
                            ref={submitBtnRef}
                            onSubmit={() => handleSubmit()}
                        />
                       
          </Form>
        </>
      )}
    </Formik>
  );
};


export default EditForm;