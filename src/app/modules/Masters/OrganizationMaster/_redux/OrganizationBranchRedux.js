import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"
import { errorMessageFormatter, sortByStandard } from "../../../_commons/Utils"
import Axios from "axios"

export const reducerInfo = {
    name: "organizationBranch",
    idFieldName: 'id',
    initialEnitity: {
        ...baseInitialEntity,
        "branchName": "",
        "address": "",
        "zipCode": "",
        "countryMSTId": 0,
        "stateMSTId": 0,
        "cityMSTId": 0
    }
}

class Crud extends BaseCrud {

    getByOrganizationMSTId(id) {
        return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/byOrganization/" + id);
    }
}

class Actions extends BaseActions {

    getByOrganizationMSTId = (id) => dispatch => {
        dispatch(this.actions.recordsFetched({ totalCount: 0, entities: [] }))
        dispatch(this.actions.startCall({ callType: this.callTypes.list }))

        return this.requestFromServer
            .getByOrganizationMSTId(id)
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
                    userMessage: "Can't get by organization id all " + this.reducerName,
                    error: error
                }
                dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
            })
    }
}

export const organizationBranchCrud = new Crud("organizationBranchDTL")
export const organizationBranchSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const organizationBranchActions = new Actions(organizationBranchCrud, organizationBranchSlice)
