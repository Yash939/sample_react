import * as requestFromServer from "./authCrud";
import { authSlice } from "./authSlice";

const { actions } = authSlice;


export const login = authToken => dispatch => {
    dispatch(actions.login({ authToken }))
}
export const register = authToken => dispatch => {
    dispatch(actions.register({ authToken }))

}
export const logout = () => dispatch => {
    dispatch(actions.logout())
}
export const requestUser = user => dispatch => {
    dispatch(actions.r)
}
export const fulfillUser = user => ({ type: actionTypes.UserLoaded, payload: { user } })

