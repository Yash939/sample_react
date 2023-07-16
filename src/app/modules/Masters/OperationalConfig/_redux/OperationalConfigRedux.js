import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"

export const reducerInfo = {
  name: "operationalConfigMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "dueInDays": 0,
    "projectDueInDays": 0,
  }
}

export const operationalConfigMasterCrud = new BaseCrud("operationalConfigMST")
export const operationalConfigMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const operationalConfigMasterActions = new BaseActions(operationalConfigMasterCrud, operationalConfigMasterSlice)
