import React from 'react';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { countryMasterActions, reducerInfo } from '../_redux/CountryMasterRedux';
import EditForm from './EditForm';

const CountryMasterEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="Country Master"
            backURL="/settings/masters/country/master"
            actions={countryMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default CountryMasterEditPage;