import React from 'react';
import { OrganizationMasterUIProvider } from './OrganizationMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/OrganizationMasterRedux";
import OrganizationMasterCard from './OrganizationMasterCard';

const OrganizationMasterPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(`/customer/new`)
        },
        editRecordBtnClick: (id) => {
            history.push(`/customer/${id}/edit`);
        },
    }
    return (
        <OrganizationMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <OrganizationMasterCard/>
        </OrganizationMasterUIProvider>
    );
};

export default OrganizationMasterPage;