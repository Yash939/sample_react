import React from 'react';
import { Switch, Redirect } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import CityMasterPage from './CityMasterPage';
import CityMasterEditPage from '../CityMaster/edit-page/CityMasterEditPage';
import CityMasterBulkEditPage from './bulk-edit/CityMasterBulkEditPage';
import CityMasterCreatePage from './edit-page/CityMasterCreatePage';

const cityPage = () => {
    return (
        <Switch>
            {/* Default Route */}
            <Redirect
                exact={true}
                from="/settings/masters/city"
                to="/settings/masters/city/master"
            />

            {/* City Master */}
            <ContentRoute path="/settings/masters/city/master" exact={true} component={CityMasterPage} />
            <ContentRoute path="/settings/masters/city/master/new" component={CityMasterCreatePage} />
            <ContentRoute path="/settings/masters/city/master/:id/edit" component={CityMasterEditPage} />
            <ContentRoute path="/settings/masters/city/master/bulk-edit" component={CityMasterBulkEditPage} />
        </Switch>
    );
};

export default cityPage;