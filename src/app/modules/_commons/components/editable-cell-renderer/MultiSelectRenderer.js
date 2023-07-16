import React, { useState } from 'react';
import { Checkbox, List, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';


const MultiSelectRenderer = ({ props, cellValue, options }) => {

    if (typeof cellValue === 'number') {
        cellValue = cellValue > 0 ? [cellValue] : []
    }
    if(cellValue === null) {
        cellValue = []
    }

    const [selectedValues, setSelectedValues] = useState(cellValue)

    const getValue = () => {
        return selectedValues
    }

    const handleToggle = (value) => {
        
        if (selectedValues?.includes(value)) {
            setSelectedValues(selectedValues.filter(x => x !== value))
        } else {
            setSelectedValues([...selectedValues, value])
        }
    }

    return (
        
        <div>
            <List>
                {options?.[0].map(x => {
                    var value = x.value
                    var label = x.label

                    return (
                        <ListItem key={value} dense button onClick={() => handleToggle(value)}>
                            <ListItemIcon>
                                <Checkbox
                                    edge="start"
                                    checked={selectedValues?.includes(value)}
                                    disableRipple
                                />
                            </ListItemIcon>
                            <ListItemText primary={label} />
                        </ListItem>
                    );
                })}
            </List>
            <button
                key="submit"
                className="btn pinaple-yellow-btn col-xs-12"//"btn btn-default"
                onClick={() => props.onUpdate(getValue())}
            >
                Done
            </button>
        </div>
    )

    // return (
    //     <div>

    //     <select multiple onChange={(e) => handleChange(e) } defaultValue={selectedValues} style={{width:'30%',overflow:'auto'}} > 
    //         {
    //             options.map(x => <option value={x.value} key={x.value} >{x.label} </option>)
    //         }
    //     </select>
    //     {/* <Multiselect 
    //         options={options}
    //         selectedValues={cellValue}
    //         onSelect={(selectedList, selectedItem) => onSelect(selectedList, selectedItem)} // Function will trigger on select event
    //         onRemove={(e) => onRemove(e)} // Function will trigger on remove event
    //         displayValue="name"
    //     /> */}
    //     <button
    //         key="submit"
    //         className= "btn pinaple-yellow-btn col-xs-12"//"btn btn-default"
    //         onClick={ () => props.onUpdate(getValue()) }
    //     >
    //         done
    //     </button>
    //     </div>
    // );
};

export default MultiSelectRenderer;