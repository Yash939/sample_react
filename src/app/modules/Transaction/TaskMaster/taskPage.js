import React from 'react';
import { Switch } from "react-router-dom";
import { ContentRoute } from '../../../../_metronic/layout';
import TaskMasterPage from './TaskMasterPage';
import TaskMasterEditPage from '../TaskMaster/edit-page/TaskMasterEditPage';
import TaskMasterCreatePage from './create-page/TaskMasterCreatePage';
import { shallowEqual, useSelector } from 'react-redux';

const TaskPage = () => {

    const { moduleMasterState } = useSelector((state) =>
    ({
        moduleMasterState: state.moduleMaster
    }), shallowEqual)

    return (
        <Switch>
            {/* Task Master */}
            <ContentRoute path="/ticket" exact component={TaskMasterPage} />
            <ContentRoute
                path="/ticket"
                exact component={TaskMasterPage} />
            {moduleMasterState?.entities?.filter(x => x.moduleCode === "TASK_CREATION")?.length > 0 ?
                <ContentRoute path="/ticket/new" exact component={TaskMasterCreatePage} /> : null}
            <ContentRoute path="/ticket/:id/edit/:readonly?" exact component={TaskMasterEditPage} />
        </Switch>
    );
};

export default TaskPage;