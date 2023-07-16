import React from "react";
import { Formik } from "formik";
import { isEqual } from "lodash";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl } from "../../../../_metronic/_helpers";

const prepareFilter = (qParams, values) => {
  const { searchText } = values;
  const newQParams = { ...qParams };
  const filter = { ...newQParams.filter };
  for (let key in qParams.filter) {
    if (typeof filter[key] === "object") {
      for (let subkey in qParams.filter[key]) {
        filter[key][subkey] = searchText ?? "";
      }
    } else {
      filter[key] = searchText ?? "";
    }
  }
  newQParams.filter = filter;
  return newQParams;
};

const POSTableFilter = ({ qParams, setQParams }) => {
  const applyFilter = (values) => {
    const newQParams = prepareFilter(qParams, values);
    if (!isEqual(newQParams, qParams)) {
      newQParams.pageNumber = 1;
      setQParams(newQParams);
    }
  };
  return (
    <Formik
      initialValues={{ searchText: "" }}
      onSubmit={(values) => {
        applyFilter(values);
      }}
    >
      {({ values, handleSubmit, handleBlur, setFieldValue }) => (
        <form onSubmit={handleSubmit} className="form">
          <div className="row">
            <div className="col-lg-12">
              <div className="input-group">
                <div className="input-group-prepend">
                  <div className="input-group-text">
                    <span className="svg-icon svg-icon-md svg-icon-dark">
                      <SVG
                        src={toAbsoluteUrl(
                          "/media/svg/icons/General/Search.svg"
                        )}
                      />
                    </span>
                  </div>
                </div>
                <input
                  type="text"
                  className="form-control"
                  name="searchText"
                  placeholder="Search in all fields"
                  onBlur={handleBlur}
                  values={values.searchText}
                  onChange={(e) => {
                    setFieldValue("searchText", e.target.value);
                    handleSubmit();
                  }}
                />
              </div>
              {/* <small className="form-text text-muted">
                                        <b>Search</b> in all fields
                                    </small> */}
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

export default POSTableFilter;
