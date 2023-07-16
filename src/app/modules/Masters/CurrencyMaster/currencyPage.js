import React from 'react';
import { Switch, Redirect } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import CurrencyMasterPage from './CurrencyMasterPage';
import CurrencyMasterEditPage from '../CurrencyMaster/edit-page/CurrencyMasterEditPage';
import CurrencyMasterBulkEditPage from './bulk-edit/CurrencyMasterBulkEditPage';

const currencyPage = () => {
    return (
        <Switch>
            {/* Default Route */}
            <Redirect
                exact={true}
                from="/settings/masters/currency"
                to="/settings/masters/currency/master"
            />

            {/* Currency Master */}
            <ContentRoute path="/settings/masters/currency/master" exact={true} component={CurrencyMasterPage} />
            <ContentRoute path="/settings/masters/currency/master/new" component={CurrencyMasterEditPage} />
            <ContentRoute path="/settings/masters/currency/master/:id/edit" component={CurrencyMasterEditPage} />
            <ContentRoute path="/settings/masters/currency/master/bulk-edit" component={CurrencyMasterBulkEditPage} />
        </Switch>
    );
};

export default currencyPage;