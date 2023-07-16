import React from "react";
import {
    MuiPickersUtilsProvider,
    KeyboardTimePicker,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { createStyles, makeStyles } from '@material-ui/core';


export function TimePickerField({
    field,
    form,
    lable,
    customFeedbackLabel,
    isrequired = false,
    ...props
}) {
    const useStyles = makeStyles(() => createStyles({
        datePicker: {
            '& .MuiPickersToolbar-toolbar ': {
                backgroundColor: 'black !important'
            },
            '& .MuiPickersToolbarText-toolbarTxt ': {
                color: 'white !important'
            },
            '& .MuiButton-textPrimary ': {
                color: 'black !important',

            },
            '& .MuiButton-label ': {
                fontWeight: '700'
            },
            '& .MuiPickersClockPointer-pointer ': {
                backgroundColor: 'black !important'
            },
            '& .MuiPickersClockPointer-thumb ': {
                border: '14px solid white'
            },
            '& .MuiPickersClock-pin': {
                backgroundColor: 'black !important'
            },
        },
    }));

    const useStyles1 = makeStyles(() => createStyles({
        inputLabelStyle: {
            "& .MuiFormLabel-root": {
                zIndex: "0 !important"
            }
        }
    }));

    const inputStyles = makeStyles(() => createStyles({
        root: {
            width: '100%',
            "& .MuiInputBase-root": {
                padding: 0,
                backgroundColor: props.backgroundColor ?? "",
                color: props.color ?? "",
                "& .MuiInputBase-input": {
                    padding: '12px 14px',
                }
            },
            '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#E4E6EF'
            }
        }
    }));

    const { datePicker } = useStyles();
    const { inputLabelStyle } = useStyles1();
    const inputStyleConst = inputStyles();

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

    return (
        <>
            {lable && <label className="mt-4">{lable}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
            <div>
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                    <KeyboardTimePicker
                        className={inputStyleConst.root}
                        DialogProps={{ className: datePicker }}
                        value={field.value ?? null}
                        onChange={val => {
                            form.setFieldValue(field.name, val ?? null);
                        }}
                        KeyboardButtonProps={{
                            'aria-label': 'change time',
                        }}
                        InputLabelProps={{ className: inputLabelStyle.outlined }}
                        inputVariant="outlined"
                        {...props}
                    />
                </MuiPickersUtilsProvider>
            </div>

            {form.errors[field.name] && form.touched[field.name] && (
                <div className="invalid-datepicker-feedback" style={{ color: 'red' }}>
                    {form.errors[field.name].toString()}
                </div>
            )}
        </>
    );
}
