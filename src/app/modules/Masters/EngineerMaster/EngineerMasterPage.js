import React from 'react';
import { EngineerMasterUIProvider } from './EngineerMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/EngineerMasterRedux";
import EngineerMasterCard from './EngineerMasterCard';

const EngineerMasterPage = ({ history }) => {
    const uiEvents = {
        newButtonClick: () => {
            history.push(`/engineer/new`)
        },
        editRecordBtnClick: (id) => {
            history.push(`/engineer/${id}/edit`);
        },
    }
    return (
        <EngineerMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <EngineerMasterCard/>
        </EngineerMasterUIProvider>
    );
};

export default EngineerMasterPage;