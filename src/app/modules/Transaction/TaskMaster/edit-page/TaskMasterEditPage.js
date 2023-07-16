import React from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import CommonEditPage from "../../../_commons/components/common-edit-page/CommonEditPage";
import { taskMasterActions, reducerInfo } from '../_redux/TaskMasterRedux';
import EditForm from './EditForm';

const TaskMasterEditPage = () => {

    const history = useHistory()
    const location = useLocation()

    const historyLogic = () => {
        if(location?.state?.prevPath) {
            let search=""
            let path = ""
            if(location.state.prevPath.includes("?")) {
                const arry = location.state.prevPath.split("?")
                path = arry[0]
                search = arry[1]
            } else {
                path = location.state.prevPath
            }
            history.push({
                pathname: path,
                state: location.state,
                search: search
            });
        } else {
            history.goBack()
        }
    }

    return (
        <CommonEditPage
            sufixTitle="Ticket"
            backURL="/ticket?filter=Main"
            actions={taskMasterActions}
            reducerInfo={reducerInfo}
            EditForm={EditForm}
            goBack
            showReset={false}
            showSave={false}
            customBack={() => {
                if(history?.action === "POP") {
                    if(location?.state?.prevPath) {
                        historyLogic()
                    } else {
                        history.push("/ticket?filter=Main")
                    }
                } else {
                    historyLogic()
                }
            }}
        />
    );
};

export default TaskMasterEditPage;