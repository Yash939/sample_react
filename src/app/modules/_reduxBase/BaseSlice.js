import { createSlice } from "@reduxjs/toolkit"

export default class BaseSlice {
    constructor(reducerName, idFieldName, initialState = {}, callTypes = {}, extraReducers = {}) {
        this.initialState = {
            listLoading: false,
            actionLoading: false,
            loadingMessage: '',
            totalCount: 0,
            entities: [],
            entityForEdit: undefined,
            // entity:[],
            ...initialState
        }
        this.callTypes = {
            list: 'list',
            action: 'action',
            ...callTypes
        }
        const reducers = {
            reIniState: (state, action) => {
                for (const k in state) {
                    state[k] = this.initialState[k]
                }
            },
            catchError: (state, action) => {
                // state.error = `${action.type}: ${action.payload.error}`
                state.error = action.payload.error
                if (action.payload.callType === this.callTypes.list)
                    state.listLoading = false
                else
                    state.actionLoading = false
                state.loadingMessage = ''
            },
            startCall: (state, action) => {
                state.error = null
                if (action.payload.callType === this.callTypes.list)
                    state.listLoading = true
                else
                    state.actionLoading = true
            },
            stopCall: (state, action) => {
                state.error = null
                state.loadingMessage = ''
                if (action.payload.callType === this.callTypes.list)
                    state.listLoading = false
                else
                    state.actionLoading = false
            },
            loadingMessage: (state, action) => {
                state.loadingMessage = action?.payload?.message
            },
            recordSorted: (state, action) => {
                const { entities } = action.payload
                state.entities = entities
            },
            recordsFetched: (state, action) => {
                const { totalCount, entities } = action.payload
                state.listLoading = false
                state.error = null
                state.entities = entities
                state.totalCount = totalCount
                state.loadingMessage = ''
            },
            recordCreated: (state, action) => {
                state.actionLoading = false;
                state.error = null;
                // if (action.payload.entity) {
                //     state.entities.push(action.payload.entity);
                //     state.totalCount += 1
                // }
                // if(action.payload.entity) {
                //     state.entity = action.payload.entity
                // }
                state.loadingMessage = ''
            },
            // getProductById
            recordFetched: (state, action) => {
                state.actionLoading = false;
                state.entityForEdit = action.payload.entity;
                state.loadingMessage = ''
            },
            recordDeleted: (state, action) => {
                state.actionLoading = false;
                state.loadingMessage = ''
                state.error = null;
            },
            recordUpdated: (state, action) => {
                state.error = null;
                state.actionLoading = false;
                state.entityForEdit = undefined;
                // if (action.payload.entity) {
                //     state.entities = state.entities.map(entity => {
                //         if (entity[idFieldName] === action.payload.entity[idFieldName]) {
                //             return action.payload.entity;
                //         }
                //         return entity;
                //     });
                // }
                state.loadingMessage = ''
            },
            ...extraReducers
        }
        this.slice = createSlice({
            name: reducerName,
            initialState: this.initialState,
            reducers: reducers
        })
        this.reducer = this.slice.reducer
    }
}