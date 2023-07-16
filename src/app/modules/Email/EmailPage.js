import React, { Suspense, lazy, useMemo } from "react";
import { useSelector } from "react-redux";
import { Switch, Redirect } from "react-router-dom";

import { LayoutSplashScreen, ContentRoute } from "../../../_metronic/layout";

const EmailConfigEditPage = lazy(() => import("./EmailConfig/EmailConfigEditPage"));
const EmailCloseEditPage = lazy(() => import("./EmailClose/EmailCloseEditPage"))
const EmailCancleEditPage = lazy(() => import("./EmailCancle/EmailCancleEditPage"));
// const UserPage = lazy(() => import("./UserStaff/userPage"));


const EmailPage = () => {

  const { moduleMasterState } = useSelector(state => {
    return {
      moduleMasterState: state.moduleMaster
    }
  })

  const routes = useMemo(() => {

    let settingsId = moduleMasterState?.entities?.filter(x => x.parentModuleId === null && x.path === "/settings")?.[0]?.id

    let parentId = moduleMasterState?.entities?.filter(x => x.parentModuleId === settingsId && x.path === "/settings/config")?.[0]?.id

    return <Switch>
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === settingsId && x.path === "/settings/config")?.[0] ?
          <Redirect exact from="/settings/config" to={moduleMasterState.entities.filter(x => x.parentModuleId !== null && x.parentModuleId === parentId)?.[0]?.path} /> : null
      }
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId === parentId)?.map(x => {
            console.log(x.path);
          if(x.path === "/settings/config/email-create") {
            return <ContentRoute path="/settings/config/email-create" component={EmailConfigEditPage} />
          } else if(x.path === "/settings/config/email-close") {
            return <ContentRoute path="/settings/config/email-close" component={EmailCloseEditPage} />
          } else if(x.path === "/settings/config/email-cancel") {
            return <ContentRoute path="/settings/config/email-cancel" component={EmailCancleEditPage} />
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

export default EmailPage;
