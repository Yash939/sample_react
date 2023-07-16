import React from 'react';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { taskPriorityMasterActions, reducerInfo } from '../_redux/TaskPriorityMasterRedux';
import EditForm from './EditForm';

const TaskPriorityMasterEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="Ticket Priority Master"
            backURL="/settings/masters/ticket-priority/master"
            actions={taskPriorityMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default TaskPriorityMasterEditPage;