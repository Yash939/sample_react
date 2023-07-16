import React from 'react';
import { TaskMasterUIProvider } from './TaskMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/TaskMasterRedux";
import TaskMasterCard from './TaskMasterCard';

const TaskMasterPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(`/ticket/new`)
        },
        editRecordBtnClick: (id, values) => {
            history.push({
                pathname: `/ticket/${id}/edit`,
                state: values
            });
        },
    }
    return (
        <TaskMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <TaskMasterCard />
        </TaskMasterUIProvider>
    );
};

export default TaskMasterPage;