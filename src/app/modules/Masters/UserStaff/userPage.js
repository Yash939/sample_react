import React from 'react';
import { Switch, Redirect } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import UserRolePage from './UserRole/UserRolePage';
import UserRoleEditPage from './UserRole/edit-page/UserRoleEditPage';
import UserMasterPage from './UserMaster/UserMasterPage';
import UserMasterEditPage from './UserMaster/edit-page/UserMasterEditPage';
import UserAuthorizationEditPage from './UserAuthorization/edit-page/UserAuthorizationEditPage';
import { USER, USER_AUTHORIZATION, USER_MASTER, 
        USER_MASTER_BULK_EDIT, 
        USER_MASTER_EDIT, USER_MASTER_NEW, USER_ROLE, USER_ROLE_EDIT, USER_ROLE_NEW } from './userRoutesConst';
import UserMasterBulkEditPage from './UserMaster/bulk-edit/UserMasterBulkEditPage';

const userPage = () => {
    return (
        <Switch>
            {/* Default Route */}
            <Redirect
                exact={true}
                from={USER}
                to={USER_MASTER}
            />

            {/* User Role */}
            <ContentRoute path={USER_ROLE} exact={true} component={UserRolePage} />
            <ContentRoute path={USER_ROLE_NEW} component={UserRoleEditPage} />
            <ContentRoute path={USER_ROLE_EDIT} component={UserRoleEditPage} />
            {/* User Master */}
            <ContentRoute path={USER_MASTER} exact={true} component={UserMasterPage} />
            <ContentRoute path={USER_MASTER_NEW} component={UserMasterEditPage} />
            <ContentRoute path={USER_MASTER_EDIT} component={UserMasterEditPage} />
            <ContentRoute path={USER_MASTER_BULK_EDIT} component={UserMasterBulkEditPage} />
            {/* User Authorization */}
            <ContentRoute path={USER_AUTHORIZATION} exact={true} component={UserAuthorizationEditPage} />
        </Switch>
    );
};

export default userPage;