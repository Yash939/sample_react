import React, { useEffect, useMemo } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { Input } from "../../../../_metronic/_partials/controls";
import { HTMLEditorFieldHTMLData } from "../../../../_metronic/_partials/controls/forms/HTMLEditorFieldHTMLData";
import HTMLEditorPlaceHolder from "../../../../_metronic/_partials/controls/forms/HTMLEditorPlaceHolder";
import { operationalConfigMasterActions } from "../../Masters/OperationalConfig/_redux/OperationalConfigRedux";

const isDanger = <span className="text-danger font-weight-bold">*</span>;
const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    document.title = "Email Close"
  }, []);

  //code unique validation
  const validationSchema = useMemo(() => {
    return Yup.object().shape({
      emailTo: Yup.string().required("Required"),
      emailSubject: Yup.string().required("Required"),
    });
  }, []);


  return (
    <Formik
      enableReinitialize={true}
      initialValues={enitity}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        if (values.id) {
          dispatch(operationalConfigMasterActions.update(values)).then(res => {
            dispatch(operationalConfigMasterActions.fetchEntity(res.id))
          }).catch(err => console.log(err))
        }
        else {
          dispatch(operationalConfigMasterActions.create(values)).then(res => {
            dispatch(operationalConfigMasterActions.fetchEntity(res.id))
          }).catch(err => console.log(err))
        }
      }}
    >
      {({ handleSubmit, handleReset, values, setFieldValue }) => (
        <Form className="form form-label-right">
          <div className="form-group row">
            <div className="col-1">
              <label className="justify-content-center" style={{ fontWeight: '600' }}>
                To{isDanger}
              </label>
            </div>

            <div className="col-10">
              <Field
                name="emailToClose"
                component={Input}
                isrequired
              />
            </div>
          </div>
          <div className="form-group row">
            <div className="col-1">
              <label className="justify-content-center" style={{ fontWeight: '600' }}>
                Subject{isDanger}
              </label>
            </div>

            <div className="col-10">
              <Field
                name="emailSubjectClose"
                component={Input}
                isrequired
              />
            </div>
          </div>
          <div className="form-group row">
            <div className="col-1">
              <label className="justify-content-center" style={{ fontWeight: '600' }}>
                Body
              </label>
            </div>

            <div className="col-10">
              <Field
                name="emailBodyClose"
                component={HTMLEditorFieldHTMLData}
                toolbarCustomButtons={[<HTMLEditorPlaceHolder />]}
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
      )}
    </Formik>
  );
};

export default EditForm;
