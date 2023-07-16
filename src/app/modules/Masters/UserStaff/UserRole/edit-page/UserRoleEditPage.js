import React from 'react';
import CommonEditPage from "../../../../_commons/components/common-edit-page/CommonEditPage";
import { reducerInfo, userRoleActions } from "../_redux/UserRoleRedux";
import EditForm from './EditForm';

const UserRoleEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="User Role"
            backURL="/settings/masters/user/role"
            actions={userRoleActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default UserRoleEditPage;