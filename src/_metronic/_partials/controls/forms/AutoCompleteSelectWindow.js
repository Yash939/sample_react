import React, { Component, useEffect, useMemo } from 'react';
import Select, { createFilter, ReactSelectProps } from "react-select";
import { FieldFeedbackLabel } from "./FieldFeedbackLabel";
import { generateOptions } from '../../../../app/modules/_commons/Utils';
import { FixedSizeList as List } from "react-window";
import WindowedSelect from 'react-windowed-select';

const getStyle = (touched, errors,backgroundColor) => {
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
      backgroundColor: backgroundColor ?? null 
    })
  }
}

export function AutoCompleteSelectWindow({
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
      <WindowedSelect
        name={field.name}
        // filterOption={createFilter({ ignoreAccents: false })} // this makes all the difference!
        styles={getStyle(form.touched[field.name], form.errors[field.name],props.backgroundColor)}
        options={optionsToBeInserted}
        value={optionsToBeInserted?.length ? optionsToBeInserted.find(option => option.value === field.value) ?? '' : ''}
        onChange={(option) => form.setFieldValue(field.name, option?.value ?? null)}
        onBlur={() => form.setFieldTouched(field.name, true)}
        {...props}
        loadingMessage={() => loadingMessage ?? "Loading..."}
        isLoading={isLoading}
        isClearable={!isrequired}
        isDisabled={nonEditable}
        // components={{ MenuList }}
      />
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