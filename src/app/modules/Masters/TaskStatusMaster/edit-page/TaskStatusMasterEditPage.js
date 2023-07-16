import React from 'react';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { taskStatusMasterActions, reducerInfo } from '../_redux/TaskStatusMasterRedux';
import EditForm from './EditForm';

const TaskStatusMasterEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="Ticket Status Master"
            backURL="/settings/masters/ticket-status/master"
            actions={taskStatusMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default TaskStatusMasterEditPage;