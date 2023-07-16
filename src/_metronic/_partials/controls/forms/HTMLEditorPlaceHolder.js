import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { EditorState, Modifier } from 'draft-js';
import './HTMLEditorPlaceHolder.css'

class HTMLEditorPlaceHolder extends Component {
    static propTypes = {
        onChange: PropTypes.func,
        editorState: PropTypes.object,
    }

    state = {
        open: false
    }

    openPlaceholderDropdown = () => this.setState({ open: !this.state.open })

    addPlaceholder = (placeholder) => {
        const { editorState, onChange } = this.props;
        const contentState = Modifier.replaceText(
            editorState.getCurrentContent(),
            editorState.getSelection(),
            placeholder,
            editorState.getCurrentInlineStyle(),
        );
        onChange(EditorState.push(editorState, contentState, 'insert-characters'));
    }

    placeholderOptions = [
        { key: 'id', value: '{id}', text: 'ID' },
        { key: 'createdOn', value: '{createdOn}', text: 'Created On' },
        { key: 'code', value: '{code}', text: 'Ticket Code' },
        { key: 'type', value: '{type}', text: 'Ticket Type' },
        { key: 'status', value: '{status}', text: 'Ticket Status' },
        { key: 'priority', value: '{priority}', text: 'Ticket Priority' },
        { key: 'customer', value: '{customer}', text: 'Customer' },
        { key: 'customerBranch', value: '{customerBranch}', text: 'Customer Branch' },
        { key: 'endCustomer', value: '{endCustomer}', text: 'End Customer' },
        { key: 'requestedBy', value: '{requestedBy}', text: 'Requested By' },
        { key: 'project', value: '{project}', text: 'Project' },
        { key: 'reference_1', value: '{reference_1}', text: 'Reference1' },
        { key: 'reference_2', value: '{reference_2}', text: 'Reference2' },
        { key: 'city', value: '{city}', text: 'City' },
        { key: 'state', value: '{state}', text: 'State' },
        { key: 'country', value: '{country}', text: 'Country' },
        { key: 'localContactName', value: '{localContactName}', text: 'Local Conatct Name' },
        { key: 'localContactPhone', value: '{localContactPhone}', text: 'Local Conatct Phone' },
        { key: 'planDateTime', value: '{planDateTime}', text: 'Plan Date - Time' },
        { key: 'dueDateTime', value: '{dueDateTime}', text: 'Due Date - Time' },
        { key: 'assignedEngineer', value: '{assignedEngineer}', text: 'Assigned Engineer' },
        { key: 'co_ordinator', value: '{co_ordinator}', text: 'Project Co-ordinator' },
        { key: 'manager', value: '{manager}', text: 'Project Manager' },
        { key: 'summary', value: '{summary}', text: 'Summary' },
        { key: 'notes', value: '{notes}', text: 'Notes' },
        { key: 'startDateTime', value: '{startDateTime}', text: 'Start Date - Time' },
        { key: 'endDateTime', value: '{endDateTime}', text: 'End Date - Time' },
        { key: 'customerStartDateTime', value: '{customerStartDateTime}', text: 'Customer Start Date - Time' },
        { key: 'customerEndDateTime', value: '{customerEndDateTime}', text: 'Customer End Date - Time' },
    ]

    listItem = this.placeholderOptions.map(item => (
        <li
            onClick={this.addPlaceholder.bind(this, item.value)}
            key={item.key}
            className="rdw-dropdownoption-default placeholder-li"
            style={{whiteSpace: 'nowrap'}}
        >{item.text}</li>
    ))

    render() {
        return (
            <div onClick={this.openPlaceholderDropdown} className="rdw-block-wrapper" aria-label="rdw-block-control" /* onMouseOut={() =>this.setState({ open: false })} */>
                <div className="rdw-dropdown-wrapper rdw-block-dropdown" aria-label="rdw-dropdown"  style={{width: '200px'}}>
                    <div className="rdw-dropdown-selectedtext" title="Placeholders">
                        <span>Placeholder</span>
                        <div className={`rdw-dropdown-caretto${this.state.open ? "close" : "open"}`}></div>
                    </div>
                    <ul className={`rdw-dropdown-optionwrapper ${this.state.open ? "" : "placeholder-ul"}`} /* onMouseOut={() =>this.setState({ open: false })} */>
                        {this.listItem}
                    </ul>
                </div>
            </div>
        );
    }
}

export default HTMLEditorPlaceHolder;