import React from "react";
import { FieldFeedbackLabel } from "./FieldFeedbackLabel";

const getFieldCSSClasses = (touched, errors) => {
  const classes = ["form-control w-100"];
  if (touched && errors) {
    classes.push("is-invalid");
  }

  if (touched && !errors) {
    classes.push("is-valid");
  }

  return classes.join(" ");
};

export function TextArea({
  field, // { name, value, onChange, onBlur }
  form: { touched, errors }, // also values, setXXXX, handleXXXX, dirty, isValid, status, etc.
  label,
  customFeedbackLabel,
  type = "text",
  isrequired = false,
  ...props
}) {
  return (
    <>
      {label && <label className="mt-4">{label}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
      <textarea
        className={getFieldCSSClasses(touched[field.name], errors[field.name]) + ` ${props.readOnly ? 'bg-secondary' : ''}`}
        {...field}
        {...props}
        value={field.value ?? ''}
        ></textarea>
      {(
        <FieldFeedbackLabel
          error={errors[field.name]}
          touched={touched[field.name]}
          label={label}
          type={'textarea'}
          customFeedbackLabel={customFeedbackLabel}
        />
      )}
    </>
  );
}
