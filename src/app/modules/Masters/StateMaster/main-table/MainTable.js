import React, { useEffect, useMemo } from 'react';
import POSTable from "../../../_commons/components/POSTable";
import { useStateMasterUIContext } from "../StateMasterUIContext";
import { reducerInfo, stateMasterActions } from "../_redux/StateMasterRedux";
import { sortCaret, toAbsoluteUrl } from '../../../../../_metronic/_helpers';
import { StatusColumnFormatter } from '../../../_commons/components/col-formattors/StatusColumnFormatter';
import { ActionsColumnFormatter } from '../../../_commons/components/col-formattors/ActionsColumnFormatter';
import SVG from "react-inlinesvg";
import { useHistory } from 'react-router';

const MainTable = () => {
    const uiContext = useStateMasterUIContext()
    const uiProps = useMemo(() => {
        return {
            openEditPage: uiContext.editRecordBtnClick
        }
    }, [uiContext])

    useEffect(() => {
        document.title = "State Master"
    }, [])
    const history = useHistory()

    const columns = [
        {
            dataField: "code",
            text: "State Code",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "stateName",
            text: "State Name",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "countryMST.countryName",
            text: "Country",
            sort: true,
            sortCaret: sortCaret
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
                      onClick={() => history.push(`/masters/state/master/bulk-edit`)}
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

    return (<>
        <POSTable
            uiContext={uiContext}
            extraUIProps={{}}
            reducerInfo={reducerInfo}
            actions={stateMasterActions}
            columns={columns}
        />
    </>)
};

export default MainTable;