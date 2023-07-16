import React from 'react';
import { ActivityLogsUIProvider } from './ActivityLogsUIContext';
import ListLoadingDialog from '../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/ActivityLogsRedux";
import ActivityLogsCard from './ActivityLogsCard';

const ActivityLogsPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(`/masters/city/master/new`)
        },
        editRecordBtnClick: (id) => {
            history.push(`/masters/city/master/${id}/edit`);
        },
    }
    return (
        <ActivityLogsUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <ActivityLogsCard/>
        </ActivityLogsUIProvider>
    );
};

export default ActivityLogsPage;