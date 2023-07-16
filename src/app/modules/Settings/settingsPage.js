import React, { Suspense, lazy, useMemo } from "react";
import { useSelector } from "react-redux";
import { Switch, Redirect } from "react-router-dom";

import { LayoutSplashScreen, ContentRoute } from "../../../_metronic/layout";

const masterPage = lazy(() => import("../Masters/mastersPage"));
const configPage = lazy(() => import("../Email/EmailPage"));


const SettingsPage = () => {

  const { moduleMasterState } = useSelector(state => {
    return {
      moduleMasterState: state.moduleMaster
    }
  })

  const routes = useMemo(() => {

    let parentId = moduleMasterState?.entities?.filter(x => x.parentModuleId === null && x.path === "/settings")?.[0]?.id

    return <Switch>
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === null && x.path === "/settings")?.[0] ?
          <Redirect exact from="/settings" to={moduleMasterState.entities.filter(x => x.parentModuleId !== null && x.parentModuleId === parentId)?.[0]?.path} /> : null
      }
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === parentId)?.map(x => {
          if(x.path === "/settings/masters") {
            return <ContentRoute path="/settings/masters" component={masterPage} />
          } else if(x.path === "/settings/config") {
            return <ContentRoute path="/settings/config" component={configPage} />
          }
        })
      }
      {/* <Redirect to="error/error-v1" /> */}
    </Switch>

  }, [moduleMasterState])

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      {routes}
    </Suspense>
  );
};

export default SettingsPage;
