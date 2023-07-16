import React, { Suspense, lazy, useMemo } from "react";
import { useSelector } from "react-redux";
import { Switch, Redirect } from "react-router-dom";

import { LayoutSplashScreen, ContentRoute } from "../../../_metronic/layout";

const projectPage = lazy(() => import("./ProjectMaster/projectPage"));
const taskPage = lazy(() => import("./TaskMaster/taskPage"));


const TransactionPage = () => {

  const { moduleMasterState } = useSelector(state => {
    return {
      moduleMasterState: state.moduleMaster
    }
  })

  const routes = useMemo(() => {

    let parentId = moduleMasterState?.entities?.filter(x => x.parentModuleId === null && x.path === "/transaction")?.[0]?.id

    return <Switch>
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === null && x.path === "/transaction")?.[0] ?
          <Redirect exact from="/transaction" to={moduleMasterState.entities.filter(x => x.parentModuleId !== null && x.parentModuleId === parentId)[0].path} /> : null
      }
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === parentId)?.map((x,index) => {
          if(x.path === "/transaction/project") {
            return <ContentRoute key={index} path="/transaction/project" component={projectPage} />
          } else if(x.path === "/ticket") {
            return <ContentRoute key={index} path="/ticket" component={taskPage} />
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

export default TransactionPage;
