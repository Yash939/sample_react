import React, { useMemo } from 'react';
import {
    Card,
    CardHeader,
    CardHeaderToolbar,
    CardBody
} from "../../../../../_metronic/_partials/controls/Card";
import { useUserRoleUIContext } from './UserRoleUIContext';
import MainTable from "./main-table/MainTable";
import POSTableFilter from '../../../_commons/components/POSTableFilter';
import { toAbsoluteUrl } from '../../../../../_metronic/_helpers';
import SVG from 'react-inlinesvg'

const UserRoleCard = () => {

    const uiContext = useUserRoleUIContext();
    const uiProps = useMemo(() => {
        return {
            newButtonClick: uiContext.newButtonClick,
            queryParams: uiContext.queryParams,
            setQueryParams: uiContext.setQueryParams,
        }
    }, [uiContext])
    return (
        <Card>
            <CardHeader title={<POSTableFilter qParams={uiProps.queryParams} setQParams={uiProps.setQueryParams} />}>
                <CardHeaderToolbar>
                    <button
                        type="button"
                        className="btn pinaple-yellow-btn col-xs-12"
                        onClick={uiProps.newButtonClick}
                        style={{ width: "auto" }}
                    >
                        <span className="svg-icon svg-icon-md svg-icon-dark">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Code/Plus.svg")} />
                        </span>
                        Add
                    </button>
                </CardHeaderToolbar>
            </CardHeader>
            <CardBody>
                <MainTable />
            </CardBody>
        </Card>
    );
};

export default UserRoleCard;