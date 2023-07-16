import React from 'react';
import { Switch, Redirect } from "react-router-dom";
import { ContentRoute } from '../../../_metronic/layout';
import ActivityLogsPage from './ActivityLogsPage';
import ProjectHistoryPage from './edit-page/ProjectHistoryPage';

const activityPage = () => {
    return (
        <Switch>
            <ContentRoute path="/activity-logs" exact={true} component={ActivityLogsPage} />
            <ContentRoute path="/activity-logs/project-history/:id" exact={true} component={ProjectHistoryPage} />
        </Switch>
    );
};

export default activityPage;