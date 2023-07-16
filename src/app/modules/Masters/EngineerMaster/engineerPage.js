import React from 'react';
import { Switch, Redirect } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import EngineerMasterPage from './EngineerMasterPage';
import EngineerMasterEditPage from '../EngineerMaster/edit-page/EngineerMasterEditPage';
import EngineerMasterBulkEditPage from './bulk-edit/EngineerMasterBulkEditPage';
import EngineerMasterCreatePage from './edit-page/EngineerMasterCreatePage';

const engineerPage = () => {
    return (
        <Switch>

            {/* Engineer Master */}
            <ContentRoute path="/engineer" exact={true} component={EngineerMasterPage} />
            <ContentRoute path="/engineer/new/:ispopup?" exact component={EngineerMasterCreatePage} />
            <ContentRoute path="/engineer/:id/edit" exact component={EngineerMasterEditPage} />
            <ContentRoute path="/engineer/bulk-edit" exact component={EngineerMasterBulkEditPage} />
        </Switch>
    );
};

export default engineerPage;