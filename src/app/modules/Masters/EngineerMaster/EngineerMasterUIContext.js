import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const EngineerMasterUIContext = createContext();

export function useEngineerMasterUIContext() {
    return useContext(EngineerMasterUIContext)
}


export function EngineerMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        engineerCode: "",
        engineerName: "",
        primaryEmailId: "",
        primaryContactNumber: "",
        pointOfContact : {engineerName: ""},
        countryMST: {countryName: ""}
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
    return <EngineerMasterUIContext.Provider value={values}>{children}</EngineerMasterUIContext.Provider>
};