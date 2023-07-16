import React from 'react';
import CommonEditPage from "../../../../_commons/components/common-edit-page/CommonEditPage";
import { reducerInfo, userAutorizationActions } from "../_redux/UserAuthorizationRedux";
import EditForm from './EditForm';

const UserAuthorizationEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="User Authorization"
            actions={userAutorizationActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default UserAuthorizationEditPage;