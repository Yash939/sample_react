import React, { useEffect, useMemo } from 'react';
import POSTable from "../../../_commons/components/POSTable";
import { useCurrencyMasterUIContext } from "../CurrencyMasterUIContext";
import { reducerInfo, currencyMasterActions } from "../_redux/CurrencyMasterRedux";
import { sortCaret, toAbsoluteUrl } from '../../../../../_metronic/_helpers';
import { StatusColumnFormatter } from '../../../_commons/components/col-formattors/StatusColumnFormatter';
import { ActionsColumnFormatter } from '../../../_commons/components/col-formattors/ActionsColumnFormatter';
import SVG from "react-inlinesvg";
import { useHistory } from 'react-router';

const MainTable = () => {
    const uiContext = useCurrencyMasterUIContext()
    const uiProps = useMemo(() => {
        return {
            openEditPage: uiContext.editRecordBtnClick
        }
    }, [uiContext])

    useEffect(() => {
        document.title = "Currency Master"
    }, [])

    const history = useHistory()

    const columns = [
        {
            dataField: "currencyCode",
            text: "Currency Code",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "currencyName",
            text: "Currency Name",
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
            headerClasses: "text-center pr-0",
            headerStyle: { width: "1px" },
            headerFormatter: (column, columnIndex) => {
                return (
                    <a
                      title="Bulk Edit"
                      className="btn btn-icon btn-light btn-hover-warning btn-sm mx-3"
                      onClick={() => history.push(`/masters/currency/master/bulk-edit`)}
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
            actions={currencyMasterActions}
            columns={columns}
        />
    </>)
};

export default MainTable;