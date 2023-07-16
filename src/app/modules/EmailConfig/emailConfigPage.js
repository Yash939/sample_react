import React from 'react';
import { Switch } from "react-router-dom";
import { ContentRoute } from '../../../_metronic/layout';
import EmailConfigEditPage from './EmailConfigEditPage';

const emailConfigPage = () => {
    return (
        <Switch>
            <ContentRoute path="/config/email-config" exact component={EmailConfigEditPage} />
        </Switch>
    );
};

export default emailConfigPage;