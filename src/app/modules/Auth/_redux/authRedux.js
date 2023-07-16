import { persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import { put, takeLatest } from "redux-saga/effects";
import { getUserByToken } from "./authCrud";

export const actionTypes = {
  Login: "[Login] Action",
  Logout: "[Logout] Action",
  Register: "[Register] Action",
  UserRequested: "[Request User] Action",
  UserLoaded: "[Load User] Auth API"
};

const initialAuthState = {
  user: undefined,
  authToken: undefined,
  roleCode: undefined,
  groupCode: undefined,
  customerName: undefined,
  customerType: undefined,
  customerGroup: undefined,
  customerMSTId: undefined
};

export const reducer = persistReducer(
  { storage, key: "ticketing-admin-auth", whitelist: ["user", "authToken", "roleCode", "groupCode", "customerName", "customerType", "customerGroup", "customerMSTId"] },
  (state = initialAuthState, action) => {
    switch (action.type) {
      case actionTypes.Login: {
        const { authToken } = action.payload;

        return { authToken, user: undefined, roleCode: undefined, groupCode: undefined, customerName: undefined, customerType: undefined, customerGroup: undefined, customerMSTId: undefined };
      }

      case actionTypes.Register: {
        const { authToken } = action.payload;

        return { authToken, user: undefined, roleCode: undefined, groupCode: undefined, customerName: undefined, customerType: undefined, customerGroup: undefined, customerMSTId: undefined };
      }

      case actionTypes.Logout: {
        // TODO: Change this code. Actions in reducer aren't allowed.
        return initialAuthState;
      }

      case actionTypes.UserLoaded: {
        const { user } = action.payload;
        const roleCode = user?.userRoleMST?.roleCode;
        const groupCode = user?.userGroupMST?.groupCode
        const customerName = user?.customerMST?.customerName 
        const customerType = user?.customerMST?.customerType
        const customerGroup = user?.customerMST?.customerGroup
        const customerMSTId = user?.customerMSTId
        return { ...state, user,roleCode,groupCode,customerName,customerType,customerGroup,customerMSTId };
      }

      default:
        return state;
    }
  }
);

export const actions = {
  login: authToken => ({ type: actionTypes.Login, payload: { authToken } }),
  register: authToken => ({
    type: actionTypes.Register,
    payload: { authToken }
  }),
  logout: () => ({ type: actionTypes.Logout }),
  requestUser: user => ({ type: actionTypes.UserRequested, payload: { user } }),
  fulfillUser: user => ({ type: actionTypes.UserLoaded, payload: { user } })
};

export function* saga() {
  yield takeLatest(actionTypes.Login, function* loginSaga() {
    yield put(actions.requestUser());
  });

  yield takeLatest(actionTypes.Register, function* registerSaga() {
    yield put(actions.requestUser());
  });

  yield takeLatest(actionTypes.UserRequested, function* userRequested() {
    const { data } = yield getUserByToken();
    yield put(actions.fulfillUser(data.data.userMST));
  });
}
