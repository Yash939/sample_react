import React from 'react';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { cityMasterActions, reducerInfo } from '../_redux/CityMasterRedux';
import EditForm from './EditForm';

const CityMasterEditPage = () => {

    return (
        <CommonEditPage
            sufixTitle="City Master"
            backURL="/settings/masters/city/master"
            actions={cityMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
        />
    );
};

export default CityMasterEditPage;