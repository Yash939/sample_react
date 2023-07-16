import moment from "moment";
// import 'antd/dist/antd.less'
// import 'antd/dist/antd.css';
// import "antd/lib/style/themes/default.less"
// import 'antd/lib/date-picker/style';
// import 'antd/lib/date-picker/style/css';
// import 'antd/lib/space/style/index.less';
// import 'antd/lib/space/style';
// import 'antd/lib/time-picker/style';
// import 'antd/lib/time-picker/style/css';
import React from "react";
// import { DatePicker, Space } from 'antd';
import { FieldFeedbackLabel } from "..";
import './AntdDateTimePickerFieldCSS.css'

//=================
import Space from 'antd/lib/space'; 
import 'antd/lib/space/style/css'

import DatePicker from 'antd/lib/date-picker'; 
import "antd/lib/date-picker/style/css";
// import 'antd/lib/date-picker/style/index.css'

// import 'antd/lib/time-picker/style/index.css'

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

export function AntdDatePickerField({
  field,
  form,
  label,
  customFeedbackLabel,
  isrequired = false,
  // format = "YYYY-MM-DD",
  format = "DD-MMM-YYYY",
  ...props
}) {

  const onChange =(val) => {
    if(props?.onChange) {
      props.onChange(val)
    } else {
      form.setFieldValue(field.name, val ? moment(val).format("yyyy-MM-DD") : null);
    }
  }
  
  return (
    <>
      {label && <label className="mt-4">{label}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
      <div>
        <Space direction="vertical" size={12} style={props?.disabled ? {padding: '0px', backgroundColor: '#F3F6F9'}: {padding: '0px'}} className={getFieldCSSClasses(form.touched[field.name], form.errors[field.name])}>
          <DatePicker
            // showTime={{ use12Hours: true, format: "h:mm a" }}
            value={field.value ? moment(field.value,"yyyy-MM-DD") : null}
            format={format}
            onOk={(val) => onChange(val)} 
            onChange={(val) => onChange(val)} 
            bordered={false}
            onBlur={() => form.setFieldTouched(field.name, true)}
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
