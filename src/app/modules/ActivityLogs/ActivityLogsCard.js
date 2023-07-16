import React, { useEffect, useMemo, useState } from 'react';
import {
    Card,
    CardHeader,
    CardHeaderToolbar,
    CardBody
} from "../../../_metronic/_partials/controls/Card";
import MainTable from "./main-table/MainTable";
import POSTableFilter from '../_commons/components/POSTableFilter';
import { useActivityLogsUIContext } from './ActivityLogsUIContext';
import { Field, Form, Formik } from 'formik';
import * as Yup from "yup";
import moment from 'moment-timezone'
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import { activityLogsActions } from './_redux/ActivityLogsRedux';
import { useLocation } from 'react-router';
import { AntdDatePickerField } from '../../../_metronic/_partials/controls/forms/AntdDatePickerField';

const ActivityLogsCard = () => {

    const uiContext = useActivityLogsUIContext();
    const dispatch = useDispatch()
    const fromDate = useLocation()?.state?.fromDate
    const toDate = useLocation()?.state?.toDate

    const [initVal, setInitVal] = useState({
        fromDate: null,
        toDate: null,
    })

    const { currentState } = useSelector(
        state => ({ currentState: state.activityLogs }),
        shallowEqual
    )

    const uiProps = useMemo(() => {
        return {
            newButtonClick: uiContext.newButtonClick,
            queryParams: uiContext.queryParams,
            setQueryParams: uiContext.setQueryParams,
        }
    }, [uiContext])

    const timezone = moment.tz.guess(true)

    // let iniValues = {
    //     fromDate: null,
    //     toDate: null,
    // }

    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            fromDate: Yup.string().nullable().required("From Date Required"),
            toDate: Yup.string().nullable().required("To Date Required"),
        });
    }, [])

    useEffect(() => {
        if(fromDate && toDate) {
            const tmp = {
                fromDate: moment.tz((fromDate + " 00:00"), 'YYYY-MM-DD HH:mm', timezone).tz("utc").format('YYYY-MM-DD HH:mm'),
                toDate: moment.tz((toDate + " 24:00"), 'YYYY-MM-DD HH:mm', timezone).tz("utc").format('YYYY-MM-DD HH:mm')
            }
            setInitVal({
                fromDate: fromDate,
                toDate: toDate
            })
            dispatch(activityLogsActions.getFilteredData(tmp))
        } else {
            dispatch(activityLogsActions.getPaginatedData())
        }
            
    }, [])

    return (
        <Formik
            enableReinitialize={true}
            initialValues={initVal}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                let tmp = { ...values }
                tmp.fromDate = moment.tz((tmp.fromDate + " 00:00"), 'YYYY-MM-DD HH:mm', timezone).tz("utc").format('YYYY-MM-DD HH:mm')
                tmp.toDate = moment.tz((tmp.toDate + " 24:00"), 'YYYY-MM-DD HH:mm', timezone).tz("utc").format('YYYY-MM-DD HH:mm')

                dispatch(activityLogsActions.getFilteredData(tmp))
            }}
        >
            {
                ({ handleSubmit, handleReset, values }) => (
                    <Form className="form form-label-right">
                        <Card>
                            <CardHeader>
                                <div className="row" style={{ marginTop: '0.5rem', alignItems: 'center' }}>
                                    <div className="col-md-4 col-12" style={{ marginBottom: '10px' }}>
                                        <Field
                                            name="fromDate"
                                            component={AntdDatePickerField}
                                            placeholder="DD-MMM-YYYY"
                                            label="From Date"
                                            isrequired
                                            disabledDate={(current) => current > moment().endOf('day')}
                                            // format="YYYY-MM-DD"
                                            // maxDate={moment().format("yyyy-MM-DD")}
                                        />
                                    </div>
                                    <div className="col-md-4 col-12" style={{ marginBottom: '10px' }}>
                                        <Field
                                            name="toDate"
                                            component={AntdDatePickerField}
                                            placeholder="DD-MMM-YYYY"
                                            label="To Date"
                                            isrequired
                                            disabledDate={(current) => current > moment().endOf('day')}
                                            // format="YYYY-MM-DD"
                                            // maxDate={moment().format("yyyy-MM-DD")}
                                        />
                                    </div>
                                    <div className="col-12 col-md-2">
                                        <label className="mt-4"></label>
                                        <button
                                            type="submit"
                                            style={{
                                                minWidth: "85px",
                                                whiteSpace: 'nowrap'
                                            }}
                                            className="btn pinaple-yellow-btn ml-2"
                                        >
                                            <i className="fa fa-save" style={{ color: "#777" }}></i>
                                            Get Data
                                        </button>
                                    </div>
                                </div>
                                <CardHeaderToolbar>
                                    <POSTableFilter qParams={uiProps.queryParams} setQParams={uiProps.setQueryParams} />
                                </CardHeaderToolbar>
                            </CardHeader>
                            <CardBody>
                                <MainTable currentState={currentState} 
                                    fromDate={values?.fromDate} 
                                    toDate={values?.toDate}/>
                            </CardBody>
                        </Card>
                    </Form>
                )
            }
        </Formik>
    );
};

export default ActivityLogsCard;