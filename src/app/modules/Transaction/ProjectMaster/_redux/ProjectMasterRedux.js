import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"
import Axios from "axios"
import { errorMessageFormatter, sortArray, customServerErrorMessageFormatter } from "../../../_commons/Utils"

export const reducerInfo = {
  name: "projectMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "cityMSTId": 0,
    "countryMSTId": 0,
    "organizationBranchDTLId": 0,
    "organizationMSTId": 0,
    "projectABHEndTiming": null,
    "projectABHRatePayIn": "",
    "projectABHRatePayOut": "",
    "projectABHStartTiming": null,
    "projectAddress": "",
    "projectCoordinatorId": 0,
    "projectDescription": "",
    "projectEndDate": null,
    "projectForceEndDate": null,
    "projectLocalContactName": "",
    "projectLocalContactPhone": "",
    "projectManagerId": 0,
    "projectName": "",
    "projectOBHEndTiming": null,
    "projectOBHRatePayIn": "",
    "projectOBHRatePayOut": "",
    "projectOBHStartTiming": null,
    "projectPayInCurrencyId": 2,
    "projectPayInRemarks": "",
    "projectPayOutCurrencyId": 0,
    "projectPayOutRemarks": "",
    "projectPreferredDay": "",
    "projectRBHEndTiming": null,
    "projectRBHRatePayIn": "",
    "projectRBHRatePayOut": "",
    "projectRBHStartTiming": null,
    "projectReference1": "",
    "projectReference2": "",
    "projectRequestedBy": "",
    "projectStartDate": null,
    "projectStatusType": "ACTIVE",
    "projectTaskCreationType": "NONE",
    "projectTaskUserId": null,
    "projectZipcode": "",
    "stateMSTId": 0,
    "taskType": 0,
    "dates": [],
    "travelChargesPayIn": "",
    "materialChargesPayIn": "",
    "parkingChargesPayIn": "",
    "otherChargesPayIn": "",
    "travelChargesPayOut": "",
    "materialChargesPayOut": "",
    "parkingChargesPayOut": "",
    "otherChargesPayOut": "",
    "externalCustomer": "",
    "minHoursPayIn": "",
    "minHoursPayOut": "",
    "projectBranchDTLList": [],
    "fullDayRatesPayIn": "",
    "fullDayRatesPayOut": "",
    "payInDayOption": "",
    "payOutDayOption": "",
    "scopeOfWork": "",
    "scopeOfWorkLength": null,
    "projectForceEndDate": null,
    // "pId" : null,
    // "forceEndDate":""
  }
}

class Crud extends BaseCrud {
  getByUserId(userId) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/userId/" + userId);
  }

  getTaskCount(data) {
    return Axios.post(process.env.REACT_APP_API_URL + this.API_MASTER + "/getCount/", data);
  }

  getTicketCount(data){
    // debugger
    let newDataObj = {"pId": data.id, "forceEndDate": data.projectForceEndDate}
    return Axios.post(process.env.REACT_APP_API_URL + /* this.API_Master +  */"projectMST/checkForForceEndDate/", newDataObj);
  }




  getManagerFilteredDataPaginated(filter, pageSize = 10) {
  return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/filterPaginated/manager/" + filter + "/?page=0&size=" + pageSize);
}

getPaginated(pageSize = 10) {
  return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/getPaginated" + "/?page=0&size=" + pageSize);
}
}

class Action extends BaseActions {

 

  getByUserId = userId => dispatch => {
    if (!userId) {
      return dispatch(this.actions.recordFetched({ entity: undefined }));
    }
    dispatch(this.actions.startCall({ callType: this.callTypes.action }));
    return this.requestFromServer
      .getByUserId(userId)
      .then(response => {
        const entity = response.data.data;
        dispatch(this.actions.recordFetched({ entity }));
      })
      .catch(error => {
        const err = {
          userMessage: `Can't fetch ` + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }));
      });
  };

  getTaskCount = (data) => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getTaskCount(data)
      .then(res => {
        // console.log("TASK COUNT", res)
        if (res?.data?.status) {
          const entities = res.data.data ?? []
          const totalCount = entities.length ?? 0
          dispatch(this.actions.recordsFetched({ totalCount, entities }))
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
          userMessage: "Can't get task count " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  }

  getTicketCount = (data) => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getTicketCount(data)
      .then(res => {
        // console.log("TICKET COUNT:", res.data)
        if (res.data.status) {
          const entities = res.data.data ?? []
          const totalCount = entities.length ?? 0
          dispatch(this.actions.recordsFetched({ totalCount, entities }))
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
          userMessage: "Can't get ticket count " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  }


  getManagerFilteredData = (filter, pageSize) => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.action }));
    return this.requestFromServer
      .getManagerFilteredDataPaginated(filter, pageSize)
      .then(res => {
        if (res?.data?.status) {
          const entities = res.data.data.content ?? []
          const totalCount = entities.length ?? 0
          dispatch(this.actions.recordsFetched({ totalCount, entities }))
          dispatch(this.actions.stopCall({ callType: this.callTypes.action }))
        } else {
          const err = {
            userMessage: errorMessageFormatter(res.data),
            error: res.data
          }
          dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
          dispatch(this.actions.stopCall({ callType: this.callTypes.action }))
          return Promise.reject(err)
        }
      })
      .catch(error => {
        const err = {
          userMessage: "Can't get tech filtered data " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
        dispatch(this.actions.stopCall({ callType: this.callTypes.action }))
      })
  };

  getManagerFilteredDataPaginated = filter => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.list }));
    return this.requestFromServer
      .getManagerFilteredDataPaginated(filter)
      .then(res => {
        if (res?.data?.status) {
          const entities = res.data.data.content ?? []
          const totalCount = entities.length ?? 0
          const totalElements = res.data.data.totalElements ?? 0
          dispatch(this.actions.recordsFetched({ totalCount, entities }))
          if (totalElements > 10) {
            dispatch(this.getManagerFilteredData(filter, totalElements))
          }
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
          userMessage: "Can't get manager paginated filtered data " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  };

  getById = id => dispatch => {
    return this.requestFromServer
      .getById(id)
      .then(response => {
        const entity = response.data.data;
        return Promise.resolve(entity)
      })
      .catch(error => {
        const err = {
          userMessage: `Can't fetch ` + this.reducerName,
          error: error
        }
        return Promise.reject(err)
      });
  }

  getPaginated = () => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getPaginated()
      .then(res => {
        const entities = sortArray(res.data.data.content ?? [], 'sortOrder')
        const totalCount = entities.length ?? 0
        const totalElements = res.data.data.totalElements ?? 0
        dispatch(this.actions.recordsFetched({ totalCount, entities }))
        if (totalElements > 10) {
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
        const entities = sortArray(res.data.data.content ?? [], 'sortOrder')
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
          if (res?.data?.message.includes("Ticket Project Error")) {
            let mess = { message: "You can't inactive this project as below tickets are still open" }
            err = {
              userMessage: errorMessageFormatter(mess),
              customError: res.data.data,
            }
          }
          else {
            err = {
              userMessage: errorMessageFormatter(res.data),
              error: res.data,
            }
          }
          dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }))
          return Promise.reject({ ...res.data, userMessage: res.data.message })
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

export const projectMasterCrud = new Crud("projectMST")
export const projectMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const projectMasterActions = new Action(projectMasterCrud, projectMasterSlice)
