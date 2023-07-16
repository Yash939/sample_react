import React from 'react';
import { Switch, Redirect } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import TaskStatusMasterPage from './TaskStatusMasterPage';
import TaskStatusMasterEditPage from '../TaskStatusMaster/edit-page/TaskStatusMasterEditPage';

const taskStatusPage = () => {
    return (
        <Switch>
            {/* Default Route */}
            <Redirect
                exact={true}
                from="/settings/masters/ticket-status"
                to="/settings/masters/ticket-status/master"
            />

            {/* TaskStatus Master */}
            <ContentRoute path="/settings/masters/ticket-status/master" exact={true} component={TaskStatusMasterPage} />
            <ContentRoute path="/settings/masters/ticket-status/master/new" component={TaskStatusMasterEditPage} />
            <ContentRoute path="/settings/masters/ticket-status/master/:id/edit" component={TaskStatusMasterEditPage} />
        </Switch>
    );
};

export default taskStatusPage;