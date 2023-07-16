import React, { useEffect, useMemo, useState } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import { toAbsoluteUrl } from '../../../../../_metronic/_helpers';
import SVG from "react-inlinesvg";
import { baseFilter, emailData, exportToCsv, searchInArray } from '../../Utils';


const CommonReportTable = (props) => {
    const [searchText, setSearchText] = useState("")

    const cols = useMemo(() => {
        const rowHeaderStyle = { fontWeight: 'bold', backgroundColor: "#f4f4f4", whiteSpace: "nowrap" }
        return props.cols.map((col, colIndex) => {
            const text = col.includes(":") ? col.split(":")[0] : col
            const dataField = col.includes(":") ? col.split(":")[1] : col
            return {
                dataField: dataField,
                text: text,
                style: (cell, row) => {
                    return {
                        ...(row.__style ?? {}),
                        ...(row.__isHeader ? rowHeaderStyle : {}),
                        ...colIndex === 0 && row.__isHeader ? { position: 'sticky', left: '0' } : {}
                    }
                },
                footer: props.footer ? props.footer[dataField] ?? "" : undefined,
                footerStyle: { backgroundColor: "#f9f9f9" }
            }
        });
    }, [props.cols])
    const rows = useMemo(() => {
        if (!Array.isArray(props.rows))
            return []
        try {
            let rTmp = props.rows?.map((x, i) => ({ ...x, keyField: i })) ?? []
            let qObj = {}
            if (searchText)
                cols.forEach(col => {
                    qObj[col.dataField] = searchText
                });
            return searchInArray(rTmp, qObj, [])
        } catch (error) {
            console.log(error)
            //debugger
            return []
        }
    }, [props.rows, searchText, cols])

    return (
        <div>
            <hr />
            <div className="row mb-2">
                <div className="col-lg-12">
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <div className="input-group-text">
                                <span className="svg-icon svg-icon-md svg-icon-dark">
                                    <SVG
                                        src={toAbsoluteUrl(
                                            "/media/svg/icons/General/Search.svg"
                                        )}
                                    />
                                </span>
                            </div>
                        </div>
                        <input
                            type="text"
                            className="form-control"
                            name="searchText"
                            placeholder="Search in all fields"
                            values={searchText}
                            onChange={(e) => {
                                setSearchText(e.target.value)
                            }}
                        />
                    </div>
                    {/* <small className="form-text text-muted">
                                        <b>Search</b> in all fields
                                    </small> */}
                </div>
            </div>
            <BootstrapTable
                keyField="keyField"
                columns={cols}
                data={rows}
                noDataIndication={<div className="text-center bg-light p-2">No Records Found</div>}
                style={{ backgroundColor: "#000" }}
            // rowStyle={({ keyField }) => keyField % 2 === 0 ? {backgroundColor:"#fff"} : {backgroundColor:"#f8f8f8"}}
            />
            {props.btnRefs.csvBtnRef ? (
                <button
                    type="button"
                    style={{ display: "none" }}
                    ref={props.btnRefs.csvBtnRef}
                    onClick={() => exportToCsv(cols, rows)}
                />
            ) : null}
            {props.btnRefs.emailBtnRef ? (
                <button
                    type="button"
                    style={{ display: "none" }}
                    ref={props.btnRefs.emailBtnRef}
                    onClick={() => emailData(cols, rows)}
                />
            ) : null}
        </div>
    );
};

export default CommonReportTable;