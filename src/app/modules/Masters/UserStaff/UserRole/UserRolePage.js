import React from 'react';
import { UserRoleUIProvider } from './UserRoleUIContext';
import ListLoadingDialog from '../../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/UserRoleRedux";
import UserRoleCard from './UserRoleCard';
import { USER_ROLE, USER_ROLE_NEW } from '../userRoutesConst';

const UserRolePage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(USER_ROLE_NEW)
        },
        editRecordBtnClick: (id) => {
            history.push(USER_ROLE+`/${id}/edit`);
        },
    }
    return (
        <UserRoleUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <UserRoleCard />
        </UserRoleUIProvider>
    );
};

export default UserRolePage;