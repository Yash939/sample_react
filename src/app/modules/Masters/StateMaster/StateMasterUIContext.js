import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const StateMasterUIContext = createContext();

export function useStateMasterUIContext() {
    return useContext(StateMasterUIContext)
}


export function StateMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        stateCode: "",
        stateName: "",
        countryMST: { countryName: "" },
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
    return <StateMasterUIContext.Provider value={values}>{children}</StateMasterUIContext.Provider>
};