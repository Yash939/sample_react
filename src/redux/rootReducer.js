import { all } from "redux-saga/effects";
import { combineReducers } from "redux";

import * as auth from "../app/modules/Auth/_redux/authRedux";

import { moduleMasterSlice } from "../app/modules/Masters/ModuleMaster/_redux/ModuleMasterRedux";
import { userRoleSlice } from "../app/modules/Masters/UserStaff/UserRole/_redux/UserRoleRedux";
import { userMasterSlice } from "../app/modules/Masters/UserStaff/UserMaster/_redux/UserMasterRedux";
import { userAutorizationSlice } from "../app/modules/Masters/UserStaff/UserAuthorization/_redux/UserAuthorizationRedux";
import { countryMasterSlice } from "../app/modules/Masters/CountryMaster/_redux/CountryMasterRedux";
import { stateMasterSlice } from "../app/modules/Masters/StateMaster/_redux/StateMasterRedux";
import { cityMasterSlice } from "../app/modules/Masters/CityMaster/_redux/CityMasterRedux";
import { currencyMasterSlice } from "../app/modules/Masters/CurrencyMaster/_redux/CurrencyMasterRedux";
import { taskPriorityMasterSlice } from "../app/modules/Masters/TaskPriorityMaster/_redux/TaskPriorityMasterRedux";
import { taskStatusMasterSlice } from "../app/modules/Masters/TaskStatusMaster/_redux/TaskStatusMasterRedux";
import { organizationMasterSlice } from "../app/modules/Masters/OrganizationMaster/_redux/OrganizationMasterRedux";
import { operationalConfigMasterSlice } from "../app/modules/Masters/OperationalConfig/_redux/OperationalConfigRedux";
import { reportsSlice } from "../app/modules/Reports/_redux/ReportsRedux";
import { userRoleStatusAccessMasterSlice } from "../app/modules/Masters/UserStaff/UserRole/_redux/UserRoleStatusAccessRedux";
import { systemMasterSlice } from "../app/modules/Masters/SystemMaster/_redux/SystemMasterRedux";
import { projectMasterSlice } from "../app/modules/Transaction/ProjectMaster/_redux/ProjectMasterRedux";
import { taskMasterSlice } from "../app/modules/Transaction/TaskMaster/_redux/TaskMasterRedux";
import { taskDetailSlice } from "../app/modules/Transaction/TaskMaster/_redux/TaskDetailsRedux";
import { engineerMasterSlice } from "../app/modules/Masters/EngineerMaster/_redux/EngineerMasterRedux";
import { activityLogsSlice } from "../app/modules/ActivityLogs/_redux/ActivityLogsRedux";
import { projectLogsSlice } from "../app/modules/ActivityLogs/_redux/ProjectLogsRedux";
import { taskAttachmentSlice } from "../app/modules/Transaction/TaskMaster/_redux/TaskAttachmentRedux";
import { reportsPayOutSlice } from "../app/modules/Reports/_redux/PayOutReportRedux";
import { reportsPayInSlice } from "../app/modules/Reports/_redux/PayInReportRedux";
import { projectAttachmentSlice } from "../app/modules/Transaction/ProjectMaster/_redux/ProjectAttachmentRedux";
import { projectBranchSlice } from "../app/modules/Transaction/ProjectMaster/_redux/ProjectBranchRedux";
import { taskPendingReasonsMasterSlice } from "../app/modules/Masters/TaskPendingStatusMaster/_redux/TaskPendingStatusMasterRedux";
import { termsAndConditionsMasterSlice } from "../app/modules/Masters/TermsAndConditionsMaster/_redux/TermsAndConditionsMasterRedux";

export const rootReducer = combineReducers({
  auth: auth.reducer,
  systemMaster: systemMasterSlice.reducer,
  moduleMaster: moduleMasterSlice.reducer,
  userRole: userRoleSlice.reducer,
  userMaster: userMasterSlice.reducer,
  userAuthorization: userAutorizationSlice.reducer,
  countryMaster: countryMasterSlice.reducer,
  stateMaster: stateMasterSlice.reducer,
  cityMaster: cityMasterSlice.reducer,
  currencyMaster: currencyMasterSlice.reducer,
  taskPriorityMaster: taskPriorityMasterSlice.reducer,
  taskStatusMaster: taskStatusMasterSlice.reducer,
  organizationMaster: organizationMasterSlice.reducer,
  projectMaster: projectMasterSlice.reducer,
  taskMaster: taskMasterSlice.reducer,
  taskDetail: taskDetailSlice.reducer,
  operationalConfigMaster: operationalConfigMasterSlice.reducer,
  reports: reportsSlice.reducer,
  userRoleStatusAccessMaster: userRoleStatusAccessMasterSlice.reducer,
  engineerMaster: engineerMasterSlice.reducer,
  activityLogs: activityLogsSlice.reducer,
  projectLogs: projectLogsSlice.reducer,
  taskAttachment: taskAttachmentSlice.reducer,
  reportPayOut: reportsPayOutSlice.reducer,
  reportPayIn: reportsPayInSlice.reducer,
  projectAttachment: projectAttachmentSlice.reducer,
  projectBranch: projectBranchSlice.reducer,
  taskPendingReasonsMaster: taskPendingReasonsMasterSlice.reducer,
  termsAndConditionsMaster: termsAndConditionsMasterSlice.reducer
});

export function* rootSaga() {
  yield all([auth.saga()]);
}
