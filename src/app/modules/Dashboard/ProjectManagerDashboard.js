import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';
import { errorMessageFormatter } from '../_commons/Utils';
import { operationalConfigMasterActions } from '../Masters/OperationalConfig/_redux/OperationalConfigRedux';

const ProjectManagerDashboard = () => {

    const dispatch = useDispatch()

    const { authState, operationalConfigMasterState, moduleMasterState } = useSelector(state => ({
        authState: state.auth,
        operationalConfigMasterState: state.operationalConfigMaster,
        moduleMasterState: state.moduleMaster
    }), shallowEqual)

    const [mainData, setMainData] = useState({
        loading: null,
        data: null,
        error: null,
    });

    const getCard = (headerName, content) => {

        return <div className="col pb-5">
            {/* <div className="col-md-2 col-lg-2 col-sm-6 col-xl-2 pb-5"> */}
            <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                <h6
                    className="card-header text-center p-1"
                    style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                >
                    {headerName}
                </h6>
                <div /* className="card-body" */ style={{ textAlign: 'center', fontSize: 'xxx-large' }}>
                    {content}
                </div>
            </div>
        </div>
    }


    useEffect(() => {

        document.title = "Manager Dashboard"

        dispatch(operationalConfigMasterActions.getAllActive())

        setMainData({ loading: true, data: null, error: null });

        Axios.get(process.env.REACT_APP_API_URL + "dashboard/manager/" /* + authState?.user?.id */).then(res => {
            if (res.data.status) {
                setMainData({
                    loading: false,
                    data: res.data.data,
                });

            } else {
                setMainData({
                    loading: false,
                    error: errorMessageFormatter(res.data.data),
                });
            }
        }).catch((err) =>
            setMainData({ loading: false, error: err?.message })
        );

    }, [])

    const days = useMemo(() => {

        if (operationalConfigMasterState?.entities && operationalConfigMasterState.entities.length > 0) {
            return operationalConfigMasterState.entities[0]['projectDueInDays']
        }

        return ''

    }, [operationalConfigMasterState])

    
    return (
        <div className="rounded p-3" style={{ backgroundColor: "#fff" }}>
            {mainData?.error ? <div style={{ color: 'red' }}> {mainData.error} </div> : <>
                <div className="container-fluid">
                    <div className="row dashBoardCon">
                        {getCard("Projects Allocated to Me",
                            <Link to={{
                                pathname: "/project",
                                search: '?dashboard=manager&filter=projects-allocated',
                                // query: { dashboard: 'manager', filter: "projects-allocated" }
                            }} rel="noopener noreferrer" >{mainData?.data?.projectsAllocated ?? 0}
                            </Link>
                        )}
                        {getCard("Projects Expiry in " + days + " Days",
                            <Link to={{
                                pathname: "/project",
                                search: '?dashboard=manager&filter=project-expiry',
                                // query: { dashboard: 'manager', filter: "project-expiry" }
                            }} rel="noopener noreferrer" >{mainData?.data?.projectExpiry ?? 0}
                            </Link>
                        )}
                        {getCard("Pending Pay In Tickets",
                            <Link to={{
                                pathname: "/reports/pay-in",
                                // query: { filter:"pending-payin-tickets"}
                                search: '?filter=pending-payin-tickets'
                            }} rel="noopener noreferrer" >{mainData?.data?.pendingPayInTasks ?? 0}
                            </Link>
                        )}
                        {getCard("Pending Pay Out Tickets",
                            <Link to={{
                                pathname: "/reports/pay-out",
                                // query: { filter:"pending-payout-tickets"}
                                search: '?filter=pending-payout-tickets'
                            }} rel="noopener noreferrer" >{mainData?.data?.pendingPayOutTasks ?? 0}
                            </Link>
                        )}
                        <div className="col pl-15">
                            {moduleMasterState?.entities?.filter(x => x.moduleCode === "PROJECT")?.length > 0 ?
                                <div className="row">
                                    <Link to={{
                                        pathname: "/project/new",
                                    }} rel="noopener noreferrer" >Add Project
                                    </Link>
                                </div> : null}
                            {moduleMasterState?.entities?.filter(x => x.moduleCode === "TASK_CREATION")?.length > 0 ?
                                <div className="row pt-2">
                                    <Link to={{
                                        pathname: "/ticket/new",
                                    }} rel="noopener noreferrer" >Create Ticket
                                    </Link>
                                </div> : null}
                            {moduleMasterState?.entities?.filter(x => x.moduleCode === "PAY_IN_REPORT")?.length > 0 ?
                                <div className="row pt-2">
                                    <Link to={{
                                        pathname: "/reports/pay-in",
                                    }} rel="noopener noreferrer" >Due Pay In Report
                                    </Link>
                                </div> : null}
                            {moduleMasterState?.entities?.filter(x => x.moduleCode === "PAY_OUT_REPORT")?.length > 0 ?
                                <div className="row pt-2">
                                    <Link to={{
                                        pathname: "/reports/pay-out",
                                    }} rel="noopener noreferrer" >Due Pay Out Report
                                    </Link>
                                </div> : null}
                            {moduleMasterState?.entities?.filter(x => x.moduleCode === "SETTLEMENT_REPORT")?.length > 0 ?
                                <div className="row pt-2">
                                    <Link to={{
                                        pathname: "/reports/settlement",
                                    }} rel="noopener noreferrer" >Settlement Report
                                    </Link>
                                </div> : null}
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-md-12 col-lg-12 col-sm-12 col-xl-6 pb-5">
                        <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                            <h6
                                className="card-header text-center p-1"
                                style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                            >
                                Ticket's Monthly Status
                            </h6>
                            <div className="card-body" style={{ textAlign: 'center', padding: '10px' }}>
                                <table
                                    cellPadding="2px"
                                    cellSpacing="2px"
                                    border="1"
                                    style={{
                                        width: "100%",
                                        border: "1px solid #aaa",
                                        padding: "3px",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Month
                                            </th>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Completed
                                            </th>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Paid
                                            </th>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Unpaid
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mainData?.data?.taskPerformedList?.map((x, index) => {
                                            return <tr key={index}>
                                                <td>{x.month}</td>
                                                <td>{x.taskCompleted}</td>
                                                <td>{x.paid}</td>
                                                <td>{x.unpaid}</td>
                                            </tr>
                                        })}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 col-lg-12 col-sm-12 col-xl-6">
                        <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                            <h6
                                className="card-header text-center p-1"
                                style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                            >
                                Ticket Status
                            </h6>
                            <div className="card-body" style={{ textAlign: 'center', padding: '10px' }}>
                                <table
                                    cellPadding="2px"
                                    cellSpacing="2px"
                                    border="1"
                                    style={{
                                        width: "100%",
                                        border: "1px solid #aaa",
                                        padding: "3px",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Status
                                            </th>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Count
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mainData?.data?.taskStatus?.map((x, index) => {
                                            return <tr key={index}>
                                                <td>{x.statusName}</td>
                                                <td>
                                                    <Link to={{
                                                        pathname: "/ticket",
                                                        search: `?dashboard=manager&status=${x.id}`,
                                                        // query: { dashboard: 'manager', statusId: x.id }
                                                    }} rel="noopener noreferrer" >
                                                        {x.count}
                                                    </Link>
                                                </td>
                                            </tr>
                                        })}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="row mt-4">
                    <div className="col-md-12 col-lg-12 col-sm-12 col-xl-6 pb-5">
                        <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                            <h6
                                className="card-header text-center p-1"
                                style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                            >
                                Customer Ticket Summary
                            </h6>
                            <div className="card-body" style={{ textAlign: 'center', padding: '10px' }}>
                                <table
                                    cellPadding="2px"
                                    cellSpacing="2px"
                                    border="1"
                                    style={{
                                        width: "100%",
                                        border: "1px solid #aaa",
                                        padding: "3px",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Customer
                                            </th>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Open
                                            </th>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Close
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mainData?.data?.customerTaskSummary?.map((x, index) => {
                                            return <tr key={index}>
                                                <td>{x.customerName}</td>
                                                <td>{x.open}</td>
                                                <td>{x.close}</td>
                                            </tr>
                                        })}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-12 col-lg-12 col-sm-12 col-xl-6">
                        <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                            <h6
                                className="card-header text-center p-1"
                                style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                            >
                                Tech Ticket Summary
                            </h6>
                            <div className="card-body" style={{ textAlign: 'center', padding: '10px' }}>
                                <table
                                    cellPadding="2px"
                                    cellSpacing="2px"
                                    border="1"
                                    style={{
                                        width: "100%",
                                        border: "1px solid #aaa",
                                        padding: "3px",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Tech
                                            </th>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Open
                                            </th>
                                            <th style={{ borderColor: "#aaa" }}>
                                                Close
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mainData?.data?.techTaskSummary?.map((x, index) => {
                                            return <tr key={index}>
                                                <td>{x.techName}</td>
                                                <td>{x.openCount}</td>
                                                <td>{x.closeCount}</td>
                                            </tr>
                                        })}

                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

            </>}
        </div>
    )

}

export default ProjectManagerDashboard;