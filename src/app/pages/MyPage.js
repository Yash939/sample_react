import Axios from "axios";
import { ErrorMessage } from "formik";
import React, { useEffect, useState } from "react";
import { useRouteMatch } from "react-router-dom";
import { FLUSH } from "redux-persist";

export const MyPage = () => {
  const { params: { id } } = useRouteMatch()
  const [module, setModule] = useState()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Axios.get("http://103.86.16.42:8080/POSLocalAPI/moduleMST/id/" + id)
      .then(res => {
        setModule(res?.data?.data)
        setLoading(false)
      })
      .catch(err => {
        alert("Error " + err.message)
        console.log("Module error : ", ErrorMessage)
        setLoading(false)
      })
  }, [])

  const saveClicked = () => {
    if (id && module && module.path) {
      setLoading(true)
      Axios.all([
        Axios.put("http://103.86.16.42:8080/POSLocalAPI/moduleMST/update/", module),
        Axios.put("http://103.86.16.42:8080/PineAppleRestAPITEST/moduleMST/update/", module),
      ]).then(Axios.spread((devAPi, testAPI) => {
        setModule(devAPi?.data?.data)
        alert("Response Dev API : " + devAPi?.data?.message)
        alert("Response Test API : " + testAPI?.data?.message)
        if (devAPi?.data?.status) {
          window.location.assign(module.path)
        } else
          setLoading(false)
      })).catch(err => {
        alert("Error " + err.message)
        console.log("Module error : ", err)
        setLoading(false)
      })
    }
  }

  return (
    <>
      {
        loading
          ? <h3>Loading...</h3>
          : module
            ? (
              <div className="form-group row">
                <h1 className="col-2">MODULE</h1>
                <h1 className="col-10">{module.moduleName}</h1>
                <h1 className="col-2">Path</h1>
                <input value={module.path ?? ""} className="form-control col-9" type="text" onChange={(e) => setModule({ ...module, path: e.target.value })} />
                <button className="btn btn-primary col-1" onClick={saveClicked}>SAVE</button>
                <pre className="bg-dark text-light col-12">{JSON.stringify(module, null, 4)}</pre>
              </div>
            )
            : <h3>Module not found</h3>
      }
    </>
  );
};
