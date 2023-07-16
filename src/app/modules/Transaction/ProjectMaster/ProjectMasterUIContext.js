import { initialFilter } from '../../_commons/UIHelper';
import React, { createContext, useContext, useState, useCallback } from 'react';
import { isFunction, isEqual } from 'lodash';

const ProjectMasterUIContext = createContext();

export function useProjectMasterUIContext() {
    return useContext(ProjectMasterUIContext)
}


export function ProjectMasterUIProvider({ uiEvents, children }) {
    initialFilter.filter = {
        projectCode: "",
        projectName: "",
        projectStartDate: "",
        projectEndDate: "",
        projectStatusType: "",
        customerName: "",
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
    return <ProjectMasterUIContext.Provider value={values}>{children}</ProjectMasterUIContext.Provider>
};