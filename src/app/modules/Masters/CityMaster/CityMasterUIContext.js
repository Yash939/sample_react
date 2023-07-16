import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const CityMasterUIContext = createContext();

export function useCityMasterUIContext() {
    return useContext(CityMasterUIContext)
}


export function CityMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        cityCode: "",
        cityName: "",
        countryName: "",
        stateName: "",
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
    return <CityMasterUIContext.Provider value={values}>{children}</CityMasterUIContext.Provider>
};