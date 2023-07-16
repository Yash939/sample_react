import React, { useMemo, useRef } from 'react';
import {
    Card,
    CardHeader,
    CardHeaderToolbar,
    CardBody
} from "../../../../_metronic/_partials/controls/Card";
import { useTaskMasterUIContext } from './TaskMasterUIContext';
import MainTable from "./main-table/MainTable";
import POSTableFilter from '../../_commons/components/POSTableFilter';
import { toAbsoluteUrl } from '../../../../_metronic/_helpers';
import SVG from 'react-inlinesvg'
import { shallowEqual, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

const TaskMasterCard = () => {

    const { moduleMasterState } = useSelector((state) =>
    ({
        moduleMasterState: state.moduleMaster
    }), shallowEqual)

    const uiContext = useTaskMasterUIContext();
    const cancelBtnRef = useRef()
    const uiProps = useMemo(() => {
        return {
            newButtonClick: uiContext.newButtonClick,
            queryParams: uiContext.queryParams,
            setQueryParams: uiContext.setQueryParams,
        }
    }, [uiContext])

    const useQuery = () => {
        return new URLSearchParams(useLocation().search);
    }

    let filter = useQuery().get("filter");

    const cancelBtnHandler = () => {
        if (cancelBtnRef && cancelBtnRef.current)
            cancelBtnRef.current.click()
    }

    return (
        <Card>
            <CardHeader title={<POSTableFilter qParams={uiProps.queryParams} setQParams={uiProps.setQueryParams} />}>
                <CardHeaderToolbar>
                    {moduleMasterState?.entities?.filter(x => x.moduleCode === "TASK_CREATION")?.length > 0 ? <button
                        type="button"
                        className="btn pinaple-yellow-btn col-xs-12"
                        onClick={uiProps.newButtonClick}
                    >
                        <span className="svv b-icon svg-icon-md svg-icon-dark">
                            <SVG src={toAbsoluteUrl("/media/svg/icons/Code/Plus.svg")} />
                        </span>
                        Create
                    </button> : null}
                    {filter === "All" ? 
                    <button
                        type="button"
                        className="btn btn-light text-danger col-xs-12 ml-5"
                        onClick={() => cancelBtnHandler()}
                        style={{fontWeight: '600'}}
                    >
                        <i className="fa fa-times" aria-hidden="true" style={{color: '#F64E60'}}></i>
                        Cancel
                    </button> : null}
                </CardHeaderToolbar>
            </CardHeader>
            <CardBody>
                <MainTable cancelBtnRef={cancelBtnRef} />
            </CardBody>
        </Card>
    );
};

export default TaskMasterCard;