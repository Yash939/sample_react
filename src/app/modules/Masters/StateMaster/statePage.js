import React from 'react';
import { Switch, Redirect } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import StateMasterPage from './StateMasterPage';
import StateMasterEditPage from '../StateMaster/edit-page/StateMasterEditPage';
import StateMasterBulkEditPage from './bulk-edit/StateMasterBulkEditPage';

const statePage = () => {
    return (
        <Switch>
            {/* Default Route */}
            <Redirect
                exact={true}
                from="/settings/masters/state"
                to="/settings/masters/state/master"
            />

            {/* State Master */}
            <ContentRoute path="/settings/masters/state/master" exact={true} component={StateMasterPage} />
            <ContentRoute path="/settings/masters/state/master/new" component={StateMasterEditPage} />
            <ContentRoute path="/settings/masters/state/master/:id/edit" component={StateMasterEditPage} />
            <ContentRoute path="/settings/masters/state/master/bulk-edit" component={StateMasterBulkEditPage} />
        </Switch>
    );
};

export default statePage;