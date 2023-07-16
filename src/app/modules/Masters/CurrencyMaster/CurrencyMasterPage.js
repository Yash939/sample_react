import React from 'react';
import { CurrencyMasterUIProvider } from './CurrencyMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/CurrencyMasterRedux";
import CurrencyMasterCard from './CurrencyMasterCard';

const CurrencyMasterPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(`/settings/masters/currency/master/new`)
        },
        editRecordBtnClick: (id) => {
            history.push(`/settings/masters/currency/master/${id}/edit`);
        },
    }
    return (
        <CurrencyMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <CurrencyMasterCard/>
        </CurrencyMasterUIProvider>
    );
};

export default CurrencyMasterPage;