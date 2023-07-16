import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const TaskMasterUIContext = createContext();

export function useTaskMasterUIContext() {
    return useContext(TaskMasterUIContext)
}


export function TaskMasterUIProvider({ uiEvents, children }) {
    const tmpFilter = {...initialFilter}
    tmpFilter.filter = {
        taskCode: "",
        taskStatus: "",
        project: "",
        customer: "",
        branch: "",
        requestedBy: "",
        planDateTime: "",
        city: "",
        country: "",

    }
    tmpFilter.pageSize = 20
    const [queryParams, setQueryParamsBase] = useState(tmpFilter)
    const [ids, setIds] = useState([])
    const setQueryParams = useCallback(nextQueryParams => {
        setQueryParamsBase(prevQueryParams => {
            if (isFunction(nextQueryParams)) {
                nextQueryParams = nextQueryParams(prevQueryParams);
            }

            if (isEqual(prevQueryParams, nextQueryParams)) {
                return prevQueryParams;
            }

            return nextQueryParams;
        });
    }, [])
    const values = {
        ...uiEvents,
        queryParams,
        setQueryParams,
        ids,
        setIds,
    }
    return <TaskMasterUIContext.Provider value={values}>{children}</TaskMasterUIContext.Provider>
};