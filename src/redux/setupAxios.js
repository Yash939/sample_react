export default function setupAxios(axios, store) {
  axios.interceptors.request.use(
    config => {
      const {
        auth: { authToken }
      } = store.getState();

      if (authToken) {
        config.headers.Authorization = `Bearer ${authToken}`;
        // if (config.data)
        //   config.data.token = `${authToken}`
        // else
        //   config.data = { token: `${authToken}` };
      }
      return config;
    },
    err => Promise.reject(err)
  );
  axios.interceptors.response.use(response => response, error => {
    if (error.response && error.response.status === 401 && error.response.data.path !== "/POSLocalAPI/authenticate") {
      localStorage.removeItem("persist:ticketing-admin-auth");
      window.location.reload()
      // if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      //   window.location.assign("/auth/login")
      // } else {
      //   window.location.assign("/pos-web-admin/auth/login")
      // }
      // window.location.reload()
    }
    return Promise.reject(error)
  })
}
