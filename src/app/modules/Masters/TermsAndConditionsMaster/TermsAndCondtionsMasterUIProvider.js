import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const TermsAndCondtionsMasterUIContext = createContext();

export function useTermsAndCondtionsUIContext() {
    return useContext(TermsAndCondtionsMasterUIContext)
}


export function TermsAndCondtionsMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        templateName: "",
        template: ""
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
    return <TermsAndCondtionsMasterUIContext.Provider value={values}>{children}</TermsAndCondtionsMasterUIContext.Provider>
};