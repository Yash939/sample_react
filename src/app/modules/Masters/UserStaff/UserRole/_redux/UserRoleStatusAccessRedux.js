import BaseCrud from "../../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../../_reduxBase/BaseSlice"
import BaseActions from "../../../../_reduxBase/BaseActions"
import baseIntialEntity from "../../../../_reduxBase/BaseIntialEntity"

export const reducerInfo = {
  name: "userRoleStatusAccessMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseIntialEntity,
    "accessRights": "",
    "statusMSTId": 0,
    "userRoleMSTId": 0,
    "active": false
  }
}

export const userRoleStatusAccessMasterCrud = new BaseCrud("statusAccessMST")
export const userRoleStatusAccessMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const userRoleStatusAccessMasterActions = new BaseActions(userRoleStatusAccessMasterCrud, userRoleStatusAccessMasterSlice)
