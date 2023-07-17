// src\app\modules\Masters\TermsAndConditionsMaster\UIContext\TermsAndConditionsUIContext.js

import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const TermsAndConditionsUIContext = createContext();

export function useTermsAndConditionsUIContext() {
    return useContext(TermsAndConditionsUIContext)
}

export function TermsAndConditionsMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        templateName: "",
        template: "",
    };
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
    
    return <TermsAndConditionsUIContext.Provider value={values}>{children}</TermsAndConditionsUIContext.Provider>
};