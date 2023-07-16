import { initialFilter } from '../../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const UserMasterUIContext = createContext();

export function useUserMasterUIContext() {
    return useContext(UserMasterUIContext)
}

export function UserMasterUIProvider({ uiEvents, children }) {

    initialFilter.filter = {
        id: "",
        userName: "",
        userRoleMST: { roleName: "" },
        cityMST: { cityName: "" },
        stateMST: { stateName: "" },
        countryMST: { countryName: "" },
        organizationMST: { organizationName: "" },
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
    return <UserMasterUIContext.Provider value={values}>{children}</UserMasterUIContext.Provider>
};