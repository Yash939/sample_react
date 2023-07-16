import React from "react";
// import Multiselect from "multiselect-react-dropdown";
import Select from "react-select";

// const selectOptions = [
//     { value: 0, label: 'good' },
//     { value: 1, label: 'Bad' },
//     { value: 2, label: 'unknown' }
// ];

const selectOptions = [
    { value: "Assigned", label: 'Assigned' },
    { value: "Open", label: 'Open' },
    { value: "WIP", label: 'WIP' }
];

class ProductFilter extends React.Component {
    //   static propTypes = {
    //     column: PropTypes.object.isRequired,
    //     onFilter: PropTypes.func.isRequired
    //   }

    constructor(props) {
        super(props);
        this.filter = this.filter.bind(this);
    }

    filter(selectedList, selectedItem) {
        //debugger
        this.props.onFilter(
            selectedList ? selectedList.map(x => [x.value]) : []
        );
    }

    render() {
        return <Select
            options={selectOptions}
            onChange={this.filter}
            isMulti
        />;
    }

}

export default ProductFilter;
