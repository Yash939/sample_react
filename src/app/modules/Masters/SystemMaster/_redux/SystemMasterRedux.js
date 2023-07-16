import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseIntialEntity from "../../../_reduxBase/BaseIntialEntity"

export const reducerInfo = {
  name: "systemMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseIntialEntity,
    "parentSystemMST": {},
    "parentSystemMSTId": 0,
    "systemCode": "",
    "systemName": "",
    "systemType": 0
  }
}

export const systemMasterCrud = new BaseCrud("systemMST")
export const systemMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const systemMasterActions = new BaseActions(systemMasterCrud, systemMasterSlice)
