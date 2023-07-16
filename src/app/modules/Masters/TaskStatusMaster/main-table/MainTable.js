import React, { useEffect, useMemo } from 'react';
import POSTable from "../../../_commons/components/POSTable";
import { useTaskStatusMasterUIContext } from "../TaskStatusMasterUIContext";
import { reducerInfo, taskStatusMasterActions } from "../_redux/TaskStatusMasterRedux";
import { sortCaret } from '../../../../../_metronic/_helpers';
import { StatusColumnFormatter } from '../../../_commons/components/col-formattors/StatusColumnFormatter';
import { ActionsColumnFormatter } from '../../../_commons/components/col-formattors/ActionsColumnFormatter';
import { FlagColumnFormatter } from '../../../_commons/components/col-formattors/FlagColumnFormatter';

const MainTable = () => {
    const uiContext = useTaskStatusMasterUIContext()
    const uiProps = useMemo(() => {
        return {
            openEditPage: uiContext.editRecordBtnClick
        }
    }, [uiContext])

    useEffect(() => {
        document.title = "Ticket Status Master"
    }, [])

    const columns = [
        {
            dataField: "id",
            text: "Status Code",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "taskStatusName",
            text: "Status Name",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "sortOrder",
            text: "Sort Order",
            sort: true,
            sortCaret: sortCaret,
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "defaultFlag",
            text: "Default Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "defaultFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "assignedFlag",
            text: "Assigned Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "assignedFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "wipFlag",
            text: "WIP Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "wipFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "closeFlag",
            text: "Close Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "closeFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "confirmFlag",
            text: "Confirm Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "confirmFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "payOutFlag",
            text: "Payout Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "payOutFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "payInFlag",
            text: "Payin Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "payInFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "reopenFlag",
            text: "Re-Open Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "reopenFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "penaltyFlag",
            text: "Penalty Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "penaltyFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "autoCloseFlag",
            text: "Auto Close Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "autoCloseFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "cancelFlag",
            text: "Cancel Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "cancelFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "pendingFlag",
            text: "Pending Flag",
            sort: true,
            sortCaret: sortCaret,
            formatter: FlagColumnFormatter,
            formatExtraData: "pendingFlag",
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "active",
            text: "Status",
            sort: true,
            sortCaret: sortCaret,
            formatter: StatusColumnFormatter,
            classes: "text-center",
            headerClasses: "text-center",
            headerStyle: { width: "1px", whiteSpace: 'nowrap' }
        },
        {
            dataField: "action",
            text: "Actions",
            formatter: ActionsColumnFormatter,
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
            actions={taskStatusMasterActions}
            columns={columns}
        />
    </>)
};

export default MainTable;