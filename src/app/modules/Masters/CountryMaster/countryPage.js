import React from 'react';
import { Switch, Redirect } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import CountryMasterPage from './CountryMasterPage';
import CountryMasterEditPage from '../CountryMaster/edit-page/CountryMasterEditPage';
import CountryMasterBulkEditPage from './bulk-edit/CountryMasterBulkEditPage';

const countryPage = () => {
    return (
        <Switch>
            {/* Default Route */}
            <Redirect
                exact={true}
                from="/settings/masters/country"
                to="/settings/masters/country/master"
            />

            {/* Country Master */}
            <ContentRoute path="/settings/masters/country/master" exact={true} component={CountryMasterPage} />
            <ContentRoute path="/settings/masters/country/master/new" component={CountryMasterEditPage} />
            <ContentRoute path="/settings/masters/country/master/:id/edit" component={CountryMasterEditPage} />
            <ContentRoute path="/settings/masters/country/master/bulk-edit" component={CountryMasterBulkEditPage} />
        </Switch>
    );
};

export default countryPage;