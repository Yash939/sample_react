import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const OrganizationMasterUIContext = createContext();

export function useOrganizationMasterUIContext() {
    return useContext(OrganizationMasterUIContext)
}


export function OrganizationMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        id: "",
        organizationName: "",
        organizationType: "",
        emailId: "",
        primaryContact: "",
        website: "",
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
    return <OrganizationMasterUIContext.Provider value={values}>{children}</OrganizationMasterUIContext.Provider>
};