import React, { useEffect, useMemo } from 'react';
import POSTable from "../../_commons/components/POSTable";
import POSEditableTable from "../../_commons/components/POSEditableTable";
import { useActivityLogsUIContext } from "../ActivityLogsUIContext";
import { reducerInfo, activityLogsActions } from "../_redux/ActivityLogsRedux";
import { sortCaret, toAbsoluteUrl } from '../../../../_metronic/_helpers';
import { StatusColumnFormatter } from '../../_commons/components/col-formattors/StatusColumnFormatter';
import { ActionsColumnFormatter } from '../../_commons/components/col-formattors/ActionsColumnFormatter';
import SVG from "react-inlinesvg";
import { useHistory } from 'react-router';
import moment from 'moment-timezone';

const MainTable = ({currentState, fromDate, toDate}) => {
    
    const uiContext = useActivityLogsUIContext()
    const uiProps = useMemo(() => {
        return {
            openEditPage: uiContext.editRecordBtnClick
        }
    }, [uiContext])

    useEffect(() => {
        document.title = "Activity Logs"
    }, [])
    const history = useHistory()

    const timezone = moment.tz.guess(true)

    const columns = [
        {
            dataField: "message",
            text: "Activity",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "module",
            text: "Module",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "userMST.userName",
            text: "Done By",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "createdOn",
            text: "Date & Time",
            sort: true,
            sortCaret: sortCaret,
            formatter: (cell) => cell ? moment.tz(cell, "utc").tz(timezone).format('YYYY-MM-DD hh:mm A') : ""
        },
        {
            dataField: "action",
            text: "Actions",
            formatter: (cell, row) => {
                if(row?.module === "Project" && !row?.message?.includes('Added new')) {
                    return (
                        <a
                            title="View History"
                            className="btn btn-icon btn-light btn-hover-warning btn-sm mx-3"
                            onClick={() => {
                                history.push({
                                    pathname:`/activity-logs/project-history/${row.id}` ,
                                    state: { fromDate: fromDate, toDate: toDate }
                                })
                            }}
                            
                        >
                            <span className="svg-icon svg-icon-md svg-icon-dark">
                                <SVG
                                    src={toAbsoluteUrl("/media/svg/icons/General/Eye.svg")}
                                    title='View History'
                                />
                            </span>
                        </a>
                    );
                } else {
                    return ""
                }
            },
            formatExtraData: {
                openEditPage: uiProps.openEditPage,
                idFieldName: reducerInfo.idFieldName,
            },
            classes: "text-center pr-0",
            headerClasses: "text-center pr-3",
            headerStyle: { width: "1px" },
        }
    ];

    return (<>
        <POSTable
            uiContext={uiContext}
            extraUIProps={{}}
            reducerInfo={reducerInfo}
            columns={columns}
            customState={currentState}
        />
    </>)
};

export default MainTable;