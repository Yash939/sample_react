import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"

export const reducerInfo = {
  name: "taskPendingReasonsMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "name": "",
  }
}


export const taskPendingReasonsMasterCrud = new BaseCrud("taskPendingReasonsMST")
export const taskPendingReasonsMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const taskPendingReasonsMasterActions = new BaseActions(taskPendingReasonsMasterCrud, taskPendingReasonsMasterSlice)
