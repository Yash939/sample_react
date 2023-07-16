import React from 'react';
import { ProjectMasterUIProvider } from './ProjectMasterUIContext';
import ListLoadingDialog from '../../_commons/components/ListLoadingDialog';
import { reducerInfo } from "./_redux/ProjectMasterRedux";
import ProjectMasterCard from './ProjectMasterCard';

const ProjectMasterPage = ({ history }) => {

    const uiEvents = {
        newButtonClick: () => {
            history.push(`/project/new`)
        },
        editRecordBtnClick: (id) => {
            history.push(`/project/${id}/edit`);
        },
    }
    return (
        <ProjectMasterUIProvider uiEvents={uiEvents}>
            <ListLoadingDialog reducerName={reducerInfo.name} />
            <ProjectMasterCard />
        </ProjectMasterUIProvider>
    );
};

export default ProjectMasterPage;