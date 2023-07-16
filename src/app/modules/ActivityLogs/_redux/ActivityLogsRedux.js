import BaseCrud from "../../_reduxBase/BaseCrud"
import BaseSlice from "../../_reduxBase/BaseSlice"
import BaseActions from "../../_reduxBase/BaseActions"
import baseInitialEntity from "../../_reduxBase/BaseIntialEntity"
import { errorMessageFormatter, sortArrayByDate, sortByStandard } from "../../_commons/Utils"
import Axios from "axios"

export const reducerInfo = {
  name: "activityLogs",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "message": "",
    "module": "",
    "moduleId": null,
    "userMSTId": null
  }
}

class Crud extends BaseCrud {

  getFilteredData(values) {
    return Axios.post(process.env.REACT_APP_API_URL + this.API_MASTER + "/all/", values)
  }

  getPaginatedData() {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/paginated/?page=0&size=10")
  }
}

const moduleMap = {
  "CITY": "City Master",
  "COUNTRY": "Country Master",
  "CURRENCY": "Currency Master",
  "ENGINEER": "Engineer List",
  "ORGANIZATION": "Customer",
  "ORGANIZATION_BRANCH": "Customer Branch",
  "SETTLEMENT": "Settlement",
  "STATE": "State Master",
  "STATUS_ACCESS": "Ticket Status Access",
  "TASK_PRIORITY": "Ticket Priority",
  "TASK_STATUS": "Ticket Status",
  "USER_AUTHORIZATION": "User Authorization",
  "USER": "User Master",
  "USER_ROLE": "User Role Master",
  "PROJECT": "Project",
  "MODULE_WISE_DETAIL": "User Authorization",
  "OPERATIONAL_CONFIG": "Operational Config",
  "PROJECT_BRANCH": "Project"
}

class Actions extends BaseActions {

  getFilteredData = (values) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getFilteredData(values)
      .then(res => {
        if (res?.data?.status) {
          const entities = sortArrayByDate((res.data.data ?? []), "createdOn","desc" ).map(x => ({
            ...x,
            module: Object.keys(moduleMap).includes(x.module) ? moduleMap[x.module] : x.module
          }))
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
          userMessage: "Can't get all " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  }

  getPaginatedData = () => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getPaginatedData()
      .then(res => {
        if (res?.data?.status) {
          const entities = sortArrayByDate((res.data.data.content ?? []), "createdOn","desc" ).map(x => ({
            ...x,
            module: Object.keys(moduleMap).includes(x.module) ? moduleMap[x.module] : x.module
          }))
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
          userMessage: "Can't get all " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  }

}

export const activityLogsCrud = new Crud("generalLog")
export const activityLogsSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const activityLogsActions = new Actions(activityLogsCrud, activityLogsSlice)
