import moment from "moment";
import React, { useEffect, useState } from "react";
import DatePicker, { DateObject } from "react-multi-date-picker";
import DatePanel from "react-multi-date-picker/plugins/date_panel";
import Icon from "react-multi-date-picker/components/icon"
import "../../../../harvices/multi-date-picker-black.css"

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

export function DatePickerMultiSelectField({
    field,
    form,
    label,
    customFeedbackLabel,
    isrequired = false,
    dateFormat = "yyyy-MM-DD",
    ...props
}) {
    const [values, setValues] = useState(field.value ? field.value?.map(x => new DateObject(x)) : [])

    useEffect(() => {
        const dates = values?.map(x => moment(x.format("YYYY-MM-DD")).format(dateFormat))
        form.setFieldValue(field.name, dates);
    }, [values])

    return (
        <>
            {label && <label className="mt-4">{label}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
            <div>
                <DatePicker
                className="black"
                    multiple
                    plugins={[
                        <DatePanel />
                    ]}
                    render={(value, openCalendar) => {
                        return (
                            <label className="btn pinaple-yellow-btn" onClick={openCalendar}>Select Dates <Icon /></label>
                        )
                    }}
                    onChange={setValues}
                    value={values}
                    {...props}
                />
            </div>

            {form.errors[field.name] && form.touched[field.name] && (
                <div className="invalid-datepicker-feedback"  style={{ color: 'red' }}>
                    {form.errors[field.name].toString()}
                </div>
            )}
        </>
    );
}
