import React, { useMemo, useEffect, useState } from 'react';
import paginationFactory, {
    PaginationProvider
} from "react-bootstrap-table2-paginator";
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import * as uiHelpers from "../UIHelper";
import { Pagination } from '../../../../_metronic/_partials/controls';
import BootstrapTable from 'react-bootstrap-table-next';
import { getHandlerTableChange, toAbsoluteUrl } from '../../../../_metronic/_helpers';
import { baseFilter } from "../../_commons/Utils";
import SVG from 'react-inlinesvg'

const POSTable = ({ uiContext, extraUIProps, reducerInfo, actions, columns, onExpand = undefined, 
    dataFilter = (row) => true, customActions, customState, paginated = false, customData = undefined, selectRow = undefined }) => {
    const defaultUIProps = useMemo(() => {
        return {
            ids: uiContext.ids,
            setIds: uiContext.setIds,
            queryParams: uiContext.queryParams,
            setQueryParams: uiContext.setQueryParams,
        }
    }, [uiContext])
    const uiProps = {
        ...defaultUIProps,
        ...extraUIProps
    }

    const [page,setPage]=useState()
    useEffect(()=>{
       if(page) {
        document.getElementById('tableContainer').scrollIntoView(); 
       }
    },[page])

    //currentState of module(props.reducerInfo)
    const { currentState } = useSelector(
        state => ({ currentState: state[reducerInfo.name] }),
        shallowEqual
    )
    const { totalCount, listLoading, error, actionLoading } = customState ? customState : currentState
    const entities = customData ? customData : customState ? customState.entities : currentState.entities

    const dispatch = useDispatch();
    useEffect(() => {
        if (!customState) {
            if (customActions) {
                dispatch(customActions)
            } else {
                dispatch(actions.getAll())
            }
        }
    }, [dispatch, actions, customActions])

    // //debugger
    //Table pagination properties
    const paginationOptions = {
        custom: true,
        totalSize: entities?.filter(dataFilter)?.length,
        sizePerPageList: uiHelpers.sizePerPageList,
        sizePerPage: uiProps.queryParams.pageSize,
        page: uiProps.queryParams.pageNumber,
        pageStartIndex: 1,
        onPageChange: (page,sizePerPage) => setPage(page)
    };
    let message = null
    if (error) {
        message = (<div className="text-center" style={{ color: 'red' }}>Error: {error.userMessage} <small>({error.error.message})</small></div>)
    } else {
        message = null;
    }
    return (
        <>
            <PaginationProvider pagination={paginationFactory(paginationOptions)}>
                {
                    ({ paginationProps, paginationTableProps }) => {
                        
                        return (
                            <Pagination
                                // isLoading={false}
                                isLoading={paginated && actionLoading}
                                paginationProps={paginationProps}
                            >
                                <BootstrapTable
                                    id="tableContainer"
                                    wrapperClasses="table-responsive"
                                    bordered={true}
                                    headerClasses="text-primary"
                                    classes="table table-head-custom table-vertical-center"// overflow-hidden
                                    bootstrap4
                                    remote
                                    keyField={reducerInfo.idFieldName}
                                    data={entities === null ? [] : baseFilter(entities, uiProps.queryParams).entities.filter(dataFilter)}
                                    columns={columns}
                                    onTableChange={getHandlerTableChange(
                                        uiProps.setQueryParams
                                    )}
                                    // selectRow={getSelectRow({
                                    //     entities,
                                    //     ids: uiProps.ids,
                                    //     setIds: uiProps.setIds,
                                    //     idFieldName: reducerInfo.idFieldName
                                    // })}
                                    {...paginationTableProps}
                                    condensed
                                    noDataIndication={(<div className="text-center bg-light m-0 p-2">
                                        {
                                            listLoading
                                                ? <div><div className="spinner-border text-warning spinner-border-sm mx-2" role="status"><span className="sr-only">Loading...</span></div>Loading...</div>
                                                : "No Data Found"
                                        }
                                    </div>)}
                                    expandRow={onExpand ? {
                                        renderer: onExpand,
                                        showExpandColumn: true,
                                        expandByColumnOnly: true,
                                        className: 'bg-light p-4',
                                        expandHeaderColumnRenderer: ({ isAnyExpands }) => {
                                            if (isAnyExpands) {
                                                return (<div className="text-center px-2 svg-icon svg-icon-md svg-icon-dark">
                                                    <SVG src={toAbsoluteUrl("/media/svg/icons/Code/Minus.svg")} />
                                                </div>);
                                            }
                                            return (<div className="text-center px-2 svg-icon svg-icon-md svg-icon-dark">
                                                <SVG src={toAbsoluteUrl("/media/svg/icons/Code/Plus.svg")} />
                                            </div>);
                                        },
                                        expandColumnRenderer: ({ expanded }) => {
                                            if (expanded) {
                                                return (<div className="text-center px-2 svg-icon svg-icon-md svg-icon-dark">
                                                    <SVG src={toAbsoluteUrl("/media/svg/icons/Code/Minus.svg")} />
                                                </div>);
                                            }
                                            return (<div className="text-center px-2 svg-icon svg-icon-md svg-icon-dark">
                                                <SVG src={toAbsoluteUrl("/media/svg/icons/Code/Plus.svg")} />
                                            </div>);
                                        }
                                    } : undefined}
                                    selectRow={selectRow}
                                >
                                    
                                </BootstrapTable>
                                {message}
                            </Pagination>
                        )
                    }
                }
            </PaginationProvider>
        </>
    );
};
export default POSTable;