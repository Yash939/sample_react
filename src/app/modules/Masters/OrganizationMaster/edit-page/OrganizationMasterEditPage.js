import React from 'react';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { organizationMasterActions, reducerInfo } from '../_redux/OrganizationMasterRedux';
import EditForm from './EditForm';

const OrganizationMasterEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="Customer Master"
            backURL="/customer"
            actions={organizationMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default OrganizationMasterEditPage;