import React, { useEffect, useMemo } from 'react';
import POSTable from "../../../_commons/components/POSTable";
import { useTaskPriorityMasterUIContext } from "../TaskPriorityMasterUIContext";
import { reducerInfo, taskPriorityMasterActions } from "../_redux/TaskPriorityMasterRedux";
import { sortCaret } from '../../../../../_metronic/_helpers';
import { StatusColumnFormatter } from '../../../_commons/components/col-formattors/StatusColumnFormatter';
import { ActionsColumnFormatter } from '../../../_commons/components/col-formattors/ActionsColumnFormatter';
import { FlagColumnFormatter } from '../../../_commons/components/col-formattors/FlagColumnFormatter';

const MainTable = () => {
    const uiContext = useTaskPriorityMasterUIContext()
    const uiProps = useMemo(() => {
        return {
            openEditPage: uiContext.editRecordBtnClick
        }
    }, [uiContext])

    useEffect(() => {
        document.title = "Ticket Priority Master"
    }, [])

    const columns = [
        {
            dataField: "code",
            text: "Priority Code",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "taskPriorityName",
            text: "Priority Name",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "taskDefaultFlag",
            text: "Default Flag",
            sort: true,
            sortCaret: sortCaret,
            formatExtraData: "taskDefaultFlag",
            formatter: FlagColumnFormatter,
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
            actions={taskPriorityMasterActions}
            columns={columns}
        />
    </>)
};

export default MainTable;