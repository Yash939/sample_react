import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"
import Axios from "axios"
import { errorMessageFormatter, sortByStandard } from "../../../_commons/Utils"

export const reducerInfo = {
  name: "taskDetail",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    taskMSTId: null,
    notes: "",
    statusMSTId: 0,
    taskUserId: null,
    taskReassignedId: null,
    startDateTime: null,
    endDateTime: null,
    actualRbh: 0,
    actualObh: 0,
    actualAbh: 0,
    travelCharges: 0,
    materialCharges: 0,
    parkingCharges: 0,
    otherCharges: 0,
    remarks: "",
    attachment: "",
    travelChargesPayIn: 0,
    materialChargesPayIn: 0,
    parkingChargesPayIn: 0,
    otherChargesPayIn: 0,
  }
}

class Crud extends BaseCrud {
    getByTaskMSTId(id) {
        return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/master/" + id);
    }
}

class Actions extends BaseActions {

    getByTaskMSTId = (id) => dispatch => {
        dispatch(this.actions.recordsFetched({ totalCount: 0, entities: [] }))
        dispatch(this.actions.startCall({ callType: this.callTypes.list }))

        return this.requestFromServer
            .getByTaskMSTId(id)
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
                    userMessage: "Can't get by task master id " + this.reducerName,
                    error: error
                }
                dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
            })
    }

    uploadAttachment = (id, file, path = '') => dispatch => {
        dispatch(this.actions.startCall({ callType: this.callTypes.action }));
        return this.requestFromServer
            .uploadFile(id, file, path = '')
            .then(response => {
                dispatch(this.actions.recordUpdated({ response }));
                return Promise.resolve(response)
            })
            .catch(error => {
                const err = {
                    userMessage: `Can't upload file ` + this.reducerName,
                    error: error
                }
                dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }));
                return Promise.reject(err)
            });
    };
}

export const taskDetailCrud = new Crud("taskDTL")
export const taskDetailSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const taskDetailActions = new Actions(taskDetailCrud, taskDetailSlice)
