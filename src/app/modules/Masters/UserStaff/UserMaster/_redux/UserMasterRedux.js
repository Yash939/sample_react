import BaseCrud from "../../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../../_reduxBase/BaseSlice"
import BaseActions from "../../../../_reduxBase/BaseActions"
import baseIntialEntity from  "../../../../_reduxBase/BaseIntialEntity"
import Axios from "axios";
import { errorMessageFormatter, sortByStandard,customServerErrorMessageFormatter } from "../../../../_commons/Utils";

export const reducerInfo = {
  name: "userMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseIntialEntity,
    "customerName": "",
    "primaryContactNumber": "",
    "secondaryContactNumber": "",
    "primaryEmailId": "",
    "secondaryEmailId":"",
    "firstName": "",
    "lastName": "",
    "userName": "",
    "password": "",
    "userType": "",
    "profilePhoto": "",
    "userRoleMSTId": 0,
    "organizationMSTId": 0,
    "countryMSTId": 0,
    "cityMSTId": 0,
    "managerUserMSTId": 0,
    "primaryCountry": "",
    "secondaryCountry": "",
    "zipCode": ""
  }
}

class UserCrud extends BaseCrud {
  getStaff() {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/staff/all/");
  }

  updateMultiple(values) {
    return Axios.put(process.env.REACT_APP_API_URL + this.API_MASTER + "/update/multiple/", values)
  }
}
class UserActions extends BaseActions {
  getStaff = () => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getStaff()
      .then(res => {
        if (res?.data?.status) {
          dispatch(this.actions.stopCall({ callType: this.callTypes.list }))
          const entities = sortByStandard(res.data.data ?? [])
          return Promise.resolve(entities)
        } else {
          const err = {
            userMessage: errorMessageFormatter(res.data),
            error: res.data
          }
          dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
          return Promise.reject(err)
        }
      })
      .catch(error => {
        const err = {
          userMessage: "Can't get all " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
        return Promise.reject(err)
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
                  let message={message:"You can't inactive this user as below tickets/projects are still open"}
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

export const userMasterCrud = new UserCrud("userMST");
export const userMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName);
export const userMasterActions = new UserActions(userMasterCrud, userMasterSlice);
