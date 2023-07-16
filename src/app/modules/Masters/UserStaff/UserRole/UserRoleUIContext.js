import { initialFilter } from '../../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const userRoleUIContext = createContext();

export function useUserRoleUIContext() {
    return useContext(userRoleUIContext)
}


export function UserRoleUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        id: "",
        roleName: "",
        roleCode: "",
        sortOrder: ""
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
    return <userRoleUIContext.Provider value={values}>{children}</userRoleUIContext.Provider>
};