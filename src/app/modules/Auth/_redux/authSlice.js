import { createSlice } from "@reduxjs/toolkit";

const initialAuthState = {
    user: undefined,
    authToken: undefined
};

export const authSlice = createSlice({
    name: "auth",
    initialState: initialAuthState,
    reducers: {
        login: (state, action) => {
            state.authToken = action.payload.authToken
        },
        register: (state, action) => {
            state.authToken = action.payload.authToken
            state.user = undefined
        },
        logout: (state, actions) => {
            state = initialAuthState
        },
        requestUser: (state, actions) => {
            state.user = actions.payload.user
        },
        userLoaded: (state, actions) => {
            state.user = actions.payload.user
        }
    }
});
