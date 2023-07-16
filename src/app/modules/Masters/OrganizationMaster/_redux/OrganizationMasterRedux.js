import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"
import Axios from "axios"
import { errorMessageFormatter,customServerErrorMessageFormatter } from "../../../_commons/Utils"

export const reducerInfo = {
  name: "organizationMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "organizationName": "",
    "organizationType": "CUSTOMER",
    "emailId": "",
    "primaryContact": "",
    "secondaryContact": "",
    "reference1": "",
    "reference2": "",
    "specialNotes": "",
    "organizationBranchDTLList": [],
    "website":"",
    "primaryContactName": "",
    "primaryContactEmail": "",
    "secondaryContactName": "",
    "secondaryContactEmail": "",
    "supportTeamContact": "",
    "supportTeamEmail": "",
    "projectTeamContact": "",
    "projectTeamEmail": "",
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
                  let message={message:"You can't inactive this customer as below tickets/projects are still open "}
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
}

export const organizationMasterCrud = new Crud("organizationMST")
export const organizationMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const organizationMasterActions = new Action(organizationMasterCrud, organizationMasterSlice)
