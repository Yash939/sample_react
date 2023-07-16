import React from "react";
import {CircularProgress} from "@material-ui/core";
// import {toAbsoluteUrl} from "../../_helpers";

export function SplashScreen() {
  return (
    <>
      <div className="splash-screen">
        {/* <img
          src={toAbsoluteUrl("/media/logos/logo-mini-md.png")}
          alt="Metronic logo"
        /> */}
        <h1>Helllo</h1>
        <CircularProgress className="splash-screen-spinner" />
      </div>
    </>
  );
}
