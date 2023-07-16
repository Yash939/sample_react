import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"
import Axios from "axios"
import { errorMessageFormatter, sortByStandard } from "../../../_commons/Utils"

export const reducerInfo = {
  name: "stateMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "stateCode": "",
    "stateName": "",
    "countryMSTId": 0,
  }
}

class Crud extends BaseCrud {

  getByCountry(id) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/country/" + id);
  }

  updateMultiple(values) {
    return Axios.put(process.env.REACT_APP_API_URL + this.API_MASTER + "/update/multiple/", values)
  }
}

class Actions extends BaseActions {

  getByCountry = (id) => dispatch => {
    dispatch(this.actions.recordsFetched({ totalCount: 0, entities: [] }))
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))

    return this.requestFromServer
      .getByCountry(id)
      .then(res => {
        if (res?.data?.status) {
          const entities = sortByStandard(res.data.data ?? [])
          const totalCount = entities.length ?? 0
          dispatch(this.actions.recordsFetched({ totalCount, entities }))
        } else {
          const err = {
            userMessage: errorMessageFormatter(res.data),
            error: res.data
          }
          dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
        }
      })
      .catch(error => {
        const err = {
          userMessage: "Can't get by country id " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  }

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

export const stateMasterCrud = new Crud("stateMST")
export const stateMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const stateMasterActions = new Actions(stateMasterCrud, stateMasterSlice)
