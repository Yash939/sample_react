import BaseCrud from "../../_reduxBase/BaseCrud"
import BaseSlice from "../../_reduxBase/BaseSlice"
import BaseActions from "../../_reduxBase/BaseActions"
import baseInitialEntity from "../../_reduxBase/BaseIntialEntity"
import { errorMessageFormatter, sortArrayByDate, sortByStandard } from "../../_commons/Utils"
import Axios from "axios"
import { reducerInfo as projectReducerInfo } from "../../Transaction/ProjectMaster/_redux/ProjectMasterRedux"

export const reducerInfo = {
  name: "projectLogs",
  idFieldName: 'id',
  initialEnitity: projectReducerInfo.initialEnitity
}

class Crud extends BaseCrud {

  getByGeneralLogId(id) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/compare/" + id);
  }
}

class Actions extends BaseActions {

  getByGeneralLogId = (id) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getByGeneralLogId(id)
      .then(res => {
        if (res?.data?.status) {
          const entities = res.data.data ?? [] //sortArrayByDate(res.data.data ?? [], 'createdOn')
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
          userMessage: "Can't get history data ",
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  }

}

export const projectLogsCrud = new Crud("projectLog")
export const projectLogsSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const projectLogsActions = new Actions(projectLogsCrud, projectLogsSlice)
