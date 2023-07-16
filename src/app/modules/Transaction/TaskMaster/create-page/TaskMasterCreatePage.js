import React from 'react';
import { toAbsoluteUrl } from '../../../../../_metronic/_helpers';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { taskMasterActions, reducerInfo } from '../_redux/TaskMasterRedux';
import CreateForm from './CreateForm';
import SVG from 'react-inlinesvg'

const TaskMasterCreatePage = () => {

    return (
        <CommonEditPage
            sufixTitle="Ticket"
            backURL="/ticket?filter=Main"
            actions={taskMasterActions}
            reducerInfo={reducerInfo}
            EditForm={CreateForm}
            goBack
            saveButtonIcon={<span className="svv b-icon svg-icon-md svg-icon-dark">
            <SVG src={toAbsoluteUrl("/media/svg/icons/Code/Plus.svg")} />
        </span>}
            saveButtonName='Create'
        />
    );
};

export default TaskMasterCreatePage;