// please be familiar with react-bootstrap-table-next column formaters
// https://react-bootstrap-table.github.io/react-bootstrap-table2/storybook/index.html?selectedKind=Work%20on%20Columns&selectedStory=Column%20Formatter&full=0&addons=1&stories=1&panelRight=0&addonPanel=storybook%2Factions%2Factions-panel
import React from "react";

export function AmPmTimeColumnFormatter(cellContent) {
    if (!cellContent)
        return ""
    const [hh, mm, ss] = cellContent?.split(":")
    if (!hh)
        return cellContent
    if (parseInt(hh) > 12)
        return (parseInt(hh) - 12) + ':' + mm + ' PM'
    else
        return hh + ':' + mm + ' AM'

}
