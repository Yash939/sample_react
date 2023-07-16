import { initialFilter } from '../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const ActivityLogsUIContext = createContext();

export function useActivityLogsUIContext() {
    return useContext(ActivityLogsUIContext)
}


export function ActivityLogsUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        message: "",
        module: "",
        createdOn: "",
        userMST: { userName: "" },
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
    return <ActivityLogsUIContext.Provider value={values}>{children}</ActivityLogsUIContext.Provider>
};