import React, { Suspense, lazy, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import { Redirect, Switch} from "react-router-dom";
import { LayoutSplashScreen, ContentRoute } from "../_metronic/layout";
// import { moduleMasterActions } from "./modules/Masters/ModuleMaster/_redux/ModuleMasterRedux";
// import { MyPage } from "./pages/MyPage";

const MastersPage = lazy(() =>
  import("./modules/Masters/mastersPage")
);

const ReportsPage = lazy(() =>
  import("./modules/Reports/reportsPage")
);

const ProjectCoordinatorDashboard = lazy(() =>
  import("./modules/Dashboard/ProjectCoordinatorDashboard")
);

const ProjectManagerDashboard = lazy(() =>
  import("./modules/Dashboard/ProjectManagerDashboard")
);

const DashboardPage = lazy(() =>
  import("./modules/Dashboard/dashboardPage")
);

const TransactionPage = lazy(() =>
  import("./modules/Transaction/transactionPage")
);

const TicketPage = lazy(() =>
  import("./modules/Transaction/TaskMaster/taskPage")
);

const ProjectPage = lazy(() =>
  import("./modules/Transaction/ProjectMaster/projectPage")
);

const CustomerPage = lazy(() =>
  import("./modules/Masters/OrganizationMaster/organizationPage")
);

const EngineerPage = lazy(() =>
  import("./modules/Masters/EngineerMaster/engineerPage")
);

const SettingsPage = lazy(() =>
  import("./modules/Settings/settingsPage")
);

const ActivityLogsPage = lazy(() =>
  import("./modules/ActivityLogs/activityPage")
);

const EmailPage = lazy(() =>
  import("./modules/Email/EmailPage")
)
const NoModulePage = lazy(() =>
  import("./NoModulePage")
)


export default function BasePage() {

  const { moduleMasterState } = useSelector(state => {
    return {
      moduleMasterState: state.moduleMaster
    }
  })

  useEffect(() => {
    const initialValue = document.body.style.zoom;

    // Change zoom level on mount
    document.body.style.zoom = "90%";

    return () => {
      // Restore default value
      document.body.style.zoom = initialValue;
    };
  }, []);

  const ticketPathRegEx = /\/ticket\/.*.\/edit/;

  const routes = useMemo(() => {

    return <Switch>
      {sessionStorage.getItem("historyPage")?.match(ticketPathRegEx) ?
        <Redirect exact from="/" to={sessionStorage.getItem("historyPage")} />
        :
        moduleMasterState?.entities?.filter(x => x.parentModuleId == null)?.[0] ?
          <Redirect exact from="/" to={moduleMasterState.entities.filter(x => x.parentModuleId == null)?.[0]?.path} /> : null
      }
      {
        moduleMasterState?.entities?.filter(x => x.parentModuleId == null)?.map((item, index) => {
          if (item.path === "/masters") {
            return <ContentRoute key={index} path="/masters" component={MastersPage} />
          } else if (item.path === "/reports") {
            return <ContentRoute key={index} path="/reports" component={ReportsPage} />
          } else if (item.path === "/dashboard") {
            return <ContentRoute key={index} path="/dashboard" component={DashboardPage} />
          }
          // else if (item.path === "/dashboard/coordinator") {
          //   return <ContentRoute key={index} path="/dashboard/coordinator" component={ProjectCoordinatorDashboard} />
          // } else if (item.path === "/dashboard/manager") {
          //   return <ContentRoute key={index} path="/dashboard/manager" component={ProjectManagerDashboard} />
          // } 
          else if (item.path === "/ticket") {
            return <ContentRoute key={index} path="/ticket" component={TicketPage} />
          } else if (item.path === "/project") {
            return <ContentRoute key={index} path="/project" component={ProjectPage} />
          } else if (item.path === "/customer") {
            return <ContentRoute key={index} path="/customer" component={CustomerPage} />
          } else if (item.path === "/engineer") {
            return <ContentRoute key={index} path="/engineer" component={EngineerPage} />
          } else if (item.path === "/settings") {
            return <ContentRoute key={index} path="/settings" component={SettingsPage} />
          }
        })
      }
      <ContentRoute path="/activity-logs" component={ActivityLogsPage} />

      {/* <ContentRoute path="/email-config" component={EmailConfigEditPage} /> */}
      {/* <Redirect to="error/error-v1" /> */}
      {/* {moduleMasterState?.entities?.length === 0 ? <ContentRoute path="/no-access" component={NoModulePage} /> : null}
      {moduleMasterState?.entities?.length === 0 ? <Redirect to="/no-access" /> : null} */}
    </Switch>

  }, [moduleMasterState])

  return (
    <Suspense fallback={<LayoutSplashScreen />}>
      {routes}
    </Suspense>
  );
}
