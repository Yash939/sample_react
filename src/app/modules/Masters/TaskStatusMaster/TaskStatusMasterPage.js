import React from 'react';
import { TaskStatusMasterUIProvider } from './TaskStatusMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/TaskStatusMasterRedux";
import TaskStatusMasterCard from './TaskStatusMasterCard';

const TaskStatusMasterPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(`/settings/masters/ticket-status/master/new`)
        },
        editRecordBtnClick: (id) => {
            history.push(`/settings/masters/ticket-status/master/${id}/edit`);
        },
    }
    return (
        <TaskStatusMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <TaskStatusMasterCard/>
        </TaskStatusMasterUIProvider>
    );
};

export default TaskStatusMasterPage;