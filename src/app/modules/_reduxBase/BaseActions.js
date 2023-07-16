import { customServerErrorMessageFormatter, errorMessageFormatter, sortArray, sortByStandard } from "../_commons/Utils"

export default class BaseActions {
    constructor(crudObj, sliceObj) {
        this.requestFromServer = crudObj
        this.actions = sliceObj.slice.actions
        this.callTypes = sliceObj.callTypes
        this.reducerName = sliceObj.slice.name
    }

    reIniState = () => dispatch => {
        dispatch(this.actions.reIniState({}))
        return Promise.resolve()
    }

    getAll = () => dispatch => {
        dispatch(this.actions.startCall({ callType: this.callTypes.list }))
        return this.requestFromServer
            .getAll()
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
                    userMessage: "Can't get all " + this.reducerName,
                    error: error
                }
                dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
            })
    }

    getAllActive = () => dispatch => {
        dispatch(this.actions.startCall({ callType: this.callTypes.list }))
        return this.requestFromServer
            .getAllActive()
            .then(res => {
                const entities = sortArray(res.data.data ?? [], 'sortOrder')
                const totalCount = entities.length ?? 0
                dispatch(this.actions.recordsFetched({ totalCount, entities }))
            })
            .catch(error => {
                const err = {
                    userMessage: "Can't get all Active " + this.reducerName,
                    error: error
                }
                dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
            })
    }

    getAllFiltered = () => dispatch => {
        dispatch(this.actions.startCall({ callType: this.callTypes.list }))
        return this.requestFromServer
            .getAllFiltered()
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
                    userMessage: "Can't get all " + this.reducerName,
                    error: error
                }
                dispatch(this.actions.catchError({ error: err, callType: this.callTypes.list }))
            })
    }

    create = (values) => dispatch => {
        dispatch(this.actions.startCall({ callType: this.callTypes.action }))
        return this.requestFromServer
            .create(values, message => dispatch(this.actions.loadingMessage({ message })))
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
    update = (values) => dispatch => {
        dispatch(this.actions.startCall({ callType: this.callTypes.action }))
        return this.requestFromServer
            .update(values, message => dispatch(this.actions.loadingMessage({ message })))
            .then(res => {
                if (res?.data.status) {
                    dispatch(this.actions.recordUpdated({ entity: res.data.data }))
                    return Promise.resolve(res.data.data)
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

    fetchEntity = id => dispatch => {
        if (!id) {
            return dispatch(this.actions.recordFetched({ entity: undefined }));
        }
        dispatch(this.actions.startCall({ callType: this.callTypes.action }));
        return this.requestFromServer
            .getById(id)
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

    delete = id => dispatch => {
        if (!id) {
            return dispatch(this.actions.recordDeleted());
        }
        dispatch(this.actions.startCall({ callType: this.callTypes.action }));
        return this.requestFromServer
            .delete(id)
            .then(response => {
                dispatch(this.actions.recordDeleted());
                if (response?.data.status) {
                    dispatch(this.actions.recordDeleted());
                    return Promise.resolve(response.data.data)
                } else {
                    const err = {
                        userMessage: errorMessageFormatter(response.data),
                        error: response.data
                    }
                    dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }))
                    return Promise.reject({ ...response.data, userMessage: response.data.message })
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
            });
    };

    uploadFile = (id, file, path = '') => dispatch => {
        dispatch(this.actions.startCall({ callType: this.callTypes.action }));
        return this.requestFromServer
            .uploadFile(id, file, path = '')
            .then(response => {
                dispatch(this.actions.recordUpdated({ response }));
            })
            .catch(error => {
                const err = {
                    userMessage: `Can't upload file ` + this.reducerName,
                    error: error
                }
                dispatch(this.actions.catchError({ error: err, callType: this.callTypes.action }));
            });
    };

}