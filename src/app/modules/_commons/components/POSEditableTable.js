import React, { useEffect, useMemo, useState } from "react";
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from "react-bootstrap-table2-editor";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";
import SVG from 'react-inlinesvg'

import paginationFactory, { PaginationProvider} from "react-bootstrap-table2-paginator";
import { Pagination } from '../../../../_metronic/_partials/controls';
import * as uiHelpers from "../UIHelper";
const POSEditableTable = ({
    dataFilter = (row) => true, customActions,
    uiContext,
    columns,
    data,
    addRowBtnHandler,
    deleteRowBtnHandler,
    reducerInfo,
    isLoading,
    noDataIndication = undefined,
    afterSaveCell,
    onExpand,
    rowStyle = undefined,
    selectRow = undefined
}) => {
    const [initialCount, setInitialCount] = useState((data ?? []).length)

    const [pageSize, setPageSize] = useState(uiHelpers.initialFilter.pageSize)
    const [startpage, setStartpage] = useState(uiHelpers.initialFilter.pageNumber)
    useEffect(() => {
        if (initialCount < data.length) {
            setInitialCount(data.length)
        }
    }, [data?.length])

    const getNewKeyField = () => {
        setInitialCount(initialCount + 1)
        return initialCount
    }
    const keyFieldColumn = {
        text: "Action",
        dataField: 'keyField',
        hidden: deleteRowBtnHandler && data?.length ? false : true,
        style: { width: '1%' },
        formatExtraData: data,
        formatter: (cellContent, row) => deleteRowBtnHandler ? <button title="Delete this row" onClick={() => deleteRowBtnHandler(cellContent, data)} type="button" className="btn mx-0 p-0"><i className="fa fa-trash m-0 px-2"></i></button> : cellContent
    }
    const bodyClassName = useMemo(() => {
        const date = new Date()
        return "pos-editable-table-body-" + date.getHours() + date.getMinutes() + date.getSeconds() + date.getMilliseconds()
    }, [])

    const paginationOptions = {
        custom: true,
        totalSize: data?.filter(dataFilter)?.length,
        sizePerPageList: uiHelpers.sizePerPageList,
        sizePerPage:pageSize,
        page:startpage,
    };
    return (
        <>
            {addRowBtnHandler && 
                <div style={{float:'right',paddingBottom:'10px'}}>
                    <button 
                        onClick={() => addRowBtnHandler(getNewKeyField(), data)} 
                        type="button" className="btn pinaple-yellow-btn col-xs-12" 
                        style={{ float: 'right' }}>+ Add</button>
                </div>
            }
            <div >
            <PaginationProvider pagination={paginationFactory(paginationOptions)}>
            {
                ({ paginationProps, paginationTableProps }) => {
                    setPageSize(paginationProps.sizePerPage)
                    setStartpage(paginationTableProps.page)
                    return (
                        <Pagination
                            isLoading={false}
                            paginationProps={paginationProps}
                        >
            <BootstrapTable
                { ...paginationTableProps }
                tabIndexCell
                wrapperClasses="table-responsive"
                bordered={true}
                classes="table table-vertical-center overflow-hidden mb-0"
                bodyClasses={bodyClassName}
                bootstrap4
                keyField="keyField"
                data={isLoading ? [] : data}
                columns={[...columns, keyFieldColumn].map(col => {
                    if (col?.editor && col.editor?.type && col.editor.type === "number")
                        return {
                            ...col,
                            editor: {
                                ...col.editor,
                                onFocus: (e) => e.target.select()
                            }
                        }
                    else
                        return col
                })}
                cellEdit={cellEditFactory(
                    {
                        mode: 'click',
                        blurToSave: true,
                        timeToCloseMessage: 2500,
                        afterSaveCell: afterSaveCell,
                        onStartEdit: (row, column, rowIndex, columnIndex) => {
                            const AllRows = document.getElementsByClassName(bodyClassName)[0].children
                            const currentRow = AllRows[rowIndex]
                            const currentCell = currentRow.children[columnIndex]
                            if (currentCell && currentCell.children.length) {
                                currentCell.children[0].addEventListener('keydown', (e) => {
                                    if (e.key === "Tab") {
                                        const nextEditablCellIndex = columns
                                            .map((x, i) => ({ ...x, index: i }))
                                            .filter(x => x.editable !== false)
                                            .find(x => x.index > columnIndex)?.index
                                        if (nextEditablCellIndex) {
                                            currentRow.children[nextEditablCellIndex].focus()
                                            currentRow.children[nextEditablCellIndex].click()
                                            e.preventDefault()
                                        } else {
                                            if ((rowIndex + 1) < AllRows.length) {
                                                const nextEditablCellIndex = columns
                                                    .map((x, i) => ({ ...x, index: i }))
                                                    .filter(x => x.editable !== false)
                                                    .find(x => x.index >= 0)?.index
                                                if (nextEditablCellIndex) {
                                                    AllRows[rowIndex + 1].children[nextEditablCellIndex].focus()
                                                    AllRows[rowIndex + 1].children[nextEditablCellIndex].click()
                                                    e.preventDefault()
                                                }
                                            }
                                        }
                                    }
                                })
                            }
                        }
                    })}
                condensed
                noDataIndication={isLoading ? <div className="text-center">Loading...</div> : noDataIndication}
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
                rowStyle={rowStyle}
                selectRow={selectRow}
            />
            </Pagination>
             ) }}
        </PaginationProvider>
            </div>
        </>
    );
};
export default POSEditableTable;