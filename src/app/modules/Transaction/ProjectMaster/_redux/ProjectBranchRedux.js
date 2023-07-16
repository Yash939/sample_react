import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"
import { errorMessageFormatter, sortByStandard } from "../../../_commons/Utils"
import Axios from "axios"

export const reducerInfo = {
    name: "projectBranch",
    idFieldName: 'id',
    initialEnitity: {
        ...baseInitialEntity,
        "branchName": "",
        "address": "",
        "zipCode": "",
        "countryMSTId": 0,
        "stateMSTId": 0,
        "cityMSTId": 0,
        "contactName": "",
        "contactNumber": "",
        "email": "",
        "selected": false
    }
}

class Crud extends BaseCrud {

    getByProjectMSTId(id) {
        return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/byProject/" + id);
    }
}

class Actions extends BaseActions {

    getByProjectMSTId = (id) => dispatch => {
        dispatch(this.actions.recordsFetched({ totalCount: 0, entities: [] }))
        dispatch(this.actions.startCall({ callType: this.callTypes.list }))

        return this.requestFromServer
            .getByProjectMSTId(id)
            .then(res => {
                if (res?.data?.status) {
                    const entities = sortByStandard(res.data.data ?? [])
                    const totalCount = entities.length ?? 0
                    dispatch(this.actions.recordsFetched({ totalCount, entities }))
                } else {
                    const err = {
                        userMessage: errorMessageFormatter(res.data),
                        error: res.data
                    }
                    dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
                }
            })
            .catch(error => {
                const err = {
                    userMessage: "Can't get by project id all " + this.reducerName,
                    error: error
                }
                dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
            })
    }
}

export const projectBranchCrud = new Crud("projectBranchDTL")
export const projectBranchSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const projectBranchActions = new Actions(projectBranchCrud, projectBranchSlice)
