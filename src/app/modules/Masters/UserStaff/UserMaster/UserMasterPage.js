import React from 'react';
import { UserMasterUIProvider } from './UserMasterUIContext';
import ListLoadingDialog from '../../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/UserMasterRedux";
import UserMasterCard from './UserMasterCard';
import { USER_MASTER, USER_MASTER_NEW } from '../userRoutesConst';

const UserMasterPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(USER_MASTER_NEW)
        },
        editRecordBtnClick: (id) => {
            history.push(USER_MASTER+`/${id}/edit`);
        },
    }
    return (
        <UserMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <UserMasterCard />
        </UserMasterUIProvider>
    );
};

export default UserMasterPage;