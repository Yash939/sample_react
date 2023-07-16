import React, { Suspense, lazy, useMemo } from "react";
import { useSelector } from "react-redux";
import { Switch, Redirect } from "react-router-dom";

import { LayoutSplashScreen, ContentRoute } from "../../../_metronic/layout";

const TaskStatusSummaryReport = lazy(() => import("./TaskStatusSummaryReport"));
const TaskStatusDetailReport = lazy(() => import("./TaskStatusDetailReport"));
const PayOutReport = lazy(() => import("./PayOutReport"));
const PayInReport = lazy(() => import("./PayInReport"));
const SettlementReport = lazy(() => import("./SettlementReport"));

const ReportsPage = () => {

  const { moduleMasterState } = useSelector(state => {
    return {
      moduleMasterState: state.moduleMaster
    }
  })

  const routes = useMemo(() => {

    let parentId = moduleMasterState?.entities?.filter(x => x.parentModuleId === null && x.path === "/reports")?.[0]?.id

    return <Switch>
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === null && x.path === "/reports")?.[0] ?
          <Redirect exact from="/reports" to={moduleMasterState.entities.filter(x => x.parentModuleId !== null && x.parentModuleId === parentId)[0].path} /> : null
      }
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === parentId)?.map((x,index) => {
          if(x.path === "/reports/ticket-status-summary") {
            return <ContentRoute key={index} path="/reports/ticket-status-summary" component={TaskStatusSummaryReport} />
          } else if(x.path === "/reports/ticket-status-detail") {
            return <ContentRoute key={index} path="/reports/ticket-status-detail" component={TaskStatusDetailReport} />
          } else if(x.path === "/reports/pay-out") {
            return <ContentRoute key={index} path="/reports/pay-out" component={PayOutReport} />
          } else if(x.path === "/reports/pay-in") {
            return <ContentRoute key={index} path="/reports/pay-in" component={PayInReport} />
          } else if(x.path === "/reports/settlement") {
            return <ContentRoute key={index} path="/reports/settlement" component={SettlementReport} />
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

export default ReportsPage;
