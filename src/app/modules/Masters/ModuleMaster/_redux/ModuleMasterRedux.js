import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseIntialEntity from "../../../_reduxBase/BaseIntialEntity"
import Axios from "axios"
import { sortArray } from "../../../_commons/Utils"

export const reducerInfo = {
  name: "moduleMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseIntialEntity,
    "documentSeriesRequired": true,
    "moduleCode": "",
    "moduleName": "",
    "parentModuleId": 0,
    "parentModuleMST": {},
    "path": "",
    "pinRequired": 0,
    "sortOrder": 0,
    "systemMST": {},
    "systemMSTId": 0
  }
}

class Crud extends BaseCrud {
  getByRole() {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/byRole/");
  }
}

class Action extends BaseActions {
  getByRole = () => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getByRole()
      .then(res => {
        const entities = sortArray(res.data.data ?? [], 'sortOrder')
        const totalCount = entities.length ?? 0
        dispatch(this.actions.recordsFetched({ totalCount, entities }))
      })
      .catch(error => {
        const err = {
          userMessage: "Can't get by role " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  }
}

export const moduleMasterCrud = new Crud("moduleMST")
export const moduleMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const moduleMasterActions = new Action(moduleMasterCrud, moduleMasterSlice)
