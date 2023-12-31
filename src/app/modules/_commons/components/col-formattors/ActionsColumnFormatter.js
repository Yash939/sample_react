// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React from "react";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";

export function ActionsColumnFormatter(
  cellContent,
  row,
  rowIndex,
  { openEditPage, idFieldName }
) {
  return (
    <a
      title="Edit this record"
      className="btn btn-icon btn-light btn-hover-warning btn-sm mx-3"
      onClick={() => openEditPage(row[idFieldName])}
    >
      <span className="svg-icon svg-icon-md svg-icon-dark">
        <SVG
          src={toAbsoluteUrl("/media/svg/icons/Communication/Write.svg")}
          title='Edit'
        />
      </span>
    </a>
  );
}
