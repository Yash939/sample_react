import React from 'react';
import { Switch } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import ProjectMasterPage from './ProjectMasterPage';
import ProjectMasterEditPage from '../ProjectMaster/edit-page/ProjectMasterEditPage';
import ProjectMasterCreatePage from './edit-page/ProjectMasterCreatePage';

const projectPage = () => {
    return (
        <Switch>
            Default Route
            
            {/* Project Master */}
            {/* /:fromDashboard? */}
            <ContentRoute path={["/project","/project/fromDashboard"]} exact component={ProjectMasterPage} />
            <ContentRoute path={["/project/new","/project/fromDashboard/new"]} exact component={ProjectMasterCreatePage} />
            <ContentRoute path="/project/:id/edit" exact component={ProjectMasterEditPage} />
        </Switch>
    );
};

export default projectPage;