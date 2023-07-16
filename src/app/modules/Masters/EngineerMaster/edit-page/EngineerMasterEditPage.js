import React from 'react';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { engineerMasterActions, reducerInfo } from '../_redux/EngineerMasterRedux';
import EditForm from './EditForm';

const EngineerMasterEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="Engineer"
            backURL="/engineer"
            actions={engineerMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default EngineerMasterEditPage;