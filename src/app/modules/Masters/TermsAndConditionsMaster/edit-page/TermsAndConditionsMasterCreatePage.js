// src\app\modules\Masters\TermsAndConditionsMaster\edit-page\TermsAndConditionsMasterEditPage.js

import React from 'react';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { termsAndConditionsMasterActions, reducerInfo } from '../_redux/TermsAndConditionsMasterRedux';
import EditForm from './EditForm';

const TermsAndConditionsMasterEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="Terms and Conditions Master"
            backURL="/settings/masters/terms-and-conditions/master"
            actions={termsAndConditionsMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default TermsAndConditionsMasterEditPage;