import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const TaskPriorityMasterUIContext = createContext();

export function useTaskPriorityMasterUIContext() {
    return useContext(TaskPriorityMasterUIContext)
}


export function TaskPriorityMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        id:"",
        taskPriorityName:"",
        taskDefaultFlag:""
    }
    const [queryParams, setQueryParamsBase] = useState(initialFilter)
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
    return <TaskPriorityMasterUIContext.Provider value={values}>{children}</TaskPriorityMasterUIContext.Provider>
};