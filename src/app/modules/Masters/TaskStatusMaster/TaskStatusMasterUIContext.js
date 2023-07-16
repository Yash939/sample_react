import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const TaskStatusMasterUIContext = createContext();

export function useTaskStatusMasterUIContext() {
    return useContext(TaskStatusMasterUIContext)
}


export function TaskStatusMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        id: "",
        taskStatusName: "",
        closeFlag: ""
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
    return <TaskStatusMasterUIContext.Provider value={values}>{children}</TaskStatusMasterUIContext.Provider>
};