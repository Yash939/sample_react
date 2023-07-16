import Axios from "axios"
import { customServerErrorMessageFormatter, errorMessageFormatter, sortByStandard } from "../../_commons/Utils"
import BaseActions from "../../_reduxBase/BaseActions"
import BaseCrud from "../../_reduxBase/BaseCrud"
import BaseSlice from "../../_reduxBase/BaseSlice"

export const reducerInfo = {
  name: "reportPayOut",
  idFieldName: 'id',
  initialEnitity: {}
}

class Crud extends BaseCrud {
  getData(endPoint, data, method) {
    if (method === "post")
      return Axios.post(process.env.REACT_APP_API_URL + this.API_MASTER + `/${endPoint}/`, data)
    else if (method === "get")
      return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + `/${endPoint}/`, data)
  }

  doSettlement(data) {
    return Axios.post(process.env.REACT_APP_API_URL + this.API_MASTER + `/settlement/`, data)
  }

}
class Actions extends BaseActions {
  getData = (crudMethod, data, method) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer.getData(crudMethod, data, method)
      .then(res => {
        if (res?.data?.status) {
          // const entities = sortByStandard(res.data.data ?? [])
          // const totalCount = entities.length ?? 0
          dispatch(this.actions.recordsFetched({ totalCount: 0, entities: res.data.data ?? {} }))
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
          userMessage: "Can't get data "+ error?.userMessage ,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  }

  doSettlement = (data) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.action }))
    return this.requestFromServer
      .doSettlement(data, message => dispatch(this.actions.loadingMessage({ message })))
      .then(res => {

        if (res?.data.status) {
          dispatch(this.actions.recordCreated({ entity: res.data.data }))
          return Promise.resolve(res.data.data)
        } else {
          const err = {
            userMessage: errorMessageFormatter(res.data),
            error: res.data
          }
          dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }))
          return Promise.reject(err)
        }
      })
      .catch(error => {

        if (!error?.userMessage) {
          const err = {
            userMessage: customServerErrorMessageFormatter(error.response),//errorMessageFormatter(error),
            error: error
          }
          dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }))

          return Promise.reject(err)
        } else {
          return Promise.reject(error)
        }
      })
  }
}

export const reportsPayOutCrud = new Crud("report")
export const reportsPayOutSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const reportsPayOutActions = new Actions(reportsPayOutCrud, reportsPayOutSlice)
