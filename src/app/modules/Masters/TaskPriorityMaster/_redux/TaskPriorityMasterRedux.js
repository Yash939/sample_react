import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"

export const reducerInfo = {
  name: "taskPriorityMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "taskPriorityName": "",
    "taskDefaultFlag": false
  }
}

export const taskPriorityMasterCrud = new BaseCrud("taskPriorityMST")
export const taskPriorityMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const taskPriorityMasterActions = new BaseActions(taskPriorityMasterCrud, taskPriorityMasterSlice)
