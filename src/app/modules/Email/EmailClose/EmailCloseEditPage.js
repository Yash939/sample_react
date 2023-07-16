import React from 'react';
import CommonEditPage from "../../_commons/components/common-edit-page/CommonEditPage";
import { reducerInfo, operationalConfigMasterActions } from "../../Masters/OperationalConfig/_redux/OperationalConfigRedux";

import EditForm from './EditForm';

const EmailCloseEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="Email Close"
            actions={operationalConfigMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
            hiddenId={1}
        />
    );
};

export default EmailCloseEditPage;