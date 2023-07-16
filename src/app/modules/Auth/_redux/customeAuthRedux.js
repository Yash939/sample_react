import { put, takeLatest } from "redux-saga/effects";
import { authSlice } from "./authSlice";
import { getUserByToken } from "./authCrud"

const { actions } = authSlice
export const { reducer } = authSlice.reducer

export const actionTypes = {
    Login: "[Login] Action",
    Logout: "[Logout] Action",
    Register: "[Register] Action",
    UserRequested: "[Request User] Action",
    UserLoaded: "[Load User] Auth API"
};

export function* saga() {
    yield takeLatest(actionTypes.Login, function* loginSaga() {
        yield put(actions.requestUser());
    });

    yield takeLatest(actionTypes.Register, function* registerSaga() {
        yield put(actions.requestUser());
    });

    yield takeLatest(actionTypes.UserRequested, function* userRequested() {
        const { data: data } = yield getUserByToken();
        yield put(actions.userLoaded(data.data));
    });
}
