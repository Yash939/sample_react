import React, { useMemo } from 'react';
import {
    Card,
    CardHeader,
    CardHeaderToolbar,
    CardBody
} from "../../../../_metronic/_partials/controls/Card";
import MainTable from "./main-table/MainTable";
import POSTableFilter from '../../_commons/components/POSTableFilter';
import { toAbsoluteUrl } from '../../../../_metronic/_helpers';
import SVG from 'react-inlinesvg'
import { useOrganizationMasterUIContext } from './OrganizationMasterUIContext';
import { useLoggedInUserRoleCode } from '../../_commons/Utils';

const OrganizationMasterCard = () => {

    const uiContext = useOrganizationMasterUIContext();
    const uiProps = useMemo(() => {
        return {
            newButtonClick: uiContext.newButtonClick,
            queryParams: uiContext.queryParams,
            setQueryParams: uiContext.setQueryParams,
        }
    }, [uiContext])

    const roleCode = useLoggedInUserRoleCode()

    return (
        <Card>
            <CardHeader title={<POSTableFilter qParams={uiProps.queryParams} setQParams={uiProps.setQueryParams} />}>
                <CardHeaderToolbar>
                {(roleCode.includes("admin")) ? 
                    <button
                        type="button"
                        className="btn pinaple-yellow-btn col-xs-12"
                        onClick={uiProps.newButtonClick}
                    >
                        <span className="svv b-icon svg-icon-md svg-icon-dark">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Code/Plus.svg")} />
                        </span>
                        Add
                    </button> : null }
                </CardHeaderToolbar>
            </CardHeader>
            <CardBody>
                <MainTable />
            </CardBody>
        </Card>
    );
};

export default OrganizationMasterCard;