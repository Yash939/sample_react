import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"
import Axios from "axios"
import { customServerErrorMessageFormatter, errorMessageFormatter, sortArrayByDate } from "../../../_commons/Utils"
import moment from "moment-timezone"

export const reducerInfo = {
  name: "taskMaster",
  idFieldName: 'id',
  initialEnitity: {
    ...baseInitialEntity,
    "abhEndTiming": null,
    "abhPayinRate": "",
    "abhPayoutRate": "",
    "abhStartTiming": null,
    "active": true,
    "address": "",
    "attachment": "",
    "cityMSTId": 0,
    "countryMSTId": 0,
    "dueDateTime": null,
    "localContactName": "",
    "localContactPhone": "",
    "obhEndTiming": null,
    "obhPayinRate": "",
    "obhPayoutRate": "",
    "obhStartTiming": null,
    "organizationBranchMSTId": 0,
    "organizationMSTId": 0,
    "payInCurrencyId": 2,
    "payInRemarks": "",
    "payOutCurrencyId": 0,
    "payOutRemarks": "",
    "planDateTime": null,
    "projectCoOrdinatorId": 0,
    "projectManagerId": 0,
    "rbhEndTiming": null,
    "rbhPayinRate": "",
    "rbhPayoutRate": "",
    "rbhStartTiming": null,
    "reference1": "",
    "reference2": "",
    "requestedById": 0,
    "scopeOfWork": "",
    "scopeOfWorkLength": null,
    "stateMSTId": 0,
    "taskDTLList": [],
    "taskDescription": "",
    "taskPriorityMSTId": 0,
    "taskStatusMSTId": 0,
    "taskType": 1,
    "taskUserId": 0,
    "zipCode": "",
    "projectMSTId": 0,
    "rbhStartTimingPayIn": null,
    "rbhEndTimingPayIn": null,
    "engineersList": [],
    "weekendPayInFlatRate": "",
    "weekendPayInMultiplier": "",
    "weekendPayOutFlatRate": "",
    "weekendPayOutMultiplier": "",
    "travelChargesPayIn": "",
    "materialChargesPayIn": "",
    "parkingChargesPayIn": "",
    "otherChargesPayIn": "",
    "travelCharges": "",
    "materialCharges": "",
    "parkingCharges": "",
    "otherCharges": "",
    "POC": "",
    "minHoursPayIn": "",
    "minHoursPayOut": "",
    "summary": "",
    "fullDayRatesPayIn": "",
    "fullDayRatesPayOut": "",
    "payInDayOption": "",
    "payOutDayOption": "",
  }
}

class Crud extends BaseCrud {
  getCordinatorFilteredDataPaginated(filter, pageSize = 20) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/filter/coordinator/" + filter + "/?page=0&size=" + pageSize);
  }

  getTechFilteredData(filter) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/filter/tech/" + filter + "/");
  }

  getManagerFilteredDataPaginated(filter, pageSize = 20) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/filterPaginated/manager/" + filter + "/?page=0&size=" + pageSize);
  }

  getTaksByStatusIdPaginated(dashboard, id, pageSize = 20) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/" + dashboard + "Paginated/status/" + id + "/?page=0&size=" + pageSize);
  }

  getTaskByStatusPaginated(status, pageSize = 20) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/getPaginated/" + status + "/?page=0&size=" + pageSize);
  }

  getTaskByCode(code) {
    return Axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/code/" + code);
  }

  async cancelMultiple(values) {
    return Axios.post(process.env.REACT_APP_API_URL + this.API_MASTER + "/cancel/multiple/" , values);
  }

  validateEngineer(values) {
    return Axios.post(process.env.REACT_APP_API_URL + this.API_MASTER + "/validateEngineer/" , values);
  }
}

const sortByPlannedDate = (data) => {

  // const timezone = moment.tz.guess(true)

  const tmpEntities = data.map(x => {
    // let tmpTimezone = timezone
    // if (x?.latitude && x?.longitude) {
    //   tmpTimezone = tz_lookup(x.latitude, x.longitude)
    // }
    // return { ...x, planDateTime: moment.tz(x.planDateTime, "utc").tz(tmpTimezone).format('YYYY-MM-DD HH:mm') }
    return { ...x, planDateTime: moment.tz(x.planDateTime, "utc").add(x.utcOffset ?? 0, 'minutes').format('DD-MMM-YYYY HH:mm') }
  })

  return sortArrayByDate(tmpEntities, "planDateTime") ?? []

}

class Action extends BaseActions {

  getCordinatorFilteredData = (filter,pageSize) => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.list }));

    return this.requestFromServer
      .getCordinatorFilteredDataPaginated(filter,pageSize)
      .then(res => {
        if (res?.data?.status) {

          const entities = res.data.data.content ? sortByPlannedDate(res.data.data.content) : []
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
          userMessage: "Can't get coordinator filtered data " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  };

  getCordinatorFilteredDataPaginated = filter => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.list }));

    return this.requestFromServer
      .getCordinatorFilteredDataPaginated(filter)
      .then(res => {
        if (res?.data?.status) {

          const entities = res.data.data.content ? sortByPlannedDate(res.data.data.content) : []
          const totalCount = entities.length ?? 0
          dispatch(this.actions.recordsFetched({ totalCount, entities }))
          const totalElements = res.data.data.totalElements ?? 0
          if (totalElements > 20) {
            dispatch(this.getCordinatorFilteredData(filter,totalElements))
          }
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
          userMessage: "Can't get coordinator filtered data " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  };

  getTechFilteredData = filter => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.list }));
    return this.requestFromServer
      .getTechFilteredData(filter)
      .then(res => {

        if (res?.data?.status) {
          const entities = res.data.data ? sortByPlannedDate(res.data.data) : []
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
          userMessage: "Can't get tech filtered data " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  };

  getManagerFilteredData = (filter, pageSize) => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.list }));
    return this.requestFromServer
      .getManagerFilteredDataPaginated(filter, pageSize)
      .then(res => {

        if (res?.data?.status) {

          const entities = res.data.data ? sortByPlannedDate(res.data.data) : []
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
          userMessage: "Can't get manager filtered data " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  };

  getManagerFilteredDataPaginated = filter => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.list }));
    return this.requestFromServer
      .getManagerFilteredDataPaginated(filter)
      .then(res => {

        if (res?.data?.status) {

          const entities = res.data.data.content ? sortByPlannedDate(res.data.data.content) : []
          const totalCount = entities.length ?? 0
          dispatch(this.actions.recordsFetched({ totalCount, entities }))
          const totalElements = res.data.data.totalElements ?? 0
          if (totalElements > 20) {
            dispatch(this.getManagerFilteredData(filter))
          }
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
          userMessage: "Can't get manager filtered data " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  };

  getTaksByStatusId = (dashboard, id, pageSize) => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.action }));
    return this.requestFromServer
      .getTaksByStatusIdPaginated(dashboard, id, pageSize)
      .then(res => {

        if (res?.data?.status) {
          const entities = sortArrayByDate(res.data.data.content, "createdOn") ?? []
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
        }
      })
      .catch(error => {
        const err = {
          userMessage: "Can't get by status id " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
        dispatch(this.actions.stopCall({ callType: this.callTypes.action }))
      })
  };

  getTaksByStatusIdPaginated = (dashboard, id) => dispatch => {

    dispatch(this.actions.startCall({ callType: this.callTypes.list }));
    return this.requestFromServer
      .getTaksByStatusIdPaginated(dashboard, id)
      .then(res => {

        if (res?.data?.status) {
          const entities = res.data.data.content ? sortArrayByDate(res.data.data.content, "createdOn") : []
          const totalCount = entities.length ?? 0
          dispatch(this.actions.recordsFetched({ totalCount, entities }))
          const totalElements = res.data.data.totalElements ?? 0
          if (totalElements > 20) {
            dispatch(this.getTaksByStatusId(dashboard, id,totalElements))
          }
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
          userMessage: "Can't get by status id " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  };

  getAllSorted = () => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getAll()
      .then(res => {
        if (res?.data?.status) {
          const entities = res.data.data ? sortByPlannedDate(res.data.data) : []
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

  getTaskByStatusPaginated = status => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getTaskByStatusPaginated(status)
      .then(res => {
        if (res?.data?.status) {
          const entities = res.data.data.content ? sortByPlannedDate(res.data.data.content) : []
          const totalCount = entities.length ?? 0
          const totalElements = res.data.data.totalElements ?? 0
          dispatch(this.actions.recordsFetched({ totalCount, entities }))
          if (totalElements > 20) {
            dispatch(this.getTaskByStatus(status, totalElements))
          }
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
          userMessage: "Can't get by status " + status,
          error: error
        }
        dispatch(this.actions.reIniState())
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })

  }

  getTaskByStatus = (status, pageSize) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.action }))
    return this.requestFromServer
      .getTaskByStatusPaginated(status, pageSize)
      .then(res => {
        if (res?.data?.status) {
          const entities = res.data.data.content ? sortByPlannedDate(res.data.data.content) : []
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
        }
      })
      .catch(error => {
        const err = {
          userMessage: "Can't get by status " + status,
          error: error
        }
        dispatch(this.actions.reIniState())
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
        dispatch(this.actions.stopCall({ callType: this.callTypes.action }))
      })

  }

  getTaskByCode = code => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .getTaskByCode(code)
      .then(res => {
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
          userMessage: "Can't get by code " + code,
          error: error
        }
        dispatch(this.actions.reIniState())
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
        return Promise.reject(err)
      })

  }

  updateCustom = (values) => dispatch => {
    return this.requestFromServer
        .update(values)
        .then(res => {
            if (res?.data.status) {
                return Promise.resolve(res.data.data)
            } else {
                const err = {
                    userMessage: errorMessageFormatter(res.data),
                    error: res.data
                }
                return Promise.reject({ ...res.data, userMessage: res.data.message })
            }
        })
        .catch(error => {
            if(!error?.userMessage) {
                const err = {
                    userMessage: customServerErrorMessageFormatter(error.response),//errorMessageFormatter(error),
                    error: error
                }
                return Promise.reject(err)
            } else {
                return Promise.reject(error)
            } 
        })
  }

  setScopeOfWorkLength = (len) => dispatch => {
    console.log('action called with length from redux', len)
    dispatch(this.actions.scopeOfWorkLength({ scopeOfWorkLength: len}))
  }

  startCall = () => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.action }));
  }

  stopCall = () => dispatch => {
    dispatch(this.actions.stopCall({ callType: this.callTypes.action }));
  }

  cancelMultiple(values) {
    
    return this.requestFromServer
        .cancelMultiple(values)
        .then(response => {
            if (response?.data.status) {
                return Promise.resolve(response.data.data)
            } else {
                const err = {
                    userMessage: errorMessageFormatter(response.data),
                    error: response.data
                }
                return Promise.reject({ ...response.data, userMessage: response.data.message })
            }
        })
        .catch(error => {
            if(!error?.userMessage) {
                const err = {
                    userMessage: customServerErrorMessageFormatter(error.response),//errorMessageFormatter(error),
                    error: error
                }
                return Promise.reject(err)
            } else {
                return Promise.reject(error)
            } 
        });
  };

  validateEngineer = (data) => dispatch => {
    dispatch(this.actions.startCall({ callType: this.callTypes.list }))
    return this.requestFromServer
      .validateEngineer(data)
      .then(res => {
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
          userMessage: "Can't validate engineer " + this.reducerName,
          error: error
        }
        dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
      })
  }

}

export const taskMasterCrud = new Crud("taskMST")
export const taskMasterSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const taskMasterActions = new Action(taskMasterCrud, taskMasterSlice)
