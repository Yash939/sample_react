import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const CountryMasterUIContext = createContext();

export function useCountryMasterUIContext() {
    return useContext(CountryMasterUIContext)
}


export function CountryMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        countryCode: "",
        countryName: "",
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
    return <CountryMasterUIContext.Provider value={values}>{children}</CountryMasterUIContext.Provider>
};