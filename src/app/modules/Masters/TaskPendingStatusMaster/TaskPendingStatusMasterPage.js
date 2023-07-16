import React from 'react';
import { CountryMasterUIProvider } from './CountryMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/CountryMasterRedux";
import CountryMasterCard from './CountryMasterCard';

const CountryMasterPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(`/settings/masters/country/master/new`)
        },
        editRecordBtnClick: (id) => {
            history.push(`/settings/masters/country/master/${id}/edit`);
        },
    }
    return (
        <CountryMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <CountryMasterCard/>
        </CountryMasterUIProvider>
    );
};

export default CountryMasterPage;