import React, { Suspense, lazy, useMemo } from "react";
import { useSelector } from "react-redux";
import { Switch, Redirect } from "react-router-dom";

import { LayoutSplashScreen, ContentRoute } from "../../../_metronic/layout";

const UserPage = lazy(() => import("./UserStaff/userPage"));
const CountryPage = lazy(() => import("./CountryMaster/countryPage"));
const statePage = lazy(() => import("./StateMaster/statePage"));
const cityPage = lazy(() => import("./CityMaster/cityPage"));
const currencyPage = lazy(() => import("./CurrencyMaster/currencyPage"));
const taskPriorityPage = lazy(() => import("./TaskPriorityMaster/taskPriorityPage"));
const taskStatusPage = lazy(() => import("./TaskStatusMaster/taskStatusPage"));


const MastersPage = () => {

  const { moduleMasterState } = useSelector(state => {
    return {
      moduleMasterState: state.moduleMaster
    }
  })

  const routes = useMemo(() => {

    let settingsId = moduleMasterState?.entities?.filter(x => x.parentModuleId === null && x.path === "/settings")?.[0]?.id

    let parentId = moduleMasterState?.entities?.filter(x => x.parentModuleId === settingsId && x.path === "/settings/masters")?.[0]?.id

    return <Switch>
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === settingsId && x.path === "/settings/masters")?.[0] ?
          <Redirect exact from="/settings/masters" to={moduleMasterState.entities.filter(x => x.parentModuleId !== null && x.parentModuleId === parentId)?.[0]?.path} /> : null
      }
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === parentId)?.map(x => {
          if(x.path === "/settings/masters/user") {
            return <ContentRoute path="/settings/masters/user" component={UserPage} />
          } else if(x.path === "/settings/masters/country") {
            return <ContentRoute path="/settings/masters/country" component={CountryPage} />
          } else if(x.path === "/settings/masters/state") {
            return <ContentRoute path="/settings/masters/state" component={statePage} />
          } else if(x.path === "/settings/masters/city") {
            return <ContentRoute path="/settings/masters/city" component={cityPage} />
          } else if(x.path === "/settings/masters/currency") {
            return <ContentRoute path="/settings/masters/currency" component={currencyPage} />
          } else if(x.path === "/settings/masters/ticket-priority") {
            return <ContentRoute path="/settings/masters/ticket-priority" component={taskPriorityPage} />
          } else if(x.path === "/settings/masters/ticket-status") {
            return <ContentRoute path="/settings/masters/ticket-status" component={taskStatusPage} />
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

export default MastersPage;
