import moment from "moment";
import React from "react";
import { Space, TimePicker } from 'antd';
import { FieldFeedbackLabel } from "..";
import './AntdDateTimePickerFieldCSS.css'

const getFieldCSSClasses = (touched, errors) => {
  const classes = ["form-control w-100"];
  if (touched && errors) {
    classes.push("is-invalid");
  }

  if (touched && !errors) {
    // classes.push("valid-border-color");
    classes.push("is-valid");
  }

  return classes.join(" ");
};

export function AntdTimePickerField({
  field,
  form,
  label,
  customFeedbackLabel,
  isrequired = false,
  format = "HH:mm",
  ...props
}) {

  const onChange =(val) => {
    if(props?.onChange) {
      props.onChange(val)
    } else {
      form.setFieldValue(field.name, val ? moment(val).format("HH:mm") : null);
    }
  }
  
  return (
    <>
      {label && <label className="mt-4">{label}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
      <div>
        <Space direction="vertical" size={10} style={props?.disabled ? {padding: '0px', backgroundColor: '#F3F6F9'}: {padding: '0px'}} className={getFieldCSSClasses(form.touched[field.name], form.errors[field.name])}>
          <TimePicker
            // use12Hours
            value={field.value ? moment(field.value,"HH:mm") : null}
            format={format}
            onOk={(val) => onChange(val)} 
            onChange={(val) => onChange(val)} 
            bordered={false}
            onBlur={() => form.setFieldTouched(field.name, true)}
            style={{width:'85%'}}
            {...props}
          />
        </Space>
      </div>

      {(
        <FieldFeedbackLabel
          error={form.errors[field.name]}
          touched={form.touched[field.name]}
          label={label}
          type="select"
          customFeedbackLabel={customFeedbackLabel}
        />
      )}
    </>
  );
}
