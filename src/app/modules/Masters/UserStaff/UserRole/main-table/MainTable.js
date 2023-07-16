import React, { useEffect, useMemo } from 'react';
import POSTable from "../../../../_commons/components/POSTable";
import { useUserRoleUIContext } from "../UserRoleUIContext";
import { reducerInfo, userRoleActions } from "../_redux/UserRoleRedux";
import { sortCaret } from '../../../../../../_metronic/_helpers';
import { StatusColumnFormatter } from '../../../../_commons/components/col-formattors/StatusColumnFormatter';
import { ActionsColumnFormatter } from '../../../../_commons/components/col-formattors/ActionsColumnFormatter';

const MainTable = () => {
    const uiContext = useUserRoleUIContext()
    const uiProps = useMemo(() => {
        return {
            openEditPage: uiContext.editRecordBtnClick
        }
    }, [uiContext])

    useEffect(() => {
        document.title = "User Role"
    }, [])

    const columns = [
        {
            dataField: "id",
            text: "Id",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "roleCode",
            text: "Role Code",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "roleName",
            text: "Role Name",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "sortOrder",
            text: "Sort Order",
            sort: true,
            sortCaret: sortCaret,
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
            text: "Action",
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
    return <POSTable
        uiContext={uiContext}
        extraUIProps={{}}
        reducerInfo={reducerInfo}
        actions={userRoleActions}
        columns={columns}
    />
};

export default MainTable;