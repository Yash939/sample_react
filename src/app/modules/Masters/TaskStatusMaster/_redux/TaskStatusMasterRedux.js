import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"

export const reducerInfo = {
  name: "taskStatusMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "taskStatusName": "",
    "closeFlag": false,
    "defaultFlag": false,
    "confirmFlag": false,
    "payOutFlag": false,
    "payInFlag": false,
    "reopenFlag": false,
    "penaltyFlag": false,
    "autoCloseFlag": false,
    "assignedFlag": false,
    "wipFlag": false,
    "cancelFlag":false,
    "pendingFlag": false,
    "sortOrder":0
  }
}

export const taskStatusMasterCrud = new BaseCrud("taskStatusMST")
export const taskStatusMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const taskStatusMasterActions = new BaseActions(taskStatusMasterCrud, taskStatusMasterSlice)
