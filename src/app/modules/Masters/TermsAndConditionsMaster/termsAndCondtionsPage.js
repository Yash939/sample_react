import React from 'react';
import { Switch, Redirect } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import TermsAndConditionsMasterPage from './TermsAndConditionsMasterPage';
import TermsAndConditionsMasterEditPage from './edit-page/TermsAndCondtionsMasterEditPage';
// import TermsAndConditionsMasterBulkEditPage from './bulk-edit/TermsAndConditionsMasterBulkEditPage';
import TermsAndConditionsMasterCreatePage from './edit-page/TermsAndConditionsMasterCreatePage';

const termsAndConditionsPage = () => {
    return (
        <Switch>
            {/* Default Route */}
            <Redirect
                exact={true}
                from="/settings/masters/terms-and-conditions"
                to="/settings/masters/terms-and-conditions/master"
            />

            {/* TermsAndConditions Master */}
            <ContentRoute path="/settings/masters/terms-and-conditions/master" exact={true} component={TermsAndConditionsMasterPage} />
            <ContentRoute path="/settings/masters/terms-and-conditions/master/new" component={TermsAndConditionsMasterCreatePage} />
            <ContentRoute path="/settings/masters/terms-and-conditions/master/:id/edit" component={TermsAndConditionsMasterEditPage} />
            
        </Switch>
    );
};

export default termsAndConditionsPage;