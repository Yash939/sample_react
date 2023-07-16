import React, { useRef, useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardHeaderToolbar,
    CardBody
} from '../../../../../_metronic/_partials/controls';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { reportsActions } from '../../../Reports/_redux/ReportsRedux';
// import { values } from 'lodash';
// import { useSubheader } from '../../../../../_metronic/layout';

const headerButtonStyles = {
    minWidth: "85px",
    whiteSpace: 'nowrap'
}

const CommonReportPage = ({ title, ReportActualPage, getDataMethod, dependancies = [], extraBtns = [], canEmail = false, canCSV = true }) => {

    const dispatch = useDispatch()
    const getDataBtnRef = useRef()
    const emailBtnRef = useRef()
    const csvBtnRef = useRef()

    useEffect(() => {
        dispatch(reportsActions.reIniState())
        dependancies.forEach(dep => {
            if (dep.callerMethod)
                dispatch(dep.callerMethod())
        })
    }, []);


    const { actionLoading, listLoading, error, entities, loadingMessage } = useSelector((state) => ({
        actionLoading: state.reports.actionLoading,
        listLoading: state.reports.listLoading,
        error: state.reports.error,
        entities: state.reports.entities,
        loadingMessage: state.reports.loadingMessage
    }), shallowEqual)

    const dependanciesStates = useSelector(state => {
        let states = []
        dependancies.forEach(dep => {
            states.push({
                reducerName: dep.reducerName,
                ...state[dep.reducerName]
            })
        })
        return states;
    })



    const getData = (data) => {
        dispatch(reportsActions.getData(getDataMethod.split(':')[1], data, getDataMethod.split(':')[0]))
    }

    const getDataBtnHandler = () => {
        if (getDataBtnRef && getDataBtnRef.current)
            getDataBtnRef.current.click()
    }
    const emailBtnHandler = () => {
        if (canEmail && emailBtnRef && emailBtnRef.current)
            emailBtnRef.current.click()
    }
    const csvBtnHandler = () => {
        if (canCSV && csvBtnRef && csvBtnRef.current)
            csvBtnRef.current.click()
    }

    useEffect(() => {
        const input = document.querySelector("input");
        if (input)
            input.focus();
    }, [])

    return (
        <Card>
            <CardHeader title={title}>
                <CardHeaderToolbar>

                    {(
                        <>
                            {canEmail && (
                                <button
                                    type="button"
                                    style={headerButtonStyles}
                                    className="btn btn-light ml-2"
                                    onClick={emailBtnHandler}
                                >
                                    <i className="fa fa-envelope" style={{ color: "#777" }}></i>
                            Email
                                </button>
                            )}
                            {canCSV && (
                                <button
                                    type="button"
                                    style={headerButtonStyles}
                                    className="btn btn-light ml-2"
                                    onClick={csvBtnHandler}
                                >
                                    <i className="fa fa-table" style={{ color: "#777" }}></i>
                                Export CSV
                                </button>
                            )}
                            <button
                                type="submit"
                                style={headerButtonStyles}
                                className="btn pinaple-yellow-btn ml-2"
                                onClick={getDataBtnHandler}
                            >
                                <i className="fa fa-database" style={{ color: "#777" }}></i>
                                    Get Data
                            </button>
                        </>
                    )}
                </CardHeaderToolbar>
            </CardHeader>
            <CardBody id="edit-form">
                {
                    actionLoading || listLoading || dependanciesStates.some(x => x.listLoading || x.actionLoading) ?
                        <div className="text-center">
                            <Spinner animation="grow" variant="warning" /> &nbsp;
                            <Spinner animation="grow" variant="dark" /> &nbsp;
                            <Spinner animation="grow" variant="warning" /> &nbsp;
                            {loadingMessage ? <><br /><br />{loadingMessage}</> : ''}
                        </div> :

                        <div className="text-center text-danger mb-3">
                            {error ? (
                                <div className="text-center text-danger mb-3">
                                    Error: {error.userMessage}
                                    {/* <small>({error.error.message})</small> */}
                                </div>
                            ) : ""}
                        </div>
                }
                <div style={{ display: actionLoading || listLoading || dependanciesStates.some(x => x.listLoading || x.actionLoading) ? 'none' : 'initial' }}>
                    <ReportActualPage
                        getData={getData}
                        entities={entities}
                        getDataBtnRef={getDataBtnRef}
                        btnRefs={{ csvBtnRef, emailBtnRef }}
                        states={dependanciesStates.reduce((wholeObj, obj) => Object.assign({}, { ...wholeObj, [obj['reducerName'] + 'State']: obj }), {})}
                    />
                </div>
            </CardBody>
        </Card>
    );
};

export default CommonReportPage;