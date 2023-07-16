import React from 'react';
import { useLocation } from 'react-router-dom';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { projectMasterActions, reducerInfo } from '../_redux/ProjectMasterRedux';
import EditForm from './EditForm';

const ProjectMasterCreatePage = () => {


    const pathname = useLocation().pathname

    return (
        <CommonEditPage
            sufixTitle="Project"
            actions={projectMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
            goBack
            backURL="/project"
        />
    );
};

export default ProjectMasterCreatePage;