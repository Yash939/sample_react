import BaseCrud from "../../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../../_reduxBase/BaseSlice"
import BaseActions from "../../../../_reduxBase/BaseActions"
import baseIntialEntity from "../../../../_reduxBase/BaseIntialEntity"

export const reducerInfo = {
  name: "userRole",
  idFieldName: 'id',
  initialEnitity: {
    ...baseIntialEntity,
    "roleCode": "",
    "roleName": "",
    "sortOrder": 1,
    "statusAccessList": [] 
  }
}

export const userRoleCrud = new BaseCrud("userRoleMST")
export const userRoleSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const userRoleActions = new BaseActions(userRoleCrud, userRoleSlice)
