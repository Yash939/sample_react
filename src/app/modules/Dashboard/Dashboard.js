import React, { useEffect } from 'react';
import ApexCharts from "apexcharts";
import BootstrapTable from 'react-bootstrap-table-next';
import { Field, Formik } from 'formik';
import { Form } from 'react-bootstrap';
import { AutoCompleteMultiSelect } from '../../../_metronic/_partials/controls/forms/AutoCompleteMultiSelect';
import { useDispatch, useSelector } from 'react-redux';
// import { outletMasterActions } from '../Masters/OutletStore/OutletMaster/_redux/OutletMasterRedux';
import { DatePickerField } from '../../../_metronic/_partials/controls/forms/DatePickerField';
const HeaderCounters = (props) => {
    const dispatch = useDispatch()

    const outletMasterState = useSelector(state => state.outletMaster)

    const headerCounter_thStyle = {
        border: "3px solid #fff",
        width: "20%"
    }
    const headerCounter_tdStyle = {
        border: "3px solid #fff",
        height: "80px"
    }
    useEffect(() => {
        // dispatch(outletMasterActions.getAll())


        const allCharts = [
            {
                element: document.getElementById("order_dollar_pie_chart"),
                options: {
                    chart: {
                        type: 'pie'
                    },
                    series: [44, 55, 13, 33],
                    labels: ['Deliveroo D', 'PU', 'Del', 'Uber PU']
                }
            },
            {
                element: document.getElementById("order_c_pie_chart"),
                options: {
                    chart: {
                        type: 'pie'
                    },
                    series: [45, 10, 60, 40],
                    labels: ['Deliveroo D', 'PU', 'Del', 'Uber PU']
                }
            },
            {
                element: document.getElementById("orders_line_chart"),
                options: {
                    chart: {
                        type: 'line',
                    },
                    series: [
                        {
                            name: "TW",
                            data: [0, 5, 7, 4, 6, 10, 2, 1, 6, 8]
                        },
                        {
                            name: "LW",
                            data: [0, 6, 5, 6, 8, 9, 10, 4, 2, 3]
                        },
                    ],
                    yaxis: [
                        {
                            axisTicks: {
                                show: true
                            },
                            title: {
                                text: "Orders",
                            }
                        },
                    ]
                }
            },
            {
                element: document.getElementById("top_5_product_chart"),
                options: {
                    chart: {
                        type: 'bar',
                    },
                    series: [{
                        data: [23, 34, 12, 54, 20],
                        name: 'Selling',
                    }],
                    xaxis: {
                        categories: ["Product 1", "Product 2", "Product 3", "Product 4", "Product 5"],
                        title: {
                            text: 'Products'
                        }
                    },
                    yaxis: {
                        title: {
                            text: 'Selling'
                        }
                    },
                    fill: {
                        opacity: .9,
                        colors: ["#5cb85c"]
                    },
                }
            },
            {
                element: document.getElementById("bottom_5_product_chart"),
                options: {
                    chart: {
                        type: 'bar',
                    },
                    series: [{
                        data: [8, 3, 4, 1, 10],
                        name: 'Selling',
                    }],
                    xaxis: {
                        categories: ["Product 6", "Product 7", "Product 8", "Product 9", "Product 10"],
                        title: {
                            text: 'Products'
                        }
                    },
                    yaxis: {
                        title: {
                            text: 'Selling'
                        }
                    },
                    fill: {
                        opacity: .9,
                        colors: ["#d9534f"]
                    },
                }
            },
        ]
        const charts = allCharts.filter(x => x.element).map(x => new ApexCharts(x.element, x.options))
        charts.forEach(chart => chart.render())
        return function cleanUp() {
            charts.forEach(chart => chart.destroy())
        };
    }, []);

    return (
        <div className="rounded p-3" style={{ backgroundColor: "#fff" }}>

            <Formik
                enableReinitialize={false}
                initialValues={{
                    slectedOutlets: null,
                    date: new Date()
                }}
                onSubmit={(values) => {

                }}
            >
                {
                    ({ handleSubmit, handleReset, values }) => (
                        <Form className="form form-label-right">
                            <div className="form-group row">
                                {console.log(values)}
                                <div className="col-4 offset-2">
                                    <Field
                                        name="slectedOutlets"
                                        label="Outlets"
                                        placeholder="Select outlets"
                                        component={AutoCompleteMultiSelect}
                                        customOptions={{
                                            records: outletMasterState.entities,
                                            labelField: "outletName",
                                            valueField: "outletMSTId",
                                        }}
                                        isLoading={outletMasterState.listLoading}
                                        loadingMessage="Fetching records..."
                                        isrequired
                                    />
                                </div>
                                <div className="col-2">
                                    <Field
                                        name="date"
                                        label="Date"
                                        component={DatePickerField}
                                    />
                                </div>
                                <div className="col-2">
                                    <br /><br />
                                    <button className="btn pinaple-yellow-btn" type="submit" onSubmit={handleSubmit}>
                                        <i className="fa fa-database" style={{ color: "#666" }}></i>
                                        Get Data
                                    </button>
                                </div>
                            </div>
                        </Form>
                    )
                }
            </Formik>

            {/* header counter */}
            <div className="row" style={{ display: 'none' }}>
                <div className="col-12">
                    <table width="100%" style={{ textAlign: 'center' }} cellSpacing="5px">
                        <thead className="pinaple-yellow text-dark p-3" style={{ fontSize: "12pt" }}>
                            <tr>
                                <td style={headerCounter_thStyle}>Total Active Outlets</td>
                                <td style={headerCounter_thStyle}>Open Orders</td>
                                <td style={headerCounter_thStyle}>Open Receipts</td>
                                <td style={headerCounter_thStyle}>Total Sales</td>
                                <td style={headerCounter_thStyle}>Total Discount</td>
                            </tr>
                        </thead>
                        <tbody className="bg-light-warning text-warning p-3" style={{ fontSize: "25pt" }}>
                            <tr>
                                <td style={headerCounter_tdStyle}>4</td>
                                <td style={headerCounter_tdStyle}>10</td>
                                <td style={headerCounter_tdStyle}>2</td>
                                <td style={headerCounter_tdStyle}>40000</td>
                                <td style={headerCounter_tdStyle}>1200</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sales Tables */}
            <div className="row">
                <div className="col-12">
                    <h4 className="pinaple-black text-light text-center p-1">Sales</h4>
                </div>
            </div>
            <div className="row">
                <div className="col-6">
                    <BootstrapTable
                        condensed
                        keyField="id"
                        headerClasses="pinaple-yellow text-dark"
                        rowClasses="bg-light-warning"
                        classes="table-sm"
                        columns={[
                            {
                                text: "",
                                dataField: "label",
                                style: { width: "31%" },
                            },
                            {
                                text: 'Today',
                                dataField: 'today',
                                style: { width: "23%" },
                                classes: 'text-right',
                                headerClasses: 'text-right'
                            },
                            {
                                text: 'Last Week(SD)',
                                dataField: 'lastWeek',
                                style: { width: "23%" },
                                classes: 'text-right',
                                headerClasses: 'text-right'
                            },
                            {
                                text: 'Last Year',
                                dataField: 'lastYear',
                                style: { width: "23%" },
                                classes: 'text-right',
                                headerClasses: 'text-right'
                            },
                        ]}
                        data={[
                            { id: 1, label: "Sales (NET) $", today: 280, lastWeek: 980, lastYear: 0 },
                            { id: 2, label: "Orders $", today: 10, lastWeek: 33, lastYear: 0 },
                            { id: 3, label: "ATV $", today: 28, lastWeek: 39, lastYear: 0 },
                            { id: 4, label: "Food Theo %", today: 50, lastWeek: 35, lastYear: 0 },
                            { id: 5, label: "Food Actual %", today: 36, lastWeek: 86, lastYear: 0 }
                        ]}
                    />
                </div>
                <div className="col-6">
                    <BootstrapTable
                        condensed
                        keyField="id"
                        headerClasses="pinaple-yellow text-dark"
                        rowClasses="bg-light-warning"
                        classes="table-sm"
                        columns={[
                            {
                                text: "",
                                dataField: "label",
                                style: { width: "31%" },
                            },
                            {
                                text: 'TY-WTD',
                                dataField: 'tywtd',
                                style: { width: "23%" },
                                classes: 'text-right',
                                headerClasses: 'text-right'
                            },
                            {
                                text: 'LW(WW)',
                                dataField: 'lw',
                                style: { width: "23%" },
                                classes: 'text-right',
                                headerClasses: 'text-right'
                            },
                            {
                                text: 'LY',
                                dataField: 'ly',
                                style: { width: "23%" },
                                classes: 'text-right',
                                headerClasses: 'text-right'
                            },
                        ]}
                        data={[
                            { id: 1, label: "Sales (NET) $", tywtd: 280, lw: 980, ly: 0 },
                            { id: 2, label: "Orders $", tywtd: 10, lw: 33, ly: 0 },
                            { id: 3, label: "ATV $", tywtd: 28, lw: 39, ly: 0 },
                            { id: 4, label: "Food Theo %", tywtd: 50, lw: 35, ly: 0 },
                            { id: 5, label: "Food Actual %", tywtd: 36, lw: 86, ly: 0 }
                        ]}
                    />
                </div>
            </div>
            {/* Services Table */}
            <div className="row mt-10">
                <div className="col-12">
                    <h4 className="pinaple-black text-light text-center p-1">Services</h4>
                </div>
            </div>
            <div className="row">
                <div className="col-6">
                    <BootstrapTable
                        condensed
                        keyField="id"
                        headerClasses="pinaple-yellow text-dark"
                        rowClasses="bg-light-warning"
                        classes="table-sm"
                        columns={[
                            {
                                text: "",
                                dataField: "label",
                                style: { width: "31%" },
                            },
                            {
                                text: 'Today',
                                dataField: 'today',
                                style: { width: "23%" },
                                classes: 'text-left',
                                headerClasses: 'text-left'
                            },
                            {
                                text: 'LW',
                                dataField: 'lw',
                                style: { width: "23%" },
                                classes: 'text-left',
                                headerClasses: 'text-left'
                            },
                            {
                                text: 'LY',
                                dataField: 'ly',
                                style: { width: "23%" },
                                classes: 'text-left',
                                headerClasses: 'text-left'
                            },
                        ]}
                        data={[
                            { id: 1, label: "OTT", today: "01:20", lw: "02:20", ly: "03:30" },
                            { id: 2, label: "Make Time (P&D)", today: "02:05", lw: "03:50", ly: "03:05" },
                            { id: 3, label: "Rack Time (D)", today: "00:30", lw: "01:20", ly: "01:50" },
                            { id: 4, label: "Delivery Time", today: "22.3", lw: "25.3", ly: "35.3" },
                        ]}
                    />
                </div>
                <div className="col-6">
                    <BootstrapTable
                        condensed
                        keyField="id"
                        headerClasses="pinaple-yellow text-dark"
                        rowClasses="bg-light-warning"
                        classes="table-sm"
                        columns={[
                            {
                                text: "",
                                dataField: "label",
                                style: { width: "31%" },
                            },
                            {
                                text: 'TY-WTD',
                                dataField: 'today',
                                style: { width: "23%" },
                                classes: 'text-left',
                                headerClasses: 'text-left'
                            },
                            {
                                text: 'LW (WW)',
                                dataField: 'lw',
                                style: { width: "23%" },
                                classes: 'text-left',
                                headerClasses: 'text-left'
                            },
                            {
                                text: 'LY',
                                dataField: 'ly',
                                style: { width: "23%" },
                                classes: 'text-left',
                                headerClasses: 'text-left'
                            },
                        ]}
                        data={[
                            { id: 1, label: "OTT", today: "01:20", lw: "02:20", ly: "03:30" },
                            { id: 2, label: "Make Time (P&D)", today: "02:05", lw: "03:50", ly: "03:05" },
                            { id: 3, label: "Rack Time (D)", today: "00:30", lw: "01:20", ly: "01:50" },
                            { id: 4, label: "Delivery Time", today: "22.3", lw: "25.3", ly: "35.3" },
                        ]}
                    />
                </div>
            </div>


            {/* Order Charts */}
            <div className="row mt-10">
                <div className="col-12">
                    <h4 className="pinaple-black text-light text-center p-1">Order</h4>
                </div>
            </div>
            <div className="row no-gutters">
                <div className="col-4">
                    <div className="card-rounded bg-light-warning" style={{ border: "4px solid #fff" }}>
                        <div className="pinaple-yellow text-center text-dark p-1" style={{ fontSize: "12pt" }}>Order ($)</div>
                        <div id="order_dollar_pie_chart"></div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="card-rounded bg-light-warning" style={{ border: "4px solid #fff" }}>
                        <div className="pinaple-yellow text-center text-dark p-1" style={{ fontSize: "12pt" }}>Order (C)</div>
                        <div id="order_c_pie_chart"></div>
                    </div>
                </div>
                <div className="col-4">
                    <div className="card-rounded bg-light-warning" style={{ border: "4px solid #fff" }}>
                        <div className="pinaple-yellow text-center text-dark p-1" style={{ fontSize: "12pt" }}>Orders</div>
                        <div id="orders_line_chart"></div>
                    </div>
                </div>
            </div>
            {/* Product Charts */}

            <div className="row mt-10">
                <div className="col-12">
                    <h4 className="pinaple-black text-light text-center p-1">Product</h4>
                </div>
            </div>
            <div className="row no-gutters">
                <div className="col-6">
                    <div className="card-rounded bg-light-warning" style={{ border: "4px solid #fff" }}>
                        <div className="pinaple-yellow text-center text-dark p-1" style={{ fontSize: "12pt" }}>Top 5 Products</div>
                        <div id="top_5_product_chart"></div>
                    </div>
                </div>
                <div className="col-6">
                    <div className="card-rounded bg-light-warning" style={{ border: "4px solid #fff" }}>
                        <div className="pinaple-yellow text-center text-dark p-1" style={{ fontSize: "12pt" }}>Bottom 5 Products</div>
                        <div id="bottom_5_product_chart"></div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default HeaderCounters;  