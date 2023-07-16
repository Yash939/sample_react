import React, { Suspense, lazy, useMemo } from "react";
import { useSelector } from "react-redux";
import { Switch, Redirect } from "react-router-dom";

import { LayoutSplashScreen, ContentRoute } from "../../../_metronic/layout";

// const TechDashboard = lazy(() => import("./TechDashboard"));
const ProjectManagerDashboard = lazy(() => import("./ProjectManagerDashboard"));
const ProjectCoordinatorDashboard = lazy(() => import("./ProjectCoordinatorDashboard"));


const DashboardPage = () => {

  const { moduleMasterState } = useSelector(state => {
    return {
      moduleMasterState: state.moduleMaster
    }
  })

  const routes = useMemo(() => {

    let parentId = moduleMasterState?.entities?.filter(x => x.parentModuleId === null && x.path === "/dashboard")?.[0]?.id

    return <Switch>
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === null && x.path === "/dashboard")?.[0] ?
          <Redirect exact from="/dashboard" to={moduleMasterState.entities.filter(x => x.parentModuleId !== null && x.parentModuleId === parentId)[0].path} /> : null
      }
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === parentId)?.map(x => {
          if(x.path === "/dashboard/coordinator") {
            return <ContentRoute path="/dashboard/coordinator" component={ProjectCoordinatorDashboard} />
          } else if(x.path === "/dashboard/manager") {
            return <ContentRoute path="/dashboard/manager" component={ProjectManagerDashboard} />
          }
          // else if(x.path === "/dashboard/tech") {
          //   return <ContentRoute path="/dashboard/tech" component={TechDashboard} />
          // }
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

export default DashboardPage;
