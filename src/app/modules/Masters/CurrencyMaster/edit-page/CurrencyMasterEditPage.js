import React from 'react';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { currencyMasterActions, reducerInfo } from '../_redux/CurrencyMasterRedux';
import EditForm from './EditForm';

const CurrencyMasterEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="Currency Master"
            backURL="/settings/masters/currency/master"
            actions={currencyMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default CurrencyMasterEditPage;