import React, { useEffect, useMemo, useState } from 'react'
import ApexCharts from "apexcharts";
import { Link } from 'react-router-dom'
import { shallowEqual, useDispatch, useSelector } from 'react-redux';
import Axios from 'axios';
import { errorMessageFormatter } from '../_commons/Utils';
import { operationalConfigMasterActions } from '../Masters/OperationalConfig/_redux/OperationalConfigRedux';

const TechDashboard = () => {

    const dispatch = useDispatch()

    const { authState, operationalConfigMasterState } = useSelector(state => ({
        authState: state.auth,
        operationalConfigMasterState: state.operationalConfigMaster
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
                    style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                >
                    {headerName}
                </h6>
                <div /* className="card-body" */ style={{ textAlign: 'center', fontSize:'xxx-large' }}>
                    {content}
                </div>
            </div>
        </div>
    }

    useEffect(() => {

        const allCharts = [
            {
                element: document.getElementById("task_completed_chart"),
                options: {
                    chart: {
                        type: "bar",
                    },
                    series: [
                        {
                            data: mainData?.data?.taskPerformedList?.map(x => x.taskCompleted) ?? [],
                            name: "Count",
                        },
                    ],
                    xaxis: {
                        categories: mainData?.data?.taskPerformedList?.map(x => x.month) ?? []
                    },
                    yaxis: {
                        title: {
                            text: "Count",
                        },
                    },
                }
            },
            {
                element: document.getElementById("task_payment_status_chart"),
                options: {
                    chart: {
                        type: "bar",
                    },
                    series: [
                        {
                            data: mainData?.data?.taskPerformedList?.map(x => x.paid) ?? [],
                            name: "Paid",
                        },
                        {
                            data: mainData?.data?.taskPerformedList?.map(x => x.unpaid) ?? [],
                            name: "Un Paid",
                        },
                    ],
                    xaxis: {
                        categories: mainData?.data?.taskPerformedList?.map(x => x.month) ?? []
                    },
                    yaxis: {
                        title: {
                            text: "Count",
                        },
                    },
                }
            },
           
        ]
        const charts = allCharts.filter(x => x.element).map(x => new ApexCharts(x.element, x.options))
        charts.forEach(chart => chart.render())
        return function cleanUp() {
            charts.forEach(chart => chart.destroy())
        };

    }, [mainData])

    useEffect(() => {

        dispatch(operationalConfigMasterActions.getAllActive())

        setMainData({ loading: true, data: null, error: null });
        Axios.get(process.env.REACT_APP_API_URL + "dashboard/tech/"/*  + authState?.user?.id */).then(res => {
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

        if(operationalConfigMasterState?.entities && operationalConfigMasterState.entities.length > 0) {
            return operationalConfigMasterState.entities[0]['dueInDays']
        }

        return ''

    }, [operationalConfigMasterState])


    return (
        <div className="rounded p-3" style={{ backgroundColor: "#fff" }}>
            <div className="row">
                {getCard("Running Tasks",
                    <Link to={{
                        pathname: "/ticket",
                        query: { dashboard: 'tech' ,filter:"running-tasks"}
                    }} rel="noopener noreferrer" >{mainData?.data?.runningTasks ?? 0}
                    </Link>
                )}
                {getCard("Today's Tasks",
                    <Link to={{
                        pathname: "/ticket",
                        query: { dashboard: 'tech' ,filter:"todays-task"}
                    }} rel="noopener noreferrer" >{mainData?.data?.todaysTasks ?? 0}
                    </Link>
                )}
                {getCard("Tomorrow's Tasks",
                    <Link to={{
                        pathname: "/ticket",
                        query: { dashboard: 'tech' ,filter:"tomorrows-tasks"}
                    }} rel="noopener noreferrer" >{mainData?.data?.tomorrowsTasks ?? 0}
                    </Link>
                )}
                {getCard("My Tasks",
                    <Link to={{
                        pathname: "/ticket",
                        query: { dashboard: 'tech' ,filter:"my-tasks"}
                    }} rel="noopener noreferrer" >{mainData?.data?.myTasks ?? 0}
                    </Link>
                )}
                {getCard("Due in "+days+" Days",
                    <Link to={{
                        pathname: "/ticket",
                        query: { dashboard: 'tech' ,filter:"due-tasks"}
                    }} rel="noopener noreferrer" >{mainData?.data?.dueTasks ?? 0}
                    </Link>
                )}
                {getCard("Over Due Tasks",
                    <Link to={{
                        pathname: "/ticket",
                        query: { dashboard: 'tech' ,filter:"overdue-tasks"}
                    }} rel="noopener noreferrer" >{mainData?.data?.overDueTasks ?? 0}
                    </Link>
                )}
            </div>

            <div className="row mt-4">
                <div className="col-md-12 col-lg-12 col-sm-12 col-xl-4 pb-5">
                    <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                        <h6
                            className="card-header text-center p-1"
                            style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                        >
                            Task Performed
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
                                            Task Completed
                                        </th>
                                        <th style={{ borderColor: "#aaa" }}>
                                            Paid
                                        </th>
                                        <th style={{ borderColor: "#aaa" }}>
                                            Un Paid
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
                <div className="col-md-12 col-lg-12 col-sm-12 col-xl-8">

                    <div className="row">
                        <div className="col-12 col-md-6">
                            <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                                <h6
                                    className="card-header text-center p-1"
                                    style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                                >
                                    Task Completed
                                </h6>
                                <div className="card-body" style={{ textAlign: 'center' }}>
                                    <div id="task_completed_chart"></div>
                                </div>
                            </div>

                        </div>
                        <div className="col-12 col-md-6">
                            <div className="card" style={{ boxShadow: "0px 0px 2px #555" }}>
                                <h6
                                    className="card-header text-center p-1"
                                    style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                                >
                                    Task Payment Status
                                </h6>
                                <div className="card-body" style={{ textAlign: 'center' }}>
                                    <div id="task_payment_status_chart"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

}

export default TechDashboard;