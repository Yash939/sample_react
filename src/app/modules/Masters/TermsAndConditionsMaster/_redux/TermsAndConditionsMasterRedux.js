import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"

export const reducerInfo = {
  name: "termsAndConditionsMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "templateName": "",
    "template": ""
  }
}

class Crud extends BaseCrud {
}

class Actions extends BaseActions {
}

export const termsAndConditionsMasterCrud = new Crud("termsAndConditionsMST")
export const termsAndConditionsMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const termsAndConditionsMasterActions = new Actions(termsAndConditionsMasterCrud, termsAndConditionsMasterSlice)
