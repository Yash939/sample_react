import React from 'react';
import { CityMasterUIProvider } from './CityMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/CityMasterRedux";
import CityMasterCard from './CityMasterCard';

const CityMasterPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(`/settings/masters/city/master/new`)
        },
        editRecordBtnClick: (id) => {
            history.push(`/settings/masters/city/master/${id}/edit`);
        },
    }
    return (
        <CityMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <CityMasterCard/>
        </CityMasterUIProvider>
    );
};

export default CityMasterPage;