import React from "react";
import { Switch as CoreSwitch } from "@material-ui/core";
// import { withStyles } from '@material-ui/styles';
// import { colors } from '@material-ui/core';

// const PurpleSwitch = withStyles({
//   switchBase: {
//     color: colors.purple[300],
//     '&$checked': {
//       color: colors.purple[500],
//     },
//     '&$checked + $track': {
//       backgroundColor: colors.purple[500],
//     },
//   },
//   checked: {},
//   track: {},
// })(CoreSwitch);

export function Switch({
  field,
  form,
  color = "primary",
  label,
  customFeedbackLabel,
  disabled = false,
  inline = false,
  inlineLabels = "No:Yes",
  ...props
}) {
  return inline ? (
    <div className="border rounded w-100 text-center">
      <span className={field.value ? '' : 'font-weight-bolder text-muted'}>{inlineLabels.split(':')[0]}</span>
      <CoreSwitch
        className=""
        color={color}
        name={field.name}
        checked={form.values[field.name]}
        onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
        onBlur={() => form.setFieldTouched(field.name, true)}
        disabled={disabled}
        {...props}
      />
      <span className={field.value ? 'font-weight-bolder' : ''}>{inlineLabels.split(':')[1]}</span>
    </div>) : (
      <>
        {label && <><label className="mt-4">{label}</label><br /></>}
        <CoreSwitch
          className="form-control"
          color={color}
          name={field.name}
          checked={form.values[field.name]}
          onChange={(e) => form.setFieldValue(field.name, e.target.checked)}
          onBlur={() => form.setFieldTouched(field.name, true)}
          disabled={disabled}
          {...props}
        />
      </>
    );
}
