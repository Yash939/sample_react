import React from 'react';
import { TaskPriorityMasterUIProvider } from './TaskPriorityMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/TaskPriorityMasterRedux";
import TaskPriorityMasterCard from './TaskPriorityMasterCard';

const TaskPriorityMasterPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(`/settings/masters/ticket-priority/master/new`)
        },
        editRecordBtnClick: (id) => {
            history.push(`/settings/masters/ticket-priority/master/${id}/edit`);
        },
    }
    return (
        <TaskPriorityMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <TaskPriorityMasterCard/>
        </TaskPriorityMasterUIProvider>
    );
};

export default TaskPriorityMasterPage;