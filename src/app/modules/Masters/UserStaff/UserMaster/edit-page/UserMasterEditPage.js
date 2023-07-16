import React from 'react';
import CommonEditPage from "../../../../_commons/components/common-edit-page/CommonEditPage";
import { USER_MASTER } from '../../userRoutesConst';
import { reducerInfo,userMasterActions } from "../_redux/UserMasterRedux";
import EditForm from './EditForm';

const UserMasterEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="User"
            backURL={USER_MASTER}
            actions={userMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default UserMasterEditPage;