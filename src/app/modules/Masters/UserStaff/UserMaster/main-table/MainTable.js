import React, { useEffect, useMemo } from 'react';
import POSTable from "../../../../_commons/components/POSTable";
import { useUserMasterUIContext } from "../UserMasterUIContext";
import { reducerInfo, userMasterActions } from "../_redux/UserMasterRedux";
import { sortCaret, toAbsoluteUrl } from '../../../../../../_metronic/_helpers';
import { StatusColumnFormatter } from '../../../../_commons/components/col-formattors/StatusColumnFormatter';
import { ActionsColumnFormatter } from '../../../../_commons/components/col-formattors/ActionsColumnFormatter';
import { shallowEqual, useSelector } from 'react-redux';
import SVG from "react-inlinesvg";
import { useHistory } from 'react-router';

const MainTable = () => {
    const uiContext = useUserMasterUIContext()
    const uiProps = useMemo(() => {
        return {
            openEditPage: uiContext.editRecordBtnClick,
        }
    }, [uiContext])

    const { authState } = useSelector((state) =>
    ({
       authState: state.auth
    }),shallowEqual)

    const action = useMemo(() => {

        if(authState?.customerMSTId) {
            return userMasterActions.getAllFiltered()
        }
        return userMasterActions.getAll()

    }, [authState?.customerMSTId])

    useEffect(() => {
        document.title = "User Master"
    }, [])
    const history = useHistory()
    
    const columns = [
        {
            dataField: "code",
            text: "User Code",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "userName",
            text: "User Name",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "organizationMST.organizationName",
            text: "Customer",
            sort: true,
            sortCaret: sortCaret,
        },
        {
            dataField: "userRoleMST.roleName",
            text: "User Role",
            sort: true,
            sortCaret: sortCaret,
        },
        {
            dataField: "cityMST.cityName",
            text: "City",
            sort: true,
            sortCaret: sortCaret,
        },
        {
            dataField: "stateMST.stateName",
            text: "State",
            sort: true,
            sortCaret: sortCaret,
        },
        {
            dataField: "countryMST.countryName",
            text: "Country",
            sort: true,
            sortCaret: sortCaret,
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
            headerClasses: "text-center",
            headerStyle: { width: "1px" },
            headerFormatter: (column, columnIndex) => {
                return (
                    <a
                      title="Bulk Edit"
                      className="btn btn-icon btn-light btn-hover-warning btn-sm mx-3"
                      onClick={() => history.push(`/masters/user/master/bulk-edit`)}
                    >
                      <span className="svg-icon svg-icon-md svg-icon-dark">
                        <SVG
                          src={toAbsoluteUrl("/media/svg/icons/Communication/Write.svg")}
                          title='Bulk Edit'
                        />
                      </span>
                    </a>
                  );
            }
        }
    ];
    return <POSTable
        uiContext={uiContext}
        extraUIProps={{}}
        reducerInfo={reducerInfo}
        // actions={userMasterActions}
        columns={columns}
        customActions={action}
    />
};

export default MainTable;