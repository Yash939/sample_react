import React from "react";
import {
    KeyboardDatePicker,
    MuiPickersUtilsProvider,
} from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';
import { createStyles, makeStyles } from '@material-ui/core';
import MomentUtils from "@date-io/moment";
import moment from "moment";

export function KeyboardDatePickerField({
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
            '& .MuiPickersDay-daySelected': {
                backgroundColor: 'black !important',
                color: 'white !important'
            },

            "& .MuiInputBase-root": {
                // '& .MuiOutlinedInput-input': {
                //    paddingTop: '12px !important'
                // },
                padding: '0px',
                "& .MuiInputBase-input": {
                    padding: '15px !important',
                    paddingLeft: '0px !important'
                }
            }
        }
    }));

    const inputStyles = makeStyles(() => createStyles({
        root: {
          
            width:'100%',
            "& .MuiInputBase-root": {
                padding: 0,
                backgroundColor: props => props.backgroundColor,
                "& .MuiInputBase-input": {
                    padding: '12px 14px',
                }
            },
            '& .MuiOutlinedInput-notchedOutline' : {
                borderColor : '#E4E6EF'
            }
        }
    }));

    const { datePicker } = useStyles();
    const inputStyleConst = inputStyles(props);

    return (
        <>
            {lable && <label className="mt-4">{lable}{(isrequired ? <span className="text-danger font-weight-bold">*</span> : null)}</label>}
            <div>
                <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
                    <KeyboardDatePicker
                        className={inputStyleConst.root}
                        DialogProps={{ className: datePicker }}
                        value={field.value ?? null}
                        onChange={(date,val) => {
                            form.setFieldValue(field.name, val ?? null);
                        }}
                        KeyboardButtonProps={{
                            'aria-label': 'change time',
                        }}
                        inputVariant="outlined"
                        // InputProps={{ className: inputStyleConst.root }}
                        onBlur={() => form.setFieldTouched(field.name, true)}
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
