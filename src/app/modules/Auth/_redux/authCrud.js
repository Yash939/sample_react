import axios from "axios";

// export const LOGIN_URL = process.env.REACT_APP_API_URL + "authenticate";
export const LOGIN_URL = process.env.REACT_APP_API_URL + "userMST/login/";
export const REGISTER_URL = "api/auth/register";
export const REQUEST_PASSWORD_URL = "api/auth/forgot-password";
export const FORGOT_PASSWORD_URL = process.env.REACT_APP_API_URL + "userMST/forgotPassword/"
export const CHANGE_PASSWORD_URL = process.env.REACT_APP_API_URL + "userMST/changePassword/"

export const ME_URL = process.env.REACT_APP_API_URL + "userMST/loggedInUser/";

export function login(username, password) {
  return axios.post(LOGIN_URL, { userName: username, password: password, system: 'admin' });
}

export function register(email, fullname, username, password) {
  return axios.post(REGISTER_URL, { email, fullname, username, password });
}

export function requestPassword(values) {
  return axios.post(FORGOT_PASSWORD_URL, values);
}

export function changePassword(values) {
  return axios.put(CHANGE_PASSWORD_URL, values);
}

export function getUserByToken() {
  // Authorization head should be fulfilled in interceptor.
  return axios.get(ME_URL);
}
