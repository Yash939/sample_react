import React from 'react';
import { StateMasterUIProvider } from './StateMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/StateMasterRedux";
import StateMasterCard from './StateMasterCard';

const StateMasterPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(`/settings/masters/state/master/new`)
        },
        editRecordBtnClick: (id) => {
            history.push(`/settings/masters/state/master/${id}/edit`);
        },
    }
    return (
        <StateMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <StateMasterCard/>
        </StateMasterUIProvider>
    );
};

export default StateMasterPage;