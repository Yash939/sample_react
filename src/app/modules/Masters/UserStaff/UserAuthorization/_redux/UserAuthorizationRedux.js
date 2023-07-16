import BaseCrud from "../../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../../_reduxBase/BaseSlice"
import BaseActions from "../../../../_reduxBase/BaseActions"
import baseIntialEntity from "../../../../_reduxBase/BaseIntialEntity"
import Axios from "axios"
import { errorMessageFormatter } from "../../../../_commons/Utils"

export const reducerInfo = {
  name: "userAuthorization",
  idFieldName: 'id',
  initialEnitity: {
    ...baseIntialEntity,
    "userRoleMSTId": 0,
    "systemMSTId": 0,
  }
}

class Crud extends BaseCrud {
  getByRoleId(roleId) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + `/role/${roleId}`);
  }
  getBySystemRoleIds(systemId, roleId) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + `/byRoleAndSystem/${roleId}/${systemId}`);
  }
}

class Actions extends BaseActions {
  getByRoleId = (roleId) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.action }));
    return this.requestFromServer
      .getByRoleId(roleId)
      .then(res => {
        if (res?.data.status) {
          dispatch(this.actions.stopCall({ callType: this.callTypes.action }));
          return Promise.resolve(res.data.data?.length ? res.data.data[0] : null)
        } else {
          const err = {
            userMessage: errorMessageFormatter(res.data),
            error: res.data
          }
          dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }))
          return Promise.reject({ ...res.data, userMessage: res.data.message })
        }
      })
      .catch(error => {
        const err = {
          userMessage: `Can't fetch modules ` + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }));
        Promise.reject(err)
      });
  }

  getBySystemRoleIds = (sysId, roleId) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.action }));
    return this.requestFromServer
      .getBySystemRoleIds(sysId, roleId)
      .then(res => {
        if (res?.data.status) {
          dispatch(this.actions.stopCall({ callType: this.callTypes.action }));
          return Promise.resolve(res.data.data?.length ? res.data.data[0] : null)
        } else {
          const err = {
            userMessage: errorMessageFormatter(res.data),
            error: res.data
          }
          dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }))
          return Promise.reject({ ...res.data, userMessage: res.data.message })
        }
      })
      .catch(error => {
        const err = {
          userMessage: `Can't fetch modules ` + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }));
        Promise.reject(err)
      });
  }
}

export const userAutorizationCrud = new Crud("userAuthorizationMST");
export const userAutorizationSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName);
export const userAutorizationActions = new Actions(userAutorizationCrud, userAutorizationSlice);
