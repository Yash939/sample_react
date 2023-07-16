import React, { useEffect, useMemo, useState } from 'react'
import ApexCharts from "apexcharts";
import { Link, useHistory } from 'react-router-dom'
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';
import { errorMessageFormatter } from '../_commons/Utils';
import { operationalConfigMasterActions } from '../Masters/OperationalConfig/_redux/OperationalConfigRedux';

const ProjectCoordinatorDashboard = () => {

    const dispatch = useDispatch()
    let history = useHistory();

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

        return <div className="col-md-3 col-lg-3 col-sm-6 col-xl-2 pb-5">
            <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                <h6
                    className="card-header text-center p-1"
                    style={{ backgroundColor: "#f4f4f4", color: "#777", whiteSpace: 'nowrap' }}
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

        const element = document.getElementById("task_status_chart")
        const options = {
            chart: {
                type: "bar",
                height: 250
            },
            series: [
                {
                    data: mainData?.data?.taskStatus ? mainData?.data?.taskStatus?.map(x => x.count) : [],
                    name: "Count",
                },
            ],
            xaxis: {
                categories: mainData?.data?.taskStatus ? mainData.data.taskStatus.map(x => x.statusName) : [] //?? {},
            },
            yaxis: {
                title: {
                    text: "Count",
                },
            },
        }

        const chart = new ApexCharts(element, options)
        chart.render()
        return function cleanUp() {
            chart.destroy()
        };
    }, [mainData])

    useEffect(() => {

        document.title = "Coordinator Dashboard"

        dispatch(operationalConfigMasterActions.getAllActive())

        setMainData({ loading: true, data: null, error: null });
        Axios.get(process.env.REACT_APP_API_URL + "dashboard/coordinator/" /* + authState?.user?.id */).then(res => {
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
            return operationalConfigMasterState.entities[0]['dueInDays']
        }

        return ''

    }, [operationalConfigMasterState])

    return (
        <div className="rounded p-3" style={{ backgroundColor: "#fff" }}>
            <div className="row">
                {getCard("Running Tickets",
                    <Link to={{
                        pathname: "/ticket",
                        search: '?dashboard=coordinator&filter=running-tasks',
                    }} rel="noopener noreferrer"
                        style={{ color: "#0ac70a" }}
                    >{mainData?.data?.runningTasks ?? 0}
                    </Link>
                )}
                {getCard("Today's Tickets",
                    <Link to={{
                        pathname: "/ticket",
                        search: '?dashboard=coordinator&filter=todays-task',
                    }} rel="noopener noreferrer"
                        style={{ color: "#0ac70a" }}
                    >{mainData?.data?.todaysTasks ?? 0}
                    </Link>
                )}
                {getCard("Tomorrow's Tickets",
                    <Link to={{
                        pathname: "/ticket",
                        search: '?dashboard=coordinator&filter=tomorrows-task',
                    }} rel="noopener noreferrer"
                        style={{ color: "#0ac70a" }}
                    >{mainData?.data?.tomorrowsTasks ?? 0}
                    </Link>
                )}
                {/* {getCard("My Tickets",
                    <Link to={{
                        pathname: "/ticket?dashboard=coordinator&filter=my-tasks",
                    }} rel="noopener noreferrer" >{mainData?.data?.myTasks ?? 0}
                    </Link>
                )} */}
                {getCard("Due in " + days + " Days",
                    <Link to={{
                        pathname: "/ticket",
                        search: '?dashboard=coordinator&filter=due-tasks',
                    }} rel="noopener noreferrer" >{mainData?.data?.dueTasks ?? 0}
                    </Link>
                )}
                {getCard("Over Due Tickets",
                    <Link to={{
                        pathname: "/ticket",
                        search: '?dashboard=coordinator&filter=overdue-tasks',
                    }} rel="noopener noreferrer"
                        style={{ color: "red" }}>
                        {mainData?.data?.overDueTasks ?? 0}
                    </Link>
                )}
                <div className="col-md-3 col-lg-3 col-sm-6 col-xl-2 pb-5 pl-10">
                    {moduleMasterState?.entities?.filter(x => x.moduleCode === "TASK_CREATION")?.length > 0 ?
                        <div className="row">
                            <Link to={{
                                pathname: "/ticket/new",
                            }} rel="noopener noreferrer" >Create Ticket
                            </Link>
                        </div> : null}
                    {moduleMasterState?.entities?.filter(x => x.moduleCode === "ENGINEER_MASTER")?.length > 0 ?
                        <div className="row pt-2">
                            <Link to={{
                                pathname: "/engineer/new",
                            }} rel="noopener noreferrer" >Add Engineer
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

            <div className="row mt-4">
                <div className="col-md-12 col-lg-12 col-sm-12 col-xl-4 pb-5">
                    <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                        <h6
                            className="card-header text-center p-1"
                            style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                        >
                            Ticket Status Table
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
                                                    search: `?dashboard=coordinator&status=${x.id}`,
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
                <div className="col-md-12 col-lg-12 col-sm-12 col-xl-8">
                    <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                        <h6
                            className="card-header text-center p-1"
                            style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                        >
                            Ticket Status Chart
                        </h6>
                        <div className="card-body" style={{ textAlign: 'center' }}>
                            <div id="task_status_chart"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default ProjectCoordinatorDashboard;