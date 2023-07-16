import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, useRouteMatch } from "react-router";
import { Card, CardBody, CardHeader, CardHeaderToolbar } from "../../../../_metronic/_partials/controls";
import { projectLogsActions } from "../_redux/ProjectLogsRedux";
import { shallowDiffObjects } from "../../_commons/Utils";
import { sortCaret } from "../../../../_metronic/_helpers";
import BootstrapTable from "react-bootstrap-table-next";
import { convertFromRaw, EditorState } from "draft-js";

const ProjectHistoryPage = () => {

    const { params: { id } } = useRouteMatch()
    const dispatch = useDispatch()
    const history = useHistory()
    const fromDate = useLocation()?.state?.fromDate
    const toDate = useLocation()?.state?.toDate

    useEffect(() => {
        dispatch(projectLogsActions.getByGeneralLogId(id))
    }, [id])

    const { listLoading, error, loadingMessage, entities } = useSelector((state) => ({
        listLoading: state.projectLogs.listLoading,
        error: state.projectLogs.error,
        loadingMessage: state.projectLogs.loadingMessage,
        entities: state.projectLogs.entities,
    }), shallowEqual)

    const [tableData, setTableData] = useState([])

    const getDataRow = (key, name, currentLog, previousLog, formatter = null, data = false) => {
        let row = {}
        row['name'] = name
        row['old'] = formatter ? data ? formatter(previousLog[key], previousLog) : formatter(previousLog[key]) : previousLog[key]
        row['new'] = formatter ? data ? formatter(currentLog[key], currentLog) : formatter(currentLog[key]) : currentLog[key]
        return row
    }

    const statusTypeFormatter = (value) => {
        if (value === "ACTIVE") {
            return "Active"
        } else if (value === "CLOSE") {
            return "Close"
        }
        return value
    }

    const customerFormatter = (value, data) => {
        return data?.organizationMST?.organizationName ?? ""
    }

    const customerBranchFormatter = (value, data) => {
        return data?.organizationBranchDTL?.branchName ?? ""
    }

    const requestedByFormatter = (value, data) => {
        return data?.projectRequestedBy?.userName ?? ""
    }

    const countryFormatter = (value, data) => {
        return data?.countryMST?.countryName ?? ""
    }

    const stateFormatter = (value, data) => {
        return data?.stateMST?.stateName ?? ""
    }

    const cityFormatter = (value, data) => {
        return data?.cityMST?.cityName ?? ""
    }

    const taskUserFormatter = (value, data) => {
        return data?.projectTaskUser?.engineerName ?? ""
    }

    const coordinatorFormatter = (value, data) => {
        return data?.projectCoordinator?.userName ?? ""
    }

    const managerFormatter = (value, data) => {
        return data?.projectManager?.userName ?? ""
    }

    const taskCreationFormatter = (value) => {
        if (value === "SINGLE") {
            return "Single"
        } else if (value === "DAYWISE") {
            return "Day Wise"
        } else if (value === "DATEWISE") {
            return "Date Wise"
        } else if (value === "NONE") {
            return "None"
        }
        return value
    }

    const taskTypeFormatter = (value) => {

        if (value === 0) {
            return "Onsite"
        } else if (value === 1) {
            return "Remote"
        }

        return value
    }

    const payInCurrencyFormatter = (value, data) => {
        return data?.projectPayInCurrency?.currencyName ?? ""
    }

    const payOutCurrencyFormatter = (value, data) => {
        return data?.projectPayOutCurrency?.currencyName ?? ""
    }

    const projectDescriptionFormatter = (value) => {
        if (value) {
            const editorData = EditorState.createWithContent(convertFromRaw(JSON.parse(value)))
            return editorData.getCurrentContent().getPlainText()
        }
        return ""
    }

    const minHourFormatter = (value) => {
        if (value) {
            return (value / 60)
        }
        return 0
    }
    const dayFormatter = (value) => {
        if (value === "fullday") {
            return "Full Day"
        } else if (value === "halfday") {
            return "Half Day"
        }
        return ""
    }

    useEffect(() => {
        let currentLog = { ...entities?.currentLog ?? {} }
        let previousLog = { ...entities?.previousLog ?? {} }

        Object.keys(currentLog).map(function (key, index) {
            if (currentLog[key] === null) {
                currentLog[key] = "";
            }
        });

        Object.keys(previousLog).map(function (key, index) {
            if (previousLog[key] === null) {
                previousLog[key] = "";
            }
        });

        let diff = shallowDiffObjects(currentLog, previousLog)
        let tmpdata = []
        Object.keys(diff).forEach(key => {
            if (key === "projectName") {
                tmpdata.push(getDataRow(key, "Project Name", currentLog, previousLog))
            } else if (key === "projectStatusType") {
                tmpdata.push(getDataRow(key, "Status", currentLog, previousLog, statusTypeFormatter))
            } else if (key === "projectStartDate") {
                tmpdata.push(getDataRow(key, "Start Date", currentLog, previousLog))
            } else if (key === "projectEndDate") {
                tmpdata.push(getDataRow(key, "End Date", currentLog, previousLog))
            } else if (key === "projectForceEndDate") {
                tmpdata.push(getDataRow(key, "Force End Date", currentLog, previousLog))
            } else if (key === "organizationMSTId") {
                tmpdata.push(getDataRow(key, "Customer", currentLog, previousLog, customerFormatter, true))
            } else if (key === "organizationBranchDTLId") {
                tmpdata.push(getDataRow(key, "Customer Branch", currentLog, previousLog, customerBranchFormatter, true))
            } else if (key === "projectRequestedById") {
                tmpdata.push(getDataRow(key, "Requested By", currentLog, previousLog, requestedByFormatter, true))
            } else if (key === "projectLocalContactName") {
                tmpdata.push(getDataRow(key, "Local Contact Name", currentLog, previousLog))
            } else if (key === "projectLocalContactPhone") {
                tmpdata.push(getDataRow(key, "Local Contact Phone", currentLog, previousLog))
            } else if (key === "countryMSTId") {
                tmpdata.push(getDataRow(key, "Country", currentLog, previousLog, countryFormatter, true))
            } else if (key === "stateMSTId") {
                tmpdata.push(getDataRow(key, "State", currentLog, previousLog, stateFormatter, true))
            } else if (key === "cityMSTId") {
                tmpdata.push(getDataRow(key, "City", currentLog, previousLog, cityFormatter, true))
            } else if (key === "projectAddress") {
                tmpdata.push(getDataRow(key, "Address", currentLog, previousLog))
            } else if (key === "projectZipcode") {
                tmpdata.push(getDataRow(key, "Zip Code", currentLog, previousLog))
            } else if (key === "externalCustomer") {
                tmpdata.push(getDataRow(key, "External Cutomer", currentLog, previousLog))
            } else if (key === "projectTaskUserId") {
                tmpdata.push(getDataRow(key, "Assigned Engineer", currentLog, previousLog, taskUserFormatter, true))
            } else if (key === "projectCoordinatorId") {
                tmpdata.push(getDataRow(key, "Project Co-ordinator", currentLog, previousLog, coordinatorFormatter, true))
            } else if (key === "projectManagerId") {
                tmpdata.push(getDataRow(key, "Project Manager", currentLog, previousLog, managerFormatter, true))
            } else if (key === "projectReference1") {
                tmpdata.push(getDataRow(key, "Reference1", currentLog, previousLog))
            } else if (key === "projectReference2") {
                tmpdata.push(getDataRow(key, "Reference2", currentLog, previousLog))
            } 
            // else if (key === "projectTaskCreationType") {
            //     tmpdata.push(getDataRow(key, "Ticket Creation", currentLog, previousLog, taskCreationFormatter))
            // } 
            else if (key === "taskType") {
                tmpdata.push(getDataRow(key, "Ticket Type", currentLog, previousLog, taskTypeFormatter))
            } else if (key === "projectRBHStartTimingPayIn") {
                tmpdata.push(getDataRow(key, "Pay In: RBH Start Time", currentLog, previousLog))
            } else if (key === "projectRBHEndTimingPayIn") {
                tmpdata.push(getDataRow(key, "Pay In RBH End Time", currentLog, previousLog))
            } else if (key === "projectRBHRatePayIn") {
                tmpdata.push(getDataRow(key, "Pay In: RBH Rate", currentLog, previousLog))
            } else if (key === "projectABHRatePayIn") {
                tmpdata.push(getDataRow(key, "Pay In: OBH Uplift Of", currentLog, previousLog))
            } else if (key === "projectOBHRatePayIn") {
                tmpdata.push(getDataRow(key, "Pay In: OBH Flat Rate", currentLog, previousLog))
            } else if (key === "weekendPayInMultiplier") {
                tmpdata.push(getDataRow(key, "Pay In: Weekend OBH Uplift Of", currentLog, previousLog))
            } else if (key === "weekendPayInFlatRate") {
                tmpdata.push(getDataRow(key, "Pay In: Weekend OBH Flat Rate", currentLog, previousLog))
            } else if (key === "projectPayInCurrencyId") {
                tmpdata.push(getDataRow(key, "Pay In: Currency", currentLog, previousLog, payInCurrencyFormatter, true))
            } else if (key === "projectPayInRemarks") {
                tmpdata.push(getDataRow(key, "Pay In: Remarks", currentLog, previousLog))
            } else if (key === "travelChargesPayIn") {
                tmpdata.push(getDataRow(key, "Pay In: Travel Charges", currentLog, previousLog))
            } else if (key === "materialChargesPayIn") {
                tmpdata.push(getDataRow(key, "Pay In: Material Charges", currentLog, previousLog))
            } else if (key === "parkingChargesPayIn") {
                tmpdata.push(getDataRow(key, "Pay In: Parking Charges", currentLog, previousLog))
            } else if (key === "otherChargesPayIn") {
                tmpdata.push(getDataRow(key, "Pay In: Other Charges", currentLog, previousLog))
            } else if (key === "projectRBHStartTiming") {
                tmpdata.push(getDataRow(key, "Pay Out: RBH Start Time", currentLog, previousLog))
            } else if (key === "projectRBHEndTiming") {
                tmpdata.push(getDataRow(key, "Pay Out: RBH End Time", currentLog, previousLog))
            } else if (key === "projectRBHRatePayOut") {
                tmpdata.push(getDataRow(key, "Pay Out: RBH Rate", currentLog, previousLog))
            } else if (key === "projectABHRatePayOut") {
                tmpdata.push(getDataRow(key, "Pay Out: OBH Uplift Of", currentLog, previousLog))
            } else if (key === "projectOBHRatePayOut") {
                tmpdata.push(getDataRow(key, "Pay Out: OBH Flat Rate", currentLog, previousLog))
            } else if (key === "weekendPayOutMultiplier") {
                tmpdata.push(getDataRow(key, "Pay Out: Weekend OBH Uplift Of", currentLog, previousLog))
            } else if (key === "weekendPayOutFlatRate") {
                tmpdata.push(getDataRow(key, "Pay Out: Weekend OBH Flat Rate", currentLog, previousLog))
            } else if (key === "projectPayOutCurrencyId") {
                tmpdata.push(getDataRow(key, "Pay Out: Currency", currentLog, previousLog, payOutCurrencyFormatter, true))
            } else if (key === "projectPayOutRemarks") {
                tmpdata.push(getDataRow(key, "Pay Out: Remarks", currentLog, previousLog))
            } else if (key === "travelChargesPayOut") {
                tmpdata.push(getDataRow(key, "Pay Out: Travel Charges", currentLog, previousLog))
            } else if (key === "materialChargesPayOut") {
                tmpdata.push(getDataRow(key, "Pay Out: Material Charges", currentLog, previousLog))
            } else if (key === "parkingChargesPayOut") {
                tmpdata.push(getDataRow(key, "Pay Out: Parking Charges", currentLog, previousLog))
            } else if (key === "otherChargesPayOut") {
                tmpdata.push(getDataRow(key, "Pay Out: Other Charges", currentLog, previousLog))
            } else if (key === "otherChargesPayOut") {
                tmpdata.push(getDataRow(key, "Pay Out: Other Charges", currentLog, previousLog))
            } else if (key === "minHoursPayOut") {
                tmpdata.push(getDataRow(key, "Pay Out Min Hours", currentLog, previousLog, minHourFormatter))
            } else if (key === "minHoursPayIn") {
                tmpdata.push(getDataRow(key, "Pay In Min Hours", currentLog, previousLog, minHourFormatter))
            } else if (key === "fullDayRatesPayOut") {
                tmpdata.push(getDataRow(key, "Pay Out: Full Day Rates", currentLog, previousLog))
            } else if (key === "fullDayRatesPayIn") {
                tmpdata.push(getDataRow(key, "Pay In: Full Day Rates", currentLog, previousLog))
            } else if (key === "payOutDayOption") {
                tmpdata.push(getDataRow(key, "Pay Out: Day", currentLog, previousLog, dayFormatter))
            } else if (key === "payInDayOption") {
                tmpdata.push(getDataRow(key, "Pay In: Day", currentLog, previousLog, dayFormatter))
            } 
        })

        const currentLogBranchDetail = currentLog?.projectBranchDTLList ? currentLog.projectBranchDTLList : []
        const prevLogBranchDetail = previousLog?.projectBranchDTLList ? previousLog.projectBranchDTLList : []

        for (let index = 0; index < currentLogBranchDetail.length; index++) {
            
            const element = currentLogBranchDetail[index];
            const prevElement = prevLogBranchDetail.find(x => x.id === element.id)

            if (prevElement) {
                const branchDiff = shallowDiffObjects(element, prevElement)

                Object.keys(branchDiff).forEach(key => {
                    if (key === "branchName") {
                        tmpdata.push(getDataRow(key, element?.branchName + ": Branch Name", element, prevElement))
                    } else if (key === "address") {
                        tmpdata.push(getDataRow(key, element?.branchName + ": Address", element, prevElement))
                    } else if (key === "zipCode") {
                        tmpdata.push(getDataRow(key, element?.branchName + ": Zip Code", element, prevElement))
                    } else if (key === "contactName") {
                        tmpdata.push(getDataRow(key, element?.branchName + ": Contact Name", element, prevElement))
                    } else if (key === "contactNumber") {
                        tmpdata.push(getDataRow(key, element?.branchName + ": Contact Number", element, prevElement))
                    } else if (key === "email") {
                        tmpdata.push(getDataRow(key, element?.branchName + ": Email", element, prevElement))
                    } else if (key === "countryMSTId") {
                        tmpdata.push(getDataRow(key, element?.branchName + ": Country", element, prevElement, countryFormatter, true))
                    } else if (key === "stateMSTId") {
                        tmpdata.push(getDataRow(key, element?.branchName + ": State", element, prevElement, stateFormatter, true))
                    } else if (key === "cityMSTId") {
                        tmpdata.push(getDataRow(key, element?.branchName + ": City", element, prevElement, cityFormatter, true))
                    }
                })
            }

        }

        setTableData(tmpdata)
    }, [entities])

    const columns = [
        {
            dataField: "name",
            text: "Name",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "old",
            text: "Old Value",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "new",
            text: "New Value",
            sort: true,
            sortCaret: sortCaret
        },
    ]

    return (
        <Card>
            <CardHeader title="Project History">
                <CardHeaderToolbar>
                    <button
                        type="button"
                        onClick={() => {
                            history.push({
                                pathname: "/activity-logs",
                                state: { fromDate: fromDate, toDate: toDate }
                            })
                        }}
                        className="btn btn-light"
                        style={{
                            minWidth: "85px",
                            whiteSpace: 'nowrap'
                        }}
                    >
                        <i className="fa fa-arrow-left"></i>
                        Back
                    </button>
                </CardHeaderToolbar>
            </CardHeader>
            <CardBody>

                {
                    error ?
                        <div className="text-center text-danger mb-3">
                            Error: {error?.userMessage}
                        </div>
                        : null
                }
                {listLoading ?
                    <div className="text-center">
                        <Spinner animation="grow" variant="warning" /> &nbsp;
                        <Spinner animation="grow" variant="dark" /> &nbsp;
                        <Spinner animation="grow" variant="warning" /> &nbsp;
                        {loadingMessage ? <><br /><br />{loadingMessage}</> : ''}
                    </div>
                    :
                    <BootstrapTable
                        wrapperClasses="table-responsive"
                        bordered={true}
                        headerClasses="text-primary"
                        classes="table table-head-custom table-vertical-center overflow-hidden"
                        bootstrap4
                        remote
                        keyField='name'
                        data={tableData}
                        columns={columns}
                        condensed
                        noDataIndication={(<div className="text-center bg-light m-0 p-2">
                            {
                                listLoading
                                    ? <div><div className="spinner-border text-warning spinner-border-sm mx-2" role="status"><span className="sr-only">Loading...</span></div>Loading...</div>
                                    : "No Data Found"
                            }
                        </div>)}
                    >
                    </BootstrapTable>
                    // <EditForm
                    //     isHistory
                    //     historyData={entities}
                    // />
                }
            </CardBody>
        </Card>
    )
}

export default ProjectHistoryPage;