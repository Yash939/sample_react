import React from 'react';
import { Switch } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import OrganizationMasterPage from './OrganizationMasterPage';
import OrganizationMasterEditPage from '../OrganizationMaster/edit-page/OrganizationMasterEditPage';
import OrganizationMasterBulkEditPage from './bulk-edit/OrganizationMasterBulkEditPage';
import OrganizationMasterCreatePage from './edit-page/OrganizationMasterCreatePage';

const organizationPage = () => {
    return (
        <Switch>

            {/* Organization Master */}
            <ContentRoute path="/customer" exact={true} component={OrganizationMasterPage} />
            <ContentRoute path="/customer/new" component={OrganizationMasterCreatePage} />
            <ContentRoute path="/customer/:id/edit" component={OrganizationMasterEditPage} />
            <ContentRoute path="/customer/bulk-edit" component={OrganizationMasterBulkEditPage} />
        </Switch>
    );
};

export default organizationPage;