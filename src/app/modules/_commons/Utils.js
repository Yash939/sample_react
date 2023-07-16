import { PhoneNumberUtil } from "google-libphonenumber";
import _ from "lodash";
import { postcodeValidator, postcodeValidatorExistsForCountry } from "postcode-validator";
import React from "react";
import { shallowEqual, useSelector } from "react-redux";
import { withStyles } from '@material-ui/core/styles';
import MuiExpansionPanel from '@material-ui/core/ExpansionPanel';
import MuiExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import MuiExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';

export function baseFilter(_entities, _queryParams, _filtrationFields = []) {
    // Filtration
    let entitiesResult = searchInArray(
        _entities,
        _queryParams.filter,
        _queryParams.filter_array_map,
        _filtrationFields
    );
    // Sorting
    // start
    if (_queryParams.sortField) {
        if (_queryParams.sortField === "POS_Standard") {
            entitiesResult = sortArray(
                entitiesResult,
                "sortOrder",
                "asc"
            );
            entitiesResult = sortArray(
                entitiesResult,
                "active",
                "desc"
            );
        } else {
            entitiesResult = sortArray(
                entitiesResult,
                _queryParams.sortField,
                _queryParams.sortOrder
            );
        }
    }
    // end

    // Paginator
    // start
    const pageNumber = _queryParams.pageNumber - 1;
    const totalCount = entitiesResult.length;
    const initialPos = pageNumber * _queryParams.pageSize;
    entitiesResult = entitiesResult.slice(
        initialPos,
        initialPos + _queryParams.pageSize
    );
    // end

    const queryResults = {
        entities: entitiesResult,
        totalCount: totalCount,
        errorMessage: ""
    };
    return queryResults;
}

/**
 * Sort array by field name and order-type
 * @param _incomingArray: any[]
 * @param _sortField: string
 * @param _sortOrder: string
 */
export function sortArray(_incomingArray, _sortField = "", _sortOrder = "asc") {
    if (!_sortField) {
        return _incomingArray;
    }

    let result = [];
    result = [..._incomingArray].sort((a, b) => {
        let aValue, bValue
        if (_sortField.includes(".")) {
            const keys = _sortField.split(".")
            aValue = a[keys[0]][keys[1]]
            bValue = b[keys[0]][keys[1]]
        } else {
            aValue = a[_sortField]
            bValue = b[_sortField]
        }
        if (aValue < bValue)
            return _sortOrder === "asc" ? -1 : 1;
        else if (aValue > bValue)
            return _sortOrder === "asc" ? 1 : -1;
        else
            return 0
    });
    return result;
}

export function sortArrayByDate(_incomingArray, _sortField = "", _sortOrder = "asc") {

    return _incomingArray.slice().sort(function (a, b) {
        // Turn your strings into dates, and then subtract them
        // to get a value that is either negative, positive, or zero.
        // return new Date(b[_sortField]) - new Date(a[_sortField]);
        var DateA = new Date(a[_sortField]);
        var DateB = new Date(b[_sortField]);
        if (DateA < DateB) {
            return _sortOrder === "asc" ? -1 : 1;
        } else if (DateA > DateB) {
            return _sortOrder === "asc" ? 1 : -1;
        } else {
            return 0;
        }
    })
}

/**
 * Filter array by some fields
 *
 * @param _incomingArray: any[]
 * @param _queryObj: any
 * @param _filtrationFields: string[]
 */
export function searchInArray(_incomingArray, _queryObj, _filter_array_map, _filtrationFields = []) {
    const result = [];
    let resultBuffer = [];
    const indexes = [];
    let firstIndexes = [];
    let doSearch = false;

    //sub field not implemented yet in this
    _filtrationFields.forEach(item => {
        if (item in _queryObj) {
            _incomingArray.forEach((element, index) => {
                if (element[item] === _queryObj[item]) {
                    firstIndexes.push(index);
                }
            });
            firstIndexes.forEach(element => {
                resultBuffer.push(_incomingArray[element]);
            });
            _incomingArray = resultBuffer.slice(0);
            resultBuffer = [].slice(0);
            firstIndexes = [].slice(0);
        }
    });

    Object.keys(_queryObj).forEach(key => {
        if (typeof _queryObj[key] === "object") {
            Object.keys(_queryObj[key]).forEach(subkey => {
                const searchText = _queryObj[key][subkey]
                    .toString()
                    .trim()
                    .toLowerCase();
                if (key && !_filtrationFields.some(e => e[key] === subkey) && searchText) {
                    doSearch = true;
                    try {
                        _incomingArray.forEach((element, index) => {
                            if (element[key][subkey] || (element[key][subkey] === 0 && searchText === "0")) {
                                const _val = element[key][subkey]
                                    .toString()
                                    .trim()
                                    .toLowerCase();
                                if (
                                    _val.indexOf(searchText) > -1 &&
                                    indexes.indexOf(index) === -1
                                ) {
                                    indexes.push(index);
                                }
                            }
                        });
                    } catch (ex) {
                        console.error(ex, key + `[${subkey}]`, searchText);
                    }
                }
            })
        } else {
            const searchText = _queryObj[key]
                .toString()
                .trim()
                .toLowerCase();
            if (key && !_filtrationFields.some(e => e === key) && searchText) {
                doSearch = true;
                try {
                    _incomingArray.forEach((element, index) => {
                        if (_filter_array_map.hasOwnProperty(key)) {
                            const _val = _filter_array_map[key].find(x => x.value === element[key])?.label
                                .toString()
                                .trim()
                                .toLowerCase();
                            if (_val || (_val === 0 && searchText === "0")) {
                                if (
                                    _val.indexOf(searchText) > -1 &&
                                    indexes.indexOf(index) === -1
                                ) {
                                    indexes.push(index);
                                }
                            }
                        } else {
                            if (element[key] || (element[key] === 0 && searchText === "0")) {
                                const _val = element[key]
                                    .toString()
                                    .trim()
                                    .toLowerCase();
                                if (
                                    _val.indexOf(searchText) > -1 &&
                                    indexes.indexOf(index) === -1
                                ) {
                                    indexes.push(index);
                                }
                            }
                        }
                    });
                } catch (ex) {
                    console.error(ex, key, searchText);
                }
            }
        }
    });

    if (!doSearch) {
        return _incomingArray;
    }

    indexes.forEach(re => {
        result.push(_incomingArray[re]);
    });

    return result;
}

export function sortByStandard(data) {
    let entitiesResult = sortArray(
        data,
        "sortOrder",
        "asc"
    );
    entitiesResult = sortArray(
        entitiesResult,
        "active",
        "desc"
    );
    return entitiesResult;
}

export function generateOptions({ records, labelField, valueField, valueToBeSkipped = 0, withDisabled = "active", iconField = '' }) {
    if (records && labelField && valueField) {
        return records.map(item => ({ label: iconField ? (<div><img style={{ border: 0 }} src={item[iconField]} alt="" width="25px" height="25px" /> {item[labelField]}</div>) : item[labelField], value: item[valueField], isDisabled: (withDisabled && item[valueField] !== valueToBeSkipped) ? !item[withDisabled] : false }))
    } else {
        return records;
    }
}

export function errorMessageFormatter(data) {
    if (!data)
        return null;
    if (data.hasOwnProperty('errors')) {
        if (data.errors.length === 1)
            return data.errors[0]
        let message = ""
        for (let i = 0; i < data.errors.length; i++) {
            const error = data.errors[i];
            if (i === data.errors.length - 1)
                message = message + "and " + error
            else
                message = message + error + ", "
        }
    } else {
        if (data?.message?.includes("constrain")) {
            return "Somthing Went Wrong"
        } else {
            return data?.message;
        }
    }
}

export function customServerErrorMessageFormatter(data) {

    if (data?.data?.apierror) {

        let apiError = data.data.apierror
        let message = ""//apiError?.message

        if (apiError?.subErrors) {
            if (apiError.subErrors.length === 1)
                return message = apiError.subErrors[0]?.message

            // message = message + ': '

            for (let i = 0; i < apiError.subErrors.length; i++) {
                const err = apiError.subErrors[i]?.message;

                if (i === apiError.subErrors.length - 1)
                    message = message + "and " + err
                else
                    message = message + err + ", "
            }
            return message
        }
    } else if (data?.data?.error) {
        return data.data.error
    }

    return data?.message;
}

export const formatDate = (date, format = "mm/dd/yyyy") => {
    let month = date.getMonth() + 1
    let day = date.getDate()
    let year = date.getFullYear()

    month = month >= 10 ? month : "0" + month
    day = day >= 10 ? day : "0" + day

    return format.replace("mm", month).replace("dd", day).replace("yyyy", year)
}

export const copyToClipboard = str => {
    const el = document.createElement('textarea');
    el.value = str;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

export const formatDecimalTime = (time, format = "hh:mm") => {
    let decimalTimeString = time.toString();
    let decimalTime = parseFloat(decimalTimeString);
    decimalTime = decimalTime * 60 * 60;
    let hours = Math.floor((decimalTime / (60 * 60)));
    decimalTime = decimalTime - (hours * 60 * 60);
    let minutes = Math.floor((decimalTime / 60));
    decimalTime = decimalTime - (minutes * 60);
    let seconds = Math.round(decimalTime);
    if (hours < 10) {
        hours = "0" + hours;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    return format.replace('hh', hours).replace('mm', minutes).replace('ss', seconds)
}

export const calcTotalHours = (arrayOfTime) => {
    let hr = arrayOfTime.reduce((a, b) => parseFloat(a ?? 0) + parseFloat(b.substring(0, 2) ?? 0), 0)
    let mn = arrayOfTime.reduce((a, b) => parseFloat(a ?? 0) + parseFloat(b.substring(3) ?? 0), 0)
    hr += parseInt(mn / 60)
    mn = parseInt(mn % 60)
    hr = hr < 10 ? "0" + hr : hr
    mn = mn < 10 ? "0" + mn : mn
    return hr + ":" + mn
}

export const exportToCsv = (cols, rows) => {

    const rowsToExport = [
        cols.map(x => x.text),
        ...rows.map(row => {
            let ab = []
            cols.forEach(c => {
                const format = (val) => c.exportFormatter ? c.exportFormatter(val) : val
                if (c.dataField.includes('.')) {
                    let f = { ...row }
                    c.dataField.split('.').forEach(fieldName => {
                        if (f) {
                            f = format(f[fieldName])
                        }
                    })
                    ab.push((f ?? "").toString().replaceAll(',', ' '))
                } else
                    ab.push((format(row[c.dataField]) ?? "").toString().replaceAll(',', ' '))
            })
            return ab
        })
    ];

    // let csvContent = "data:text/csv;charset=utf-8,%EF%BB%BF"
    //     + rowsToExport.map(e => e.join(",")).join("\n");
    let csvContent =  rowsToExport.map(e => e.join(",")).join("\n");
    var encodedUri = encodeURIComponent(csvContent);
    var link = document.createElement("a");
    //link.setAttribute("href", encodedUri);
    link.setAttribute("href", "data:text/csv;charset=utf-8,%EF%BB%BF" + encodeURIComponent(csvContent));
    const locSplt = window.location.pathname.split("/")
    link.setAttribute("download", locSplt[locSplt.length - 1] + "-" + (new Date()).toLocaleString().replaceAll('/', '-').replaceAll(',', '-').replaceAll(' ', '-').replaceAll(':', '-') + '.csv');
    // document.body.appendChild(link); // Required for FF

    link.click(); // This will download the data file named "my_data.csv".
}
export const emailData = (cols, rows) => {
    alert("Email Data")
}

export const formatABNNumber = (abn) => {
    //debugger;
    const orgnl = abn.replaceAll(' ', '').split('')
    let newAbn = ""
    orgnl.forEach((c, i) => {
        if ([2, 4, 7, 10].includes(i)) {
            newAbn = newAbn + c + ' '
        } else
            newAbn += c
    })
    return newAbn.toUpperCase()
}
export const formatContact = (contact) => {
    //debugger;
    const orgnl = contact.replaceAll(' ', '').replaceAll('(', '').replaceAll(')', '').split('')
    let newContact = ""
    orgnl.forEach((c, i) => {
        if (i === 2) {
            newContact = "(" + newContact + ") " + c
        } else if (i === 6) {
            newContact = newContact + " " + c
        } else
            newContact += c
    })
    return newContact;
}
export const setTimeForDate = (today, hour, min, sec) => {
    today = new Date(today.setHours(hour))
    today = new Date(today.setMinutes(min))
    today = new Date(today.setSeconds(sec))
    return today
}

export const useLoggedInUserRoleCode = () => {

    const { authState } = useSelector(state => ({
        authState: state.auth,
    }), shallowEqual)

    if (authState?.user?.userRoleMST) {
        return authState.user.userRoleMST?.roleCode?.toLowerCase()
    }

    return ""
}

export const shallowDiffObjects = (a, b) => {
    return _.omitBy(a, function (v, k) {
        return b[k] === v;
    })
}

export function isValidZipCode(ref, message) {
    return this.test("isValidZipCode", message, function (value) {
        const { path, createError } = this;
        let refValue = this.resolve(ref);
        if (value) {
            if (refValue) {
                if (postcodeValidatorExistsForCountry(refValue)) {
                    if (!postcodeValidator(value, refValue)) {
                        return createError({ path, message: message ?? "Invalid Zip Code" });
                    }
                } else {
                    if (!postcodeValidator(value, 'INTL')) {
                        return createError({ path, message: message ?? "Invalid Zip Code" });
                    }
                }
            } else {
                if (!postcodeValidator(value, 'INTL')) {
                    return createError({ path, message: message ?? "Invalid Zip Code" });
                }
            }
        }
        return true;
    });
}

export function isValidContactForCountry(ref, message) {
    return this.test("isValidContactForCountry", message, function (value) {
        const { path, createError } = this;
        let countryCode = this.resolve(ref);
        let valid = false
        const data = this.parent
        if (data?.primaryContactNumber && data?.secondaryContactNumber) {
            if (data.primaryContactNumber === data.secondaryContactNumber)
                return createError({ path, message: message ?? "Primary & Secondary Contact# can't be same" });
        }
        if (value) {
            try {
                const phoneUtil = PhoneNumberUtil.getInstance();
                valid = phoneUtil.isValidNumberForRegion(phoneUtil.parse(value, countryCode), countryCode);
            } catch (e) {
                valid = false;
            }
            if (!valid) {
                return createError({ path, message: "Invalid Contact#" });
            }
        }
        return true
    });
}

export const ExpansionPanel = withStyles({
    root: {
        border: '1px solid rgba(0,0,0,.125)',
        boxShadow: 'none',
        '&:not(:last-child)': {
            borderBottom: 0,
        },
        '&:before': {
            display: 'none',
        },
        borderRadius: '10px',
        marginBottom: '5px'
    },
    expanded: {
        margin: 'auto',
    },
})(MuiExpansionPanel);

export const ExpansionPanelSummary = withStyles({
    root: {
        backgroundColor: 'rgba(0,0,0,.03)',
        // borderBottom: '1px solid rgba(0,0,0,.125)',
        marginBottom: -1,
        minHeight: 50,
        '&$expanded': {
            minHeight: 50,
        },
    },
    content: {
        '&$expanded': {
            margin: '12px 0',
        },
    },
    expanded: {},
})(props => <MuiExpansionPanelSummary {...props} />);

ExpansionPanelSummary.muiName = 'ExpansionPanelSummary';

export const ExpansionPanelDetails = withStyles(theme => ({
    root: {
        padding: theme.spacing.unit * 2,
        display: 'block'
    },
}))(MuiExpansionPanelDetails);

export const mergeArrayWithObject = (arr, obj, field) => {
    return arr && arr.map(t => t[field] === obj[field] ? obj : t);
}

export const payOutInFieldsMapping = {
    "fullDayRatesPayIn": "minHoursPayIn",
    "minHoursPayIn": "fullDayRatesPayIn",
    "projectABHRatePayIn": "projectOBHRatePayIn",
    "projectOBHRatePayIn": "projectABHRatePayIn",
    "weekendPayInMultiplier": "weekendPayInFlatRate",
    "weekendPayInFlatRate": "weekendPayInMultiplier",
    "fullDayRatesPayOut": "minHoursPayOut",
    "minHoursPayOut": "fullDayRatesPayOut",
    "projectABHRatePayOut": "projectOBHRatePayOut",
    "projectOBHRatePayOut": "projectABHRatePayOut",
    "weekendPayOutMultiplier": "weekendPayOutFlatRate",
    "weekendPayOutFlatRate": "weekendPayOutMultiplier",
    "abhPayinRate": "obhPayinRate",
    "obhPayinRate": "abhPayinRate",
    "abhPayoutRate": "obhPayoutRate",
    "obhPayoutRate": "abhPayoutRate",
}

export function isValidNumber(ref, message) {
    return this.test("isValidNumber", message, function (value) {
        const { path, createError } = this;
        let refValue = this.resolve(ref);
        const colName = message ? message : ""
        let tmpVal = ""
        const data = this.parent

        if (value !== null && value !== undefined) {
            tmpVal = value
        }

        if (refValue) {
            if (typeof refValue === 'object') {
                if (refValue.length > 0) {
                    if (tmpVal === '') {
                        const depFieldVal = data[payOutInFieldsMapping[path]]
                        let tmpDepFieldVal = ""

                        if (depFieldVal !== null && depFieldVal !== undefined) {
                            tmpDepFieldVal = depFieldVal
                        }

                        if (tmpDepFieldVal === "") {
                            return createError({ path, message: colName + " Required" });
                        }
                    }
                }
            } else if (refValue > 0) {
                if (tmpVal === '') {
                    const depFieldVal = data[payOutInFieldsMapping[path]]
                    let tmpDepFieldVal = ""

                    if (depFieldVal !== null && depFieldVal !== undefined) {
                        tmpDepFieldVal = depFieldVal
                    }

                    if (tmpDepFieldVal === "") {
                        return createError({ path, message: colName + " Required" });
                    }
                }
            }
        }
        if (tmpVal) {
            if (parseFloat(value) < 0) {
                return createError({ path, message: colName + " Must be Positive" });
            }
        }

        return true;
    });
}

export function isValidCurrency(ref, message) {
    return this.test("isValidCurrency", message, function (value) {
        const { path, createError } = this;
        let refValue = this.resolve(ref);
        const colName = message ? message : ""
        const tmpValue = value ? value : 0

        if (refValue) {
            if (typeof refValue === 'object') {
                if (refValue.length > 0) {
                    if (tmpValue <= 0) {
                        return createError({ path, message: colName + " Required" });
                    }
                }
            } else if (refValue > 0) {
                if (tmpValue <= 0) {
                    return createError({ path, message: colName + " Required" });
                }
            }
        }

        return true;
    });
}

export const getErrors = (errors) => {
    if (errors && Object.keys(errors)?.length > 0) {
        return Object.values(errors).join(", ")
    }
    return ""
}

export const MAX_LENGTH = 5500

