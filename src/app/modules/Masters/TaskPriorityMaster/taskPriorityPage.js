import React from 'react';
import { Switch, Redirect } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import TaskPriorityMasterPage from './TaskPriorityMasterPage';
import TaskPriorityMasterEditPage from '../TaskPriorityMaster/edit-page/TaskPriorityMasterEditPage';

const taskPriorityPage = () => {
    return (
        <Switch>
            {/* Default Route */}
            <Redirect
                exact={true}
                from="/settings/masters/ticket-priority"
                to="/settings/masters/ticket-priority/master"
            />

            {/* TaskPriority Master */}
            <ContentRoute path="/settings/masters/ticket-priority/master" exact={true} component={TaskPriorityMasterPage} />
            <ContentRoute path="/settings/masters/ticket-priority/master/new" component={TaskPriorityMasterEditPage} />
            <ContentRoute path="/settings/masters/ticket-priority/master/:id/edit" component={TaskPriorityMasterEditPage} />
        </Switch>
    );
};

export default taskPriorityPage;