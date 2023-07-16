import moment from "moment";
import React from "react";
import DatePicker from "react-datepicker";

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

export function DatePickerField({
  field,
  form,
  label,
  customFeedbackLabel,
  isrequired = false,
  dateFormat = "MM/dd/yyyy",
  ...props
}) {
  return (
    <>
      {label && <label className="mt-4">{label}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
      <div>
        <DatePicker
          wrapperClassName="w-100"
          className={getFieldCSSClasses(form.touched[field.name], form.errors[field.name])}
          selected={field.value ? new Date(field.value) : null}
          dateFormat={dateFormat}
          onChange={val => {
            form.setFieldValue(field.name, val ? moment(val).format("yyyy-MM-DD") : null);
          }}
          name={field.name}
          onBlur={field.onBlur}
          {...props}
        />
      </div>

      {form.errors[field.name] && form.touched[field.name] && (
        <div className="invalid-datepicker-feedback">
          {form.errors[field.name].toString()}
        </div>
      )}
    </>
  );
}
