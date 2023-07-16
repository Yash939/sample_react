import React from "react";
import { FieldFeedbackLabel } from "./FieldFeedbackLabel";

const getFieldCSSClasses = (touched, errors) => {
  const classes = ["w-100"];
  if (touched && errors) {
    classes.push("is-invalid");
  }

  if (touched && !errors) {
    classes.push("is-valid");
  }

  return classes.join(" ");
};

export class FileField extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      file: null
    }
    this.handleChange = this.handleChange.bind(this)
  } handleChange(event) {
    this.setState({
      file: URL.createObjectURL(event.target.files[0])
    })
  } render() {
    const {
      field, // { name, value, onChange, onBlur }
      form: { touched, errors, ...form }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
      label,
      customFeedbackLabel,
      isrequired = false,
      ...props
    } = this.props
    return (
      <>
        {label && <label className="mt-4">{label}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
        <div className="d-inline-flex form-control w-100">
          <input
            type="file"
            onChange={(e) => {
              this.handleChange(e)
              form.setFieldValue(field.name, e.target.files[0])
            }}
            className={getFieldCSSClasses(touched[field.name], errors[field.name])}
            // {...field}
            {...props}
          />
          {this.state.file || field.value ? 
            <a href={this.state.file ? this.state.file : field.value} download>Download</a> : null
          }
        </div>
        {(
          <FieldFeedbackLabel
            error={errors[field.name]}
            touched={touched[field.name]}
            label={label}
            customFeedbackLabel={customFeedbackLabel}
          />
        )}
      </>
    );
  }
}