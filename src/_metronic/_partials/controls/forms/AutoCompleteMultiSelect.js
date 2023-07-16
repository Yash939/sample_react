import React, { useEffect, useMemo } from 'react';
import Select, { ReactSelectProps } from "react-select";
import { FieldFeedbackLabel } from "./FieldFeedbackLabel";
import { parseWithOptions } from 'date-fns/esm/fp';
import { generateOptions } from '../../../../app/modules/_commons/Utils';

const getStyle = (touched, errors) => {
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
      borderColor: valueSelector("#ddd", "#1BC5BD", "#F64E60")
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 10
    }),
  }
}

export function AutoCompleteMultiSelect({
  field,
  form,
  customOptions = { records: [], labelField: '', valueField: '', valueToBeSkipped: 0, withDisabled: "active", iconField: "" },
  options,
  label,
  customFeedbackLabel,
  isrequired = false,
  isLoading = false,
  loadingMessage = undefined,
  ...props
}) {
  const optionsToBeInserted = useMemo(() => {
    return options
      ? options
      : generateOptions(customOptions)
  }, [options, customOptions])


  useEffect(() => {
    if (optionsToBeInserted?.length === 1 && isrequired) {
      form.setFieldValue(field.name, optionsToBeInserted[0])
      if (props.onChange)
        props.onChange(optionsToBeInserted[0])
    }
  }, [isLoading])

  return (
    <>
      {label && <label className="mt-4">{label}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
      <Select
        name={field.name}
        styles={getStyle(form.touched[field.name], form.errors[field.name])}
        options={optionsToBeInserted}
        value={field.value}
        onChange={(value) => form.setFieldValue(field.name, value)}
        onBlur={() => form.setFieldTouched(field.name, true)}
        {...props}
        loadingMessage={() => loadingMessage ?? "Loading..."}
        isLoading={isLoading}
        isClearable={!isrequired}
        isMulti
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