import { Field, Formik } from "formik";
import React, { useEffect, useMemo, useState, useRef } from "react";
import { Form, Spinner } from "react-bootstrap";
import { sortCaret, toAbsoluteUrl } from "../../../_metronic/_helpers";
import {
  AutoCompleteSelect,
  Card,
  CardBody,
  CardHeader,
  CardHeaderToolbar,
} from "../../../_metronic/_partials/controls";
import SVG from "react-inlinesvg";
import BootstrapTable from "react-bootstrap-table-next";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { reportsActions } from "./_redux/ReportsRedux";
import { Link, useLocation } from "react-router-dom";
import { exportToCsv, searchInArray } from "../_commons/Utils";
import * as Yup from "yup";
import cellEditFactory from "react-bootstrap-table2-editor";
import { currencyMasterActions } from "../Masters/CurrencyMaster/_redux/CurrencyMasterRedux";
import moment from "moment";
import { AntdDatePickerField } from "../../../_metronic/_partials/controls/forms/AntdDatePickerField";
import ToolkitProvider from "react-bootstrap-table2-toolkit";

const headerButtonStyles = {
  minWidth: "85px",
  whiteSpace: "nowrap",
};

const PayInReport = () => {
  const [searchText, setSearchText] = useState("");
  const [parentValues, setParentValues] = useState({});
  const [filterData, setFilterData] = useState([]);
  const [screenSize, setScreenSize] = useState(false);
  const [filterDataError, setFilterDataError] = useState("");
  const [modifiedTickets, setModifiedTickets] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const dispatch = useDispatch();
  const location = useLocation();
  const ref = useRef();

  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };

  let filter = useQuery().get("filter");

  // let filter = location?.query?.filter

  const {
    actionLoading,
    listLoading,
    error,
    entities,
    loadingMessage,
    currencyMasterState /* authState */,
  } = useSelector(
    (state) => ({
      actionLoading: state.reports.actionLoading,
      listLoading: state.reports.listLoading,
      error: state.reports.error,
      entities: state.reports.entities,
      loadingMessage: state.reports.loadingMessage,
      currencyMasterState: state.currencyMaster,
      // authState: state.auth
    }),
    shallowEqual
  );

  const convertDate = (date) => {
    if (date) {
      let dt = moment(date).format("DD-MMM-YYYY HH:mm");
      // console.log("DATE IS ::::-------------------",dt)
      return dt;
    }
  };

  const cols = [
    {
      dataField: "customerName",
      text: "Customer",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "projectName",
      text: "Project",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "projectBranchName",
      text: "Project Branch",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "taskCode",
      text: "Ticket Code",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell, row) => {
        return (
          <Link
            to={{
              pathname: `/ticket/${row.taskId}/edit/readonly`,
            }}
            rel="noopener noreferrer"
          >
            <label style={{ cursor: "pointer" }}> {row.taskCode}</label>
          </Link>
        );
      },
    },
    {
      dataField: "statusName",
      text: "Status",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "techCode",
      text: "Tech Code",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "techName",
      text: "Tech Name",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "pocName",
      text: "POC",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },

    {
      dataField: "endCustomer",
      text: "End Customer",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "customerRefNumber1",
      text: "Customer REF Ticket-1",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "customerRefNumber2",
      text: "Customer REF Ticket-2",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "cityName",
      text: "City",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "countryName",
      text: "Country",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },

    {
      dataField: "planDateTime",
      text: "Plan Date - Time",
      sort: true,
      sortCaret: sortCaret,
      formatter: (cell) => convertDate(cell),
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "startDateTime",
      text: "Engineer Start Time",
      sort: true,
      sortCaret: sortCaret,
      formatter: (cell) => convertDate(cell),
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "endDateTime",
      text: "Engineer End Time",
      sort: true,
      sortCaret: sortCaret,
      formatter: (cell) => convertDate(cell),
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "customerStartDateTime",
      text: "Customer Start Time",
      sort: true,
      sortCaret: sortCaret,
      formatter: (cell) => convertDate(cell),
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "customerEndDateTime",
      text: "Customer End Time",
      sort: true,
      sortCaret: sortCaret,
      formatter: (cell) => convertDate(cell),
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "rbh",
      text: "RBH",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "rbhMin",
      text: "RBH Min",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "rbhRate",
      text: "RBH Rate",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "fullDayRates",
      text: "Full Day Rates",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "minHours",
      text: "Min Hours",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => cell / 60,
      exportFormatter: (cell) => cell / 60,
    },
    {
      dataField: "obh",
      text: "OBH",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "obhMin",
      text: "OBH Min",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "obhRate",
      text: "Flat Rate",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "abhRate",
      text: "Uplift of",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "abh",
      text: "Weekend OBH",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "abhMin",
      text: "Weekend OBH Min",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "weekendFlatRate",
      text: "Weekend Flat Rate",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "weekendMultiplierRate",
      text: "Weekend Uplift Of",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "travel",
      text: "Travel",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "material",
      text: "Material",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "parking",
      text: "Parking",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "other",
      text: "Other",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "receivableValue",
      text: "Receivable Value",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => (cell ? cell.toFixed(2) : "0.00"),
      exportFormatter: (cell) => (cell ? cell.toFixed(2) : "0.00"),
    },
    {
      dataField: "receivableCurrency",
      text: "Payin Currency",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "payInPaidCurrencyId",
      text: "Received Currency",
      sort: true,
      sortCaret: sortCaret,
      // headerStyle: { whiteSpace: 'nowrap' }
      headerStyle: screenSize
        ? headerButtonStyles
        : {
            whiteSpace: "nowrap",
            position: "sticky",
            right: "225px",
            backgroundColor: "white",
            minWidth: "150px",
            maxWidth: "150px",
          },
      style: screenSize
        ? {}
        : {
            position: "sticky",
            right: "225px",
            backgroundColor: "white",
            minWidth: "150px",
            maxWidth: "150px",
          },
      editor: {
        type: "select",
        getOptions: () => {
          return currencyMasterState?.entities?.map((x) => ({
            value: x.id,
            label: x.currencyName,
          }));
        },
      },
      editorClasses: "form-control-sm",
      // formatter: (cell) => {
      //   if (cell) {
      //     return currencyMasterState?.entities?.filter(
      //       (x) => x.id.toString() === cell.toString()
      //     )?.[0]?.currencyName;
      //   }
      //   return currencyMasterState?.entities?.filter(
      //     (x) => x.id.toString() === cell.toString()
      //   )?.[0]?.currencyName;
      // },
      formatter: (cell) =>
        cell ? (
          currencyMasterState?.entities?.filter(
            (x) => x.id.toString() === cell.toString()
          )?.[0]?.currencyName
        ) : (
          <select
            className="form-control-sm"
            style={{
              position: "sticky",
              right: "90px",
              backgroundColor: "white",
              minWidth: "120px",
              maxWidth: "120px",
            }}
          />
        ),
      exportFormatter: (cell) => {
        if (cell) {
          return currencyMasterState?.entities?.filter(
            (x) => x.id.toString() === cell.toString()
          )?.[0]?.currencyName;
        }
        return "";
      },
      // hidden: authState?.user?.organizationMST?.organizationType === "SELF" || authState?.roleCode === "admin" ? false : true
    },
    {
      dataField: "payInPaidValue",
      text: "Received Value",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: screenSize
        ? headerButtonStyles
        : {
            whiteSpace: "nowrap",
            position: "sticky",
            right: "90px",
            backgroundColor: "white",
            minWidth: "135px",
            maxWidth: "135px",
          },
      style: screenSize
        ? {}
        : {
            position: "sticky",
            right: "90px",
            backgroundColor: "white",
            minWidth: "135px",
            maxWidth: "135px",
          },
      editor: {
        type: "text",
      },
      editorClasses: "form-control-sm",
      formatter: (cell) =>
        cell ? (
          isNaN(parseFloat(cell)) ? (
            cell
          ) : (
            parseFloat(cell).toFixed(2)
          )
        ) : (
          <input
            type="text"
            className="form-control-sm"
            style={{
              position: "sticky",
              right: "90px",
              backgroundColor: "white",
              minWidth: "120px",
              maxWidth: "120px",
            }}
          />
        ),
      exportFormatter: (cell) =>
        cell
          ? isNaN(parseFloat(cell))
            ? cell
            : parseFloat(cell).toFixed(2)
          : "",
      // hidden: authState?.user?.organizationMST?.organizationType === "SELF" || authState?.roleCode === "admin" ? false : true
    },
  ];

  const [filterColData, setFilterColData] = useState(cols);
  const [colData, setColData] = useState(cols);
  const [sytle, setSytle] = useState(false);

  useEffect(() => {
    if (currencyMasterState) {
      setFilterColData(cols);
    }
  }, [currencyMasterState]);

  useEffect(() => {
    if (window.innerWidth < 550) {
      setScreenSize(true);
    }
  }, []);

  useEffect(() => {
    if (error) {
      if (
        error?.error?.message === "Ticket Modified by Someone. Please Refresh"
      ) {
        let tmpError = error?.error?.data;
        let ticket = [];
        if (tmpError?.length) {
          tmpError.map((dl) => {
            if (dl.ticketId) {
              ticket.push(dl);
            }
          });
          if (ticket?.length) {
            setModifiedTickets(ticket);
          } else {
            setModifiedTickets(null);
          }
        }
      }
    }
  }, [error]);

  const initialVals = useMemo(() => {
    let iniVal = {
      fromDate: null,
      toDate: null,
      customerId: null,
      projectId: null,
      statusId: null,
      engineerId: null,
    };

    setParentValues(iniVal);
    return iniVal;
  }, []);

  const actualHoursFormatter = (value) => {
    if (value) {
      let tmpMin = value;
      let tmpHours = Math.floor(value / 60);
      let tmpMins = tmpMin % 60;
      tmpMins = tmpMins === 0 ? "00" : tmpMins;
      tmpHours = tmpHours < 10 ? "0" + tmpHours : tmpHours;
      return tmpHours + ":" + String("0" + tmpMins).slice(-2);
    }
    return "00:00";
  };

  useEffect(() => {
    document.title = "Due Pay In Report";
    dispatch(currencyMasterActions.getAllActive());
    dispatch(reportsActions.reIniState());
  }, []);

  useEffect(() => {
    setSelectedRows([]);
  }, [entities]);

  const rows = useMemo(() => {
    if (!Array.isArray(entities)) return [];
    try {
      let rTmp =
        entities?.map((x, i) => ({
          ...x,
          keyField: i,
          payInPaidValue: "",
          payInPaidCurrencyId: "",
          settlement: false,
          planDateTime: moment
            .tz(x.planDateTime, "utc")
            .add(x.utcOffset ?? 0, "minutes")
            .format("YYYY-MM-DD HH:mm"),
          startDateTime: moment
            .tz(x.startDateTime, "utc")
            .add(x.utcOffset ?? 0, "minutes")
            .format("YYYY-MM-DD HH:mm"),
          endDateTime: moment
            .tz(x.endDateTime, "utc")
            .add(x.utcOffset ?? 0, "minutes")
            .format("YYYY-MM-DD HH:mm"),
          customerStartDateTime: moment
            .tz(x.customerStartDateTime, "utc")
            .add(x.utcOffset ?? 0, "minutes")
            .format("YYYY-MM-DD HH:mm"),
          customerEndDateTime: moment
            .tz(x.customerEndDateTime, "utc")
            .add(x.utcOffset ?? 0, "minutes")
            .format("YYYY-MM-DD HH:mm"),
        })) ?? [];
      // let rTmp = entities ?? []

      let qObj = {};
      if (searchText)
        cols.forEach((col) => {
          qObj[col.dataField] = searchText;
        });
      return searchInArray(rTmp, qObj, []);
    } catch (error) {
      console.log(error);
      return [];
    }
  }, [entities, searchText]);

  const validationSchema = useMemo(() => {
    return Yup.object().shape({
      fromDate: Yup.string()
        .nullable()
        .required("From Date Required"),
      toDate: Yup.string()
        .nullable()
        .required("To Date Required"),
    });
  }, [entities]);

  const bodyClassName = useMemo(() => {
    const date = new Date();
    return (
      "pos-editable-table-body-" +
      date.getHours() +
      date.getMinutes() +
      date.getSeconds() +
      date.getMilliseconds()
    );
  }, []);

  useEffect(() => {
    setFilterDataError("");
    dispatch(reportsActions.getPayInFilterData())
      .then((res) => {
        setFilterData(res);
      })
      .catch((err) => setFilterDataError(err));
  }, []);

  useEffect(() => {
    if (filter === "pending-payin-tickets") {
      document.title = "Pending Pay In Tickets";
      document.getElementById("get-data-button").click();
    }
  }, [filter]);

  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      if (sytle && ref.current && !ref.current.contains(e.target)) {
        setSytle(false);
      }
    };
    document.addEventListener("mousedown", checkIfClickedOutside);
    return () => {
      document.removeEventListener("mousedown", checkIfClickedOutside);
    };
  }, [sytle]);

  const findColumn = (col) => {
    let colFilter = colData.filter((e) => e.dataField !== col.dataField);
    setColData(colFilter);
  };

  const myColumnToggle = (df) => {
    var newTableColumns = filterColData.map((val) => {
      if (val.dataField === df) {
        val.hidden = !val.hidden;
      }
      return val;
    });
    setFilterColData(newTableColumns);
  };

  const CustomToggleList = ({ columns, onColumnToggle, toggles,index }) => (
    <div className="text-center">
      <div style={{ float: "left" }}>
        <div className=" ">
          <div>
            <button
              onClick={() => setSytle(!sytle)}
              style={{ height: "45px", marginTop: "15px", background: "white" }}
              className=" btn-default dropdown-toggle custom-csv"
              data-toggle="dropdown"
            ></button>
          </div>
          <div style={sytle ? { display: "block" } : { display: "none" }}>
            <ul
              key={onColumnToggle.text}
              ref={ref}
              className=""
              style={{
                width: "230px",
                position: "absolute",
                left: "0",
                background: "#F3F6F9",
                textAlign: "left",
                margin: "5px 0px 5px 20px",
                padding: 0,
              }}
            >
              {columns
                .map((column) => ({
                  ...column,
                  toggle: toggles[column.dataField],
                }))
                .map((column, index) => (
                  <React.Fragment>
                    <label
                      style={{ width: "100%", padding: "0px 10px", margin: 0 }}
                    >
                      <input
                        type="checkbox"
                        key={column.dataField}
                        id={column.dataField}
                        checked={column.toggle}
                        aria-checked={column.toggle ? "true" : "false"}
                        onChange={() => [
                          onColumnToggle(column.dataField),
                          findColumn(column),
                        ]}
                      />
                      &nbsp;
                      {column.text}
                    </label>
                  </React.Fragment>
                ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialVals}
      validationSchema={
        filter === "pending-payin-tickets" ? null : validationSchema
      }
      onSubmit={(values) => {
        setParentValues(values);
        if (filter === "pending-payin-tickets") {
          dispatch(
            reportsActions.getData("payInReport/noDates", values, "get")
          );
        } else {
          dispatch(reportsActions.getData("payInReport", values, "post"));
        }
      }}
    >
      {({ handleSubmit, handleReset, setFieldValue, values }) => (
        <Form className="form form-label-right">
          <Card>
            <CardHeader title="Due Pay In Report">
              <CardHeaderToolbar>
                {
                  <>
                    <button
                      type="button"
                      style={headerButtonStyles}
                      className="btn btn-light ml-2"
                      onClick={() => [
                        exportToCsv(
                          [
                            ...colData,
                            {
                              dataField: "settlement",
                              text: "Settlement",
                              editable: false,
                              hidden: true,
                            },
                          ],
                          rows
                        ),
                        console.log(rows),
                      ]}
                    >
                      <i className="fa fa-table" style={{ color: "#777" }}></i>
                      Export CSV
                    </button>

                    <button
                      type="submit"
                      style={headerButtonStyles}
                      className="btn pinaple-yellow-btn ml-2"
                      onClick={(e) => {
                        e.preventDefault();
                        handleSubmit();
                      }}
                      id="get-data-button"
                    >
                      <i
                        className="fa fa-database"
                        style={{ color: "#777" }}
                      ></i>
                      Get Data
                    </button>
                  </>
                }
              </CardHeaderToolbar>
            </CardHeader>
            <CardBody id="summary-report">
              {actionLoading || listLoading ? (
                <div className="text-center">
                  <Spinner animation="grow" variant="warning" /> &nbsp;
                  <Spinner animation="grow" variant="dark" /> &nbsp;
                  <Spinner animation="grow" variant="warning" /> &nbsp;
                  {loadingMessage ? (
                    <>
                      <br />
                      <br />
                      {loadingMessage}
                    </>
                  ) : (
                    ""
                  )}
                </div>
              ) : (
                <div className="text-center text-danger mb-3">
                  {error ? (
                    <div className="text-center text-danger mb-3">
                      Error: {error.userMessage}
                    </div>
                  ) : (
                    ""
                  )}
                  {modifiedTickets ? (
                    <>
                      Modified Tickets :-
                      {modifiedTickets?.map((el) => {
                        return (
                          <Link
                            to={`/ticket/${el.ticketId}/edit`}
                            target="_blank"
                          >
                            <span>{`${el.ticketCode},`}</span>
                          </Link>
                        );
                      })}
                    </>
                  ) : null}
                </div>
              )}
              {
                <div className="text-center text-danger mb-3">
                  {filterDataError ? (
                    <div className="text-center text-danger mb-3">
                      Error: {filterDataError.userMessage}
                    </div>
                  ) : (
                    ""
                  )}
                </div>
              }
              <div
                style={{
                  display: actionLoading || listLoading ? "none" : "initial",
                }}
              >
                <div className="form-group row">
                  {filter === "pending-payin-tickets" ? null : (
                    <>
                      <div className="col-12 col-md-3">
                        <Field
                          name="fromDate"
                          component={AntdDatePickerField}
                          placeholder="DD-MMM-YYYY"
                          label="From Date"
                          isrequired
                          disabledDate={(current) =>
                            current > moment().endOf("day")
                          }
                        />
                      </div>
                      <div className="col-12 col-md-3">
                        <Field
                          name="toDate"
                          component={AntdDatePickerField}
                          placeholder="DD-MMM-YYYY"
                          label="To Date"
                          isrequired
                          disabledDate={(current) =>
                            current > moment().endOf("day")
                          }
                        />
                      </div>
                    </>
                  )}
                  <div className="col-12 col-md-3">
                    <Field
                      name="customerId"
                      component={AutoCompleteSelect}
                      options={
                        values?.customerId
                          ? filterData?.organization
                              ?.filter((x) => x.id === values?.customerId)
                              .map((x) => ({
                                label: x.name,
                                value: x.id,
                              })) ?? []
                          : filterData?.organization?.map((x) => ({
                              label: x.name,  
                              value: x.id,
                            })) ?? []
                      }
                      placeholder="Select Customer"
                      label="Customer"
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <Field
                      name="projectId"
                      component={AutoCompleteSelect}
                      onChange={(e) => {
                        setFieldValue("projectId", e?.value ?? null);
                        if (e?.customerId)
                          setFieldValue("customerId", e?.customerId);
                      }}
                      options={
                        values?.customerId
                          ? filterData?.project
                              ?.filter(
                                (x) => x.customerId === values.customerId
                              )
                              .map((x) => ({
                                label: x.name,
                                value: x.id,
                                customerId: x.customerId,
                              })) ?? []
                          : filterData?.project?.map((x) => ({
                              label: x.name,
                              value: x.id,
                              customerId: x.customerId,
                            })) ?? []
                      }
                      placeholder="Select Project"
                      label="Project"
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <Field
                      name="statusId"
                      component={AutoCompleteSelect}
                      options={
                        filterData?.status?.map((x) => ({
                          label: x.name,
                          value: x.id,
                        })) ?? []
                      }
                      placeholder="Select Status"
                      label="Status"
                    />
                  </div>
                  <div className="col-12 col-md-3">
                    <Field
                      name="engineerId"
                      component={AutoCompleteSelect}
                      options={
                        filterData?.user?.map((x) => ({
                          label: x.name,
                          value: x.id,
                        })) ?? []
                      }
                      placeholder="Select Engineer"
                      label="Engineer"
                    />
                  </div>

                  <div className="col-12 col-md-3">
                    <Field
                      name="reference1"
                      component={AutoCompleteSelect}
                      options={
                        filterData?.reference1?.map((x) => {
                          for (let [k, v] of Object.entries(x)) {
                            return {
                              label: v,
                              value: v,
                            };
                          }
                        }) ?? []
                      }
                      placeholder="Select Reference"
                      label="Reference"
                    />
                  </div>
                </div>

                <hr />

                <Formik
                  enableReinitialize={true}
                  initialValues={rows}
                  // validationSchema={validationSchema}
                  onSubmit={(values) => {
                    // let val = values.filter(x => x.settlement === true)?.map(x => ({
                    //     taskMSTId: x.taskId,
                    //     userMSTId: x.techId,
                    //     payInPayableValue: x.receivableValue,
                    //     payInPayableCurrencyId: x.receivableCurrencyId,
                    //     payInPaidCurrencyId: x.payInPaidCurrencyId,
                    //     payInPaidValue: x.payInPaidValue,
                    //     modifiedOn: x.modifiedOn
                    // }))
                    let val = values
                      .filter((x) => selectedRows.includes(x.keyField))
                      ?.map((x) => ({
                        taskMSTId: x.taskId,
                        userMSTId: x.techId,
                        payInPayableValue: x.receivableValue,
                        payInPayableCurrencyId: x.receivableCurrencyId,
                        payInPaidCurrencyId: x.payInPaidCurrencyId,
                        payInPaidValue: x.payInPaidValue,
                        modifiedOn: x.modifiedOn,
                      }));

                    if (!val || val.length === 0) {
                      window.alert(
                        "Please select atleast 1 ticket to perform Settlement !!!"
                      );
                      return;
                    }

                    let isReturn = false;

                    for (let index = 0; index < val.length; index++) {
                      const x = val[index];
                      if (!x.payInPaidValue) {
                        window.alert("Please Enter Paid Value !!!");
                        return;
                      }
                      if (!x.payInPaidCurrencyId) {
                        window.alert("Please Enter Paid Currency !!!");
                        return;
                      }
                    }

                    if (isReturn) {
                      return;
                    }

                    const myArrayFiltered = values.filter((el) => {
                      return val.some((f) => {
                        return (
                          f.taskMSTId === el.taskId &&
                          !selectedRows.includes(el.keyField)
                        ); //el.settlement === false;
                      });
                    });

                    if (myArrayFiltered && myArrayFiltered.length > 0) {
                      window.alert(
                        "Please Select all the rows of same ticket for Settlement !!!"
                      );
                      return;
                    }

                    dispatch(reportsActions.doSettlement(val))
                      .then((res) => {
                        if (filter === "pending-payin-tickets") {
                          dispatch(
                            reportsActions.getData(
                              "payInReport/noDates",
                              parentValues,
                              "get"
                            )
                          );
                        } else {
                          dispatch(
                            reportsActions.getData(
                              "payInReport",
                              parentValues,
                              "post"
                            )
                          );
                        }
                      })
                      .catch((err) => {
                        console.log(err);
                      });
                  }}
                >
                  {({ handleSubmit, handleReset, setFieldValue, values }) => (
                    <Form className="form form-label-right">
                      <div className="row mb-2">
                        <div className="col-lg-4 col-md-4">
                          <div className="input-group">
                            <div className="input-group-prepend">
                              <div className="input-group-text">
                                <span className="svg-icon svg-icon-md svg-icon-dark">
                                  <SVG
                                    src={toAbsoluteUrl(
                                      "/media/svg/icons/General/Search.svg"
                                    )}
                                  />
                                </span>
                              </div>
                            </div>
                            <input
                              type="text"
                              className="form-control"
                              name="searchText"
                              placeholder="Search in all fields"
                              values={searchText}
                              onChange={(e) => {
                                setSearchText(e.target.value);
                              }}
                            />
                          </div>
                        </div>
                        <div className="col-lg-6 col-md-5"></div>
                        <div className="col-lg-2 col-md-3 settlement">
                          <button
                            type="submit"
                            style={headerButtonStyles}
                            className="btn pinaple-yellow-btn ml-2"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSubmit();
                            }}
                          >
                            <i
                              className="fa fa-database"
                              style={{ color: "#777" }}
                            ></i>
                            Settlement
                          </button>
                        </div>
                      </div>

                      <ToolkitProvider
                        keyField="keyField"
                        columns={filterColData}
                        data={values}
                        columnToggle
                        noDataIndication={
                          <div className="text-center bg-light p-2">
                            No Records Found
                          </div>
                        }
                        style={{ backgroundColor: "#000" }}
                      >
                        {(props) => (
                          <div>
                            <div>
                              <CustomToggleList
                                {...props.columnToggleProps}
                                onColumnToggle={myColumnToggle}
                              />
                            </div>
                            <hr />
                            <BootstrapTable
                              data={values}
                              noDataIndication={
                                <div className="text-center bg-light p-2">
                                  No Records Found
                                </div>
                              }
                              style={{ backgroundColor: "#000" }}
                              keyField="keyField"
                              {...props.baseProps}
                              bodyClasses={bodyClassName}
                              cellEdit={cellEditFactory({
                                mode: "click",
                                blurToSave: true,
                                timeToCloseMessage: 2500,
                                // afterSaveCell: afterSaveCell,
                                onStartEdit: (
                                  row,
                                  column,
                                  rowIndex,
                                  columnIndex
                                ) => {
                                  const AllRows = document.getElementsByClassName(
                                    bodyClassName
                                  )[0].children;
                                  const currentRow = AllRows[rowIndex];
                                  const currentCell =
                                    currentRow.children[columnIndex];
                                  if (
                                    currentCell &&
                                    currentCell.children.length
                                  ) {
                                    currentCell.children[0].addEventListener(
                                      "keydown",
                                      (e) => {
                                        if (e.key === "Tab") {
                                          currentCell.children[0].blur();
                                          const nextEditablCellIndex = cols
                                            .map((x, i) => ({ ...x, index: i }))
                                            .filter((x) => x.editable !== false)
                                            .find((x) => x.index > columnIndex)
                                            ?.index;
                                          if (nextEditablCellIndex) {
                                            currentRow.children[
                                              nextEditablCellIndex
                                            ].focus();
                                            currentRow.children[
                                              nextEditablCellIndex
                                            ].click();
                                            e.preventDefault();
                                          } else {
                                            if (rowIndex + 1 < AllRows.length) {
                                              const nextEditablCellIndex = cols
                                                .map((x, i) => ({
                                                  ...x,
                                                  index: i,
                                                }))
                                                .filter(
                                                  (x) => x.editable !== false
                                                )
                                                .find((x) => x.index >= 0)
                                                ?.index;
                                              if (nextEditablCellIndex) {
                                                AllRows[rowIndex + 1].children[
                                                  nextEditablCellIndex
                                                ].focus();
                                                AllRows[rowIndex + 1].children[
                                                  nextEditablCellIndex
                                                ].click();
                                                e.preventDefault();
                                              }
                                            }
                                          }
                                        }
                                      }
                                    );
                                  }
                                },
                              })}
                              selectRow={{
                                mode: "checkbox",
                                selected: selectedRows,
                                // hideSelectAll: true,
                                selectColumnPosition: "right",
                                onSelect: (row, isSelect, rowIndex, e) => {
                                  if (isSelect) {
                                    setSelectedRows([
                                      ...selectedRows,
                                      row.keyField,
                                    ]);
                                  } else {
                                    setSelectedRows(
                                      selectedRows.filter(
                                        (x) => x !== row.keyField
                                      )
                                    );
                                  }
                                },
                                selectionHeaderRenderer: ({
                                  mode,
                                  checked,
                                  indeterminate,
                                }) => {
                                  return <span>Settlement</span>;
                                },
                                headerColumnStyle: screenSize
                                  ? headerButtonStyles
                                  : {
                                      whiteSpace: "nowrap",
                                      position: "sticky",
                                      right: "0",
                                      backgroundColor: "white",
                                      minWidth: "90px",
                                      maxWidth: "90px",
                                    },
                                selectColumnStyle: screenSize
                                  ? {}
                                  : {
                                      position: "sticky",
                                      right: "0",
                                      backgroundColor: "white",
                                      minWidth: "90px",
                                      maxWidth: "90px",
                                      textAlign: "center",
                                    },
                              }}
                            />
                          </div>
                        )}
                      </ToolkitProvider>
                    </Form>
                  )}
                </Formik>
              </div>
            </CardBody>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default PayInReport;
