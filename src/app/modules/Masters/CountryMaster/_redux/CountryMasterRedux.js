import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"
import Axios from "axios"
import { errorMessageFormatter } from "../../../_commons/Utils"

export const reducerInfo = {
  name: "countryMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "countryCode": "",
    "countryName": "",
    "dialingCode": ""
  }
}

class Crud extends BaseCrud {
  updateMultiple(values) {
    return Axios.put(process.env.REACT_APP_API_URL + this.API_MASTER + "/update/multiple/", values)
  }
}

class Action extends BaseActions {

  updateMultiple(values) {
    return new Promise(async (res1, reje) => {
      try {
        const res = await this.requestFromServer.updateMultiple(values)
        if (!res?.data?.status) {
          const err = {
            userMessage: errorMessageFormatter(res?.data),
            error: res?.data
          }
          return reje({ ...res?.data, userMessage: res?.data?.message ?? "Error in Saving Data"})
        }
        else {
          res1({ res })
        }
      } catch (error) {
        reje(error)
      }
    })
  }

}

export const countryMasterCrud = new Crud("countryMST")
export const countryMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const countryMasterActions = new Action(countryMasterCrud, countryMasterSlice)
