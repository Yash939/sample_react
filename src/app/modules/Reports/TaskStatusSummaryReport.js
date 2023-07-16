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
import { Link } from "react-router-dom";
import { exportToCsv, searchInArray } from "../_commons/Utils";
import * as Yup from "yup";
import moment from "moment";
import { AntdDatePickerField } from "../../../_metronic/_partials/controls/forms/AntdDatePickerField";
import ToolkitProvider from "react-bootstrap-table2-toolkit";

const headerButtonStyles = {
  minWidth: "85px",
  whiteSpace: "nowrap",
};

const TaskStatusSummaryReport = () => {
  const cols = [
    {
      dataField: "countryName",
      text: "Country",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "stateName",
      text: "State",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "cityName",
      text: "City",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "zipCode",
      text: "Zip Code",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "customerName",
      text: "Customer",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "projectName",
      text: "Project",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
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
      formatter: (cell, row) => {
        return (
          <Link
            to={{
              pathname: `/ticket/${row.taskId}/edit/readonly`,
            }}
            rel="noopener noreferrer"
          >
            <label style={{ cursor: "pointer" }}>{row.taskCode} </label>
          </Link>
        );
      },
    },
    {
      dataField: "taskType",
      text: "Ticket Type",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
      // formatter: (cell) => cell === 1 ? 'Onsite' : cell === 2 ? 'Online' : "",
      // exportFormatter: (cell) => cell === 1 ? 'Onsite' : cell === 2 ? 'Online' : "",
    },
    {
      dataField: "priorityName",
      text: "Priority",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "statusName",
      text: "Status",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
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
      dataField: "planDate",
      text: "Plan Date - Time",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "dueDate",
      text: "Due Date - Time",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "createdBy",
      text: "Created By",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "createdDate",
      text: "Created Date - Time",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "updatedBy",
      text: "Last Updated By",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    {
      dataField: "lastUpdate",
      text: "Last Updated Date - Time",
      sort: true,
      sortCaret: sortCaret,
      headerStyle: { whiteSpace: "nowrap" },
    },
    // {
    //     dataField: "",
    //     text: "View",
    //     headerStyle: { whiteSpace: 'nowrap' },
    //     style:{position: 'sticky'},
    //     formatter: (cell, row) => {
    //         return (
    //             <Link to={{
    //                 pathname: `/ticket/${row.taskId}/edit/readonly`,
    //             }} target="_blank" rel="noopener noreferrer" >
    //                 <img
    //                     src={toAbsoluteUrl("/media/svg/icons/General/Eye.svg")}
    //                     alt=""
    //                     style={{ cursor: 'pointer' }}
    //                     title="View Ticket"
    //                 />
    //             </Link>

    //         )
    //     },
    // },
  ];

  const [searchText, setSearchText] = useState("");
  const dispatch = useDispatch();
  const [filterData, setFilterData] = useState([]);
  const [filterColData, setFilterColData] = useState(cols);
  const [colData, setColData] = useState(cols);
  const [sytle, setSytle] = useState(false);
  const [filterDataError, setFilterDataError] = useState("");
  const ref = useRef();

  const {
    actionLoading,
    listLoading,
    error,
    entities,
    loadingMessage,
  } = useSelector(
    (state) => ({
      actionLoading: state.reports.actionLoading,
      listLoading: state.reports.listLoading,
      error: state.reports.error,
      entities: state.reports.entities,
      loadingMessage: state.reports.loadingMessage,
    }),
    shallowEqual
  );

  const initialVals = useMemo(() => {
    return {
      fromDate: null,
      toDate: null,
      organisationId: null,
      projectId: null,
      statusId: null,
      userId: null,
      dateFilter: "createdDate",
    };
  }, []);
  const GetPropertyValue = (obj1, dataToRetrieve) => {
    return dataToRetrieve
      .split(".") // split string based on `.`
      .reduce(function(o, k) {
        return o && o[k]; // get inner property if `o` is defined else get `o` and return
      }, obj1); // set initial value as object
  };

  const rows = useMemo(() => {
    if (!Array.isArray(entities)) return [];
    try {
      let rTmp = entities?.map((x, i) => ({ ...x, keyField: i })) ?? [];

      let qObj = {};
      if (searchText)
        cols.forEach((col) => {
          // console.log("------------------------------------------")
          // console.log(col.dataField)
          // console.log(GetPropertyValue(rTmp,col.dataField))
          qObj[col.dataField] = searchText;
        });
      return searchInArray(rTmp, qObj, []);
    } catch (error) {
      console.log(error);
      return [];
    }
  }, [entities, searchText, cols]);

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

  useEffect(() => {
    document.title = "Ticket Status Summary Report";
    setFilterDataError("");
    dispatch(reportsActions.reIniState());
    dispatch(reportsActions.getTaskStatusFilterData())
      .then((res) => {
        setFilterData(res);
      })
      .catch((err) => setFilterDataError(err));
  }, []);

  const dateFilterOptions = [
    { label: "Create Date", value: "createdDate" },
    { label: "Modified Date", value: "modifiedDate" },
    { label: "Close Flag", value: "closeFlag" },
    { label: "Confirm Flag", value: "confirmFlag" },
  ];
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

  const CustomToggleList = ({ columns, onColumnToggle, toggles }) => (
    <div className="text-center">
      <div style={{ float: "left" }}>
        <div class=" ">
          <div>
            <button
              onClick={() => setSytle(!sytle)}
              style={{ height: "45px", marginTop: "15px", background: "white" }}
              class=" btn-default dropdown-toggle custom-csv"
              data-toggle="dropdown"
            ></button>
          </div>
          <div style={sytle ? { display: "block" } : { display: "none" }}>
            <ul
              ref={ref}
              class=""
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

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialVals}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        console.log(values);
        dispatch(reportsActions.getData("taskSummary", values, "post"));
      }}
    >
      {({ handleSubmit, handleReset, setFieldValue, values }) => (
        <Form className="form form-label-right">
          <Card>
            <CardHeader title="Ticket Status Summary Report">
              <CardHeaderToolbar>
                {
                  <>
                    <button
                      type="button"
                      style={headerButtonStyles}
                      className="btn btn-light ml-2"
                      onClick={() => exportToCsv(colData, rows)}
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
                      {/* <small>({error.error.message})</small> */}
                    </div>
                  ) : (
                    ""
                  )}
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
                  <div className="col-12 col-md-3">
                    <Field
                      name="dateFilter"
                      component={AutoCompleteSelect}
                      placeholder="Select Date Filter By"
                      label="Date Filter By"
                      options={dateFilterOptions}
                      isrequired
                    />
                  </div>
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
                  <div className="col-12 col-md-3">
                    <Field
                      name="organisationId"
                      component={AutoCompleteSelect}
                      options={
                        values?.organisationId
                          ? filterData?.organization
                              ?.filter((x) => x.id === values?.organisationId)
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
                          setFieldValue("organisationId", e?.customerId);
                      }}
                      options={
                        values?.organisationId
                          ? filterData?.project
                              ?.filter(
                                (x) => x.customerId === values.organisationId
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
                      name="userId"
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
                <div className="row mb-2">
                  <div className="col-lg-12">
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
                    {/* <small className="form-text text-muted">
                                        <b>Search</b> in all fields
                                    </small> */}
                  </div>
                </div>

                {/* <BootstrapTable
                                        keyField="keyField"
                                        columns={cols}
                                        data={rows}
                                        noDataIndication={<div className="text-center bg-light p-2">No Records Found</div>}
                                        style={{ backgroundColor: "#000" }}
                                    /> */}
                <ToolkitProvider
                  keyField="keyField"
                  data={rows}
                  columns={filterColData}
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
                        noDataIndication={
                          <div className="text-center bg-light p-2">
                            No Records Found
                          </div>
                        }
                        style={{ backgroundColor: "#000" }}
                        keyField="keyField"
                        {...props.baseProps}
                      />
                    </div>
                  )}
                </ToolkitProvider>
              </div>
            </CardBody>
          </Card>
        </Form>
      )}
    </Formik>
  );
};

export default TaskStatusSummaryReport;
