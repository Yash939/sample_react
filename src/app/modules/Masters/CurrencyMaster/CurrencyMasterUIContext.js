import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const CurrencyMasterUIContext = createContext();

export function useCurrencyMasterUIContext() {
    return useContext(CurrencyMasterUIContext)
}


export function CurrencyMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        "currencyCode": "",
        "currencyName": ""
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
    return <CurrencyMasterUIContext.Provider value={values}>{children}</CurrencyMasterUIContext.Provider>
};