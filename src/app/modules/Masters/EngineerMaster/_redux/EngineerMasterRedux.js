import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"
import Axios from "axios"
import { errorMessageFormatter ,customServerErrorMessageFormatter} from "../../../_commons/Utils"

export const reducerInfo = {
  name: "engineerMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "engineerName": "",
    "primaryEmailId": "",
    "secondaryEmailId": "",
    "primaryContactNumber": "",
    "secondaryContactNumber": null,
    "countryMSTId": 0,
    "pointOfContactId": 0,
    "ratePerHour": 0,
    "currencyMSTId": null,
    "skillSet": ""
  }
}

class Crud extends BaseCrud {
  updateMultiple(values) {
    return Axios.put(process.env.REACT_APP_API_URL + this.API_MASTER + "/update/multiple/", values)
  }

  getPaginated(pageSize=10) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/getPaginated" + "/?page=0&size=" + pageSize);
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

  getPaginated = () => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getPaginated()
      .then(res => {
        const entities = res.data.data.content ?? []
        const totalCount = entities.length ?? 0
        const totalElements = res.data.data.totalElements ?? 0
        dispatch(this.actions.recordsFetched({ totalCount, entities }))
        if(totalElements > 10) {
          dispatch(this.getAfterPaginated(totalElements))
        }
      })
      .catch(error => {
        const err = {
          userMessage: "Can't get all paginated " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  }

  getAfterPaginated = (pageSize) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.action }))
    return this.requestFromServer
      .getPaginated(pageSize)
      .then(res => {
        const entities = res.data.data.content ?? []
        const totalCount = entities.length ?? 0
        dispatch(this.actions.recordsFetched({ totalCount, entities }))
        dispatch(this.actions.stopCall({ callType: this.callTypes.action }))
      })
      .catch(error => {
        const err = {
          userMessage: "Can't get all " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
        dispatch(this.actions.stopCall({ callType: this.callTypes.action }))
      })
  }
  updateCustom = (values) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.action }))
    return this.requestFromServer
        .update(values, message => dispatch(this.actions.loadingMessage({ message })))
        .then(res => {
            if (res?.data.status === true) {
                dispatch(this.actions.recordUpdated({ entity: res.data.data }))
                return Promise.resolve(res.data.data)
            } else {
              let err
                if(res?.data?.message.includes("Ticket Project Error")){
                  let message={message:"You can't inactive this engineer as below tickets/projects are still open "}
                  err  = {
                    userMessage: errorMessageFormatter(message),
                    customError:res.data.data,
                   }
                } else if(res?.data?.message.includes("Duplicate Engineer")){
                  let message={message:"Duplicate Engineer"}
                  err  = {
                    userMessage: errorMessageFormatter(message),
                    customError:res.data.data,
                   }
                } else{
                  err  = {
                    userMessage: errorMessageFormatter(res.data),
                    error: res.data,
                  } 
                }
                dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }))
                return Promise.reject({ ...res.data, userMessage: res.data.message })
            } 
        })
        .catch(error => {
            if(!error?.userMessage) {
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
  createCustom = (values) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.action }))
    return this.requestFromServer
        .create(values, message => dispatch(this.actions.loadingMessage({ message })))
        .then(res => {

            if (res?.data.status) {
                dispatch(this.actions.recordCreated({ entity: res.data.data }))
                return Promise.resolve(res.data.data)
            } else {
              let err
                if(res?.data?.message.includes("Duplicate Engineer")){
                  let message={message:"Duplicate Engineer"}
                  err  = {
                    userMessage: errorMessageFormatter(message),
                    customError:res.data.data,
                   }
                }
                else{
                  err  = {
                    userMessage: errorMessageFormatter(res.data),
                    error: res.data,
                  } 
                }
               
                dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }))
                // return Promise.reject({ ...res.data })
                return Promise.reject(err)
            }
        })
        .catch(error => {

            if(!error?.userMessage) {
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

export const engineerMasterCrud = new Crud("engineerMST")
export const engineerMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const engineerMasterActions = new Action(engineerMasterCrud, engineerMasterSlice)
