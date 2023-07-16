import React, { useEffect, useMemo } from 'react';
import POSTable from "../../../_commons/components/POSTable";
import { useOrganizationMasterUIContext } from "../OrganizationMasterUIContext";
import { organizationMasterActions, reducerInfo } from "../_redux/OrganizationMasterRedux";
import { sortCaret, toAbsoluteUrl } from '../../../../../_metronic/_helpers';
import { StatusColumnFormatter } from '../../../_commons/components/col-formattors/StatusColumnFormatter';
import { ActionsColumnFormatter } from '../../../_commons/components/col-formattors/ActionsColumnFormatter';
import SVG from "react-inlinesvg";
import { useHistory } from 'react-router';
import { Link} from 'react-router-dom';

const MainTable = () => {
    const uiContext = useOrganizationMasterUIContext()
    const uiProps = useMemo(() => {
        return {
            openEditPage: uiContext.editRecordBtnClick
        }
    }, [uiContext])

    useEffect(() => {
        document.title = "Customer Master"
    }, [])
    const history = useHistory()

    const organizationTypeFormatter = (cell) => {
        if(cell === "PARTNER") 
            return "Partner"
        else if(cell === "SELF")
            return "Self"
        else if(cell === "CUSTOMER")
            return "Customer"

        return ""
    }

    const columns = [
        {
            dataField: "code",
            text: "Code",
            sort: true,
            sortCaret: sortCaret,
            formatter: (cell, row) => {
                return (
                    <Link  target={'_blank'} to={{
                        pathname: `/customer/${row.id}/edit`,
                    }} rel="noopener noreferrer" >
                        <label style={{ cursor: 'pointer' }}>{cell} </label>
                    </Link>

                )
            }
        },
        {
            dataField: "organizationName",
            text: "Name",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "organizationType",
            text: "Type",
            sort: true,
            sortCaret: sortCaret,
            formatter: (cell) => organizationTypeFormatter(cell)
        },
        {
            dataField: "emailId",
            text: "Email",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "primaryContact",
            text: "Contact",
            sort: true,
            sortCaret: sortCaret
        },
        {
            dataField: "website",
            text: "Website",
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
                      onClick={() => history.push(`/masters/engineer/master/bulk-edit`)}
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
            actions={organizationMasterActions}
            columns={columns}
        />
    </>)
};

export default MainTable;