import React, { useEffect, useMemo } from 'react';
import Select, { ReactSelectProps } from "react-select";
import { FieldFeedbackLabel } from "./FieldFeedbackLabel";
import { parseWithOptions } from 'date-fns/esm/fp';
import { generateOptions } from '../../../../app/modules/_commons/Utils';

const getStyle = (touched, errors,backgroundColor,color) => {
  const valueSelector = (normal, valid, invalid) => {
    if (touched && errors)
      return invalid
    else if (touched && !errors)
      return valid
    else
      return normal
  }
  return {
    control: (provided, state) => ({
      ...provided,
      borderColor: valueSelector("#ddd", "#1BC5BD", "#F64E60"),
      backgroundColor: backgroundColor ?? null,
      color: color ?? null 
    })
  }
}

export function AutoCompleteSelect({
  field,
  form,
  customOptions = { records: [], labelField: '', valueField: '', valueToBeSkipped: 0, withDisabled: "active", iconField: "" },
  options,
  label,
  customFeedbackLabel,
  isrequired = false,
  isLoading = false,
  loadingMessage = undefined,
  nonEditable=false,
  setDefault=true,
  ...props
}) {
  const optionsToBeInserted = useMemo(() => {
    return options
      ? options
      : generateOptions(customOptions)
  }, [options, customOptions])


  useEffect(() => {
    if (optionsToBeInserted?.length === 1 && isrequired && setDefault) {
      form.setFieldValue(field.name, optionsToBeInserted[0].value)
      if (props.onChange)
        props.onChange(optionsToBeInserted[0])
    }
  }, [isLoading])

  return (
    <>
      {label && <label className="mt-4">{label}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
      <div name={field.name}>
      <Select
        name={field.name}
        styles={getStyle(form.touched[field.name], form.errors[field.name],nonEditable ? "#F3F6F9" : null, nonEditable ? "#3F4254" : null)}
        options={optionsToBeInserted}
        value={optionsToBeInserted?.length ? optionsToBeInserted.find(option => option.value === field.value) ?? '' : ''}
        onChange={(option) => form.setFieldValue(field.name, option?.value ?? null)}
        onBlur={() => form.setFieldTouched(field.name, true)}
        {...props}
        loadingMessage={() => loadingMessage ?? "Loading..."}
        isLoading={isLoading}
        isClearable={!isrequired}
        isDisabled={nonEditable}
      />
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
};