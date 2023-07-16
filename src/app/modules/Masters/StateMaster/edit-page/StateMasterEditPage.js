import React from 'react';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { reducerInfo, stateMasterActions } from '../_redux/StateMasterRedux';
import EditForm from './EditForm';

const StateMasterEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="State Master"
            backURL="/settings/masters/state/master"
            actions={stateMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default StateMasterEditPage;