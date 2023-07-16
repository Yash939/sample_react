import React, { useEffect, useMemo, useRef, useState } from "react";
import { Formik, Form, Field } from "formik";
import {
  AutoCompleteSelect,
  Input,
  TextArea,
} from "../../../../../_metronic/_partials/controls";
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { taskMasterActions } from "../_redux/TaskMasterRedux";
import { taskStatusMasterActions } from "../../../Masters/TaskStatusMaster/_redux/TaskStatusMasterRedux";
import { taskPriorityMasterActions } from "../../../Masters/TaskPriorityMaster/_redux/TaskPriorityMasterRedux";
import { currencyMasterActions } from "../../../Masters/CurrencyMaster/_redux/CurrencyMasterRedux";
import { HTMLEditorField } from "../../../../../_metronic/_partials/controls/forms/HTMLEditorField";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import SVG from "react-inlinesvg";
import { taskDetailActions } from "../_redux/TaskDetailsRedux";
import { userMasterActions } from "../../../Masters/UserStaff/UserMaster/_redux/UserMasterRedux";
import moment from "moment-timezone";
import {
  getErrors,
  isValidCurrency,
  isValidNumber,
  isValidZipCode,
  setTimeForDate,
  sortArray,
  sortArrayByDate,
  useLoggedInUserRoleCode,
} from "../../../_commons/Utils";
import { engineerMasterActions } from "../../../Masters/EngineerMaster/_redux/EngineerMasterRedux";
import TabularView from "../../../_commons/components/TabularView";
import tz_lookup from "tz-lookup";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { groupBy } from "lodash";
import { taskAttachmentActions } from "../_redux/TaskAttachmentRedux";
import ErrorFocus from "../../../_commons/ErrorFocus";
import draftToHtml from "draftjs-to-html";
import { reportsPayOutActions } from "../../../Reports/_redux/PayOutReportRedux";
import BootstrapTable from "react-bootstrap-table-next";
import cellEditFactory from "react-bootstrap-table2-editor";
import { reportsPayInActions } from "../../../Reports/_redux/PayInReportRedux";
import EngineerModal from "../EngineerModal";
import { AntdDateTimePickerField } from "../../../../../_metronic/_partials/controls/forms/AntdDateTimePickerField";
import { AntdTimePickerField } from "../../../../../_metronic/_partials/controls/forms/AntdTimePickerField";
// import { confirm } from 'react-bootstrap-confirmation';
import AssignEngineerModal from "./AssignEngineerModal";
import { useDropzone } from "react-dropzone";
import { countryMasterActions } from "../../../Masters/CountryMaster/_redux/CountryMasterRedux";
import { stateMasterActions } from "../../../Masters/StateMaster/_redux/StateMasterRedux";
import { cityMasterActions } from "../../../Masters/CityMaster/_redux/CityMasterRedux";
import { AutoCompleteSelectWindow } from "../../../../../_metronic/_partials/controls/forms/AutoCompleteSelectWindow";
import PendingReasonModal from "./PendingReasonModal";
// import {DocumentViewer} from 'react-documents'
// import DocViewer, { DocViewerRenderers, PDFRenderer, PNGRenderer } from "react-doc-viewer";
import { taskPendingReasonsMasterActions } from "../../../Masters/TaskPendingStatusMaster/_redux/TaskPendingStatusMasterRedux";

function isValidSOW(message) {
  return this.test("isValidSOW", message, function(value) {
    const { path, createError } = this;

    if (!value) {
      return createError({ path, message: message ?? "Required" });
    }

    const editorData = EditorState.createWithContent(
      convertFromRaw(JSON.parse(value))
    );

    if (editorData.getCurrentContent().getPlainText() === "") {
      return createError({ path, message: message ?? "Required" });
    }
    return true;
  });
}

const actualHoursFormatter = (value) => {
  if (value) {
    let tmpMin = value;
    let tmpHours = Math.floor(value / 60);
    let tmpMins = tmpMin % 60;
    tmpMins = tmpMins === 0 ? "00" : tmpMins;
    tmpHours = tmpHours < 10 ? "0" + tmpHours : tmpHours;
    return tmpHours + ":" + String("0" + tmpMins).slice(-2);
  }
  return "00:00";
};

const headerButtonStyles = {
  minWidth: "85px",
  whiteSpace: "nowrap",
};

const EditForm = ({
  enitity,
  saveRecord,
  submitBtnRef,
  resetBtnRef,
  isReadOnlyPage,
}) => {
  const dispatch = useDispatch();

  const {
    currentState,
    taskStatusMasterState,
    taskPriorityMasterState,
    userMasterState,
    currencyMasterState,
    engineerMasterState,
    reportPayOutError,
    reportPayOutEntities,
    reportPayInError,
    reportPayInEntities,
    authState,
    countryMasterState,
    stateMasterState,
    cityMasterState,
    taskPendingReasonsMasterState,
  } = useSelector(
    (state) => ({
      currentState: state.taskMaster,
      taskStatusMasterState: state.taskStatusMaster,
      taskPriorityMasterState: state.taskPriorityMaster,
      userMasterState: state.userMaster,
      currencyMasterState: state.currencyMaster,
      engineerMasterState: state.engineerMaster,
      reportPayOutError: state.reportPayOut.error,
      reportPayOutEntities: state.reportPayOut.entities,
      reportPayInError: state.reportPayIn.error,
      reportPayInEntities: state.reportPayIn.entities,
      authState: state.auth,
      countryMasterState: state.countryMaster,
      stateMasterState: state.stateMaster,
      cityMasterState: state.cityMaster,
      taskPendingReasonsMasterState: state.taskPendingReasonsMaster,
    }),
    shallowEqual
  );

  const [currentSortOrder, setCurrentSortOrder] = useState(0);
  const [remarksCharCount, setRemarksCharCount] = useState({
    payIn: 0,
    payOut: 0,
  });
  const [isUplift, setIsUplift] = useState(false);
  const [isFlatRate, setIsFlatRate] = useState(false);
  const [isUpliftWeekend, setIsUpliftWeekend] = useState(false);
  const [isFlatRateWeekend, setIsFlatRateWeekend] = useState(false);
  const [isUpliftPayIn, setIsUpliftPayIn] = useState(false);
  const [isFlatRatePayIn, setIsFlatRatePayIn] = useState(false);
  const [isUpliftPayInWeekend, setIsUpliftPayInWeekend] = useState(false);
  const [isFlatRatePayInWeekend, setIsFlatRatePayInWeekend] = useState(false);
  const [isFullDayRate, setIsFullDayRate] = useState(false);
  const [isMinHours, setIsMinHours] = useState(false);
  const [isFullDayRatePayIn, setIsFullDayRatePayIn] = useState(false);
  const [isMinHoursPayIn, setIsMinHoursPayIn] = useState(false);
  const [isCordinator, setIsCordinator] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [weekendDays, setWeekendDays] = useState([]);
  const [modal, setModal] = useState(false);
  const [attachmentState, setAttachmentState] = useState([]);
  const [attachmentStateCount, setAttachmentStateCount] = useState(0);
  const [updateError, setUpdateError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [filestoBeDeleted, setFilestoBeDeleted] = useState([]);
  const [canEditStartEndTime, setCanEditStartEndTime] = useState(true);
  const [canchangeprojectcoordinator, setCanchangeprojectcoordinator] = useState(true);
  const [canEditCustomerStartEndTime, setCanEditCustomerStartEndTime] = useState(true);
  const [canChangeEngineer, setCanChangeEngineer] = useState(true);
  const [canChangeStatus, setCanChangeStatus] = useState(true);
  const [paidOut, setPaidOut] = useState(false);
  const [paidIn, setPaidIn] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isPenalty, setIsPenalty] = useState(false);
  const [canViewPayOut, setCanViewPayOut] = useState(true);
  const [screenSize, setScreenSize] = useState(false);
  const [hasPayOutAccess, setHasPayOutAccess] = useState(false);
  const [hasPayInAccess, setHasPayInAccess] = useState(false);
  const [canEditPayOut, setCanEditPayOut] = useState(true);
  const [errorOnSumit, setErrorOnSumit] = useState(false);
  const [canChangeAddress, setCanChangeAddress] = useState(false);
  const [pendingStatusId, setPendingStatusId] = useState(null);
  const [canupdatehwpro, setcanupdatehwpro] = useState(true);
  const roleCode = useLoggedInUserRoleCode();

  useEffect(() => {
    if (roleCode.includes("pm")) {
      setIsManager(true);
    }

    if (roleCode.includes("pco")) {
      setIsCordinator(true);
    }
  }, [roleCode]);

  useEffect(() => {
    if (authState?.user?.userRoleMST?.statusAccessList) {
      const statusAccessList = authState.user.userRoleMST.statusAccessList;
      for (let index = 0; index < statusAccessList.length; index++) {
        const element = statusAccessList[index];
        if (element.accessRights === "FULL") {
          if (element.statusMST.payOutFlag === true) {
            setHasPayOutAccess(true);
          }
          if (element.statusMST.payInFlag === true) {
            setHasPayInAccess(true);
          }
        }
      }
    }
  }, [authState]);

  const bodyClassName = useMemo(() => {
    const date = new Date();
    return (
      "pos-editable-table-body-" +
      date.getHours() +
      date.getMinutes() +
      date.getSeconds() +
      date.getMilliseconds()
    );
  }, []);

  useEffect(() => {
    isReadOnlyPage
      ? (document.title = "View Ticket")
      : (document.title = "Update Ticket");
    dispatch(taskStatusMasterActions.getAllActive());
    dispatch(taskPriorityMasterActions.getAllActive());
    dispatch(userMasterActions.getAll());
    dispatch(currencyMasterActions.getAllActive());
    dispatch(engineerMasterActions.getAll());
    dispatch(countryMasterActions.getAllActive());
    dispatch(taskPendingReasonsMasterActions.getAllActive());
    if (window.innerWidth < 550) {
      setScreenSize(true);
    }
  }, []);

  const taskTypes = [
    { label: "Onsite", value: 1 },
    { label: "Online", value: 2 },
    { label: "HW Procurement", value: 3 },
  ];

  const dayOption = [
    { label: "Full Day", value: "fullday" },
    { label: "Half Day", value: "halfday" },
  ];

  const openEngineerModal = () => {
    const modal = <EngineerModal closeModalHandler={() => setModal(null)} />;
    setModal(modal);
  };

  const openAssignEngineerModal = (
    data,
    setFieldValue,
    entity,
    setTimingsData
  ) => {
    const modal = (
      <AssignEngineerModal
        closeModalHandler={() => setModal(null)}
        data={data}
        values={entity}
        setTimingsData={setTimingsData}
        setUpdateError={setUpdateError}
        convertBlankToNull={convertBlankToNull}
      />
    );
    setModal(modal);
  };

  //code unique validation
  const editId = currentState?.entityForEdit?.id ?? 0;

  const getFormattedActuals = (value) => {
    if (value) {
      let tmpMin = value;
      let tmpHours = Math.floor(value / 60);
      let tmpMins = tmpMin % 60;
      tmpMins = tmpMins === 0 ? "00" : tmpMins;
      return (
        String("0" + tmpHours).slice(-2) + ":" + String("0" + tmpMins).slice(-2)
      );
    }
    return "00:00";
  };

  const convertBlankToNull = (val) => {
    const colArray = [
      "abhPayinRate",
      "abhPayoutRate",
      "obhPayinRate",
      "obhPayoutRate",
      "rbhPayinRate",
      "rbhPayoutRate",
      "weekendPayInFlatRate",
      "weekendPayInMultiplier",
      "weekendPayOutFlatRate",
      "weekendPayOutMultiplier",
      "travelChargesPayIn",
      "materialChargesPayIn",
      "parkingChargesPayIn",
      "otherChargesPayIn",
      "travelCharges",
      "materialCharges",
      "parkingCharges",
      "otherCharges",
      "minHoursPayIn",
      "minHoursPayOut",
      "fullDayRatesPayIn",
      "fullDayRatesPayOut",
    ];

    colArray.forEach((col) => {
      if (val[col] === "") {
        val[col] = null;
      }
    });
  };

  const convertNullToBlank = (val) => {
    const colArray = [
      "abhPayinRate",
      "abhPayoutRate",
      "obhPayinRate",
      "obhPayoutRate",
      "rbhPayinRate",
      "rbhPayoutRate",
      "weekendPayInFlatRate",
      "weekendPayInMultiplier",
      "weekendPayOutFlatRate",
      "weekendPayOutMultiplier",
      "travelChargesPayIn",
      "materialChargesPayIn",
      "parkingChargesPayIn",
      "otherChargesPayIn",
      "travelCharges",
      "materialCharges",
      "parkingCharges",
      "otherCharges",
      "minHoursPayIn",
      "minHoursPayOut",
      "fullDayRatesPayIn",
      "fullDayRatesPayOut",
    ];

    colArray.forEach((col) => {
      if (val[col] === null || val[col] === undefined) {
        val[col] = "";
      }
    });
  };

  let entity = useMemo(() => {
    let timezone = moment.tz.guess(true);
    let userTimezone = moment.tz.guess(true);

    if (enitity?.cityMST?.latitude && enitity?.cityMST?.longitude) {
      timezone = tz_lookup(enitity.cityMST.latitude, enitity.cityMST.longitude);
    }

    if (enitity?.countryMST?.weekendDays) {
      const sortedData = enitity.countryMST.weekendDays
        .split(",")
        .map((x) => parseInt(x))
        ?.sort();
      setWeekendDays(sortedData);
    }

    if (isCordinator) {
      if (enitity?.taskType)
      {
          if (enitity?.taskType == 3)
          {
            setcanupdatehwpro(false);
          }

      }
    }
    let tmpEntity = {
      ...enitity,
      taskDetails: [],
      /* startDateTime: currentTime, endDateTime: currentTime , */ statusMSTId: 0,
      actualAbh: 0,
      actualObh: 0,
      actualRbh: 0,

      rbhStartTiming: enitity?.rbhStartTiming
        ? moment(enitity.rbhStartTiming, "HH:mm").toDate()
        : null,
      obhStartTiming: enitity?.obhStartTiming
        ? moment(enitity.obhStartTiming, "HH:mm").toDate()
        : null,
      abhStartTiming: enitity?.abhStartTiming
        ? moment(enitity.abhStartTiming, "HH:mm").toDate()
        : null,
      rbhStartTimingPayIn: enitity?.rbhStartTimingPayIn
        ? moment(enitity.rbhStartTimingPayIn, "HH:mm").toDate()
        : null,
      obhStartTimingPayIn: enitity?.obhStartTimingPayIn
        ? moment(enitity.obhStartTimingPayIn, "HH:mm").toDate()
        : null,
      abhStartTimingPayIn: enitity?.abhStartTimingPayIn
        ? moment(enitity.abhStartTimingPayIn, "HH:mm").toDate()
        : null,
      rbhEndTiming: enitity?.rbhEndTiming
        ? moment(enitity.rbhEndTiming, "HH:mm").toDate()
        : null,
      obhEndTiming: enitity?.obhEndTiming
        ? moment(enitity.obhEndTiming, "HH:mm").toDate()
        : null,
      abhEndTiming: enitity?.abhEndTiming
        ? moment(enitity.abhEndTiming, "HH:mm").toDate()
        : null,
      rbhEndTimingPayIn: enitity?.rbhEndTimingPayIn
        ? moment(enitity.rbhEndTimingPayIn, "HH:mm").toDate()
        : null,
      obhEndTimingPayIn: enitity?.obhEndTimingPayIn
        ? moment(enitity.obhEndTimingPayIn, "HH:mm").toDate()
        : null,
      abhEndTimingPayIn: enitity?.abhEndTimingPayIn
        ? moment(enitity.abhEndTimingPayIn, "HH:mm").toDate()
        : null,
      timezone: timezone,
      statusMSTId: enitity?.taskStatusMSTId,
    };

    if (enitity?.countryMSTId && enitity.countryMSTId !== 0) {
      dispatch(stateMasterActions.getByCountry(enitity?.countryMSTId));
      if (enitity?.stateMSTId && enitity.stateMSTId !== 0) {
        dispatch(
          cityMasterActions.getByCountryAndState(
            enitity.countryMSTId,
            enitity.stateMSTId
          )
        );
      } else {
        dispatch(cityMasterActions.getByCountry(enitity.countryMSTId));
      }

      let countryCode = countryMasterState?.entities?.find(
        (x) => x.id === enitity.countryMSTId
      )?.countryCode;
      tmpEntity.countryCode = countryCode;
    }

    tmpEntity.endDateTime = null;

    if (tmpEntity.taskDTLList && tmpEntity.taskDTLList.length > 0) {
      sortArray(tmpEntity.taskDTLList);

      tmpEntity.taskDetails = sortArrayByDate(
        tmpEntity.taskDTLList,
        "modifiedOn"
      );

      tmpEntity.taskDetails = tmpEntity.taskDetails.map((x) => ({
        ...x,
        startDateTime: moment
          .tz(x.startDateTime, "utc")
          .add(tmpEntity.utcOffset ?? 0, "minutes")
          .format("YYYY-MM-DD HH:mm"),
        endDateTime: x.endDateTime
          ? moment
              .tz(x.endDateTime, "utc")
              .add(tmpEntity.utcOffset ?? 0, "minutes")
              .format("YYYY-MM-DD HH:mm")
          : null,
        customerStartDateTime: x.customerStartDateTime
          ? moment
              .tz(x.customerStartDateTime, "utc")
              .add(tmpEntity.utcOffset ?? 0, "minutes")
              .format("YYYY-MM-DD HH:mm")
          : null,
        customerEndDateTime: x.customerEndDateTime
          ? moment
              .tz(x.customerEndDateTime, "utc")
              .add(tmpEntity.utcOffset ?? 0, "minutes")
              .format("YYYY-MM-DD HH:mm")
          : null,
        modifiedOn: moment
          .tz(x.modifiedOn, "utc")
          .tz(userTimezone)
          .format("YYYY-MM-DD HH:mm:ss"),
        timezone: timezone,
        rbhEndTiming: tmpEntity.rbhEndTiming,
        rbhStartTiming: tmpEntity.rbhStartTiming,
        rbhStartTimingPayIn: tmpEntity.rbhStartTimingPayIn,
        rbhEndTimingPayIn: tmpEntity.rbhEndTimingPayIn,
      }));

      if (tmpEntity?.taskStatusMST?.reopenFlag === true) {
        setCurrentSortOrder(
          taskStatusMasterState.entities?.filter(
            (x) => x.defaultFlag === true
          )?.[0]?.sortOrder ?? 0
        );
      } else {
        setCurrentSortOrder(tmpEntity?.taskStatusMST?.sortOrder ?? 0);
      }

      if (isManager || isCordinator) {
        if (
          tmpEntity?.taskStatusMST?.confirmFlag === true ||          
          tmpEntity?.taskStatusMST?.payOutFlag === true
        ) {
          setCanEditStartEndTime(false);
          setCanchangeprojectcoordinator(false);
        }
      }

      if (isCordinator) {
        if (
          tmpEntity?.taskStatusMST?.closeFlag === true 
        ) {          
          setCanchangeprojectcoordinator(false);
        }
      }
      if (isManager || isCordinator) {
        if (
          tmpEntity?.taskStatusMST?.confirmFlag === true ||
          tmpEntity?.taskStatusMST?.payInFlag === true
        ) {
          setCanEditCustomerStartEndTime(false);
        }
      }
      
      if (isCordinator) {
        if (tmpEntity?.taskStatusMST?.closeFlag === true) {
          setCanChangeStatus(false);
        }
        if (tmpEntity?.taskStatusMST?.confirmFlag === true) {
          setCanEditPayOut(false);
        }
      }
      if (roleCode === "admin") {
        if (tmpEntity?.payOutFlag === true) {
          setCanEditStartEndTime(false);
          setCanchangeprojectcoordinator(false);
        }
        if (tmpEntity?.payInFlag === true) {
          setCanEditCustomerStartEndTime(false);
        }
      }

      if (tmpEntity?.payInFlag === true) {
        setPaidIn(true);
      }
      if (tmpEntity?.payOutFlag === true) {
        setPaidOut(true);
        setCanEditPayOut(false);
      }

      const dtlRow = tmpEntity?.taskDetails?.filter(
        (x) => x.notes === null && !x.log
      )?.[0];
      tmpEntity.startDateTime = dtlRow.startDateTime;
      tmpEntity.endDateTime = dtlRow.endDateTime;
      tmpEntity.customerStartDateTime = dtlRow.customerStartDateTime;
      tmpEntity.customerEndDateTime = dtlRow.customerEndDateTime;
      tmpEntity.actualAbh = dtlRow.actualAbh;
      tmpEntity.actualRbh = dtlRow.actualRbh;
      tmpEntity.actualObh = dtlRow.actualObh;
      tmpEntity.actualAbhMin = dtlRow.actualAbhMin;
      tmpEntity.actualRbhMin = dtlRow.actualRbhMin;
      tmpEntity.actualObhMin = dtlRow.actualObhMin;
      tmpEntity.payInAbh = dtlRow.payInAbh;
      tmpEntity.payInRbh = dtlRow.payInRbh;
      tmpEntity.payInObh = dtlRow.payInObh;
      tmpEntity.payInAbhMin = dtlRow.payInAbhMin;
      tmpEntity.payInRbhMin = dtlRow.payInRbhMin;
      tmpEntity.payInObhMin = dtlRow.payInObhMin;
      tmpEntity.travelChargesPayIn = dtlRow.travelChargesPayIn ?? "";
      tmpEntity.travelCharges = dtlRow.travelCharges ?? "";
      tmpEntity.materialChargesPayIn = dtlRow.materialChargesPayIn ?? "";
      tmpEntity.materialCharges = dtlRow.materialCharges ?? "";
      tmpEntity.parkingChargesPayIn = dtlRow.parkingChargesPayIn ?? "";
      tmpEntity.parkingCharges = dtlRow.parkingCharges ?? "";
      tmpEntity.otherChargesPayIn = dtlRow.otherChargesPayIn ?? "";
      tmpEntity.otherCharges = dtlRow.otherCharges ?? "";
      tmpEntity.closure = false;
      tmpEntity.cancellation = false;
      tmpEntity.taskPendingReasonsMSTId = dtlRow.taskPendingReasonsMSTId;

      if (
        dtlRow.actualAbh > 0 ||
        dtlRow.actualRbh > 0 ||
        dtlRow.actualObh > 0 ||
        dtlRow.payInAbh > 0 ||
        dtlRow.payInRbh > 0 ||
        dtlRow.payInObh > 0
      ) {
        setCanChangeEngineer(false);
      }
    } else {
      if (taskStatusMasterState?.entities) {
        setCurrentSortOrder(
          taskStatusMasterState.entities?.filter(
            (x) => x.defaultFlag === true
          )?.[0]?.sortOrder ?? 0
        );
      }
    }

    if (tmpEntity.taskLogs && tmpEntity.taskLogs.length > 0) {
      tmpEntity.taskLogs = tmpEntity.taskLogs.map((x) => ({
        ...x,
        planDateTime: moment
          .tz(x.planDateTime, "utc")
          .add(x.utcOffset ?? 0, "minutes")
          .format("YYYY-MM-DD HH:mm"),
        modifiedOn: moment
          .tz(x.modifiedOn, "utc")
          .tz(userTimezone)
          .format("YYYY-MM-DD HH:mm:ss"),
      }));
    }

    if (tmpEntity?.planDateTime) {
      tmpEntity.planDateTime = moment
        .tz(tmpEntity.planDateTime, "utc")
        .add(tmpEntity.utcOffset ?? 0, "minutes")
        .format("YYYY-MM-DD HH:mm");
    }

    if (tmpEntity?.dueDateTime) {
      tmpEntity.dueDateTime = moment
        .tz(tmpEntity.dueDateTime, "utc")
        .add(tmpEntity.utcOffset ?? 0, "minutes")
        .format("YYYY-MM-DD HH:mm");
    }

    // Handle Attachments

    if (tmpEntity?.taskAttachments && tmpEntity?.taskAttachments?.length > 0) {
      let tmpUploadedFiles = [];
      let currentCount = attachmentStateCount;

      tmpEntity.taskAttachments.forEach((x) => {
        let tmp = {
          file: null,
          fileDownloadUri: x.attachment,
          fileName: x?.attachment
            ?.split("/")
            ?.pop()
            ?.slice(6)
            ?.replace("%20", " "),
          id: x.id,
          key: currentCount,
        };
        currentCount = currentCount + 1;
        tmpUploadedFiles.push(tmp);
      });

      setAttachmentState(tmpUploadedFiles);
      setAttachmentStateCount(currentCount);
    } else {
      setAttachmentState([]);
      setAttachmentStateCount(0);
    }

    // Handle Disable Flat Rate/Uplift Of

    if (tmpEntity?.abhPayinRate) {
      setIsUpliftPayIn(true);
    } else {
      setIsUpliftPayIn(false);
    }

    if (tmpEntity?.abhPayoutRate) {
      setIsUplift(true);
    } else {
      setIsUplift(false);
    }

    if (tmpEntity?.obhPayoutRate) {
      setIsFlatRate(true);
    } else {
      setIsFlatRate(false);
    }

    if (tmpEntity?.obhPayinRate) {
      setIsFlatRatePayIn(true);
    } else {
      setIsFlatRatePayIn(false);
    }

    if (tmpEntity?.weekendPayInMultiplier) {
      setIsUpliftPayInWeekend(true);
    } else {
      setIsUpliftPayInWeekend(false);
    }

    if (tmpEntity?.weekendPayInFlatRate) {
      setIsFlatRatePayInWeekend(true);
    } else {
      setIsFlatRatePayInWeekend(false);
    }

    if (tmpEntity?.weekendPayOutMultiplier) {
      setIsUpliftWeekend(true);
    } else {
      setIsUpliftWeekend(false);
    }

    if (tmpEntity?.weekendPayOutFlatRate) {
      setIsFlatRateWeekend(true);
    } else {
      setIsFlatRateWeekend(false);
    }

    if (tmpEntity?.fullDayRatesPayIn) {
      setIsFullDayRatePayIn(true);
    } else {
      setIsFullDayRatePayIn(false);
    }

    if (tmpEntity?.fullDayRatesPayOut) {
      setIsFullDayRate(true);
    } else {
      setIsFullDayRate(false);
    }

    if (tmpEntity?.minHoursPayIn) {
      setIsMinHoursPayIn(true);
    } else {
      setIsMinHoursPayIn(false);
    }

    if (tmpEntity?.minHoursPayOut) {
      setIsMinHours(true);
    } else {
      setIsMinHours(false);
    }

    tmpEntity.notes = null;
    tmpEntity.reference1 = tmpEntity.reference1 ?? "";
    tmpEntity.reference2 = tmpEntity.reference2 ?? "";
    tmpEntity.planDateTime = tmpEntity.planDateTime ?? "";
    tmpEntity.dueDateTime = tmpEntity.dueDateTime ?? "";

    convertNullToBlank(tmpEntity);

    //Handle POC

    let engineerRow = engineerMasterState?.entities?.find(
      (x) => x.id === tmpEntity?.taskUserId
    );
    if (engineerRow) {
      tmpEntity.POC = engineerRow?.pointOfContact?.engineerName;
    } else {
      tmpEntity.POC = "";
    }

    tmpEntity.minHoursPayIn =
      tmpEntity.minHoursPayIn === null ||
      tmpEntity.minHoursPayIn === undefined ||
      tmpEntity.minHoursPayIn === ""
        ? ""
        : tmpEntity.minHoursPayIn / 60;
    tmpEntity.minHoursPayOut =
      tmpEntity.minHoursPayOut === null ||
      tmpEntity.minHoursPayOut === undefined ||
      tmpEntity.minHoursPayOut === ""
        ? ""
        : tmpEntity.minHoursPayOut / 60;

    //Handle Address Change

    const assignedSortOrder = taskStatusMasterState?.entities?.find(
      (x) => x.assignedFlag === true
    )?.sortOrder;
    if (
      tmpEntity?.taskStatusMST &&
      tmpEntity.taskStatusMST.sortOrder <= assignedSortOrder
    ) {
      setCanChangeAddress(true);
    } else {
      setCanChangeAddress(false);
    }

    //Handle Decimals

    tmpEntity.rbhPayinRate =
      tmpEntity.rbhPayinRate !== null &&
      tmpEntity.rbhPayinRate !== undefined &&
      tmpEntity.rbhPayinRate !== ""
        ? parseFloat(tmpEntity.rbhPayinRate).toFixed(2)
        : tmpEntity.rbhPayinRate;
    tmpEntity.fullDayRatesPayIn =
      tmpEntity.fullDayRatesPayIn !== null &&
      tmpEntity.fullDayRatesPayIn !== undefined &&
      tmpEntity.fullDayRatesPayIn !== ""
        ? parseFloat(tmpEntity.fullDayRatesPayIn).toFixed(2)
        : tmpEntity.fullDayRatesPayIn;
    tmpEntity.abhPayinRate =
      tmpEntity.abhPayinRate !== null &&
      tmpEntity.abhPayinRate !== undefined &&
      tmpEntity.abhPayinRate !== ""
        ? parseFloat(tmpEntity.abhPayinRate).toFixed(2)
        : tmpEntity.abhPayinRate;
    tmpEntity.obhPayinRate =
      tmpEntity.obhPayinRate !== null &&
      tmpEntity.obhPayinRate !== undefined &&
      tmpEntity.obhPayinRate !== ""
        ? parseFloat(tmpEntity.obhPayinRate).toFixed(2)
        : tmpEntity.obhPayinRate;
    tmpEntity.weekendPayInMultiplier =
      tmpEntity.weekendPayInMultiplier !== null &&
      tmpEntity.weekendPayInMultiplier !== undefined &&
      tmpEntity.weekendPayInMultiplier !== ""
        ? parseFloat(tmpEntity.weekendPayInMultiplier).toFixed(2)
        : tmpEntity.weekendPayInMultiplier;
    tmpEntity.weekendPayInFlatRate =
      tmpEntity.weekendPayInFlatRate !== null &&
      tmpEntity.weekendPayInFlatRate !== undefined &&
      tmpEntity.weekendPayInFlatRate !== ""
        ? parseFloat(tmpEntity.weekendPayInFlatRate).toFixed(2)
        : tmpEntity.weekendPayInFlatRate;
    tmpEntity.rbhPayoutRate =
      tmpEntity.rbhPayoutRate !== null &&
      tmpEntity.rbhPayoutRate !== undefined &&
      tmpEntity.rbhPayoutRate !== ""
        ? parseFloat(tmpEntity.rbhPayoutRate).toFixed(2)
        : tmpEntity.rbhPayoutRate;
    tmpEntity.fullDayRatesPayOut =
      tmpEntity.fullDayRatesPayOut !== null &&
      tmpEntity.fullDayRatesPayOut !== undefined &&
      tmpEntity.fullDayRatesPayOut !== ""
        ? parseFloat(tmpEntity.fullDayRatesPayOut).toFixed(2)
        : tmpEntity.fullDayRatesPayOut;
    tmpEntity.abhPayoutRate =
      tmpEntity.abhPayoutRate !== null &&
      tmpEntity.abhPayoutRate !== undefined &&
      tmpEntity.abhPayoutRate !== ""
        ? parseFloat(tmpEntity.abhPayoutRate).toFixed(2)
        : tmpEntity.abhPayoutRate;
    tmpEntity.obhPayoutRate =
      tmpEntity.obhPayoutRate !== null &&
      tmpEntity.obhPayoutRate !== undefined &&
      tmpEntity.obhPayoutRate !== ""
        ? parseFloat(tmpEntity.obhPayoutRate).toFixed(2)
        : tmpEntity.obhPayoutRate;
    tmpEntity.weekendPayOutMultiplier =
      tmpEntity.weekendPayOutMultiplier !== null &&
      tmpEntity.weekendPayOutMultiplier !== undefined &&
      tmpEntity.weekendPayOutMultiplier !== ""
        ? parseFloat(tmpEntity.weekendPayOutMultiplier).toFixed(2)
        : tmpEntity.weekendPayOutMultiplier;
    tmpEntity.weekendPayOutFlatRate =
      tmpEntity.weekendPayOutFlatRate !== null &&
      tmpEntity.weekendPayOutFlatRate !== undefined &&
      tmpEntity.weekendPayOutFlatRate !== ""
        ? parseFloat(tmpEntity.weekendPayOutFlatRate).toFixed(2)
        : tmpEntity.weekendPayOutFlatRate;

    setRemarksCharCount({
      payIn: tmpEntity?.payInRemarks?.length ?? 0,
      payOut: tmpEntity?.payOutRemarks?.length ?? 0,
    });

    return tmpEntity;
  }, [enitity, editId, taskStatusMasterState]);

  const getDateWiseStartEnd = (startDate, endDate, timezone) => {
    let startTime = startDate.clone();
    let dates = [];

    let tmpStartTime = startDate.clone();
    while (startTime.isSameOrBefore(endDate)) {
      if (
        moment
          .tz(startTime, "YYYY-MM-DD HH:mm", timezone)
          .endOf("day")
          .isBefore(endDate)
      ) {
        dates.push([
          tmpStartTime.format("HH:mm"),
          moment
            .tz(startTime, "YYYY-MM-DD HH:mm", timezone)
            .endOf("day")
            .format("HH:mm"),
          moment
            .tz(startTime, "YYYY-MM-DD HH:mm", timezone)
            .format("YYYY-MM-DD"),
        ]);
      } else {
        dates.push([
          tmpStartTime.format("HH:mm"),
          moment.tz(endDate, "YYYY-MM-DD HH:mm", timezone).format("HH:mm"),
          moment.tz(endDate, "YYYY-MM-DD HH:mm", timezone).format("YYYY-MM-DD"),
        ]);
      }

      tmpStartTime = moment
        .tz(tmpStartTime, "YYYY-MM-DD HH:mm", timezone)
        .endOf("day")
        .add(1, "m");

      startTime = startTime.add(1, "days").set({
        hour: 0,
        minute: 0,
        second: 0,
        millisecond: 0,
      });
    }
    return dates;
  };

  const checkOverlap = (timeSegments) => {
    if (timeSegments.length === 1) return false;

    timeSegments.sort((timeSegment1, timeSegment2) =>
      timeSegment1[0].localeCompare(timeSegment2[0])
    );

    for (let i = 0; i < timeSegments.length - 1; i++) {
      let currentEndTime = timeSegments[i][1];
      let nextStartTime = timeSegments[i + 1][0];

      currentEndTime = currentEndTime === "00:00" ? "24:00" : currentEndTime;
      // nextStartTime = nextStartTime === "00:00" ? "24:00" : nextStartTime

      if (currentEndTime > nextStartTime) {
        return true;
      }
    }
    return false;
  };

  const getActuals = (startTime, endTime, bhStartTime, bhEndTime) => {
    if (
      !checkOverlap([
        [startTime, endTime],
        [bhStartTime, bhEndTime],
      ])
    ) {
      return 0;
    }

    // startTime = startTime === "00:00" ? "23:59" : startTime
    endTime = endTime === "00:00" || endTime === "23:59" ? "24:00" : endTime;
    // bhStartTime = bhStartTime === "00:00" ? "23:59" : bhStartTime
    bhEndTime =
      bhEndTime === "00:00" || bhEndTime === "23:59" ? "24:00" : bhEndTime;

    let tmpStartTime = moment(startTime, "HH:mm");
    let tmpEndTime = moment(endTime, "HH:mm");
    let tmpBhStartTime = moment(bhStartTime, "HH:mm");
    let tmpBhEndTime = moment(bhEndTime, "HH:mm");

    if (
      !tmpStartTime.isBetween(tmpBhStartTime, tmpBhEndTime, undefined, "[]") &&
      tmpEndTime.isBetween(tmpBhStartTime, tmpBhEndTime, undefined, "[]")
    ) {
      return tmpEndTime.diff(tmpBhStartTime, "minutes", true);
    } else if (
      tmpStartTime.isBetween(tmpBhStartTime, tmpBhEndTime, undefined, "[]") &&
      !tmpEndTime.isBetween(tmpBhStartTime, tmpBhEndTime, undefined, "[]")
    ) {
      return tmpBhEndTime.diff(tmpStartTime, "minutes", true);
    } else if (
      tmpStartTime.isBetween(tmpBhStartTime, tmpBhEndTime, undefined, "[]") &&
      tmpEndTime.isBetween(tmpBhStartTime, tmpBhEndTime, undefined, "[]")
    ) {
      return tmpEndTime.diff(tmpStartTime, "minutes", true);
    } else if (
      !tmpStartTime.isBetween(tmpBhStartTime, tmpBhEndTime, undefined, "[]") &&
      !tmpEndTime.isBetween(tmpBhStartTime, tmpBhEndTime, undefined, "[]")
    ) {
      return tmpBhEndTime.diff(tmpBhStartTime, "minutes", true);
    }

    return 0;
  };

  const calculateActuals = (
    startDateTime,
    endDateTime,
    values,
    setFieldValue,
    forPayIn = false,
    rbhStartTimeParam,
    rbhEndTimeParam,
    forMinHours = false
  ) => {
    let rbhStartTime = rbhStartTimeParam
      ? typeof rbhStartTimeParam === "string"
        ? moment(rbhStartTimeParam, "HH:mm")
        : rbhStartTimeParam
      : rbhStartTimeParam;
    let rbhEndTime = rbhEndTimeParam
      ? typeof rbhEndTimeParam === "string"
        ? moment(rbhEndTimeParam, "HH:mm")
        : rbhEndTimeParam
      : rbhEndTimeParam;

    const timezone = values?.timezone;

    if (
      startDateTime === endDateTime ||
      startDateTime === null ||
      endDateTime === null
    ) {
      if (forPayIn) {
        if (forMinHours) {
          setFieldValue("payInRbhMin", "0");
          setFieldValue("payInObhMin", "0");
          setFieldValue("payInAbhMin", "0");
        } else {
          setFieldValue("payInRbh", "0");
          setFieldValue("payInObh", "0");
          setFieldValue("payInAbh", "0");
        }
      } else {
        if (forMinHours) {
          setFieldValue("actualRbhMin", "0");
          setFieldValue("actualObhMin", "0");
          setFieldValue("actualAbhMin", "0");
        } else {
          setFieldValue("actualRbh", "0");
          setFieldValue("actualObh", "0");
          setFieldValue("actualAbh", "0");
        }
      }

      return;
    }

    const date1 = moment.tz(startDateTime, "YYYY-MM-DD HH:mm", timezone);
    const date2 = moment.tz(endDateTime, "YYYY-MM-DD HH:mm", timezone);

    const dateWiseStartEndArray = getDateWiseStartEnd(date1, date2, timezone);

    if (forPayIn) {
      if (rbhStartTime && rbhEndTime) {
        let actualRBH = 0;
        let actualOBH = 0;
        let actualABH = 0;

        dateWiseStartEndArray.forEach((x) => {
          let tmpBH = 0;

          if (moment(rbhStartTime, "HH:mm") > moment(rbhEndTime, "HH:mm")) {
            tmpBH =
              tmpBH +
              getActuals(
                x[0],
                x[1],
                moment(rbhStartTime).format("HH:mm"),
                "00:00"
              );
            tmpBH =
              tmpBH +
              getActuals(
                x[0],
                x[1],
                "00:00",
                moment(rbhEndTime).format("HH:mm")
              );
          } else {
            tmpBH =
              tmpBH +
              getActuals(
                x[0],
                x[1],
                moment(rbhStartTime).format("HH:mm"),
                moment(rbhEndTime).format("HH:mm")
              );
          }

          if (weekendDays.includes(moment.tz(x[2], timezone).isoWeekday())) {
            actualABH = actualABH + tmpBH;
          } else {
            actualRBH = actualRBH + tmpBH;
          }
        });

        // OBH Calculation

        const tmpOBHStartTime = moment(rbhEndTime).format("HH:mm");
        const tmpOBHEndTime = moment(rbhStartTime).format("HH:mm");

        dateWiseStartEndArray.forEach((x) => {
          const day = moment.tz(x[2], timezone).isoWeekday();

          if (
            moment(tmpOBHStartTime, "HH:mm") > moment(tmpOBHEndTime, "HH:mm")
          ) {
            if (
              weekendDays.includes(day) ||
              weekendDays.includes(day + 1) ||
              (day === 7 && weekendDays.includes(1))
            ) {
              actualABH =
                actualABH + getActuals(x[0], x[1], tmpOBHStartTime, "00:00");
            } else {
              actualOBH =
                actualOBH + getActuals(x[0], x[1], tmpOBHStartTime, "00:00");
            }
            if (
              weekendDays.includes(day) ||
              weekendDays.includes(day - 1) ||
              (day === 1 && weekendDays.includes(7))
            ) {
              actualABH =
                actualABH + getActuals(x[0], x[1], "00:00", tmpOBHEndTime);
            } else {
              actualOBH =
                actualOBH + getActuals(x[0], x[1], "00:00", tmpOBHEndTime);
            }
          } else {
            if (
              weekendDays.includes(day) /*  || weekendDays.includes(day + 1) */
            ) {
              actualABH =
                actualABH +
                getActuals(x[0], x[1], tmpOBHStartTime, tmpOBHEndTime);
            } else {
              actualOBH =
                actualOBH +
                getActuals(x[0], x[1], tmpOBHStartTime, tmpOBHEndTime);
            }
          }
        });

        if (forMinHours) {
          setFieldValue("payInRbhMin", actualRBH);
          setFieldValue("payInObhMin", actualOBH);
          setFieldValue("payInAbhMin", actualABH);
        } else {
          setFieldValue("payInRbh", actualRBH);
          setFieldValue("payInObh", actualOBH);
          setFieldValue("payInAbh", actualABH);
        }
      } else {
        if (forMinHours) {
          setFieldValue("payInRbhMin", 0);
          setFieldValue("payInObhMin", 0);
          setFieldValue("payInAbhMin", 0);
        } else {
          setFieldValue("payInRbh", 0);
          setFieldValue("payInObh", 0);
          setFieldValue("payInAbh", 0);
        }
      }
    } else {
      if (rbhStartTime && rbhEndTime) {
        let actualRBH = 0;
        let actualOBH = 0;
        let actualABH = 0;

        dateWiseStartEndArray.forEach((x) => {
          let tmpBH = 0;

          if (moment(rbhStartTime, "HH:mm") > moment(rbhEndTime, "HH:mm")) {
            tmpBH =
              tmpBH +
              getActuals(
                x[0],
                x[1],
                moment(rbhStartTime).format("HH:mm"),
                "00:00"
              );
            tmpBH =
              tmpBH +
              getActuals(
                x[0],
                x[1],
                "00:00",
                moment(rbhEndTime).format("HH:mm")
              );
          } else {
            tmpBH =
              tmpBH +
              getActuals(
                x[0],
                x[1],
                moment(rbhStartTime).format("HH:mm"),
                moment(rbhEndTime).format("HH:mm")
              );
          }

          if (weekendDays.includes(moment.tz(x[2], timezone).isoWeekday())) {
            actualABH = actualABH + tmpBH;
          } else {
            actualRBH = actualRBH + tmpBH;
          }
        });

        // OBH Calculation

        const tmpOBHStartTime = moment(rbhEndTime).format("HH:mm");
        const tmpOBHEndTime = moment(rbhStartTime).format("HH:mm");

        dateWiseStartEndArray.forEach((x) => {
          const day = moment.tz(x[2], timezone).isoWeekday();

          if (
            moment(tmpOBHStartTime, "HH:mm") > moment(tmpOBHEndTime, "HH:mm")
          ) {
            if (
              weekendDays.includes(day) ||
              weekendDays.includes(day + 1) ||
              (day === 7 && weekendDays.includes(1))
            ) {
              actualABH =
                actualABH + getActuals(x[0], x[1], tmpOBHStartTime, "00:00");
            } else {
              actualOBH =
                actualOBH + getActuals(x[0], x[1], tmpOBHStartTime, "00:00");
            }
            if (
              weekendDays.includes(day) ||
              weekendDays.includes(day - 1) ||
              (day === 1 && weekendDays.includes(7))
            ) {
              actualABH =
                actualABH + getActuals(x[0], x[1], "00:00", tmpOBHEndTime);
            } else {
              actualOBH =
                actualOBH + getActuals(x[0], x[1], "00:00", tmpOBHEndTime);
            }
          } else {
            if (
              weekendDays.includes(day) /*  || weekendDays.includes(day + 1) */
            ) {
              actualABH =
                actualABH +
                getActuals(x[0], x[1], tmpOBHStartTime, tmpOBHEndTime);
            } else {
              actualOBH =
                actualOBH +
                getActuals(x[0], x[1], tmpOBHStartTime, tmpOBHEndTime);
            }
          }
        });

        if (forMinHours) {
          setFieldValue("actualRbhMin", actualRBH);
          setFieldValue("actualObhMin", actualOBH);
          setFieldValue("actualAbhMin", actualABH);
        } else {
          setFieldValue("actualRbh", actualRBH);
          setFieldValue("actualObh", actualOBH);
          setFieldValue("actualAbh", actualABH);
        }
      } else {
        if (forMinHours) {
          setFieldValue("actualRbhMin", 0);
          setFieldValue("actualObhMin", 0);
          setFieldValue("actualAbhMin", 0);
        } else {
          setFieldValue("actualRbh", 0);
          setFieldValue("actualObh", 0);
          setFieldValue("actualAbh", 0);
        }
      }
    }
  };

  const statusList = useMemo(() => {
    if (
      entity?.taskStatusMST?.confirmFlag === true ||
      entity?.payInFlag === true ||
      entity?.payOutFlag === true
    ) {
      setIsConfirmed(true);
    } else {
      setIsConfirmed(false);
    }

    if (taskStatusMasterState?.entities) {
      const pendingStatusId = taskStatusMasterState.entities?.find(
        (x) => x.pendingFlag === true
      )?.id;

      if (pendingStatusId) {
        setPendingStatusId(pendingStatusId);
      }

      if (entity?.taskStatusMST?.autoCloseFlag === true) {
        return [];
      } else if (entity?.taskStatusMST?.penaltyFlag === true) {
        return taskStatusMasterState.entities?.filter(
          (x) => x.penaltyFlag === true
        );
      } else if (entity?.taskStatusMST?.cancelFlag === true) {
        return taskStatusMasterState.entities?.filter(
          (x) =>
            x.penaltyFlag === true ||
            x.cancelFlag === true ||
            x.defaultFlag === true
        );
      } else if (
        entity?.taskStatusMST?.defaultFlag === true &&
        (entity?.taskUserId === null || entity?.taskUserId === 0)
      ) {
        return taskStatusMasterState.entities?.filter(
          (x) =>
            x.cancelFlag === true ||            
            x.pendingFlag === true
        );
      } else if (entity?.taskStatusMST?.defaultFlag === true) {
        return taskStatusMasterState.entities?.filter(
          (x) =>
            x.sortOrder >= currentSortOrder &&
            x.defaultFlag === false &&
            x.payInFlag === false &&
            x.payOutFlag === false
        );
      } else if (entity?.taskStatusMST?.assignedFlag === true) {
        return taskStatusMasterState.entities?.filter(
          (x) =>
            x.sortOrder >= currentSortOrder &&
            x.defaultFlag === false &&
            x.payInFlag === false &&
            x.payOutFlag === false &&
            x.penaltyFlag === false &&
            x.autoCloseFlag === false &&
            x.confirmFlag === false
        );
      } else if (
        entity?.taskStatusMST?.closeFlag === true &&
        entity?.taskStatusMST?.confirmFlag === false &&
        entity?.payInFlag === false &&
        entity?.payOutFlag === false
      ) {
        return taskStatusMasterState.entities?.filter(
          (x) =>
            x.sortOrder >= currentSortOrder &&
            x.defaultFlag === false &&
            x.payInFlag === false &&
            x.payOutFlag === false &&
            x.penaltyFlag === false &&
            x.autoCloseFlag === false &&
            x.confirmFlag === true
        );
      } else if (
        entity?.taskStatusMST?.confirmFlag === true &&
        roleCode === "admin"
      ) {
        return taskStatusMasterState.entities?.filter(
          (x) =>
            x.defaultFlag === false &&
            x.payInFlag === false &&
            x.payOutFlag === false &&
            x.penaltyFlag === false &&
            x.autoCloseFlag === false &&
            x.confirmFlag === false &&
            x.cancelFlag === false &&
            x.closeFlag === true
        );
      } else if (entity?.taskStatusMST?.pendingFlag === true) {
        return taskStatusMasterState.entities?.filter(
          (x) =>
            x.pendingFlag === true ||
            x.cancelFlag === true ||
            x.defaultFlag === true
        );
      } else {
        return taskStatusMasterState.entities?.filter(
          (x) =>
            x.sortOrder >= currentSortOrder &&
            x.defaultFlag === false &&
            x.payInFlag === false &&
            x.payOutFlag === false &&
            x.penaltyFlag === false &&
            x.autoCloseFlag === false &&
            x.confirmFlag === false &&
            x.cancelFlag === false
        );
      }
    }

    return [];
  }, [taskStatusMasterState, entity, currentSortOrder]);

  function isValidEndDateTime(ref, message) {
    return this.test("isValidEndDateTime", message, function(value) {
      const { path, createError } = this;
      let statusMSTId = this.resolve(ref);
      const data = this.parent;
      if (statusMSTId) {
        const row = taskStatusMasterState?.entities?.filter(
          (x) => x.id === statusMSTId
        )?.[0];
        if (row) {
          if (
            row.closeFlag &&
            !row.confirmFlag &&
            !row.payInFlag &&
            !row.payOutFlag &&
            !row.reopenFlag &&
            !row.penaltyFlag &&
            !row.autoCloseFlag &&
            !row.assignedFlag &&
            !row.wipFlag &&
            !row.cancelFlag
          ) {
            if (value === null || value === "" || value === undefined) {
              return createError({
                path,
                message: message ?? "End Date - Time Required ",
              });
            }
          }
        }
      }
      const startDateTime = data?.startDateTime;
      const endDateTime = data?.endDateTime;
      if (endDateTime) {
        if (startDateTime && startDateTime !== "") {
          if (
            moment(endDateTime, "yyyy-MM-DD HH:mm").isBefore(
              moment(startDateTime, "yyyy-MM-DD HH:mm")
            )
          ) {
            return createError({
              path,
              message:
                message ??
                "End Date - Time must not be greater than Start Date - Time",
            });
          }
        } else {
          return createError({
            path,
            message:
              message ??
              "End Date - Time must not be greater than Start Date - Time",
          });
        }
      }
      return true;
    });
  }
  function isValidCustomerEndDateTime(ref, message) {
    return this.test("isValidCustomerEndDateTime", message, function(value) {
      const { path, createError } = this;
      let statusMSTId = this.resolve(ref);
      const data = this.parent;
      if (statusMSTId) {
        const row = taskStatusMasterState?.entities?.filter(
          (x) => x.id === statusMSTId
        )?.[0];
        if (row) {
          if (
            row.closeFlag &&
            !row.confirmFlag &&
            !row.payInFlag &&
            !row.payOutFlag &&
            !row.reopenFlag &&
            !row.penaltyFlag &&
            !row.autoCloseFlag &&
            !row.assignedFlag &&
            !row.wipFlag &&
            !row.cancelFlag
          ) {
            if (value === null || value === "" || value === undefined) {
              return createError({
                path,
                message: message ?? "Customer End Date - Time Required ",
              });
            }
          }
        }
      }
      const startDateTime = data?.customerStartDateTime;
      const endDateTime = value;
      if (endDateTime) {
        if (startDateTime && startDateTime !== "") {
          if (
            moment(endDateTime, "yyyy-MM-DD HH:mm").isBefore(
              moment(startDateTime, "yyyy-MM-DD HH:mm")
            )
          ) {
            return createError({
              path,
              message:
                message ??
                "Customer End Date - Time must not be greater than Customer Start Date - Time",
            });
          }
        } else {
          return createError({
            path,
            message:
              message ??
              "Customer End Date - Time must not be greater than Customer Start Date - Time",
          });
        }
      }
      return true;
    });
  }
  function isValidCustomerStartDateTime(ref, message) {
    return this.test("isValidCustomerStartDateTime", message, function(value) {
      const { path, createError } = this;
      let statusMSTId = this.resolve(ref);
      if (statusMSTId) {
        const row = taskStatusMasterState?.entities?.filter(
          (x) => x.id === statusMSTId
        )?.[0];
        if (row) {
          if (
            row.closeFlag &&
            !row.confirmFlag &&
            !row.payInFlag &&
            !row.payOutFlag &&
            !row.reopenFlag &&
            !row.penaltyFlag &&
            !row.autoCloseFlag &&
            !row.assignedFlag &&
            !row.wipFlag &&
            !row.cancelFlag
          ) {
            if (value === null || value === "" || value === undefined) {
              return createError({
                path,
                message: message ?? "Customer Start Date - Time Required ",
              });
            }
          }
        }
      }
      return true;
    });
  }

  function isValidStatus(ref, message) {
    return this.test("isValidStatus", message, function(value) {
      const { path, createError } = this;
      let startDateTime = this.resolve(ref);

      if (value < 1 || value === null || value === undefined) {
        return createError({ path, message: "Ticket Status Required " });
      }

      if (startDateTime && startDateTime !== "") {
        const data = this.parent;

        const row = taskStatusMasterState?.entities?.find(
          (x) => x.id === value
        );
        if (row) {
          if (
            row.closeFlag &&
            !row.confirmFlag &&
            !row.payInFlag &&
            !row.payOutFlag &&
            !row.reopenFlag &&
            !row.penaltyFlag &&
            !row.autoCloseFlag &&
            !row.assignedFlag &&
            !row.wipFlag &&
            !row.cancelFlag
          ) {
            if (
              moment
                .tz(startDateTime, "YYYY-MM-DD HH:mm", data.timezone)
                .isAfter(moment.tz(data.timezone))
            ) {
              return createError({
                path,
                message: "You can't close ticket for future date",
              });
            }
          }
        }
      }
      return true;
    });
  }

  function isValidChargesOnClosure(ref, message) {
    return this.test("isValidChargesOnClosure", message, function(value) {
      const { path, createError } = this;
      const colName = message ? message : "";
      let tmpVal = "";

      if (value !== null && value !== undefined) {
        tmpVal = value;
      }

      let statusMSTId = this.resolve(ref);

      if (statusMSTId) {
        const row = taskStatusMasterState?.entities?.filter(
          (x) => x.id === statusMSTId
        )?.[0];
        if (row) {
          if (
            row.closeFlag &&
            !row.confirmFlag &&
            !row.payInFlag &&
            !row.payOutFlag &&
            !row.reopenFlag &&
            !row.penaltyFlag &&
            !row.autoCloseFlag &&
            !row.assignedFlag &&
            !row.wipFlag &&
            !row.cancelFlag
          ) {
            if (tmpVal === "") {
              return createError({ path, message: colName + " Required" });
            }
          }
        }
      }

      if (tmpVal) {
        if (parseFloat(value) < 0) {
          return createError({ path, message: colName + " Must be Positive" });
        }
      }

      return true;
    });
  }

  Yup.addMethod(Yup.mixed, "isValidEndDateTime", isValidEndDateTime);
  Yup.addMethod(
    Yup.mixed,
    "isValidCustomerEndDateTime",
    isValidCustomerEndDateTime
  );
  Yup.addMethod(
    Yup.mixed,
    "isValidCustomerStartDateTime",
    isValidCustomerStartDateTime
  );
  Yup.addMethod(Yup.mixed, "isValidSOW", isValidSOW);
  Yup.addMethod(Yup.mixed, "isValidStatus", isValidStatus);
  Yup.addMethod(Yup.mixed, "isValidNumber", isValidNumber);
  Yup.addMethod(Yup.mixed, "isValidChargesOnClosure", isValidChargesOnClosure);
  Yup.addMethod(Yup.mixed, "isValidZipCode", isValidZipCode);
  Yup.addMethod(Yup.mixed, "isValidCurrency", isValidCurrency);

  const contactRegExp = /^[\d ()+-]+$/;

  const validationSchema = useMemo(() => {
    return Yup.object().shape({
      countryMSTId: Yup.number().min(1, "Country Required"),
      cityMSTId: Yup.number().min(1, "City Required"),
      zipCode: Yup.mixed().isValidZipCode(
        Yup.ref("countryCode"),
        "Invalid Zip Code"
      ),
      startDateTime: Yup.string()
        .nullable()
        .required("Start Date - Time Required "),
      planDateTime: Yup.string()
        .nullable()
        .required("Plan Date - Time Required "),
      statusMSTId: Yup.mixed().isValidStatus(Yup.ref("startDateTime")),
      endDateTime: Yup.mixed().isValidEndDateTime(Yup.ref("statusMSTId"), null),
      customerEndDateTime: Yup.mixed().isValidCustomerEndDateTime(
        Yup.ref("statusMSTId"),
        null
      ),
      customerStartDateTime: Yup.mixed().isValidCustomerStartDateTime(
        Yup.ref("statusMSTId"),
        null
      ),
      summary: Yup.string()
        .nullable()
        .required("Ticket Summary Required")
        .max(100, "Must not exceed 100 characters"),
      scopeOfWork: Yup.mixed().isValidSOW("Scope of Work Required"),
      localContactPhone: Yup.string()
        .nullable()
        .matches(contactRegExp, "Invalid Local Contact Phone"),
      localContactEmail: Yup.string()
        .nullable()
        .email("Invalid LCON Email"),
      rbhPayoutRate: Yup.mixed().isValidNumber(Yup.ref("taskUserId"), "Rate"),
      abhPayoutRate: Yup.mixed().isValidNumber(
        Yup.ref("taskUserId"),
        "Uplift of"
      ),
      obhPayoutRate: Yup.mixed().isValidNumber(
        Yup.ref("taskUserId"),
        "Flat Rate"
      ),
      // rbhPayinRate: Yup.mixed().isValidNumber(Yup.ref('taskUserId'), 'Rate'),
      // abhPayinRate: Yup.mixed().isValidNumber(Yup.ref('taskUserId'), 'Uplift of'),
      // obhPayinRate: Yup.mixed().isValidNumber(Yup.ref('taskUserId'), 'Flat Rate'),
      // weekendPayInMultiplier: Yup.mixed().isValidNumber(Yup.ref('taskUserId'), "Uplift of"),
      // weekendPayInFlatRate: Yup.mixed().isValidNumber(Yup.ref('taskUserId'), "Flat Rate"),
      weekendPayOutMultiplier: Yup.mixed().isValidNumber(
        Yup.ref("taskUserId"),
        "Uplift of"
      ),
      weekendPayOutFlatRate: Yup.mixed().isValidNumber(
        Yup.ref("taskUserId"),
        "Flat Rate"
      ),
      // travelChargesPayIn: Yup.mixed().isValidChargesOnClosure(Yup.ref('statusMSTId'), 'Travel Charges'),
      // materialChargesPayIn: Yup.mixed().isValidChargesOnClosure(Yup.ref('statusMSTId'), 'Material Charges'),
      // parkingChargesPayIn: Yup.mixed().isValidChargesOnClosure(Yup.ref('statusMSTId'), 'Parking Charges'),
      // otherChargesPayIn: Yup.mixed().isValidChargesOnClosure(Yup.ref('statusMSTId'), 'Other Charges'),
      travelCharges: Yup.mixed().isValidChargesOnClosure(
        Yup.ref("statusMSTId"),
        "Travel Charges"
      ),
      materialCharges: Yup.mixed().isValidChargesOnClosure(
        Yup.ref("statusMSTId"),
        "Material Charges"
      ),
      parkingCharges: Yup.mixed().isValidChargesOnClosure(
        Yup.ref("statusMSTId"),
        "Parking Charges"
      ),
      otherCharges: Yup.mixed().isValidChargesOnClosure(
        Yup.ref("statusMSTId"),
        "Other Charges"
      ),
      // minHoursPayIn: Yup.mixed().isValidNumber(Yup.ref('taskUserId'), 'Min Hours'),
      minHoursPayIn: Yup.mixed().test(
        "max-check",
        "Min Hours should be 8 or less",
        (val) => {
          if (val && val !== "" && val !== undefined) {
            if (parseFloat(val) > 8) {
              return false;
            }
          }
          return true;
        }
      ),
      minHoursPayOut: Yup.mixed()
        .isValidNumber(Yup.ref("taskUserId"), "Min Hours")
        .test("max-check", "Min Hours should be 8 or less", (val) => {
          if (val && val !== "" && val !== undefined) {
            if (parseFloat(val) > 8) {
              return false;
            }
          }
          return true;
        }),
      // fullDayRatesPayIn: Yup.mixed().isValidNumber(Yup.ref('taskUserId'), 'Full Day Rates'),
      fullDayRatesPayOut: Yup.mixed().isValidNumber(
        Yup.ref("taskUserId"),
        "Full Day Rates"
      ),
      payOutRemarks: Yup.string()
        .nullable()
        .max(500, "Pay Out Remarks: Must not exceed 500 characters"),
      payInRemarks: Yup.string()
        .nullable()
        .max(500, "Pay In Remarks: Must not exceed 500 characters"),
      payOutCurrencyId: Yup.mixed().isValidCurrency(
        Yup.ref("taskUserId"),
        "Currency"
      ),
      taskPendingReasonsMSTId: Yup.mixed().test(
        "reason-test",
        "Pending Reason Required",
        function(val) {
          const data = this.parent;
          if (data.statusMSTId === pendingStatusId) {
            if (
              val === null ||
              val === undefined ||
              val === "" ||
              val === "0"
            ) {
              return false;
            }
          }
          return true;
        }
      ),
    });
  }, [currentState.entities, editId]);

  const setTimingsData = (val, values) => {
    let timezone = moment.tz.guess(true);

    if (val?.cityMSTId && val?.cityMSTId !== 0) {
      const cityMST = val.cityMST;
      if (cityMST?.latitude && cityMST?.longitude) {
        timezone = tz_lookup(cityMST.latitude, cityMST.longitude);
      }
    }

    val.timezone = timezone;

    val.rbhStartTiming = values.rbhStartTiming
      ? moment(values.rbhStartTiming, "HH:mm").format("HH:mm")
      : null;
    val.obhStartTiming = values.obhStartTiming
      ? moment(values.obhStartTiming, "HH:mm").format("HH:mm")
      : null;
    val.abhStartTiming = values.abhStartTiming
      ? moment(values.abhStartTiming, "HH:mm").format("HH:mm")
      : null;
    val.obhEndTiming = values.obhEndTiming
      ? moment(values.obhEndTiming, "HH:mm").format("HH:mm")
      : null;
    val.rbhEndTiming = values.rbhEndTiming
      ? moment(values.rbhEndTiming, "HH:mm").format("HH:mm")
      : null;
    val.abhEndTiming = values.abhEndTiming
      ? moment(values.abhEndTiming, "HH:mm").format("HH:mm")
      : null;

    val.rbhStartTimingPayIn = values.rbhStartTimingPayIn
      ? moment(values.rbhStartTimingPayIn, "HH:mm").format("HH:mm")
      : null;
    val.obhStartTimingPayIn = values.obhStartTimingPayIn
      ? moment(values.obhStartTimingPayIn, "HH:mm").format("HH:mm")
      : null;
    val.abhStartTimingPayIn = values.abhStartTimingPayIn
      ? moment(values.abhStartTimingPayIn, "HH:mm").format("HH:mm")
      : null;
    val.obhEndTimingPayIn = values.obhEndTimingPayIn
      ? moment(values.obhEndTimingPayIn, "HH:mm").format("HH:mm")
      : null;
    val.rbhEndTimingPayIn = values.rbhEndTimingPayIn
      ? moment(values.rbhEndTimingPayIn, "HH:mm").format("HH:mm")
      : null;
    val.abhEndTimingPayIn = values.abhEndTimingPayIn
      ? moment(values.abhEndTimingPayIn, "HH:mm").format("HH:mm")
      : null;

    val.planDateTime = val?.planDateTime
      ? moment(val.planDateTime)
          .subtract(val.utcOffset, "minutes")
          .format("YYYY-MM-DD HH:mm")
      : null;
    val.dueDateTime = val?.dueDateTime
      ? moment(val.dueDateTime)
          .subtract(val.utcOffset, "minutes")
          .format("YYYY-MM-DD HH:mm")
      : null;
  };

  const logs = useMemo(() => {
    let tmp = [];
    let tmpLog = [];

    // Manage Task Master logs

    if (entity.taskLogs && entity.taskLogs.length > 0) {
      const sortedLogArray = sortArrayByDate(
        entity.taskLogs,
        "modifiedOn"
      )?.map((x) => ({
        ...x,
        projectManagerId: x?.projectManagerId ?? 0,
        projectCoOrdinatorId: x?.projectCoOrdinatorId ?? 0,
        localContactName: x?.localContactName ?? "",
        localContactPhone: x?.localContactPhone ?? "",
        localContactEmail: x?.localContactEmail ?? "",
        reference1: x?.reference1 ?? "",
        reference2: x?.reference2 ?? "",
      }));

      for (var index = 0; index < sortedLogArray.length; index++) {
        let element = sortedLogArray[index];
        let msg = "";

        if (index === 0) {
          msg = msg + "Created the ticket, ";
          if (element.taskUserId > 0) {
            msg =
              msg +
              "Assigned Engineer: " +
              element?.taskUser?.engineerName +
              ", ";
          }
        } else {
          let prevElement = sortedLogArray[index - 1];

          if (prevElement.taskUserId !== element.taskUserId) {
            if (
              prevElement.taskUserId === null ||
              prevElement.taskUserId === 0
            ) {
              msg =
                msg +
                "Assigned Engineer: " +
                element?.taskUser?.engineerName +
                ", ";
            } else {
              if (element?.taskUser?.engineerName) {
                msg =
                  msg +
                  "Re-Assigned Engineer: " +
                  element?.taskUser?.engineerName +
                  ", ";
              } else {
                msg = msg + "Removed Engineer , ";
              }
            }
          }
          // if (prevElement.taskStatusMSTId !== element.taskStatusMSTId) {
          //     if (element?.taskStatusMST?.cancelFlag === true || prevElement?.taskStatusMST?.cancelFlag === true) {
          //         msg = msg + "Changed Status to " + element?.taskStatusMST?.taskStatusName + ", "
          //     }
          // }

          if (prevElement.countryMSTId !== element.countryMSTId) {
            if (element?.countryMST?.countryName) {
              msg =
                msg +
                "Updated Country: " +
                element.countryMST.countryName +
                ", ";
            }
          }
          if (prevElement.stateMSTId !== element.stateMSTId) {
            if (element?.stateMST?.stateName) {
              msg = msg + "Updated State: " + element.stateMST.stateName + ", ";
            } else {
              msg = msg + "Updated State: , ";
            }
          }
          if (prevElement.cityMSTId !== element.cityMSTId) {
            if (element?.cityMST?.cityName) {
              msg = msg + "Updated City: " + element.cityMST.cityName + ", ";
            }
          }
          if (prevElement.zipCode !== element.zipCode) {
            msg = msg + "Updated Zip Code: " + element.zipCode + ", ";
          }
          if (prevElement.address !== element.address) {
            msg = msg + "Updated Address: " + element.address + ", ";
          }
          if (prevElement.planDateTime !== element.planDateTime) {
            msg =
              msg + "Updated Plan Date - Time: " + element.planDateTime + ", ";
          }
          if (
            prevElement.projectCoOrdinatorId !== element.projectCoOrdinatorId
          ) {
            msg =
              msg +
              "Updated Project Co-ordinator: " +
              (element.projectCoOrdinatorId !== null
                ? element?.projectCoOrdinator?.userName
                  ? element.projectCoOrdinator.userName
                  : ""
                : "") +
              ", ";
          }
          if (prevElement.projectManagerId !== element.projectManagerId) {
            msg =
              msg +
              "Updated Project Manager: " +
              (element.projectManagerId !== null
                ? element?.projectManager?.userName
                  ? element.projectManager.userName
                  : ""
                : "") +
              ", ";
          }
          if (prevElement.localContactName !== element.localContactName) {
            msg = msg + "Updated LCON Name: " + element.localContactName + ", ";
          }
          if (prevElement.localContactPhone !== element.localContactPhone) {
            msg =
              msg + "Updated LCON Number: " + element.localContactPhone + ", ";
          }
          if (prevElement.poNumber !== element.poNumber) {
            msg = msg + "Updated PO Number: " + element.poNumber + ", ";
          }
          if (prevElement.localContactEmail !== element.localContactEmail) {
            msg =
              msg + "Updated LCON Email: " + element.localContactEmail + ", ";
          }
          if (prevElement.reference1 !== element.reference1) {
            msg =
              msg +
              "Updated Customer REF Ticket-1: " +
              element.reference1 +
              ", ";
          }
          if (prevElement.summary !== element.summary) {
            msg = msg + "Updated Ticket Summary: " + element.summary + ", ";
          }
          if (prevElement.reference2 !== element.reference2) {
            msg =
              msg +
              "Updated Customer REF Ticket-2: " +
              element.reference2 +
              ", ";
          }
          if (prevElement.rbhStartTiming !== element.rbhStartTiming) {
            msg =
              msg +
              "Updated Pay Out RBH Start Time: " +
              element.rbhStartTiming +
              ", ";
          }
          if (prevElement.rbhEndTiming !== element.rbhEndTiming) {
            msg =
              msg +
              "Updated Pay Out RBH End Time: " +
              element.rbhEndTiming +
              ", ";
          }
          if (prevElement.rbhPayoutRate !== element.rbhPayoutRate) {
            msg =
              msg + "Updated Pay Out RBH Rate: " + element.rbhPayoutRate + ", ";
          }
          if (prevElement.abhPayoutRate !== element.abhPayoutRate) {
            msg =
              msg +
              "Updated Pay Out OBH Uplift Of: " +
              element.abhPayoutRate +
              ", ";
          }
          if (prevElement.obhPayoutRate !== element.obhPayoutRate) {
            msg =
              msg +
              "Updated Pay Out OBH Flat Rate: " +
              element.obhPayoutRate +
              ", ";
          }
          if (
            prevElement.weekendPayOutMultiplier !==
            element.weekendPayOutMultiplier
          ) {
            msg =
              msg +
              "Updated Pay Out Weekend OBH Uplift Of: " +
              element.weekendPayOutMultiplier +
              ", ";
          }
          if (
            prevElement.weekendPayOutFlatRate !== element.weekendPayOutFlatRate
          ) {
            msg =
              msg +
              "Updated Pay Out Weekend OBH Flat Rate: " +
              element.weekendPayOutFlatRate +
              ", ";
          }
          if (prevElement.payOutCurrencyId !== element.payOutCurrencyId) {
            msg =
              msg +
              "Updated Pay Out Currency: " +
              element?.payOutCurrency?.currencyName +
              ", ";
          }
          if (prevElement.payOutRemarks !== element.payOutRemarks) {
            msg =
              msg + "Updated Pay Out Remarks: " + element.payOutRemarks + ", ";
          }
          if (prevElement.minHoursPayOut !== element.minHoursPayOut) {
            msg =
              msg +
              "Updated Pay Out Min Hours: " +
              element.minHoursPayOut / 60 +
              ", ";
          }

          if (prevElement.fullDayRatesPayOut !== element.fullDayRatesPayOut) {
            msg =
              msg +
              "Updated Pay Out Full Day Rates: " +
              element.fullDayRatesPayOut +
              ", ";
          }

          if (prevElement.payOutDayOption !== element.payOutDayOption) {
            msg =
              msg +
              "Updated Pay Out Day: " +
              (element.payOutDayOption === "fullday"
                ? "Full Day"
                : element.payOutDayOption === "halfday"
                ? "Half Day"
                : "") +
              ", ";
          }

          if (isManager || roleCode === "admin") {
            if (
              prevElement.rbhStartTimingPayIn !== element.rbhStartTimingPayIn
            ) {
              msg =
                msg +
                "Updated Pay In RBH Start Time: " +
                element.rbhStartTimingPayIn +
                ", ";
            }
            if (prevElement.rbhEndTimingPayIn !== element.rbhEndTimingPayIn) {
              msg =
                msg +
                "Updated Pay In RBH End Time: " +
                element.rbhEndTimingPayIn +
                ", ";
            }
            if (prevElement.rbhPayinRate !== element.rbhPayinRate) {
              msg =
                msg + "Updated Pay In RBH Rate: " + element.rbhPayinRate + ", ";
            }
            if (prevElement.abhPayinRate !== element.abhPayinRate) {
              msg =
                msg +
                "Updated Pay In OBH Uplift Of: " +
                element.abhPayinRate +
                ", ";
            }
            if (prevElement.obhPayinRate !== element.obhPayinRate) {
              msg =
                msg +
                "Updated Pay In OBH Flat Rate: " +
                element.obhPayinRate +
                ", ";
            }
            if (
              prevElement.weekendPayInMultiplier !==
              element.weekendPayInMultiplier
            ) {
              msg =
                msg +
                "Updated Pay In Weekend OBH Uplift Of: " +
                element.weekendPayInMultiplier +
                ", ";
            }
            if (
              prevElement.weekendPayInFlatRate !== element.weekendPayInFlatRate
            ) {
              msg =
                msg +
                "Updated Pay In Weekend OBH Flat Rate: " +
                element.weekendPayInFlatRate +
                ", ";
            }
            if (prevElement.payInCurrencyId !== element.payInCurrencyId) {
              msg =
                msg +
                "Updated Pay In Currency: " +
                element.payInCurrency?.currencyName +
                ", ";
            }
            if (prevElement.payInRemarks !== element.payInRemarks) {
              msg =
                msg + "Updated Pay In Remarks: " + element.payInRemarks + ", ";
            }
            if (prevElement.minHoursPayIn !== element.minHoursPayIn) {
              msg =
                msg +
                "Updated Pay In Min Hours: " +
                element.minHoursPayIn / 60 +
                ", ";
            }
            if (prevElement.fullDayRatesPayIn !== element.fullDayRatesPayIn) {
              msg =
                msg +
                "Updated Pay In Full Day Rates: " +
                element.fullDayRatesPayIn +
                ", ";
            }

            if (prevElement.payInDayOption !== element.payInDayOption) {
              msg =
                msg +
                "Updated Pay In Day: " +
                (element.payInDayOption === "fullday"
                  ? "Full Day"
                  : element.payInDayOption === "halfday"
                  ? "Half Day"
                  : "") +
                ", ";
            }
          }

          const prevScopeOfWork = prevElement.scopeOfWork
            ? EditorState.createWithContent(
                convertFromRaw(JSON.parse(prevElement.scopeOfWork))
              )
                .getCurrentContent()
                .getPlainText()
            : "";
          const scopeOfWork = element.scopeOfWork
            ? EditorState.createWithContent(
                convertFromRaw(JSON.parse(element.scopeOfWork))
              )
                .getCurrentContent()
                .getPlainText()
            : "";

          if (prevScopeOfWork !== scopeOfWork) {
            msg = msg + "Updated Scope Of Work, ";
          }

          //Attachment Log Logic

          const prevAttachments = prevElement.taskAttachments
            ? prevElement.taskAttachments
            : [];
          const attachments = element.taskAttachments
            ? element.taskAttachments
            : [];

          let tmpMsg = "Added Attachment(s): ";

          attachments.forEach((a) => {
            if (prevAttachments.filter((p) => p.id === a.id).length <= 0) {
              tmpMsg =
                tmpMsg +
                a?.attachment
                  ?.split("/")
                  ?.pop()
                  ?.slice(6)
                  ?.replace("%20", " ") +
                ", ";
            }
          });

          if (tmpMsg !== "Added Attachment(s): ") {
            msg = msg + tmpMsg;
          }

          tmpMsg = "Deleted Attachment(s): ";

          prevAttachments.forEach((a) => {
            if (attachments.filter((p) => p.id === a.id).length <= 0) {
              tmpMsg =
                tmpMsg +
                a?.attachment
                  ?.split("/")
                  ?.pop()
                  ?.slice(6)
                  ?.replace("%20", " ") +
                ", ";
            }
          });

          if (tmpMsg !== "Deleted Attachment(s): ") {
            msg = msg + tmpMsg;
          }
        }

        if (msg) {
          msg = msg.slice(0, -2);
          tmpLog.push({
            message: msg,
            modifiedOn: element.modifiedOn,
            createdById: element.createdBy,
            createdByUser: element.createdByUser,
          });
        }
      }
    }

    // Manage Task Details logs

    if (entity.taskDetails && entity.taskDetails.length > 0) {
      tmp = [...entity.taskDetails.filter((x) => !x.log && x.notes === null)];

      entity.taskDetails
        .filter((x) => !x.log && x.notes === null)
        .forEach((x) => {
          if (
            entity.taskDetails.filter((y) => y.referenceId === x.id && y.log)
              .length > 1
          ) {
            tmp = tmp.filter((y) => y.id !== x.id);

            const dtlLogSorted = sortArrayByDate(
              entity.taskDetails.filter((y) => y.referenceId === x.id && y.log),
              "modifiedOn"
            );
            tmp.push(dtlLogSorted[0]);

            for (let index3 = 1; index3 < dtlLogSorted.length; index3++) {
              let element3 = dtlLogSorted[index3];
              let prevElement3 = dtlLogSorted[index3 - 1];
              let msg = ""; //"Update Code : " + element3.taskDTLCode + " --> "

              prevElement3.travelChargesPayIn =
                prevElement3.travelChargesPayIn ?? 0;
              prevElement3.travelCharges = prevElement3.travelCharges ?? 0;
              prevElement3.materialChargesPayIn =
                prevElement3.materialChargesPayIn ?? 0;
              prevElement3.materialCharges = prevElement3.materialCharges ?? 0;
              prevElement3.parkingChargesPayIn =
                prevElement3.parkingChargesPayIn ?? 0;
              prevElement3.parkingCharges = prevElement3.parkingCharges ?? 0;
              prevElement3.otherChargesPayIn =
                prevElement3.otherChargesPayIn ?? 0;
              prevElement3.otherCharges = prevElement3.otherCharges ?? 0;

              element3.travelChargesPayIn = element3.travelChargesPayIn ?? 0;
              element3.travelCharges = element3.travelCharges ?? 0;
              element3.materialChargesPayIn =
                element3.materialChargesPayIn ?? 0;
              element3.materialCharges = element3.materialCharges ?? 0;
              element3.parkingChargesPayIn = element3.parkingChargesPayIn ?? 0;
              element3.parkingCharges = element3.parkingCharges ?? 0;
              element3.otherChargesPayIn = element3.otherChargesPayIn ?? 0;
              element3.otherCharges = element3.otherCharges ?? 0;

              prevElement3.actualRbh = prevElement3.actualRbh ?? 0;
              prevElement3.actualObh = prevElement3.actualObh ?? 0;
              prevElement3.actualAbh = prevElement3.actualAbh ?? 0;

              prevElement3.payInRbh = prevElement3.payInRbh ?? 0;
              prevElement3.payInObh = prevElement3.payInObh ?? 0;
              prevElement3.payInAbh = prevElement3.payInAbh ?? 0;

              element3.actualRbh = element3.actualRbh ?? 0;
              element3.actualObh = element3.actualObh ?? 0;
              element3.actualAbh = element3.actualAbh ?? 0;

              element3.payInRbh = element3.payInRbh ?? 0;
              element3.payInObh = element3.payInObh ?? 0;
              element3.payInAbh = element3.payInAbh ?? 0;

              if (prevElement3.statusMSTId !== element3.statusMSTId) {
                if (element3?.taskStatusMST?.assignedFlag === true) {
                } else {
                  msg =
                    msg +
                    "Changed Status to " +
                    element3?.taskStatusMST?.taskStatusName +
                    ", ";
                }

                if (element3?.taskStatusMST?.penaltyFlag) {
                  setIsPenalty(true);
                  if (element3?.taskUserId && element3.taskUserId > 0) {
                  } else {
                    setCanViewPayOut(false);
                  }
                }
              }

              if (
                prevElement3.taskPendingReasonsMSTId !==
                element3.taskPendingReasonsMSTId
              ) {
                if (
                  element3.taskPendingReasonsMSTId !== null &&
                  element3.taskPendingReasonsMSTId !== 0
                ) {
                  msg =
                    msg +
                    "Changed Pending Reason to " +
                    element3?.taskPendingReasonsMST?.name +
                    ", ";
                }
              }

              if (prevElement3.actualRbh !== element3.actualRbh) {
                msg =
                  msg +
                  "RBH: " +
                  getFormattedActuals(element3.actualRbh) +
                  " , ";
              }
              if (prevElement3.actualObh !== element3.actualObh) {
                msg =
                  msg +
                  "OBH: " +
                  getFormattedActuals(element3.actualObh) +
                  " , ";
              }
              if (prevElement3.actualAbh !== element3.actualAbh) {
                msg =
                  msg +
                  "Weekend OBH: " +
                  getFormattedActuals(element3.actualAbh) +
                  " , ";
              }

              if (prevElement3.payInRbh !== element3.payInRbh) {
                msg =
                  msg +
                  "Pay In RBH: " +
                  getFormattedActuals(element3.payInRbh) +
                  " , ";
              }
              if (prevElement3.payInObh !== element3.payInObh) {
                msg =
                  msg +
                  "Pay In OBH: " +
                  getFormattedActuals(element3.payInObh) +
                  " , ";
              }
              if (prevElement3.payInAbh !== element3.payInAbh) {
                msg =
                  msg +
                  "Pay In Weekend OBH: " +
                  getFormattedActuals(element3.payInAbh) +
                  " , ";
              }

              if (prevElement3.travelCharges !== element3.travelCharges) {
                msg = msg + "Travel Charges: " + element3.travelCharges + " , ";
              }
              if (prevElement3.materialCharges !== element3.materialCharges) {
                msg =
                  msg + "Material Charges: " + element3.materialCharges + " , ";
              }
              if (prevElement3.parkingCharges !== element3.parkingCharges) {
                msg =
                  msg + "Parking Charges: " + element3.parkingCharges + " , ";
              }
              if (prevElement3.otherCharges !== element3.otherCharges) {
                msg = msg + "Other Charges: " + element3.otherCharges + " , ";
              }

              if (isManager || roleCode === "admin") {
                if (
                  prevElement3.travelChargesPayIn !==
                  element3.travelChargesPayIn
                ) {
                  msg =
                    msg +
                    "Pay In Travel Charges: " +
                    element3.travelChargesPayIn +
                    " , ";
                }
                if (
                  prevElement3.materialChargesPayIn !==
                  element3.materialChargesPayIn
                ) {
                  msg =
                    msg +
                    "Pay In Material Charges: " +
                    element3.materialChargesPayIn +
                    " , ";
                }
                if (
                  prevElement3.parkingChargesPayIn !==
                  element3.parkingChargesPayIn
                ) {
                  msg =
                    msg +
                    "Pay In Parking Charges: " +
                    element3.parkingChargesPayIn +
                    " , ";
                }
                if (
                  prevElement3.otherChargesPayIn !== element3.otherChargesPayIn
                ) {
                  msg =
                    msg +
                    "Pay In Other Charges: " +
                    element3.otherChargesPayIn +
                    " , ";
                }
              }

              if (msg) {
                msg = msg.slice(0, -2);
                tmpLog.push({
                  message: msg,
                  modifiedOn: element3.modifiedOn,
                  createdById: element3.createdById,
                  createdByUser: element3.createdByUser,
                });
              }
            }
          }
        });

      //Handle Notes Log

      entity.taskDetails
        .filter((x) => !x.log && x.notes !== null)
        .forEach((x) => {
          tmpLog.push({
            message: "Posted an Update",
            modifiedOn: x.modifiedOn,
            createdById: x.createdById,
            createdByUser: x.createdByUser,
          });
        });
    }

    const groupedData = groupBy(tmpLog, function(n) {
      return n.modifiedOn + n.createdById;
    });

    tmpLog = Object.keys(groupedData).map((key, index) => {
      let tmpArray = groupedData[key];
      let msg = null;
      tmpArray.map((row) => {
        msg = msg ? msg + ", " + row.message : row.message;
      });

      return {
        ...tmpArray[0],
        message: msg,
      };
    });

    return sortArrayByDate(tmpLog, "modifiedOn", "desc");
  }, [entity]);

  const onDrop = React.useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const files = acceptedFiles;

        if (attachmentState?.length + files.length > 20) {
          alert("You can't upload more than 20 files!!!");
          return;
        }
        let tmp = [];
        let currentCount = attachmentState.length + 1;

        for (let index = 0; index < files.length; index++) {
          const file = files[index];
          tmp.push({
            file: file,
            fileDownloadUri: URL.createObjectURL(file),
            fileName: file.name,
            id: null,
            key: currentCount,
          });
        }
        // currentCount = attachmentState.length + 1
        setAttachmentState([...attachmentState, ...tmp]);
        // setAttachmentStateCount(currentCount)
        // setErrors('');
      } else {
        // setErrors(`Error: File Format is not accept or Size more than 1 MB`);
      }
    },
    [attachmentState]
  );

  const { getRootProps, getInputProps, inputRef } = useDropzone({
    noKeyboard: true,
    // maxSize: 1048576,
    multiple: true,
    accept: "",
    onDrop,
  });

  const handleDeleteAttachment = (key) => {
    const id = attachmentState?.filter((x) => x.key === key)?.[0]?.id;
    if (id) {
      setFilestoBeDeleted([...filestoBeDeleted, id]);
    }
    setAttachmentState(attachmentState?.filter((x) => x.key !== key));
  };

  const notesHistoryData = useMemo(() => {
    return sortArrayByDate(
      entity?.taskDetails?.filter((x) => !x.log && x.notes !== null) ?? [],
      "modifiedOn",
      "desc"
    );
  }, [entity]);

  const topNotesToShow = useMemo(() => { 
    let tmp = [];

    const tmpNotes = notesHistoryData?.filter(
      (x) => x.closure === true || x.cancellation === true
    );

    if (tmpNotes) {
      tmp = tmpNotes;
    }    

    tmp = [
      ...tmp,
      ...notesHistoryData?.filter(
        (x) =>
          x.closure === false && x.cancellation === false && x.confirm === true
      ),
    ];

    if (tmp.length == 0)
    {
      const tmpNotes1 = notesHistoryData;
      tmp = tmpNotes1;
    }
    else if (tmp.length == 1)
    {
      tmp = [
        ...tmp,
        ...notesHistoryData?.filter(
          (x) =>
            x.closure === false && x.cancellation === false && x.confirm === false
        ),
      ];
    }
    return tmp.slice(0, 2);
  }, [notesHistoryData]);

  useMemo(() => {
    if ((isConfirmed || isPenalty) && entity?.id && !paidOut && canViewPayOut) {
      dispatch(
        reportsPayOutActions.getData(
          "payOutReport/noDates",
          { params: { id: entity.id } },
          "get"
        )
      );
    }

    if ((isConfirmed || isPenalty) && entity?.id && !paidIn) {
      dispatch(
        reportsPayInActions.getData(
          "payInReport/noDates",
          { params: { id: entity.id } },
          "get"
        )
      );
    }
  }, [entity, isConfirmed, isPenalty, canViewPayOut]);

  const payOutReportRows = useMemo(() => {
    if (!Array.isArray(reportPayOutEntities)) return [];
    try {
      let rTmp =
        reportPayOutEntities?.map((x, i) => ({
          ...x,
          keyField: i,
          payOutPaidValue: "",
          payOutPaidCurrencyId: x?.payOutCurrencyId,
          settlement: true,
        })) ?? [];

      return rTmp;
    } catch (error) {
      console.log(error);
      return [];
    }
  }, [reportPayOutEntities]);

  const payOutReportCols = [
    {
      dataField: "techCode",
      text: "Tech Code",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "techName",
      text: "Tech Name",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "rbh",
      text: "RBH",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "rbhMin",
      text: "RBH Min",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "rbhRate",
      text: "RBH Rate",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "fullDayRates",
      text: "Full Day Rates",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "minHours",
      text: "Min Hours",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => cell / 60,
      exportFormatter: (cell) => cell / 60,
    },
    {
      dataField: "obh",
      text: "OBH",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "obhMin",
      text: "OBH Min",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "obhRate",
      text: "Flat Rate",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "abhRate",
      text: "Uplift Of",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "abh",
      text: "Weekend OBH",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "abhMin",
      text: "Weekend OBH Min",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "weekendFlatRate",
      text: "Weekend Flat Rate",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "weekendMultiplierRate",
      text: "Weekend Uplift Of",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "travel",
      text: "Travel",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "material",
      text: "Material",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "parking",
      text: "Parking",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "other",
      text: "Other",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "payableValue",
      text: "Payable Value",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => (cell ? cell.toFixed(2) : "0.00"),
      exportFormatter: (cell) => (cell ? cell.toFixed(2) : "0.00"),
    },
    {
      dataField: "payOutCurrency",
      text: "Payout Currency",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "payOutPaidCurrencyId",
      text: "Paid Currency",
      // headerStyle: { whiteSpace: 'nowrap' }
      headerStyle: screenSize
        ? headerButtonStyles
        : {
            whiteSpace: "nowrap",
            position: "sticky",
            right: "195px",
            backgroundColor: "white",
            minWidth: "125px",
            maxWidth: "125px",
          },
      style: screenSize
        ? {}
        : {
            position: "sticky",
            right: "195px",
            backgroundColor: "white",
            minWidth: "125px",
            maxWidth: "125px",
          },
      editor: {
        type: "select",
        getOptions: () => {
          return currencyMasterState?.entities?.map((x) => ({
            value: x.id,
            label: x.currencyName,
          }));
        },
      },
      editorClasses: "form-control-sm",
      formatter: (cell) => {
        if (cell) {
          return currencyMasterState?.entities?.filter(
            (x) => x.id.toString() === cell.toString()
          )?.[0]?.currencyName;
        }
        return "";
      },
      exportFormatter: (cell) => {
        if (cell) {
          return currencyMasterState?.entities?.filter(
            (x) => x.id.toString() === cell.toString()
          )?.[0]?.currencyName;
        }
        return "";
      },
      editable: roleCode === "pco" ? false : true,
      // hidden: authState?.user?.organizationMST?.organizationType === "SELF" || authState?.roleCode === "admin" ? false : true
    },
    {
      dataField: "payOutPaidValue",
      text: "Paid Value",
      headerStyle: screenSize
        ? headerButtonStyles
        : {
            whiteSpace: "nowrap",
            position: "sticky",
            right: "90px",
            backgroundColor: "white",
            minWidth: "105px",
            maxWidth: "105px",
          },
      style: screenSize
        ? {}
        : {
            position: "sticky",
            right: "90px",
            backgroundColor: "white",
            minWidth: "105px",
            maxWidth: "105px",
          },
      editor: {
        type: "text",
      },
      editorClasses: "form-control-sm",
      editable: roleCode === "pco" ? false : true,
      formatter: (cell) =>
        cell
          ? isNaN(parseFloat(cell))
            ? cell
            : parseFloat(cell).toFixed(2)
          : "",
      exportFormatter: (cell) =>
        cell
          ? isNaN(parseFloat(cell))
            ? cell
            : parseFloat(cell).toFixed(2)
          : "",
      // hidden: authState?.user?.organizationMST?.organizationType === "SELF" || authState?.roleCode === "admin" ? false : true
    },
    {
      dataField: "settlement",
      text: "Settlement",
      headerStyle: screenSize
        ? headerButtonStyles
        : {
            whiteSpace: "nowrap",
            position: "sticky",
            right: "0",
            backgroundColor: "white",
            minWidth: "90px",
            maxWidth: "90px",
          },
      style: screenSize
        ? {}
        : {
            position: "sticky",
            right: "0",
            backgroundColor: "white",
            minWidth: "90px",
            maxWidth: "90px",
            textAlign: "center",
          },
      formatter: (cell, row) => {
        return (
          <input
            type="checkbox"
            checked={cell}
            value={cell}
            onChange={(e) => {
              row.settlement = e.target.checked;
            }}
          ></input>
        );
      },
      editable: false,
    },
  ];

  const payInReportRows = useMemo(() => {
    if (!Array.isArray(reportPayInEntities)) return [];
    try {
      let rTmp =
        reportPayInEntities?.map((x, i) => ({
          ...x,
          keyField: i,
          payInPaidValue: "",
          payInPaidCurrencyId: "",
          settlement: true,
        })) ?? [];

      return rTmp;
    } catch (error) {
      console.log(error);
      return [];
    }
  }, [reportPayInEntities]);

  const payInReportCols = [
    {
      dataField: "techCode",
      text: "Tech Code",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "techName",
      text: "Tech Name",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "rbh",
      text: "RBH",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "rbhMin",
      text: "RBH Min",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "rbhRate",
      text: "RBH Rate",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "fullDayRates",
      text: "Full Day Rates",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "minHours",
      text: "Min Hours",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => cell / 60,
      exportFormatter: (cell) => cell / 60,
    },
    {
      dataField: "obh",
      text: "OBH",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "obhMin",
      text: "OBH Min",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "obhRate",
      text: "Flat Rate",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "abhRate",
      text: "Uplift of",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "abh",
      text: "Weekend OBH",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "abhMin",
      text: "Weekend OBH Min",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => actualHoursFormatter(cell),
      exportFormatter: (cell) => actualHoursFormatter(cell),
    },
    {
      dataField: "weekendFlatRate",
      text: "Weekend Flat Rate",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "weekendMultiplierRate",
      text: "Weekend Uplift Of",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "travel",
      text: "Travel",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "material",
      text: "Material",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "parking",
      text: "Parking",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "other",
      text: "Other",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "receivableValue",
      text: "Receivable Value",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
      formatter: (cell) => (cell ? cell.toFixed(2) : "0.00"),
      exportFormatter: (cell) => (cell ? cell.toFixed(2) : "0.00"),
    },
    {
      dataField: "receivableCurrency",
      text: "Payin Currency",
      headerStyle: { whiteSpace: "nowrap" },
      editable: false,
    },
    {
      dataField: "payInPaidCurrencyId",
      text: "Received Currency",
      // headerStyle: { whiteSpace: 'nowrap' }
      headerStyle: screenSize
        ? headerButtonStyles
        : {
            whiteSpace: "nowrap",
            position: "sticky",
            right: "225px",
            backgroundColor: "white",
            minWidth: "150px",
            maxWidth: "150px",
          },
      style: screenSize
        ? {}
        : {
            position: "sticky",
            right: "225px",
            backgroundColor: "white",
            minWidth: "150px",
            maxWidth: "150px",
          },
      editor: {
        type: "select",
        getOptions: () => {
          return currencyMasterState?.entities?.map((x) => ({
            value: x.id,
            label: x.currencyName,
          }));
        },
      },
      editorClasses: "form-control-sm",
      formatter: (cell) => {
        if (cell) {
          return currencyMasterState?.entities?.filter(
            (x) => x.id.toString() === cell.toString()
          )?.[0]?.currencyName;
        }
        return "";
      },
      exportFormatter: (cell) => {
        if (cell) {
          return currencyMasterState?.entities?.filter(
            (x) => x.id.toString() === cell.toString()
          )?.[0]?.currencyName;
        }
        return "";
      },
      // hidden: authState?.user?.organizationMST?.organizationType === "SELF" || authState?.roleCode === "admin" ? false : true
    },
    {
      dataField: "payInPaidValue",
      text: "Received Value",
      headerStyle: screenSize
        ? headerButtonStyles
        : {
            whiteSpace: "nowrap",
            position: "sticky",
            right: "90px",
            backgroundColor: "white",
            minWidth: "135px",
            maxWidth: "135px",
          },
      style: screenSize
        ? {}
        : {
            position: "sticky",
            right: "90px",
            backgroundColor: "white",
            minWidth: "135px",
            maxWidth: "135px",
          },
      editor: {
        type: "text",
      },
      editorClasses: "form-control-sm",
      formatter: (cell) =>
        cell
          ? isNaN(parseFloat(cell))
            ? cell
            : parseFloat(cell).toFixed(2)
          : "",
      exportFormatter: (cell) =>
        cell
          ? isNaN(parseFloat(cell))
            ? cell
            : parseFloat(cell).toFixed(2)
          : "",
      // hidden: authState?.user?.organizationMST?.organizationType === "SELF" || authState?.roleCode === "admin" ? false : true
    },
    {
      dataField: "settlement",
      text: "Settlement",
      headerStyle: screenSize
        ? headerButtonStyles
        : {
            whiteSpace: "nowrap",
            position: "sticky",
            right: "0",
            backgroundColor: "white",
            minWidth: "90px",
            maxWidth: "90px",
          },
      style: screenSize
        ? {}
        : {
            position: "sticky",
            right: "0",
            backgroundColor: "white",
            minWidth: "90px",
            maxWidth: "90px",
            textAlign: "center",
          },
      formatter: (cell, row) => {
        return (
          <input
            type="checkbox"
            checked={cell}
            value={cell}
            onChange={(e) => {
              row.settlement = e.target.checked;
            }}
          ></input>
        );
      },
      editable: false,
      // hidden: authState?.user?.organizationMST?.organizationType === "SELF" || authState?.roleCode === "admin" ? false : true
    },
  ];

  const settlementCols = [
    {
      dataField: "status",
      text: "Status",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "8%" },
    },
    {
      dataField: "taskUserName",
      text: "Assigned Engineer",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "10%" },
    },
    {
      dataField: "payOutPayableAmount",
      text: "Payable Value",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "15%" },
      formatter: (cell) => (cell ? cell.toFixed(2) : "0.00"),
      // hidden: !hasPayOutAccess
    },
    {
      dataField: "payOutPayableCurrency",
      text: "Pay Out Currency",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "15%" },
      // hidden: !hasPayOutAccess
    },
    {
      dataField: "payOutPaidAmount",
      text: "Paid Value",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "17%" },
      formatter: (cell) => (cell ? cell.toFixed(2) : "0.00"),
      // hidden: !hasPayOutAccess
    },
    {
      dataField: "payOutPaidCurrency",
      text: "Paid Currency",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "10%" },
      // hidden: !hasPayOutAccess
    },
    {
      dataField: "payOutDate",
      text: "Pay Out Date",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "5%" },
      // hidden: !hasPayOutAccess
    },
  ];

  const settlementReportRows = useMemo(() => {
    if (entity?.settlementMST) {
      try {
        let rTmp =
          entity.settlementMST /* ?.map((x, i) => ({ ...x, keyField: i })) */ ??
          [];
        let seprateRows = [];
        if (rTmp) {
          if (hasPayOutAccess) {
            const payOutData = {
              status: "Pay Out",
              ...rTmp,
            };
            seprateRows.push(payOutData);
          }
        }

        return seprateRows;
      } catch (error) {
        console.log(error);
        return [];
      }
    }

    return [];
  }, [entity?.settlementMST]);

  const settlementColsPayIn = [
    {
      dataField: "status",
      text: "Status",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "8%" },
    },
    {
      dataField: "taskUserName",
      text: "Assigned Engineer",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "10%" },
    },
    {
      dataField: "payInPayableAmount",
      text: "Receivable Value",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "15%" },
      formatter: (cell) => (cell ? cell.toFixed(2) : "0.00"),
      hidden: !hasPayInAccess,
    },
    {
      dataField: "payInPayableCurrency",
      text: "Pay In Currency",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "15%" },
      hidden: !hasPayInAccess,
    },
    {
      dataField: "payInPaidAmount",
      text: "Received Value",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "17%" },
      formatter: (cell) => (cell ? cell.toFixed(2) : "0.00"),
      hidden: !hasPayInAccess,
    },
    {
      dataField: "payInPaidCurrency",
      text: "Received Currency",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "10%" },
      hidden: !hasPayInAccess,
    },
    {
      dataField: "payInDate",
      text: "Pay In Date",
      sort: true,
      headerStyle: { whiteSpace: "nowrap", width: "5%" },
      hidden: !hasPayInAccess,
    },
  ];

  const settlementReportRowsPayIn = useMemo(() => {
    if (entity?.settlementMST) {
      try {
        let rTmp =
          entity.settlementMST /* ?.map((x, i) => ({ ...x, keyField: i })) */ ??
          [];
        let seprateRows = [];
        if (rTmp) {
          if (hasPayInAccess) {
            const payInData = {
              status: "Pay In ",
              ...rTmp,
            };
            seprateRows.push(payInData);
          }
        }

        return seprateRows;
      } catch (error) {
        console.log(error);
        return [];
      }
    }

    return [];
  }, [entity?.settlementMST]);

  const canEditEndDateTime = (values, setFieldValue) => {
    const row = taskStatusMasterState?.entities?.find(
      (x) => x.id === values.statusMSTId
    );

    if (row && row.penaltyFlag === true) {
      if (roleCode === "admin") {
        return true;
      } else {
        return false;
      }
    }

    if (canEditStartEndTime) {
      if (values?.taskUserId && values.taskUserId > 0) {
        if (values?.statusMSTId && values.statusMSTId > 0) {
          const closeFlagRow = taskStatusMasterState?.entities?.find(
            (row) =>
              row.closeFlag &&
              !row.confirmFlag &&
              !row.payInFlag &&
              !row.payOutFlag &&
              !row.reopenFlag &&
              !row.penaltyFlag &&
              !row.autoCloseFlag &&
              !row.assignedFlag &&
              !row.wipFlag &&
              !row.cancelFlag
          );

          const wipFlagRow = taskStatusMasterState?.entities?.find(
            (row) => row.wipFlag
          );

          if (row) {
            if (
              row.closeFlag &&
              !row.confirmFlag &&
              !row.payInFlag &&
              !row.payOutFlag &&
              !row.reopenFlag &&
              !row.penaltyFlag &&
              !row.autoCloseFlag &&
              !row.assignedFlag &&
              !row.wipFlag &&
              !row.cancelFlag
            ) {
            } else {
              if (row.sortOrder < closeFlagRow.sortOrder) {
                if (values.endDateTime !== null) {
                  setFieldValue("endDateTime", null);
                  calculateActuals(
                    values.startDateTime,
                    null,
                    values,
                    setFieldValue,
                    false,
                    values.rbhStartTiming,
                    values.rbhEndTiming
                  );
                  calculateActuals(
                    values.startDateTime,
                    null,
                    values,
                    setFieldValue,
                    false,
                    values.rbhStartTiming,
                    values.rbhEndTiming,
                    true
                  );
                }
                if (values.customerEndDateTime !== null) {
                  setFieldValue("customerEndDateTime", null);
                  calculateActuals(
                    values.startDateTime,
                    null,
                    values,
                    setFieldValue,
                    true,
                    values.rbhStartTimingPayIn,
                    values.rbhEndTimingPayIn
                  );
                  calculateActuals(
                    values.startDateTime,
                    null,
                    values,
                    setFieldValue,
                    true,
                    values.rbhStartTimingPayIn,
                    values.rbhEndTimingPayIn,
                    true
                  );
                }
                if (values.customerStartDateTime !== null) {
                  if (row.sortOrder < wipFlagRow.sortOrder) {
                    setFieldValue("customerStartDateTime", null);
                    calculateActuals(
                      null,
                      null,
                      values,
                      setFieldValue,
                      true,
                      values.rbhStartTimingPayIn,
                      values.rbhEndTimingPayIn
                    );
                    calculateActuals(
                      null,
                      null,
                      values,
                      setFieldValue,
                      true,
                      values.rbhStartTimingPayIn,
                      values.rbhEndTimingPayIn,
                      true
                    );
                  }
                }
                return false;
              }
              if (roleCode === "admin") {
                if (entity?.taskStatusMST?.confirmFlag === true) {
                  return true;
                }
              }
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return canEditStartEndTime;
  };


  const canEditCustomerEndDateTime = (values, setFieldValue) => {
    const row = taskStatusMasterState?.entities?.find(
      (x) => x.id === values.statusMSTId
    );

    if (row && row.penaltyFlag === true) {
      if (roleCode === "admin") {
        return true;
      } else {
        return false;
      }
    }

    if (canEditCustomerStartEndTime) {
      if (values?.taskUserId && values.taskUserId > 0) {
        if (values?.statusMSTId && values.statusMSTId > 0) {
          const closeFlagRow = taskStatusMasterState?.entities?.find(
            (row) =>
              row.closeFlag &&
              !row.confirmFlag &&
              !row.reopenFlag &&
              !row.penaltyFlag &&
              !row.autoCloseFlag &&
              !row.assignedFlag &&
              !row.wipFlag &&
              !row.cancelFlag
          );

          const wipFlagRow = taskStatusMasterState?.entities?.find(
            (row) => row.wipFlag
          );

          if (row) {
            if (
              row.closeFlag &&
              !row.confirmFlag &&
              !row.reopenFlag &&
              !row.penaltyFlag &&
              !row.autoCloseFlag &&
              !row.assignedFlag &&
              !row.wipFlag &&
              !row.cancelFlag
            ) {
            } else {
              if (row.sortOrder < closeFlagRow.sortOrder) {
                if (values.endDateTime !== null) {
                  setFieldValue("endDateTime", null);
                  calculateActuals(
                    values.startDateTime,
                    null,
                    values,
                    setFieldValue,
                    false,
                    values.rbhStartTiming,
                    values.rbhEndTiming
                  );
                  calculateActuals(
                    values.startDateTime,
                    null,
                    values,
                    setFieldValue,
                    false,
                    values.rbhStartTiming,
                    values.rbhEndTiming,
                    true
                  );
                }
                if (values.customerEndDateTime !== null) {
                  setFieldValue("customerEndDateTime", null);
                  calculateActuals(
                    values.startDateTime,
                    null,
                    values,
                    setFieldValue,
                    true,
                    values.rbhStartTimingPayIn,
                    values.rbhEndTimingPayIn
                  );
                  calculateActuals(
                    values.startDateTime,
                    null,
                    values,
                    setFieldValue,
                    true,
                    values.rbhStartTimingPayIn,
                    values.rbhEndTimingPayIn,
                    true
                  );
                }
                if (values.customerStartDateTime !== null) {
                  if (row.sortOrder < wipFlagRow.sortOrder) {
                    setFieldValue("customerStartDateTime", null);
                    calculateActuals(
                      null,
                      null,
                      values,
                      setFieldValue,
                      true,
                      values.rbhStartTimingPayIn,
                      values.rbhEndTimingPayIn
                    );
                    calculateActuals(
                      null,
                      null,
                      values,
                      setFieldValue,
                      true,
                      values.rbhStartTimingPayIn,
                      values.rbhEndTimingPayIn,
                      true
                    );
                  }
                }
                return false;
              }
              if (roleCode === "admin") {
                if (entity?.taskStatusMST?.confirmFlag === true) {
                  return true;
                }
              }
            }
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else {
        return false;
      }
    }
    return canEditCustomerStartEndTime;
  };

  const canEditCustomerStartTime = (values, setFieldValue) => {
    const row = taskStatusMasterState?.entities?.find(
      (x) => x.id === values.statusMSTId
    );

    if (row && row.wipFlag) {
      return true;
    }
    return canEditCustomerEndDateTime(values, setFieldValue);
  };

  const canViewAddMultipleEngineer = (values) => {
    const row = taskStatusMasterState?.entities?.filter(
      (x) => x.id === values.statusMSTId
    )?.[0];

    const closeFlagRow = taskStatusMasterState?.entities?.find(
      (row) =>
        row.closeFlag &&
        !row.confirmFlag &&
        !row.payInFlag &&
        !row.payOutFlag &&
        !row.reopenFlag &&
        !row.penaltyFlag &&
        !row.autoCloseFlag &&
        !row.assignedFlag &&
        !row.wipFlag &&
        !row.cancelFlag
    );

    if (row?.sortOrder >= closeFlagRow?.sortOrder) {
      return false;
    }

    return true;
  };

  const updateDetailData = (values) => {
    let val = { ...values };

    setTimingsData(val, values);

    delete val?.taskDTLList;
    delete val?.taskLogs;
    delete val?.projectMST;
    delete val?.cityMST;
    delete val?.countryMST;
    delete val?.currentUser;
    delete val?.organizationMST;
    delete val?.taskDetails;
    delete val?.taskStatusMST;
    delete val?.taskUser;
    delete val?.taskPriorityMST;
    delete val?.taskAttachments;
    delete val?.payInCurrency;
    delete val?.payOutCurrency;
    delete val?.stateMST;
    delete val?.settlementMST;
    delete val?.projectManager;
    delete val?.projectCoOrdinator;
    delete val?.projectBranchDTL;

    convertBlankToNull(val);

    val.minHoursPayIn =
      val.minHoursPayIn !== null ? val.minHoursPayIn * 60 : null;
    val.minHoursPayOut =
      val.minHoursPayOut !== null ? val.minHoursPayOut * 60 : null;

    //If Assigned Engineer is removed, move ticket in Open Status
    if (entity.taskUserId) {
      if (val.taskUserId === null || val.taskUserId === 0) {
        if (val.statusMSTId !== pendingStatusId) {
          val.statusMSTId = taskStatusMasterState?.entities?.find(
            (x) => x.defaultFlag === true
          )?.id;
        }
      }
    }

    if (val.statusMSTId !== pendingStatusId) {
      val.taskPendingReasonsMSTId = null;
    }

    if (values.taskUserId <= 0) {
      val.travelChargesPayIn = null;
      val.travelCharges = null;
      val.materialChargesPayIn = null;
      val.materialCharges = null;
      val.parkingChargesPayIn = null;
      val.parkingCharges = null;
      val.otherChargesPayIn = null;
      val.otherCharges = null;
    } else {
      val.travelChargesPayIn = val.travelChargesPayIn;
      val.travelCharges = val.travelCharges;
      val.materialChargesPayIn = val.materialChargesPayIn;
      val.materialCharges = val.materialCharges;
      val.parkingChargesPayIn = val.parkingChargesPayIn;
      val.parkingCharges = val.parkingCharges;
      val.otherChargesPayIn = val.otherChargesPayIn;
      val.otherCharges = val.otherCharges;
    }

    const dtlId = entity?.taskDetails?.filter(
      (x) => x.notes === null && !x.log
    )?.[0]?.id;

    let taskDTLList = {
      id: dtlId,
      taskMSTId: values?.id,
      statusMSTId: values.statusMSTId,
      taskUserId: values.taskUserId,
      startDateTime: moment(values.startDateTime)
        .subtract(values.utcOffset, "minutes")
        .format("YYYY-MM-DD HH:mm"),
      endDateTime: values.endDateTime
        ? moment(values.endDateTime)
            .subtract(values.utcOffset, "minutes")
            .format("YYYY-MM-DD HH:mm")
        : null,
      customerStartDateTime: values.customerStartDateTime
        ? moment(values.customerStartDateTime)
            .subtract(values.utcOffset, "minutes")
            .format("YYYY-MM-DD HH:mm")
        : null,
      customerEndDateTime: values.customerEndDateTime
        ? moment(values.customerEndDateTime)
            .subtract(values.utcOffset, "minutes")
            .format("YYYY-MM-DD HH:mm")
        : null,
      actualRbh: values.actualRbh,
      actualObh: values.actualObh,
      actualAbh: values.actualAbh,
      actualRbhMin: values.actualRbhMin,
      actualObhMin: values.actualObhMin,
      actualAbhMin: values.actualAbhMin,
      payInRbh: values.payInRbh,
      payInObh: values.payInObh,
      payInAbh: values.payInAbh,
      payInRbhMin: values.payInRbhMin,
      payInObhMin: values.payInObhMin,
      payInAbhMin: values.payInAbhMin,
      travelCharges: val.travelCharges,
      materialCharges: val.materialCharges,
      parkingCharges: val.parkingCharges,
      otherCharges: val.otherCharges,
      travelChargesPayIn: val.travelChargesPayIn,
      materialChargesPayIn: val.materialChargesPayIn,
      parkingChargesPayIn: val.parkingChargesPayIn,
      otherChargesPayIn: val.otherChargesPayIn,
      ID_FIELD: "id",
      notes: null,
      closure: val.closure,
      cancellation: val.cancellation,
      taskPendingReasonsMSTId: val.taskPendingReasonsMSTId,
    };
    const defaultStatusRow = taskStatusMasterState?.entities?.find(
      (x) => x.defaultFlag === true
    );
    const cancelStatusRow = taskStatusMasterState?.entities?.find(
      (x) => x.cancelFlag === true
    );
    const pendingStatusRow = taskStatusMasterState?.entities?.find(
      (x) => x.pendingFlag === true
    );
    const assignedStatusRow = taskStatusMasterState?.entities?.find(
      (x) => x.assignedFlag === true
    );

    if (
      entity?.statusMSTId === cancelStatusRow?.id ||
      entity?.statusMSTId === pendingStatusRow?.id
    ) {
      if (taskDTLList.statusMSTId === defaultStatusRow?.id) {
        if (taskDTLList?.taskUserId > 0) {
          taskDTLList.statusMSTId = assignedStatusRow?.id;
          val.taskStatusMSTId = assignedStatusRow?.id;
          val.statusMSTId = assignedStatusRow?.id;
        }
      }
    }

    dispatch(taskMasterActions.startCall());

    let notesDTL;

    if (val.notes) {
      const editorData = EditorState.createWithContent(
        convertFromRaw(JSON.parse(val.notes))
      );

      if (editorData.getCurrentContent().getPlainText() !== "") {
        notesDTL = {
          taskMSTId: values?.id,
          notes: val.notes,
          statusMSTId: null,
          taskUserId: null,
          taskReassignedId: null,
          startDateTime: moment(values.startDateTime)
            .subtract(values.utcOffset, "minutes")
            .format("YYYY-MM-DD HH:mm"),
          endDateTime: null,
          customerStartDateTime: null,
          customerEndDateTime: null,
          actualRbh: 0,
          actualObh: 0,
          actualAbh: 0,
          payInRbh: 0,
          payInObh: 0,
          payInAbh: 0,
          actualRbhMin: 0,
          actualObhMin: 0,
          actualAbhMin: 0,
          payInRbhMin: 0,
          payInObhMin: 0,
          payInAbhMin: 0,
          travelCharges: null,
          materialCharges: null,
          parkingCharges: null,
          otherCharges: null,
          travelChargesPayIn: null,
          materialChargesPayIn: null,
          parkingChargesPayIn: null,
          otherChargesPayIn: null,
          ID_FIELD: "id",
          closure: val.closure,
          cancellation: val.cancellation,
          pending: val.pending,
          taskPendingReasonsMSTId: val.pending
            ? val.taskPendingReasonsMSTId
            : null,
        };

        if (val?.confirm === true) {
          notesDTL = {
            ...notesDTL,
            confirm: val?.confirm,
          };
        }

        if (val.closure || val.cancellation) {
          val.notesText = draftToHtml(
            convertToRaw(editorData.getCurrentContent())
          ); //editorData.getCurrentContent().getPlainText()
        }
      }
    }

    if (
      entity.startDateTime !== val.startDateTime ||
      entity.endDateTime !== val.endDateTime ||
      entity.customerStartDateTime !== val.customerStartDateTime ||
      entity.customerEndDateTime !== val.customerEndDateTime ||
      entity.travelChargesPayIn !== val.travelChargesPayIn ||
      entity.travelCharges !== val.travelCharges ||
      entity.materialChargesPayIn !== val.materialChargesPayIn ||
      entity.materialCharges !== val.materialCharges ||
      entity.parkingChargesPayIn !== val.parkingChargesPayIn ||
      entity.parkingCharges !== val.parkingCharges ||
      entity.otherChargesPayIn !== val.otherChargesPayIn ||
      entity.otherCharges !== val.otherCharges ||
      entity.taskStatusMSTId !== val.statusMSTId ||
      entity.actualAbh !== val.actualAbh ||
      entity.actualAbhMin !== val.actualAbhMin ||
      entity.actualObh !== val.actualObh ||
      entity.actualObhMin !== val.actualObhMin ||
      entity.actualRbh !== val.actualRbh ||
      entity.actualRbhMin !== val.actualRbhMin ||
      entity.payInAbh !== val.payInAbh ||
      entity.payInAbhMin !== val.payInAbhMin ||
      entity.payInObh !== val.payInObh ||
      entity.payInObhMin !== val.payInObhMin ||
      entity.payInRbh !== val.payInRbh ||
      entity.payInRbhMin !== val.payInRbhMin ||
      entity.countryMSTId != val.countryMSTId ||
      entity.stateMSTId != val.stateMSTId ||
      entity.cityMSTId != val.cityMSTId ||
      entity.taskPendingReasonsMSTId != val.taskPendingReasonsMSTId
    ) {
      // val.taskUserId = entity.taskUserId
      val.taskStatusMSTId = val.statusMSTId;

      val.taskDTL = taskDTLList;
      dispatch(taskMasterActions.updateCustom(val))
        .then((res1) => {
          if (taskDTLList.statusMSTId !== res1.taskStatusMSTId) {
            taskDTLList.statusMSTId = res1.taskStatusMSTId;
          }
          if (entity.taskStatusMSTId === val.statusMSTId) {
            taskDTLList.statusMSTId = res1.taskStatusMSTId;
          }

          dispatch(taskDetailActions.update(taskDTLList))
            .then((res2) => {
              if (notesDTL) {
                dispatch(taskDetailActions.create(notesDTL))
                  .then((res) => {
                    taskAttachmentActions
                      .deleteMultiple(filestoBeDeleted)
                      .then((res3) => {
                        taskAttachmentActions
                          .uploadMultiple(
                            attachmentState
                              ?.filter((x) => x.file !== null)
                              ?.map((x) => x.file),
                            res1.id
                          )
                          .then((res2) => {
                            dispatch(taskMasterActions.fetchEntity(res1.id))
                              .then((res1) => {})
                              .catch((err) => {
                                dispatch(taskMasterActions.stopCall());
                                setSaveError(err?.userMessage);
                              });
                          })
                          .catch((err) => {
                            dispatch(taskMasterActions.stopCall());
                            setSaveError(err?.userMessage);
                          });
                      })
                      .catch((err) => {
                        dispatch(taskMasterActions.stopCall());
                        setSaveError(err?.userMessage);
                      });
                  })
                  .catch((err) => {
                    dispatch(taskMasterActions.stopCall());
                    setUpdateError(err?.userMessage);
                  });
              } else {
                taskAttachmentActions
                  .deleteMultiple(filestoBeDeleted)
                  .then((res3) => {
                    taskAttachmentActions
                      .uploadMultiple(
                        attachmentState
                          ?.filter((x) => x.file !== null)
                          ?.map((x) => x.file),
                        res1.id
                      )
                      .then((res2) => {
                        dispatch(taskMasterActions.fetchEntity(res1.id))
                          .then((res1) => {})
                          .catch((err) => {
                            dispatch(taskMasterActions.stopCall());
                            setSaveError(err?.userMessage);
                          });
                      })
                      .catch((err) => {
                        dispatch(taskMasterActions.stopCall());
                        setSaveError(err?.userMessage);
                      });
                  })
                  .catch((err) => {
                    dispatch(taskMasterActions.stopCall());
                    setSaveError(err?.userMessage);
                  });
              }
            })
            .catch((err) => {
              dispatch(taskMasterActions.stopCall());
              setUpdateError(err?.userMessage);
            });
        })
        .catch((err) => {
          dispatch(taskMasterActions.stopCall());
          setUpdateError(err?.userMessage);
        });
    } else {
      // val.taskUserId = entity.taskUserId
      dispatch(taskMasterActions.updateCustom(val))
        .then((res1) => {
          if (notesDTL) {
            dispatch(taskDetailActions.create(notesDTL))
              .then((res) => {
                taskAttachmentActions
                  .deleteMultiple(filestoBeDeleted)
                  .then((res3) => {
                    taskAttachmentActions
                      .uploadMultiple(
                        attachmentState
                          ?.filter((x) => x.file !== null)
                          ?.map((x) => x.file),
                        res1.id
                      )
                      .then((res2) => {
                        dispatch(taskMasterActions.fetchEntity(res1.id))
                          .then((res4) => {})
                          .catch((err) => {
                            dispatch(taskMasterActions.stopCall());
                            setSaveError(err?.userMessage);
                          });
                      })
                      .catch((err) => {
                        dispatch(taskMasterActions.stopCall());
                        setSaveError(err?.userMessage);
                      });
                  })
                  .catch((err) => {
                    dispatch(taskMasterActions.stopCall());
                    setSaveError(err?.userMessage);
                  });
              })
              .catch((err) => {
                dispatch(taskMasterActions.stopCall());
                setUpdateError(err?.userMessage);
              });
          } else {
            taskAttachmentActions
              .deleteMultiple(filestoBeDeleted)
              .then((res3) => {
                taskAttachmentActions
                  .uploadMultiple(
                    attachmentState
                      ?.filter((x) => x.file !== null)
                      ?.map((x) => x.file),
                    res1.id
                  )
                  .then((res2) => {
                    dispatch(taskMasterActions.fetchEntity(res1.id))
                      .then((res4) => {})
                      .catch((err) => {
                        dispatch(taskMasterActions.stopCall());
                        setSaveError(err?.userMessage);
                      });
                  })
                  .catch((err) => {
                    dispatch(taskMasterActions.stopCall());
                    setSaveError(err?.userMessage);
                  });
              })
              .catch((err) => {
                dispatch(taskMasterActions.stopCall());
                setSaveError(err?.userMessage);
              });
          }
        })
        .catch((err) => {
          dispatch(taskMasterActions.stopCall());
          setUpdateError(err?.userMessage);
        });
    }
  };

  const getPayOutFormula = (values) => {
    let formula = "";
    if (values && values.length > 0) {
      const data = values[0];
      const rbhHour =
        data.minCal === true
          ? parseFloat((data.rbhMin / 60).toFixed(10))
          : parseFloat((data.rbh / 60).toFixed(10));
      const obhHour =
        data.minCal === true
          ? parseFloat((data.obhMin / 60).toFixed(10))
          : parseFloat((data.obh / 60).toFixed(10));
      const abhHour =
        data.minCal === true
          ? parseFloat((data.abhMin / 60).toFixed(10))
          : parseFloat((data.abh / 60).toFixed(10));

      if (data?.fullDayRates > 0) {
        formula = formula + data.fullDayRates + " + ";
      } else {
        formula =
          formula + " (" + rbhHour + " * " + data.rbhRate + ") " + " + ";
      }

      if (data.abhRate > 0) {
        formula =
          formula +
          " (" +
          obhHour +
          " * " +
          data.abhRate +
          " * " +
          data.rbhRate +
          ") " +
          " + ";
      } else {
        formula =
          formula + " (" + obhHour + " * " + data.obhRate + ") " + " + ";
      }

      if (data.weekendMultiplierRate > 0) {
        formula =
          formula +
          " (" +
          abhHour +
          " * " +
          data.weekendMultiplierRate +
          " * " +
          data.rbhRate +
          ") " +
          " + ";
      } else {
        formula =
          formula +
          " (" +
          abhHour +
          " * " +
          data.weekendFlatRate +
          ") " +
          " + ";
      }

      formula =
        formula +
        data.travel +
        " + " +
        data.material +
        " + " +
        data.parking +
        " + " +
        data.other +
        " = " +
        data.payableValue.toFixed(2);
    }

    return formula;
  };

  const getPayInFormula = (values) => {
    let formula = "";
    if (values && values.length > 0) {
      const data = values[0];
      const rbhHour =
        data.minCal === true
          ? parseFloat((data.rbhMin / 60).toFixed(10))
          : parseFloat((data.rbh / 60).toFixed(10));
      const obhHour =
        data.minCal === true
          ? parseFloat((data.obhMin / 60).toFixed(10))
          : parseFloat((data.obh / 60).toFixed(10));
      const abhHour =
        data.minCal === true
          ? parseFloat((data.abhMin / 60).toFixed(10))
          : parseFloat((data.abh / 60).toFixed(10));

      if (data?.fullDayRates > 0) {
        formula = formula + data.fullDayRates + " + ";
      } else {
        formula =
          formula + " (" + rbhHour + " * " + data.rbhRate + ") " + " + ";
      }

      if (data.abhRate > 0) {
        formula =
          formula +
          " (" +
          obhHour +
          " * " +
          data.abhRate +
          " * " +
          data.rbhRate +
          ") " +
          " + ";
      } else {
        formula =
          formula + " (" + obhHour + " * " + data.obhRate + ") " + " + ";
      }

      if (data.weekendMultiplierRate > 0) {
        formula =
          formula +
          " (" +
          abhHour +
          " * " +
          data.weekendMultiplierRate +
          " * " +
          data.rbhRate +
          ") " +
          " + ";
      } else {
        formula =
          formula +
          " (" +
          abhHour +
          " * " +
          data.weekendFlatRate +
          ") " +
          " + ";
      }

      formula =
        formula +
        data.travel +
        " + " +
        data.material +
        " + " +
        data.parking +
        " + " +
        data.other +
        " = " +
        data.receivableValue.toFixed(2);
    }

    return formula;
  };

  const openPendingReasonModal = (
    values,
    handleSubmit,
    setFieldValue,
    notesType
  ) => {
    const modal = (
      <PendingReasonModal
        closeModalHandler={() => setModal(null)}
        updateDetailData={updateDetailData}
        values={values}
        handleSubmit={handleSubmit}
        setFieldValue={setFieldValue}
        setErrorOnSumit={setErrorOnSumit}
        notesType={notesType}
      />
    );
    setModal(modal);
  };

  function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
      var reader = new FileReader();
      reader.onloadend = function() {
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  }

  return (
    <>
      {modal ? modal : null}
      <Formik
        enableReinitialize={true}
        initialValues={entity}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          setErrorOnSumit(false);

          let val = { ...values };

          setUpdateError(null);

          if (values.statusMSTId) {
            if (entity.statusMSTId !== values.statusMSTId) {
              const row = taskStatusMasterState?.entities?.find(
                (x) => x.id === values.statusMSTId
              );
              const OrgRow = taskStatusMasterState?.entities?.find(
                (x) => x.id === entity.statusMSTId
              );

              if (
                OrgRow?.confirmFlag === false &&
                row.closeFlag &&
                !row.confirmFlag &&
                !row.payInFlag &&
                !row.payOutFlag &&
                !row.reopenFlag &&
                !row.penaltyFlag &&
                !row.autoCloseFlag &&
                !row.assignedFlag &&
                !row.wipFlag &&
                !row.cancelFlag
              ) {
                val.closure = true;

                if (!values.notes) {
                  alert("Please Add Closure Note and Click on Update button");
                  const selector = `[name="notes"]`;
                  const errorElement = document.querySelector(selector);
                  if (errorElement) {
                    errorElement.setAttribute("tabindex", -1);
                    errorElement.focus();
                  }
                  return;
                }

                const editorData = EditorState.createWithContent(
                  convertFromRaw(JSON.parse(values.notes))
                );

                if (editorData.getCurrentContent().getPlainText() === "") {
                  alert("Please Add Closure Note and Click on Update button");
                  const selector = `[name="notes"]`;
                  const errorElement = document.querySelector(selector);
                  if (errorElement) {
                    errorElement.setAttribute("tabindex", -1);
                    errorElement.focus();
                  }
                  return;
                }
              }

              if (
                !row.confirmFlag &&
                !row.payInFlag &&
                !row.payOutFlag &&
                !row.reopenFlag &&
                !row.penaltyFlag &&
                !row.autoCloseFlag &&
                !row.assignedFlag &&
                !row.wipFlag &&
                row.cancelFlag
              ) {
                val.cancellation = true;

                if (!values.notes) {
                  alert(
                    "Please Add Cancellation Note and Click on Update button"
                  );
                  const selector = `[name="notes"]`;
                  const errorElement = document.querySelector(selector);
                  if (errorElement) {
                    errorElement.setAttribute("tabindex", -1);
                    errorElement.focus();
                  }
                  return;
                }

                const editorData = EditorState.createWithContent(
                  convertFromRaw(JSON.parse(values.notes))
                );

                if (editorData.getCurrentContent().getPlainText() === "") {
                  alert(
                    "Please Add Cancellation Note and Click on Update button"
                  );
                  const selector = `[name="notes"]`;
                  const errorElement = document.querySelector(selector);
                  if (errorElement) {
                    errorElement.setAttribute("tabindex", -1);
                    errorElement.focus();
                  }
                  return;
                }
              }

              if (row.pendingFlag) {
                if (
                  entity.taskPendingReasonsMSTId !==
                  values.taskPendingReasonsMSTId
                ) {
                  val.pending = true;
                  if (!values.notes) {
                    alert(
                      "Please Add Pending Reason Note and Click on Update button"
                    );

                    const selector = `[name="notes"]`;
                    const errorElement = document.querySelector(selector);
                    if (errorElement) {
                      errorElement.setAttribute("tabindex", -1);
                      errorElement.focus();
                    }
                    return;
                  }

                  const editorData = EditorState.createWithContent(
                    convertFromRaw(JSON.parse(values.notes))
                  );

                  if (editorData.getCurrentContent().getPlainText() === "") {
                    alert(
                      "Please Add Pending Reason Note and Click on Update button"
                    );

                    const selector = `[name="notes"]`;
                    const errorElement = document.querySelector(selector);
                    if (errorElement) {
                      errorElement.setAttribute("tabindex", -1);
                      errorElement.focus();
                    }
                    return;
                  }
                }
              }
            }
          }

          updateDetailData(val);
        }}
      >
        {({
          handleSubmit,
          handleReset,
          values,
          setFieldValue,
          setFieldTouched,
          errors,
        }) => (
          <Form className="form form-label-right">
            {/* <DocViewer
                                pluginRenderers={DocViewerRenderers}
                                // pluginRenderers={[PDFRenderer, PNGRenderer]}
                                documents={[
                                    {
                                        // uri: "https://static.remove.bg/sample-gallery/graphics/bird-thumbnail.jpg"
                                        uri:"https://projects.harvices.in/ticketingappapi/uploads/images/ZtIaN_Sign_off_Form.pdf"
                                        // uri:  toDataUrl("https://projects.harvices.in/ticketingappapi/uploads/images/ZtIaN_Sign_off_Form.pdf", function(myBase64) {
                                        //     return myBase64 // myBase64 is the base64 string
                                        // })
                                    }
                                ]} 
                            /> */}

            {/* <DocumentViewer
                                queryParams="hl=Nl"
                                url={"https://image.shutterstock.com/image-vector/sample-stamp-grunge-texture-vector-600w-1389188327.jpg"}
                                // viewerUrl={selectedViewer.viewerUrl}
                                // viewer={selectedViewer.name}
                                // overrideLocalhost="https://react-doc-viewer.firebaseapp.com/"
                                >
                            </DocumentViewer> */}

            {updateError ? (
              <div style={{ color: "red" }}>{updateError}</div>
            ) : null}
            {reportPayOutError ? (
              <div style={{ color: "red" }}>
                Error: {reportPayOutError?.userMessage}
              </div>
            ) : null}
            {reportPayInError ? (
              <div style={{ color: "red" }}>
                Error: {reportPayInError?.userMessage}
              </div>
            ) : null}

            <div>
              {errors && errorOnSumit ? (
                <div style={{ color: "red" }}>{getErrors(errors)}</div>
              ) : (
                ""
              )}
            </div>
            <div className="form-group row ticketWidth">
              <div className="col-md-2">
                <Field
                  name="taskCode"
                  component={Input}
                  label="Ticket Code"
                  disabled
                />
              </div>

              <div className="col-md-2">
                <Field
                  name="taskType"
                  component={AutoCompleteSelect}
                  placeholder="Select Task Type"
                  label="Ticket Type"
                  options={taskTypes}
                  nonEditable
                  backgroundColor="#F3F6F9"
                />
              </div>

              <div className="col-md-2">
                <Field
                  name="taskPriorityMSTId"
                  component={AutoCompleteSelect}
                  placeholder="Select Priority"
                  label="Ticket Priority"
                  customOptions={{
                    records: taskPriorityMasterState?.entities,
                    labelField: "taskPriorityName",
                    valueField: "id",
                  }}
                  isLoading={taskPriorityMasterState?.listLoading}
                  loadingMessage="Fetching records"
                  nonEditable
                  backgroundColor="#F3F6F9"
                />
              </div>
              <div className="col-md-3">
                <Field
                  name="planDateTime"
                  component={AntdDateTimePickerField}
                  label="Plan Date - Time"
                  isrequired
                  placeholder="DD-MMM-YYYY HH:MM"
                />
              </div>
              <div className="col-md-3">
                <Field
                  name="dueDateTime"
                  component={AntdDateTimePickerField}
                  label="Due Date - Time"
                  disabled
                />
              </div>
            </div>
            <div className="form-group row ticketWidth">
              <div className="col-md-3 mb-7">
                <Field
                  name="statusMSTId"
                  component={AutoCompleteSelect}
                  placeholder={
                    values?.taskStatusMST?.taskStatusName ?? "Select"
                  }
                  label="Ticket Status"
                  customOptions={{
                    records: statusList,
                    labelField: "taskStatusName",
                    valueField: "id",
                  }}
                  isLoading={taskStatusMasterState?.listLoading}
                  loadingMessage="Fetching records"
                  isrequired
                  nonEditable={
                    (!canChangeStatus && isCordinator) || !canEditStartEndTime
                  }
                  onChange={(option) => {
                    let prevValue = { ...values };

                    const statusMSTId = option?.value ?? null;
                    const row = taskStatusMasterState?.entities?.find(
                      (x) => x.id === statusMSTId
                    );
                    setFieldValue("statusMSTId", statusMSTId);
                    setFieldValue(
                      "confirm",
                      prevValue?.taskStatusMST?.confirmFlag
                    );

                    if (row) {
                      if (
                        (row.closeFlag &&
                          !row.confirmFlag &&
                          !row.payInFlag &&
                          !row.payOutFlag &&
                          !row.reopenFlag &&
                          !row.penaltyFlag &&
                          !row.autoCloseFlag &&
                          !row.assignedFlag &&
                          !row.wipFlag &&
                          !row.cancelFlag) ||
                        row.penaltyFlag === true
                      ) {
                        const startDateTime = values.startDateTime
                          ? moment(values.startDateTime).format(
                              "yyyy-MM-DD HH:mm"
                            )
                          : null;

                        //Min Hours Calculation
                        if (
                          values?.minHoursPayOut &&
                          values.minHoursPayOut > 0
                        ) {
                          const endDateTime = startDateTime
                            ? moment(startDateTime)
                                .add(values.minHoursPayOut, "hours")
                                .format("yyyy-MM-DD HH:mm")
                            : null;
                          calculateActuals(
                            startDateTime,
                            endDateTime,
                            values,
                            setFieldValue,
                            false,
                            values.rbhStartTiming,
                            values.rbhEndTiming,
                            true
                          );
                        } else {
                          calculateActuals(
                            startDateTime,
                            null,
                            values,
                            setFieldValue,
                            false,
                            values.rbhStartTiming,
                            values.rbhEndTiming,
                            true
                          );
                        }

                        if (
                          entity?.statusMSTId !== statusMSTId &&
                          row.closeFlag
                        ) {
                          let val = { ...values };
                          val.statusMSTId = statusMSTId;

                          openPendingReasonModal(
                            val,
                            handleSubmit,
                            setFieldValue,
                            prevValue?.taskStatusMST?.confirmFlag
                              ? "Confirm"
                              : "Close"
                          );
                        }
                      }

                      if (row.penaltyFlag) {
                        const customerStartDateTime = values.planDateTime;
                        setFieldValue(
                          "customerStartDateTime",
                          customerStartDateTime
                        );

                        calculateActuals(
                          customerStartDateTime,
                          values.customerEndDateTime,
                          values,
                          setFieldValue,
                          true,
                          values.rbhStartTimingPayIn,
                          values.rbhEndTimingPayIn
                        );

                        //Min Hours Calculation
                        if (values?.minHoursPayIn && values.minHoursPayIn > 0) {
                          const customerEndDateTime = customerStartDateTime
                            ? moment(customerStartDateTime)
                                .add(values.minHoursPayIn, "hours")
                                .format("yyyy-MM-DD HH:mm")
                            : null;
                          calculateActuals(
                            customerStartDateTime,
                            customerEndDateTime,
                            values,
                            setFieldValue,
                            true,
                            values.rbhStartTimingPayIn,
                            values.rbhEndTimingPayIn,
                            true
                          );
                        } else {
                          calculateActuals(
                            customerStartDateTime,
                            null,
                            values,
                            setFieldValue,
                            true,
                            values.rbhStartTimingPayIn,
                            values.rbhEndTimingPayIn,
                            true
                          );
                        }
                      }

                      if (row.cancelFlag) {
                        if (
                          entity?.statusMSTId !== statusMSTId &&
                          row.closeFlag
                        ) {
                          let val = { ...values };
                          val.statusMSTId = statusMSTId;

                          openPendingReasonModal(
                            val,
                            handleSubmit,
                            setFieldValue,
                            "Cancel"
                          );
                        }
                      }
                    }
                  }}
                />
              </div>
              <div
                className="col-md-3"
                style={
                  values?.statusMSTId === pendingStatusId
                    ? null
                    : { display: "none" }
                }
              >
                <Field
                  name="taskPendingReasonsMSTId"
                  component={AutoCompleteSelect}
                  placeholder="Select Reason"
                  label="Pending Reason"
                  customOptions={{
                    records: taskPendingReasonsMasterState?.entities,
                    labelField: "name",
                    valueField: "id",
                  }}
                  isLoading={taskPendingReasonsMasterState?.listLoading}
                  loadingMessage="Fetching records"
                  isrequired
                  nonEditable={
                    (!canChangeStatus && isCordinator) || !canEditStartEndTime
                  }
                  onChange={(option) => {
                    const id = option?.value ?? null;
                    setFieldValue("taskPendingReasonsMSTId", id);
                    let val = { ...values };
                    val.taskPendingReasonsMSTId = id;
                    openPendingReasonModal(
                      val,
                      handleSubmit,
                      setFieldValue,
                      "Pending"
                    );
                  }}
                />
              </div>
              <div className="col-md-3 mb-7">
                <Field
                  name="taskUserId"
                  component={AutoCompleteSelect}
                  customOptions={{
                    records: engineerMasterState?.entities?.filter(
                      (x) => x.countryMSTId === values.countryMSTId
                    ),
                    labelField: "engineerName",
                    valueField: "id",
                  }}
                  isLoading={engineerMasterState?.listLoading}
                  loadingMessage="Fetching records..."
                  label="Assigned Engineer"
                  placeholder="Select Assigned Engineer"
                  // nonEditable={/* entity?.taskUserId ||  */entity?.taskStatusMST?.penaltyFlag}
                  onChange={(option) => {
                    let id = option?.value ?? null;
                    let engineerRow = engineerMasterState?.entities?.filter(
                      (x) => x.id === id
                    )?.[0];
                    if (
                      values?.rbhPayoutRate === null ||
                      values?.rbhPayoutRate === 0
                    ) {
                      setFieldValue("rbhPayoutRate", engineerRow?.ratePerHour);
                    }
                    if (
                      values?.payOutCurrencyId === null ||
                      values?.payOutCurrencyId === 0
                    ) {
                      setFieldValue(
                        "payOutCurrencyId",
                        engineerRow?.currencyMSTId
                      );
                    }
                    setFieldValue("taskUserId", id);
                    setFieldValue(
                      "POC",
                      engineerRow?.pointOfContact?.engineerName
                    );
                  }}
                  nonEditable={
                    !canChangeEngineer || entity?.taskStatusMST?.penaltyFlag
                  }
                />
                <div style={{ paddingTop: "10px", color: "blue" }}>
                  <span
                    onClick={() => {
                      openEngineerModal();
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    Create?
                  </span>

                  <span
                    onClick={() => {
                      openAssignEngineerModal(
                        engineerMasterState?.entities?.filter(
                          (x) =>
                            x.countryMSTId === values.countryMSTId &&
                            x.id !== values?.taskUserId
                        ),
                        setFieldValue,
                        values,
                        setTimingsData
                      );
                    }}
                    style={
                      canViewAddMultipleEngineer(values)
                        ? { float: "right", cursor: "pointer" }
                        : { display: "none" }
                    }
                  >
                    Add Multiple?
                  </span>
                </div>
              </div>
              <div
                className={
                  values?.statusMSTId === pendingStatusId
                    ? "col-md-3 mb-7"
                    : "col-md-2 mb-7"
                }
              >
                <Field name="POC" label="POC" component={Input} disabled />
              </div>
              <div
                className={
                  values?.statusMSTId === pendingStatusId
                    ? "col-md-3 mb-7"
                    : "col-md-2 mb-7"
                }
              >
                <Field
                  name="projectCoOrdinatorId"
                  component={AutoCompleteSelect}
                  customOptions={{
                    records: userMasterState?.entities?.filter(
                      (x) =>
                        x?.organizationMST?.organizationType === "SELF" &&
                        x?.userName !== "admin"
                    ),
                    labelField: "userName",
                    valueField: "id",
                  }}
                  loadingMessage="Fetching records..."
                  isLoading={userMasterState?.listLoading}
                  label="Project Co-ordinator"
                  // placeholder="Select Co-ordinator"
                  nonEditable={!canchangeprojectcoordinator}
                />
              </div>
              <div
                className={
                  values?.statusMSTId === pendingStatusId
                    ? "col-md-3 mb-7"
                    : "col-md-2 mb-7"
                }
              >
                <Field
                  name="projectManagerId"
                  component={AutoCompleteSelect}
                  customOptions={{
                    records: userMasterState?.entities?.filter(
                      (x) =>
                        x?.organizationMST?.organizationType === "SELF" &&
                        x?.userName !== "admin"
                    ),
                    labelField: "userName",
                    valueField: "id",
                  }}
                  isLoading={userMasterState?.listLoading}
                  loadingMessage="Fetching records..."
                  label="Project Manager"
                  nonEditable={
                    (!isManager && roleCode !== "admin") || !canEditStartEndTime
                  }
                />
              </div>

              {/* <div className="form-group row ticketWidth"> */}

              <div className="col-md-3 mb-7">
                <Field
                  name="startDateTime"
                  component={AntdDateTimePickerField}
                  label="Start Date - Time"
                  isrequired
                  onChange={(val) => {
                    const startDateTime = val
                      ? moment(val).format("yyyy-MM-DD HH:mm")
                      : null;
                    setFieldValue("startDateTime", startDateTime);
                    calculateActuals(
                      startDateTime,
                      values.endDateTime,
                      values,
                      setFieldValue,
                      false,
                      values.rbhStartTiming,
                      values.rbhEndTiming
                    );

                    //Min Hours Calculation
                    if (values?.minHoursPayOut && values.minHoursPayOut > 0) {
                      const endDateTime = val
                        ? moment(val)
                            .add(values.minHoursPayOut, "hours")
                            .format("yyyy-MM-DD HH:mm")
                        : null;
                      calculateActuals(
                        startDateTime,
                        endDateTime,
                        values,
                        setFieldValue,
                        false,
                        values.rbhStartTiming,
                        values.rbhEndTiming,
                        true
                      );
                    } else {
                      calculateActuals(
                        startDateTime,
                        null,
                        values,
                        setFieldValue,
                        false,
                        values.rbhStartTiming,
                        values.rbhEndTiming,
                        true
                      );
                    }
                  }}
                  disabled={!canEditStartEndTime}
                  placeholder="DD-MMM-YYYY HH:MM"
                />
              </div>
              <div className="col-md-3 mb-7">
                <Field
                  name="endDateTime"
                  component={AntdDateTimePickerField}
                  label="End Date - Time"
                  onChange={(val) => {
                    setFieldValue(
                      "endDateTime",
                      val ? moment(val).format("yyyy-MM-DD HH:mm") : null
                    );
                    calculateActuals(
                      values.startDateTime,
                      val ? moment(val).format("yyyy-MM-DD HH:mm") : null,
                      values,
                      setFieldValue,
                      false,
                      values.rbhStartTiming,
                      values.rbhEndTiming
                    );

                    //Min Hours Calculation
                    if (values?.minHoursPayOut && values.minHoursPayOut > 0) {
                      const endDateTime = values.startDateTime
                        ? moment(values.startDateTime)
                            .add(values.minHoursPayOut, "hours")
                            .format("yyyy-MM-DD HH:mm")
                        : null;
                      calculateActuals(
                        values.startDateTime,
                        endDateTime,
                        values,
                        setFieldValue,
                        false,
                        values.rbhStartTiming,
                        values.rbhEndTiming,
                        true
                      );
                    } else {
                      calculateActuals(
                        values.startDateTime,
                        null,
                        values,
                        setFieldValue,
                        false,
                        values.rbhStartTiming,
                        values.rbhEndTiming,
                        true
                      );
                    }
                  }}
                  disabled={!canEditEndDateTime(values, setFieldValue)}
                  placeholder="DD-MMM-YYYY HH:MM"
                />
              </div>
              <div className="col-md-3 mb-7">
                <Field
                  name="customerStartDateTime"
                  component={AntdDateTimePickerField}
                  label="Customer Start Date - Time"
                  onChange={(val) => {
                    const customerStartDateTime = val
                      ? moment(val).format("yyyy-MM-DD HH:mm")
                      : null;
                    setFieldValue(
                      "customerStartDateTime",
                      customerStartDateTime
                    );
                    calculateActuals(
                      customerStartDateTime,
                      values.customerEndDateTime,
                      values,
                      setFieldValue,
                      true,
                      values.rbhStartTimingPayIn,
                      values.rbhEndTimingPayIn
                    );

                    //Min Hours Calculation
                    if (values?.minHoursPayIn && values.minHoursPayIn > 0) {
                      const customerEndDateTime = val
                        ? moment(val)
                            .add(values.minHoursPayIn, "hours")
                            .format("yyyy-MM-DD HH:mm")
                        : null;
                      calculateActuals(
                        customerStartDateTime,
                        customerEndDateTime,
                        values,
                        setFieldValue,
                        true,
                        values.rbhStartTimingPayIn,
                        values.rbhEndTimingPayIn,
                        true
                      );
                    } else {
                      calculateActuals(
                        customerStartDateTime,
                        null,
                        values,
                        setFieldValue,
                        true,
                        values.rbhStartTimingPayIn,
                        values.rbhEndTimingPayIn,
                        true
                      );
                    }
                  }}
                  disabled={!canEditCustomerStartTime(values, setFieldValue)}
                  placeholder="DD-MMM-YYYY HH:MM"
                  showTime={{
                    format: "HH:mm",
                    defaultValue: moment()
                      .set("hours", 8)
                      .set("minutes", 30),
                  }}
                />
              </div>
              <div className="col-md-3 mb-7">
                <Field
                  name="customerEndDateTime"
                  component={AntdDateTimePickerField}
                  label="Customer End Date - Time"
                  onChange={(val) => {
                    setFieldValue(
                      "customerEndDateTime",
                      val ? moment(val).format("yyyy-MM-DD HH:mm") : null
                    );
                    calculateActuals(
                      values.customerStartDateTime,
                      val ? moment(val).format("yyyy-MM-DD HH:mm") : null,
                      values,
                      setFieldValue,
                      true,
                      values.rbhStartTimingPayIn,
                      values.rbhEndTimingPayIn
                    );

                    //Min Hours Calculation
                    if (values?.minHoursPayIn && values.minHoursPayIn > 0) {
                      const customerEndDateTime = values.customerStartDateTime
                        ? moment(values.customerStartDateTime)
                            .add(values.minHoursPayIn, "hours")
                            .format("yyyy-MM-DD HH:mm")
                        : null;
                      calculateActuals(
                        values.customerStartDateTime,
                        customerEndDateTime,
                        values,
                        setFieldValue,
                        true,
                        values.rbhStartTimingPayIn,
                        values.rbhEndTimingPayIn,
                        true
                      );
                    } else {
                      calculateActuals(
                        values.customerStartDateTime,
                        null,
                        values,
                        setFieldValue,
                        true,
                        values.rbhStartTimingPayIn,
                        values.rbhEndTimingPayIn,
                        true
                      );
                    }
                  }}
                  disabled={!canEditCustomerStartTime(values, setFieldValue)}
                  placeholder="DD-MMM-YYYY HH:MM"
                />
              </div>
              {/* </div> */}
              {/* <div className="form-group row ticketWidth"> */}
              <div className="col-md-3 mb-7">
                <Field
                  name="organizationMST.organizationName"
                  label="Customer"
                  component={Input}
                  disabled
                />
              </div>
              <div className="col-md-3 mb-7">
                <Field
                  name="externalCustomer"
                  component={Input}
                  label="End Customer"
                  disabled
                />
              </div>
              <div className="col-md-3 mb-7">
                <Field
                  name="projectMST.projectName"
                  component={Input}
                  label="Project"
                  disabled
                />
              </div>
              <div className="col-md-3 mb-7">
                <Field
                  name="projectBranchDTL.branchName"
                  component={Input}
                  label="Project Branch"
                  disabled
                />
              </div>

              {/* </div> */}
              {/* <div className="form-group row ticketWidth"> */}
              <div className="col-md-3 mb-7">
                <Field
                  name="countryMSTId"
                  label="Country"
                  component={AutoCompleteSelect}
                  customOptions={{
                    records: countryMasterState?.entities,
                    labelField: "countryName",
                    valueField: "id",
                  }}
                  isrequired
                  isLoading={countryMasterState?.listLoading}
                  loadingMessage="Fetching records..."
                  placeholder="Select Country"
                  onChange={(option) => {
                    let countryMSTId = option?.value ?? null;
                    let countryCode = countryMasterState?.entities?.find(
                      (x) => x.id === countryMSTId
                    )?.countryCode;
                    setFieldValue("countryCode", countryCode);
                    dispatch(stateMasterActions.getByCountry(countryMSTId));
                    dispatch(cityMasterActions.getByCountry(countryMSTId));

                    setFieldValue("stateMSTId", 0);
                    setFieldValue("cityMSTId", 0);
                    setFieldValue("taskUserId", null);

                    setFieldValue("countryMSTId", countryMSTId);
                  }}
                  nonEditable={!canChangeAddress}
                  backgroundColor={!canChangeAddress ? "#F3F6F9" : null}
                />
              </div>
              <div className="col-md-3 mb-7">
                <Field
                  name="stateMSTId"
                  component={AutoCompleteSelect}
                  label="State"
                  customOptions={{
                    records: stateMasterState?.entities,
                    labelField: "stateName",
                    valueField: "id",
                  }}
                  isLoading={stateMasterState?.listLoading}
                  loadingMessage="Fetching records..."
                  placeholder="Select State"
                  onChange={(option) => {
                    let stateMSTId = option?.value ?? null;
                    if (stateMSTId && values.countryMSTId) {
                      dispatch(
                        cityMasterActions.getByCountryAndState(
                          values.countryMSTId,
                          stateMSTId
                        )
                      );
                    } else {
                      dispatch(
                        cityMasterActions.getByCountry(values.countryMSTId)
                      );
                    }

                    setFieldValue("cityMSTId", 0);
                    setFieldValue("stateMSTId", stateMSTId);
                  }}
                  nonEditable={!canChangeAddress}
                  backgroundColor={!canChangeAddress ? "#F3F6F9" : null}
                />
              </div>
              <div className="col-md-3 mb-7">
                <Field
                  name="cityMSTId"
                  label="City"
                  component={AutoCompleteSelectWindow}
                  customOptions={{
                    records: cityMasterState?.entities,
                    labelField: "cityName",
                    valueField: "id",
                  }}
                  isLoading={cityMasterState?.listLoading}
                  loadingMessage="Fetching records..."
                  placeholder="Select City"
                  isrequired
                  onChange={(option) => {
                    const cityMSTId = option?.value ?? null;
                    const cityMST = cityMasterState?.entities?.find(
                      (x) => x.id === cityMSTId
                    );
                    if (cityMST?.latitude && cityMST?.longitude) {
                      const timezone = tz_lookup(
                        cityMST.latitude,
                        cityMST.longitude
                      );
                      setFieldValue(
                        "utcOffset",
                        moment.tz(timezone).utcOffset()
                      );
                    }
                    setFieldValue("cityMSTId", cityMSTId);
                  }}
                  nonEditable={!canChangeAddress}
                  backgroundColor={!canChangeAddress ? "#F3F6F9" : null}
                />
              </div>
              <div className="col-md-3 mb-7">
                <Field
                  name="zipCode"
                  label="Zip Code"
                  component={Input}
                  disabled={!canChangeAddress}
                />
              </div>
              {/* </div> */}
              {/* <div className="form-group row ticketWidth"> */}
              <div className="col-md-6 mb-7">
                <Field
                  name="address"
                  label="Address"
                  component={TextArea}
                  placeholder="Enter Address"
                  disabled={
                    values?.taskStatusMST?.taskStatusName === "WIP" &&
                    !values?.projectBranchDTL
                      ? false
                      : !canChangeAddress
                  }
                />
              </div>
              <div className="col-md-6 mb-7">
                <Field
                  name="summary"
                  label="Ticket Summary"
                  component={TextArea}
                  placeholder="Enter Ticket Summary"
                  disabled={!canEditStartEndTime}
                  isrequired
                />
              </div>
              {/* </div> */}
            </div>

            <div className="form-group row ticketWidth pt-5">
              <div className="col-md-2 offset-md-10 saveMobileBtn">
                <button
                  type="submit"
                  style={
                    canupdatehwpro === false 
                      ? { minWidth: "85px", whiteSpace: "nowrap",width: "100%",display: "none"}
                      : {  minWidth: "85px", whiteSpace: "nowrap",width: "100%" }
                  }                  
                  className="btn pinaple-yellow-btn"
                  onSubmit={() => handleSubmit(values)}
                  onClick={() => setErrorOnSumit(true)}
                >
                  <SVG
                    src={toAbsoluteUrl(
                      "/media/svg/icons/Communication/Write.svg"
                    )}
                    title="Edit"
                  />
                  Update
                </button>
              </div>
            </div>

            <div className="form-group row  pt-7 ticketWidth">
              <div className="col-md-12">
                <Field
                  name="notes"
                  component={HTMLEditorField}
                  placeholder="Add your Note here...."
                  // lable="Notes"
                />
              </div>
            </div>
            <div className="form-group row ticketWidth">
              <div className="col-md-2 offset-md-10 pb-3">
                <button
                  type="button"
                  style={
                    canupdatehwpro === false 
                      ? { minWidth: "70px", whiteSpace: "nowrap",width: "100%",display: "none"}
                      : {  minWidth: "70px", whiteSpace: "nowrap",width: "100%" }
                  } 
                  className="btn pinaple-yellow-btn"
                  onClick={() => {
                    if (!values.notes) {
                      alert("Please Add Note");
                      return;
                    }

                    const editorData = EditorState.createWithContent(
                      convertFromRaw(JSON.parse(values.notes))
                    );

                    if (editorData.getCurrentContent().getPlainText() === "") {
                      alert("Please Add Note");
                      return;
                    }
                    let notesDTL = {
                      taskMSTId: values?.id,
                      notes: values.notes,
                      statusMSTId: null,
                      taskUserId: null,
                      taskReassignedId: null,
                      startDateTime: moment(values.startDateTime)
                        .subtract(values.utcOffset, "minutes")
                        .format("YYYY-MM-DD HH:mm"),
                      endDateTime: null,
                      customerStartDateTime: null,
                      customerEndDateTime: null,
                      actualRbh: 0,
                      actualObh: 0,
                      actualAbh: 0,
                      payInRbh: 0,
                      payInObh: 0,
                      payInAbh: 0,
                      actualRbhMin: 0,
                      actualObhMin: 0,
                      actualAbhMin: 0,
                      payInRbhMin: 0,
                      payInObhMin: 0,
                      payInAbhMin: 0,
                      travelCharges: null,
                      materialCharges: null,
                      parkingCharges: null,
                      otherCharges: null,
                      travelChargesPayIn: null,
                      materialChargesPayIn: null,
                      parkingChargesPayIn: null,
                      otherChargesPayIn: null,
                      ID_FIELD: "id",
                    };

                    dispatch(taskDetailActions.create(notesDTL))
                      .then((res) => {
                        dispatch(
                          taskMasterActions.fetchEntity(res.taskMSTId)
                        ).then((res3) => {});
                      })
                      .catch((err) => {
                        dispatch(taskMasterActions.stopCall());
                        setUpdateError(err?.userMessage);
                      });
                  }}
                >
                  <SVG
                    src={toAbsoluteUrl("/media/svg/icons/Design/Union.svg")}
                    title="Edit"
                  />
                  Add Note
                </button>
              </div>
            </div>
            <div
              className="row ticketWidth"
              style={{ paddingTop: "7px", paddingBottom: "25px" }}
            >
              {topNotesToShow.map((x, index) => {
                const editorData = EditorState.createWithContent(
                  convertFromRaw(JSON.parse(x.notes))
                );
                return (
                  <div className="col-md-12" key={index}>
                    {x.closure === true ? (
                      <h4 className="pt-2 pl-2">Closure Note</h4>
                    ) : x.confirm === true ? (
                      <h4 className="pt-2 pl-2">
                        Reason for moving this ticket from confirm to close
                      </h4>
                    ) : x.cancellation === true ? (
                      <h4 className="pt-2 pl-2">Cancellation Note</h4>
                    ) : null}

                    <div
                      style={
                        x.closure === true || x.confirm === true
                          ? {
                              backgroundColor: "#bdc0c3",
                              borderRadius: "10px",
                              marginBottom: "10px",
                            }
                          : x.cancellation === true
                          ? {
                              backgroundColor: "#f14949",
                              borderRadius: "10px",
                              marginBottom: "10px",
                            }
                          : x.pending === true
                          ? {
                              backgroundColor: "#e9e985",
                              borderRadius: "10px",
                              marginBottom: "10px",
                            }
                          : {
                              backgroundColor: "#F3F6F9",
                              borderRadius: "10px",
                              marginBottom: "10px",
                            }
                      }
                    >
                      <div className="pt-2 pl-2" style={{ fontWeight: "bold" }}>
                        {x.modifiedOn} &nbsp;&nbsp; User:&nbsp;
                        {x?.createdByUser?.userName}
                      </div>
                      <div
                        className="pt-2 pl-2"
                        dangerouslySetInnerHTML={{
                          __html: draftToHtml(
                            convertToRaw(editorData.getCurrentContent())
                          ),
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            <hr />
            <div className="pb-10"></div>

            <TabularView
              tabs={[
                {
                  key: "details",
                  title: "Details",
                  content: (
                    <>
                      <div className="form-group row">
                        <div className="col-md-2">
                          <Field
                            name="localContactName"
                            label="LCON Name"
                            component={Input}
                            placeholder="Enter LCON Name"
                          />
                        </div>
                        <div className="col-md-2">
                          <Field
                            name="localContactPhone"
                            label="LCON Number"
                            component={Input}
                            placeholder="Enter LCON Number"
                            // isrequired
                          />
                        </div>
                        <div className="col-md-2">
                          <Field
                            name="localContactEmail"
                            label="LCON Email"
                            component={Input}
                            placeholder="Enter LCON Email"
                            // isrequired
                          />
                        </div>
                        <div className="col-md-3">
                          <Field
                            name="reference1"
                            label="Customer REF Ticket-1"
                            component={Input}
                            placeholder="Enter Customer REF Ticket-1"
                          />
                        </div>
                        <div className="col-md-3">
                          <Field
                            name="reference2"
                            label="Customer REF Ticket-2"
                            component={Input}
                            placeholder="Enter Customer REF Ticket-2"
                          />
                        </div>
                        <div className="col-md-3">
                          <Field
                            name="poNumber"
                            label="PO Number"
                            component={Input}
                            placeholder="Enter PO Number"
                          />
                        </div>
                      </div>

                      <div className="form-group row pb-5">
                        <div className="col-12">
                          <Field
                            name="scopeOfWork"
                            component={HTMLEditorField}
                            isrequired
                            lable="Scope of Work"
                          />
                        </div>
                      </div>

                      <hr />

                      <div className="form-group row pt-5">
                        <div className="col-md-2">
                          <label>Attachment(s)</label>
                        </div>
                        <div className="col-md-8">
                          <div {...getRootProps({ className: "dropzone" })}>
                            <input {...getInputProps()} />
                            <p>
                              Drag 'n' drop some files here, or click to select
                              files
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="form-group row">
                        {attachmentState?.map((x, index) => {
                          return (
                            <div
                              key={index}
                              className="col-md-2"
                              style={{
                                textAlign: "center",
                                backgroundColor: "#F3F6F9",
                                borderRadius: "10px",
                                marginRight: "7px",
                                marginBottom: "7px",
                                padding: "10px",
                              }}
                            >
                              <div>
                                <i className="fas fa-file fa-3x"></i>
                                {authState?.user?.userRoleMST?.roleCode ===
                                "admin" ? (
                                  <i
                                    className="fas fa-times-circle"
                                    style={{
                                      float: "right",
                                      color: "#e62020",
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) =>
                                      handleDeleteAttachment(x.key)
                                    }
                                  ></i>
                                ) : !x.id ? (
                                  <i
                                    className="fas fa-times-circle"
                                    style={{
                                      float: "right",
                                      color: "#e62020",
                                      cursor: "pointer",
                                    }}
                                    onClick={(e) =>
                                      handleDeleteAttachment(x.key)
                                    }
                                  ></i>
                                ) : (
                                  ""
                                )}
                              </div>
                              <a
                                download={x?.fileName}
                                href={x?.fileDownloadUri}
                              >
                                <div>{x?.fileName}</div>
                              </a>
                            </div>
                          );
                        })}
                      </div>

                      <hr />

                      <div className="form-group row mt-7">
                        {roleCode.includes("admin") ||
                        roleCode.includes("pm") ? (
                          <div className="col-12 col-md-6 border-right">
                            <div className="row">
                              <div
                                className="col-12"
                                style={{ textAlign: "center" }}
                              >
                                <label
                                  className="justify-content-center"
                                  style={{ fontWeight: "600" }}
                                >
                                  Pay In (Customer)
                                </label>
                              </div>
                            </div>
                            <div className="form-group row">
                              <div
                                className="col-12 col-md-3"
                                style={{ marginBlock: "auto" }}
                              >
                                <label className="justify-content-start">
                                  RBH Rates
                                </label>
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="payInDayOption"
                                  component={AutoCompleteSelect}
                                  options={dayOption}
                                  label="Day"
                                  onChange={(e) => {
                                    let day = e?.value ?? null;
                                    if (day) {
                                      if (day === "fullday") {
                                        let today = new Date();
                                        let startTime = setTimeForDate(
                                          today,
                                          8,
                                          30,
                                          0
                                        );
                                        let endTime = setTimeForDate(
                                          today,
                                          17,
                                          0,
                                          0
                                        );
                                        setFieldValue(
                                          "rbhStartTimingPayIn",
                                          startTime
                                        );
                                        setFieldValue(
                                          "rbhEndTimingPayIn",
                                          endTime
                                        );

                                        const customerStartDateTime =
                                          values.customerStartDateTime;
                                        calculateActuals(
                                          customerStartDateTime,
                                          values.customerEndDateTime,
                                          values,
                                          setFieldValue,
                                          true,
                                          startTime,
                                          endTime
                                        );

                                        //Min Hours Calculation
                                        if (
                                          values?.minHoursPayIn &&
                                          values.minHoursPayIn > 0
                                        ) {
                                          const customerEndDateTime = customerStartDateTime
                                            ? moment(customerStartDateTime)
                                                .add(
                                                  values.minHoursPayIn,
                                                  "hours"
                                                )
                                                .format("yyyy-MM-DD HH:mm")
                                            : null;
                                          calculateActuals(
                                            customerStartDateTime,
                                            customerEndDateTime,
                                            values,
                                            setFieldValue,
                                            true,
                                            startTime,
                                            values.rbhEndTimingPayIn,
                                            true
                                          );
                                        } else {
                                          calculateActuals(
                                            customerStartDateTime,
                                            null,
                                            values,
                                            setFieldValue,
                                            true,
                                            startTime,
                                            endTime,
                                            true
                                          );
                                        }
                                      } else if (day === "halfday") {
                                        let today = new Date();
                                        let startTime = setTimeForDate(
                                          today,
                                          8,
                                          30,
                                          0
                                        );
                                        let endTime = setTimeForDate(
                                          today,
                                          12,
                                          30,
                                          0
                                        );
                                        setFieldValue(
                                          "rbhStartTimingPayIn",
                                          startTime
                                        );
                                        setFieldValue(
                                          "rbhEndTimingPayIn",
                                          endTime
                                        );

                                        const customerStartDateTime =
                                          values.customerStartDateTime;
                                        calculateActuals(
                                          customerStartDateTime,
                                          values.customerEndDateTime,
                                          values,
                                          setFieldValue,
                                          true,
                                          startTime,
                                          endTime
                                        );

                                        //Min Hours Calculation
                                        if (
                                          values?.minHoursPayIn &&
                                          values.minHoursPayIn > 0
                                        ) {
                                          const customerEndDateTime = customerStartDateTime
                                            ? moment(customerStartDateTime)
                                                .add(
                                                  values.minHoursPayIn,
                                                  "hours"
                                                )
                                                .format("yyyy-MM-DD HH:mm")
                                            : null;
                                          calculateActuals(
                                            customerStartDateTime,
                                            customerEndDateTime,
                                            values,
                                            setFieldValue,
                                            true,
                                            startTime,
                                            endTime,
                                            true
                                          );
                                        } else {
                                          calculateActuals(
                                            customerStartDateTime,
                                            null,
                                            values,
                                            setFieldValue,
                                            true,
                                            startTime,
                                            endTime,
                                            true
                                          );
                                        }
                                      }
                                    }
                                    setFieldValue("payInDayOption", day);
                                  }}
                                  nonEditable={paidIn}
                                  backgroundColor={paidIn ? "#F3F6F9" : null}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="rbhStartTimingPayIn"
                                  component={AntdTimePickerField}
                                  label="Start Time"
                                  disabled={paidIn}
                                  placeholder="HH:MM"
                                  onChange={(val) => {
                                    const startTime = val
                                      ? moment(val).format("HH:mm")
                                      : null;
                                    setFieldValue(
                                      "rbhStartTimingPayIn",
                                      startTime
                                    );

                                    const customerStartDateTime =
                                      values.customerStartDateTime;

                                    calculateActuals(
                                      customerStartDateTime,
                                      values.customerEndDateTime,
                                      values,
                                      setFieldValue,
                                      true,
                                      val ? moment(val) : null,
                                      values.rbhEndTimingPayIn
                                    );

                                    //Min Hours Calculation
                                    if (
                                      values?.minHoursPayIn &&
                                      values.minHoursPayIn > 0
                                    ) {
                                      const customerEndDateTime = customerStartDateTime
                                        ? moment(customerStartDateTime)
                                            .add(values.minHoursPayIn, "hours")
                                            .format("yyyy-MM-DD HH:mm")
                                        : null;
                                      calculateActuals(
                                        customerStartDateTime,
                                        customerEndDateTime,
                                        values,
                                        setFieldValue,
                                        true,
                                        startTime,
                                        values.rbhEndTimingPayIn,
                                        true
                                      );
                                    } else {
                                      calculateActuals(
                                        customerStartDateTime,
                                        null,
                                        values,
                                        setFieldValue,
                                        true,
                                        startTime,
                                        values.rbhEndTimingPayIn,
                                        true
                                      );
                                    }
                                  }}
                                />
                              </div>
                              <div className="col-12 col-md-4 offset-md-3">
                                <Field
                                  name="rbhEndTimingPayIn"
                                  component={AntdTimePickerField}
                                  label="End Time"
                                  disabled={paidIn}
                                  placeholder="HH:MM"
                                  onChange={(val) => {
                                    const endTime = val
                                      ? moment(val).format("HH:mm")
                                      : null;
                                    setFieldValue("rbhEndTimingPayIn", endTime);

                                    const customerStartDateTime =
                                      values.customerStartDateTime;

                                    calculateActuals(
                                      customerStartDateTime,
                                      values.customerEndDateTime,
                                      values,
                                      setFieldValue,
                                      true,
                                      values.rbhStartTimingPayIn,
                                      val ? moment(val) : null
                                    );

                                    //Min Hours Calculation
                                    if (
                                      values?.minHoursPayIn &&
                                      values.minHoursPayIn > 0
                                    ) {
                                      const customerEndDateTime = customerStartDateTime
                                        ? moment(customerStartDateTime)
                                            .add(values.minHoursPayIn, "hours")
                                            .format("yyyy-MM-DD HH:mm")
                                        : null;
                                      calculateActuals(
                                        customerStartDateTime,
                                        customerEndDateTime,
                                        values,
                                        setFieldValue,
                                        true,
                                        values.rbhStartTimingPayIn,
                                        endTime,
                                        true
                                      );
                                    } else {
                                      calculateActuals(
                                        customerStartDateTime,
                                        null,
                                        values,
                                        setFieldValue,
                                        true,
                                        values.rbhStartTimingPayIn,
                                        endTime,
                                        true
                                      );
                                    }
                                  }}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="rbhPayinRate"
                                  component={Input}
                                  label="Rates/hour"
                                  type="number"
                                  step="any"
                                  disabled={paidIn}
                                  onBlur={() => {
                                    const val =
                                      values.rbhPayinRate === null ||
                                      values.rbhPayinRate === ""
                                        ? 0
                                        : values.rbhPayinRate;
                                    setFieldValue(
                                      "rbhPayinRate",
                                      parseFloat(val).toFixed(2)
                                    );
                                    setFieldTouched("rbhPayinRate", true);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <div className="col-12 col-md-4 offset-md-3">
                                <Field
                                  name="fullDayRatesPayIn"
                                  component={Input}
                                  label="Full Day Rates"
                                  type="number"
                                  step="any"
                                  min="0"
                                  disabled={isMinHoursPayIn || paidIn}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === "" ||
                                      e.target.value === "0"
                                        ? 0
                                        : e.target.value;
                                    if (val) {
                                      setIsFullDayRatePayIn(true);
                                    } else {
                                      setIsFullDayRatePayIn(false);
                                    }
                                    setFieldValue(
                                      "fullDayRatesPayIn",
                                      e.target.value
                                    );
                                  }}
                                  onBlur={() => {
                                    const val =
                                      values.fullDayRatesPayIn === null ||
                                      values.fullDayRatesPayIn === ""
                                        ? 0
                                        : values.fullDayRatesPayIn;
                                    setFieldValue(
                                      "fullDayRatesPayIn",
                                      parseFloat(val).toFixed(2)
                                    );
                                    setFieldTouched("fullDayRatesPayIn", true);
                                  }}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="minHoursPayIn"
                                  component={Input}
                                  label="Min Hours"
                                  placeholder="Enter Min Hours"
                                  type="number"
                                  min="0"
                                  step="any"
                                  disabled={isFullDayRatePayIn || paidIn}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === "" ||
                                      e.target.value === "0"
                                        ? 0
                                        : e.target.value;
                                    if (val) {
                                      setIsMinHoursPayIn(true);
                                    } else {
                                      setIsMinHoursPayIn(false);
                                    }

                                    const customerStartDateTime = values.customerStartDateTime
                                      ? moment(
                                          values.customerStartDateTime
                                        ).format("yyyy-MM-DD HH:mm")
                                      : null;

                                    if (val > 0) {
                                      const customerEndDateTime = customerStartDateTime
                                        ? moment(customerStartDateTime)
                                            .add(val, "hours")
                                            .format("yyyy-MM-DD HH:mm")
                                        : null;
                                      calculateActuals(
                                        customerStartDateTime,
                                        customerEndDateTime,
                                        values,
                                        setFieldValue,
                                        true,
                                        values.rbhStartTimingPayIn,
                                        values.rbhEndTimingPayIn,
                                        true
                                      );
                                    } else {
                                      calculateActuals(
                                        customerStartDateTime,
                                        null,
                                        values,
                                        setFieldValue,
                                        true,
                                        values.rbhStartTimingPayIn,
                                        values.rbhEndTimingPayIn,
                                        true
                                      );
                                    }

                                    setFieldValue(
                                      "minHoursPayIn",
                                      e.target.value
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <div
                                className="col-12 col-md-3 "
                                style={{ marginBlock: "auto" }}
                              >
                                <label className="justify-content-start">
                                  OBH Rates
                                </label>
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="abhPayinRate"
                                  component={Input}
                                  label="Uplift of"
                                  type="number"
                                  step="any"
                                  disabled={isFlatRatePayIn || paidIn}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === "" ||
                                      e.target.value === "0"
                                        ? 0
                                        : e.target.value;
                                    if (val) {
                                      setIsUpliftPayIn(true);
                                    } else {
                                      setIsUpliftPayIn(false);
                                    }
                                    setFieldValue(
                                      "abhPayinRate",
                                      e.target.value
                                    );
                                  }}
                                  onBlur={() => {
                                    const val =
                                      values.abhPayinRate === null ||
                                      values.abhPayinRate === undefined ||
                                      values.abhPayinRate === ""
                                        ? ""
                                        : parseFloat(
                                            values.abhPayinRate
                                          ).toFixed(2);
                                    setFieldValue("abhPayinRate", val);
                                    setFieldTouched("abhPayinRate", true);
                                  }}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="obhPayinRate"
                                  component={Input}
                                  label="Flat rates/hour"
                                  type="number"
                                  step="any"
                                  disabled={isUpliftPayIn || paidIn}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === "" ||
                                      e.target.value === "0"
                                        ? 0
                                        : e.target.value;
                                    if (val) {
                                      setIsFlatRatePayIn(true);
                                    } else {
                                      setIsFlatRatePayIn(false);
                                    }
                                    setFieldValue(
                                      "obhPayinRate",
                                      e.target.value
                                    );
                                  }}
                                  onBlur={() => {
                                    const val =
                                      values.obhPayinRate === null ||
                                      values.obhPayinRate === ""
                                        ? 0
                                        : values.obhPayinRate;
                                    setFieldValue(
                                      "obhPayinRate",
                                      parseFloat(val).toFixed(2)
                                    );
                                    setFieldTouched("obhPayinRate", true);
                                  }}
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <div
                                className="col-12 col-md-3 "
                                style={{ marginBlock: "auto" }}
                              >
                                <label className="justify-content-start">
                                  Weekend OBH Rates
                                </label>
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="weekendPayInMultiplier"
                                  component={Input}
                                  label="Uplift of"
                                  type="number"
                                  step="any"
                                  disabled={isFlatRatePayInWeekend || paidIn}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === "" ||
                                      e.target.value === "0"
                                        ? 0
                                        : e.target.value;
                                    if (val) {
                                      setIsUpliftPayInWeekend(true);
                                    } else {
                                      setIsUpliftPayInWeekend(false);
                                    }
                                    setFieldValue(
                                      "weekendPayInMultiplier",
                                      e.target.value
                                    );
                                  }}
                                  onBlur={() => {
                                    const val =
                                      values.weekendPayInMultiplier === null ||
                                      values.weekendPayInMultiplier ===
                                        undefined ||
                                      values.weekendPayInMultiplier === ""
                                        ? ""
                                        : parseFloat(
                                            values.weekendPayInMultiplier
                                          ).toFixed(2);
                                    setFieldValue(
                                      "weekendPayInMultiplier",
                                      val
                                    );
                                    setFieldTouched(
                                      "weekendPayInMultiplier",
                                      true
                                    );
                                  }}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="weekendPayInFlatRate"
                                  component={Input}
                                  label="Flat rates/hour"
                                  type="number"
                                  step="any"
                                  disabled={isUpliftPayInWeekend || paidIn}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === "" ||
                                      e.target.value === "0"
                                        ? 0
                                        : e.target.value;
                                    if (val) {
                                      setIsFlatRatePayInWeekend(true);
                                    } else {
                                      setIsFlatRatePayInWeekend(false);
                                    }
                                    setFieldValue(
                                      "weekendPayInFlatRate",
                                      e.target.value
                                    );
                                  }}
                                  onBlur={() => {
                                    const val =
                                      values.weekendPayInFlatRate === null ||
                                      values.weekendPayInFlatRate === ""
                                        ? 0
                                        : values.weekendPayInFlatRate;
                                    setFieldValue(
                                      "weekendPayInFlatRate",
                                      parseFloat(val).toFixed(2)
                                    );
                                    setFieldTouched(
                                      "weekendPayInFlatRate",
                                      true
                                    );
                                  }}
                                />
                              </div>
                            </div>
                            <div className="form-group row mt-10">
                              <div
                                className="col-12 col-md-3 "
                                style={{ marginBlock: "auto" }}
                              >
                                <label className="justify-content-start">
                                  Currency
                                </label>
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="payInCurrencyId"
                                  component={AutoCompleteSelect}
                                  customOptions={{
                                    records: currencyMasterState?.entities,
                                    labelField: "currencyName",
                                    valueField: "id",
                                  }}
                                  isLoading={currencyMasterState?.listLoading}
                                  loadingMessage="Fetching records..."
                                  nonEditable={paidIn}
                                  backgroundColor={paidIn ? "#F3F6F9" : null}
                                />
                              </div>
                              <div className="col-12 col-md-4 saveMobileBtn">
                                <Field
                                  name="payInRemarks"
                                  component={TextArea}
                                  placeholder="Enter Remarks"
                                  onChange={(e) => {
                                    setFieldValue(
                                      "payInRemarks",
                                      e?.target?.value ?? null
                                    );
                                    setRemarksCharCount({
                                      ...remarksCharCount,
                                      payIn: e?.target?.value?.length ?? 0,
                                    });
                                  }}
                                />
                                {remarksCharCount.payIn} / 500 Characters
                              </div>
                            </div>
                            {values?.taskUserId && values.taskUserId > 0 && (
                              <div className="form-group row">
                                <div
                                  className="col-12 col-md-3 "
                                  style={{ marginBlock: "auto" }}
                                >
                                  <label className="justify-content-start">
                                    Charges
                                  </label>
                                </div>
                                <div className="col-12 col-md-4">
                                  <Field
                                    name="travelChargesPayIn"
                                    component={Input}
                                    placeholder="Enter Travel"
                                    label="Travel"
                                    type="number"
                                    step="any"
                                    disabled={paidIn}
                                  />
                                </div>
                                <div className="col-12 col-md-4">
                                  <Field
                                    name="materialChargesPayIn"
                                    component={Input}
                                    placeholder="Enter Material"
                                    label="Material"
                                    type="number"
                                    step="any"
                                    disabled={paidIn}
                                  />
                                </div>
                                <div className="col-12 col-md-4 offset-md-3">
                                  <Field
                                    name="parkingChargesPayIn"
                                    component={Input}
                                    placeholder="Enter Parking"
                                    label="Parking"
                                    type="number"
                                    step="any"
                                    disabled={paidIn}
                                  />
                                </div>
                                <div className="col-12 col-md-4">
                                  <Field
                                    name="otherChargesPayIn"
                                    component={Input}
                                    placeholder="Enter Other"
                                    label="Other"
                                    type="number"
                                    step="any"
                                    disabled={paidIn}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ) : null}

                        <div className="col-12 col-md-6">
                          <div className="row">
                            <div
                              className="col-12"
                              style={{ textAlign: "center" }}
                            >
                              <label
                                className="justify-content-center"
                                style={{ fontWeight: "600" }}
                              >
                                Pay Out (Engineer)
                              </label>
                            </div>
                          </div>
                          <div className="form-group row">
                            <div
                              className="col-12 col-md-3"
                              style={{ marginBlock: "auto" }}
                            >
                              <label className="justify-content-start">
                                RBH Rates
                              </label>
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="payOutDayOption"
                                component={AutoCompleteSelect}
                                options={dayOption}
                                label="Day"
                                onChange={(e) => {
                                  let day = e?.value ?? null;
                                  if (day) {
                                    if (day === "fullday") {
                                      let today = new Date();
                                      let startTime = setTimeForDate(
                                        today,
                                        8,
                                        30,
                                        0
                                      );
                                      let endTime = setTimeForDate(
                                        today,
                                        17,
                                        0,
                                        0
                                      );
                                      setFieldValue(
                                        "rbhStartTiming",
                                        startTime
                                      );
                                      setFieldValue("rbhEndTiming", endTime);
                                      calculateActuals(
                                        values.startDateTime,
                                        values.endDateTime,
                                        values,
                                        setFieldValue,
                                        false,
                                        startTime,
                                        endTime
                                      );

                                      const startDateTime =
                                        values.startDateTime;

                                      if (
                                        values?.minHoursPayOut &&
                                        values.minHoursPayOut > 0
                                      ) {
                                        const endDateTime = startDateTime
                                          ? moment(startDateTime)
                                              .add(
                                                values.minHoursPayOut,
                                                "hours"
                                              )
                                              .format("yyyy-MM-DD HH:mm")
                                          : null;
                                        calculateActuals(
                                          startDateTime,
                                          endDateTime,
                                          values,
                                          setFieldValue,
                                          false,
                                          startTime,
                                          endTime,
                                          true
                                        );
                                      } else {
                                        calculateActuals(
                                          startDateTime,
                                          null,
                                          values,
                                          setFieldValue,
                                          false,
                                          startTime,
                                          endTime,
                                          true
                                        );
                                      }
                                    } else if (day === "halfday") {
                                      let today = new Date();
                                      let startTime = setTimeForDate(
                                        today,
                                        8,
                                        30,
                                        0
                                      );
                                      let endTime = setTimeForDate(
                                        today,
                                        12,
                                        30,
                                        0
                                      );
                                      setFieldValue(
                                        "rbhStartTiming",
                                        startTime
                                      );
                                      setFieldValue("rbhEndTiming", endTime);
                                      calculateActuals(
                                        values.startDateTime,
                                        values.endDateTime,
                                        values,
                                        setFieldValue,
                                        false,
                                        startTime,
                                        endTime
                                      );

                                      const startDateTime =
                                        values.startDateTime;

                                      if (
                                        values?.minHoursPayOut &&
                                        values.minHoursPayOut > 0
                                      ) {
                                        const endDateTime = startDateTime
                                          ? moment(startDateTime)
                                              .add(
                                                values.minHoursPayOut,
                                                "hours"
                                              )
                                              .format("yyyy-MM-DD HH:mm")
                                          : null;
                                        calculateActuals(
                                          startDateTime,
                                          endDateTime,
                                          values,
                                          setFieldValue,
                                          false,
                                          startTime,
                                          endTime,
                                          true
                                        );
                                      } else {
                                        calculateActuals(
                                          startDateTime,
                                          null,
                                          values,
                                          setFieldValue,
                                          false,
                                          startTime,
                                          endTime,
                                          true
                                        );
                                      }
                                    }
                                  }
                                  setFieldValue("payOutDayOption", day);
                                }}
                                nonEditable={!canEditPayOut}
                                backgroundColor={
                                  !canEditPayOut ? "#F3F6F9" : null
                                }
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="rbhStartTiming"
                                component={AntdTimePickerField}
                                label="Start Time"
                                disabled={!canEditPayOut}
                                placeholder="HH:MM"
                                onChange={(val) => {
                                  const startTime = val
                                    ? moment(val).format("HH:mm")
                                    : null;
                                  setFieldValue("rbhStartTiming", startTime);
                                  const startDateTime = values.startDateTime;

                                  calculateActuals(
                                    startDateTime,
                                    values.endDateTime,
                                    values,
                                    setFieldValue,
                                    false,
                                    val ? moment(val) : null,
                                    values.rbhEndTiming
                                  );

                                  if (
                                    values?.minHoursPayOut &&
                                    values.minHoursPayOut > 0
                                  ) {
                                    const endDateTime = startDateTime
                                      ? moment(startDateTime)
                                          .add(values.minHoursPayOut, "hours")
                                          .format("yyyy-MM-DD HH:mm")
                                      : null;
                                    calculateActuals(
                                      startDateTime,
                                      endDateTime,
                                      values,
                                      setFieldValue,
                                      false,
                                      startTime,
                                      values.rbhEndTiming,
                                      true
                                    );
                                  } else {
                                    calculateActuals(
                                      startDateTime,
                                      null,
                                      values,
                                      setFieldValue,
                                      false,
                                      startTime,
                                      values.rbhEndTiming,
                                      true
                                    );
                                  }
                                }}
                              />
                            </div>
                            <div className="col-12 col-md-4 offset-md-3">
                              <Field
                                name="rbhEndTiming"
                                component={AntdTimePickerField}
                                label="End Time"
                                disabled={!canEditPayOut}
                                placeholder="HH:MM"
                                onChange={(val) => {
                                  const endTime = val
                                    ? moment(val).format("HH:mm")
                                    : null;
                                  setFieldValue("rbhEndTiming", endTime);
                                  const startDateTime = values.startDateTime;
                                  calculateActuals(
                                    startDateTime,
                                    values.endDateTime,
                                    values,
                                    setFieldValue,
                                    false,
                                    values.rbhStartTiming,
                                    val ? moment(val) : null
                                  );

                                  if (
                                    values?.minHoursPayOut &&
                                    values.minHoursPayOut > 0
                                  ) {
                                    const endDateTime = startDateTime
                                      ? moment(startDateTime)
                                          .add(values.minHoursPayOut, "hours")
                                          .format("yyyy-MM-DD HH:mm")
                                      : null;
                                    calculateActuals(
                                      startDateTime,
                                      endDateTime,
                                      values,
                                      setFieldValue,
                                      false,
                                      values.rbhStartTiming,
                                      endTime,
                                      true
                                    );
                                  } else {
                                    calculateActuals(
                                      startDateTime,
                                      null,
                                      values,
                                      setFieldValue,
                                      false,
                                      values.rbhStartTiming,
                                      endTime,
                                      true
                                    );
                                  }
                                }}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="rbhPayoutRate"
                                component={Input}
                                label="Rates/hour"
                                type="number"
                                step="any"
                                disabled={!canEditPayOut}
                                onBlur={() => {
                                  const val =
                                    values.rbhPayoutRate === null ||
                                    values.rbhPayoutRate === ""
                                      ? 0
                                      : values.rbhPayoutRate;
                                  setFieldValue(
                                    "rbhPayoutRate",
                                    parseFloat(val).toFixed(2)
                                  );
                                  setFieldTouched("rbhPayoutRate", true);
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <div className="col-12 col-md-4 offset-md-3">
                              <Field
                                name="fullDayRatesPayOut"
                                component={Input}
                                label="Full Day Rates"
                                type="number"
                                step="any"
                                min="0"
                                disabled={isMinHours || !canEditPayOut}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === "" ||
                                    e.target.value === "0"
                                      ? 0
                                      : e.target.value;
                                  if (val) {
                                    setIsFullDayRate(true);
                                  } else {
                                    setIsFullDayRate(false);
                                  }
                                  setFieldValue(
                                    "fullDayRatesPayOut",
                                    e.target.value
                                  );
                                }}
                                onBlur={() => {
                                  const val =
                                    values.fullDayRatesPayOut === null ||
                                    values.fullDayRatesPayOut === ""
                                      ? 0
                                      : values.fullDayRatesPayOut;
                                  setFieldValue(
                                    "fullDayRatesPayOut",
                                    parseFloat(val).toFixed(2)
                                  );
                                  setFieldTouched("fullDayRatesPayOut", true);
                                }}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="minHoursPayOut"
                                component={Input}
                                label="Min Hours"
                                placeholder="Enter Min Hours"
                                type="number"
                                min="0"
                                step="any"
                                disabled={isFullDayRate || !canEditPayOut}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === "" ||
                                    e.target.value === "0"
                                      ? 0
                                      : e.target.value;
                                  if (val) {
                                    setIsMinHours(true);
                                  } else {
                                    setIsMinHours(false);
                                  }

                                  const startDateTime = values.startDateTime
                                    ? moment(values.startDateTime).format(
                                        "yyyy-MM-DD HH:mm"
                                      )
                                    : null;

                                  if (val > 0) {
                                    const endDateTime = startDateTime
                                      ? moment(startDateTime)
                                          .add(val, "hours")
                                          .format("yyyy-MM-DD HH:mm")
                                      : null;
                                    calculateActuals(
                                      startDateTime,
                                      endDateTime,
                                      values,
                                      setFieldValue,
                                      false,
                                      values.rbhStartTiming,
                                      values.rbhEndTiming,
                                      true
                                    );
                                  } else {
                                    calculateActuals(
                                      startDateTime,
                                      null,
                                      values,
                                      setFieldValue,
                                      false,
                                      values.rbhStartTiming,
                                      values.rbhEndTiming,
                                      true
                                    );
                                  }

                                  setFieldValue(
                                    "minHoursPayOut",
                                    e.target.value
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <div
                              className="col-12 col-md-3"
                              style={{ marginBlock: "auto" }}
                            >
                              <label className="justify-content-start">
                                OBH Rates
                              </label>
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="abhPayoutRate"
                                component={Input}
                                label="Uplift of"
                                type="number"
                                step="any"
                                disabled={isFlatRate || !canEditPayOut}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === "" ||
                                    e.target.value === "0"
                                      ? 0
                                      : e.target.value;
                                  if (val) {
                                    setIsUplift(true);
                                  } else {
                                    setIsUplift(false);
                                  }
                                  setFieldValue(
                                    "abhPayoutRate",
                                    e.target.value
                                  );
                                }}
                                onBlur={() => {
                                  const val =
                                    values.abhPayoutRate === null ||
                                    values.abhPayoutRate === undefined ||
                                    values.abhPayoutRate === ""
                                      ? ""
                                      : parseFloat(
                                          values.abhPayoutRate
                                        ).toFixed(2);
                                  setFieldValue("abhPayoutRate", val);
                                  setFieldTouched("abhPayoutRate", true);
                                }}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="obhPayoutRate"
                                component={Input}
                                label="Flat rates/hour"
                                type="number"
                                step="any"
                                disabled={isUplift || !canEditPayOut}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === "" ||
                                    e.target.value === "0"
                                      ? 0
                                      : e.target.value;
                                  if (val) {
                                    setIsFlatRate(true);
                                  } else {
                                    setIsFlatRate(false);
                                  }
                                  setFieldValue(
                                    "obhPayoutRate",
                                    e.target.value
                                  );
                                }}
                                onBlur={() => {
                                  const val =
                                    values.obhPayoutRate === null ||
                                    values.obhPayoutRate === ""
                                      ? 0
                                      : values.obhPayoutRate;
                                  setFieldValue(
                                    "obhPayoutRate",
                                    parseFloat(val).toFixed(2)
                                  );
                                  setFieldTouched("obhPayoutRate", true);
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <div
                              className="col-12 col-md-3"
                              style={{ marginBlock: "auto" }}
                            >
                              <label className="justify-content-start">
                                Weekend OBH Rates
                              </label>
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="weekendPayOutMultiplier"
                                component={Input}
                                label="Uplift of"
                                type="number"
                                step="any"
                                disabled={isFlatRateWeekend || !canEditPayOut}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === "" ||
                                    e.target.value === "0"
                                      ? 0
                                      : e.target.value;
                                  if (val) {
                                    setIsUpliftWeekend(true);
                                  } else {
                                    setIsUpliftWeekend(false);
                                  }
                                  setFieldValue(
                                    "weekendPayOutMultiplier",
                                    e.target.value
                                  );
                                }}
                                onBlur={() => {
                                  const val =
                                    values.weekendPayOutMultiplier === null ||
                                    values.weekendPayOutMultiplier ===
                                      undefined ||
                                    values.weekendPayOutMultiplier === ""
                                      ? ""
                                      : parseFloat(
                                          values.weekendPayOutMultiplier
                                        ).toFixed(2);
                                  setFieldValue("weekendPayOutMultiplier", val);
                                  setFieldTouched(
                                    "weekendPayOutMultiplier",
                                    true
                                  );
                                }}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="weekendPayOutFlatRate"
                                component={Input}
                                label="Flat rates/hour"
                                type="number"
                                step="any"
                                disabled={isUpliftWeekend || !canEditPayOut}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === "" ||
                                    e.target.value === "0"
                                      ? 0
                                      : e.target.value;
                                  if (val) {
                                    setIsFlatRateWeekend(true);
                                  } else {
                                    setIsFlatRateWeekend(false);
                                  }
                                  setFieldValue(
                                    "weekendPayOutFlatRate",
                                    e.target.value
                                  );
                                }}
                                onBlur={() => {
                                  const val =
                                    values.weekendPayOutFlatRate === null ||
                                    values.weekendPayOutFlatRate === ""
                                      ? 0
                                      : values.weekendPayOutFlatRate;
                                  setFieldValue(
                                    "weekendPayOutFlatRate",
                                    parseFloat(val).toFixed(2)
                                  );
                                  setFieldTouched(
                                    "weekendPayOutFlatRate",
                                    true
                                  );
                                }}
                              />
                            </div>
                          </div>
                          <div className="form-group row mt-10">
                            <div
                              className="col-12 col-md-3"
                              style={{ marginBlock: "auto" }}
                            >
                              <label className="justify-content-start">
                                Currency
                              </label>
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="payOutCurrencyId"
                                component={AutoCompleteSelect}
                                customOptions={{
                                  records: currencyMasterState?.entities,
                                  labelField: "currencyName",
                                  valueField: "id",
                                }}
                                isLoading={currencyMasterState?.listLoading}
                                loadingMessage="Fetching records..."
                                nonEditable={!canEditPayOut}
                                backgroundColor={
                                  !canEditPayOut ? "#F3F6F9" : null
                                }
                              />
                            </div>
                            <div className="col-12 col-md-4 saveMobileBtn">
                              <Field
                                name="payOutRemarks"
                                component={TextArea}
                                placeholder="Enter Remarks"
                                onChange={(e) => {
                                  setFieldValue(
                                    "payOutRemarks",
                                    e?.target?.value ?? null
                                  );
                                  setRemarksCharCount({
                                    ...remarksCharCount,
                                    payOut: e?.target?.value?.length ?? 0,
                                  });
                                }}
                              />
                              {remarksCharCount.payOut} / 500 Characters
                            </div>
                          </div>

                          {values?.taskUserId && values.taskUserId && (
                            <div className="form-group row">
                              <div
                                className="col-12 col-md-3 "
                                style={{ marginBlock: "auto" }}
                              >
                                <label className="justify-content-start">
                                  Charges
                                </label>
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="travelCharges"
                                  component={Input}
                                  placeholder="Enter Travel"
                                  label="Travel"
                                  type="number"
                                  step="any"
                                  disabled={!canEditPayOut}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="materialCharges"
                                  component={Input}
                                  placeholder="Enter Material"
                                  label="Material"
                                  type="number"
                                  step="any"
                                  disabled={!canEditPayOut}
                                />
                              </div>
                              <div className="col-12 col-md-4 offset-md-3">
                                <Field
                                  name="parkingCharges"
                                  component={Input}
                                  placeholder="Enter Parking"
                                  label="Parking"
                                  type="number"
                                  step="any"
                                  disabled={!canEditPayOut}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="otherCharges"
                                  component={Input}
                                  placeholder="Enter Other"
                                  label="Other"
                                  type="number"
                                  step="any"
                                  disabled={!canEditPayOut}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {saveError ? (
                        <div style={{ color: "red" }}>{saveError}</div>
                      ) : null}

                      <div className="form-group row ticketWidth pt-5">
                        <div className="col-md-2 offset-md-10 saveMobileBtn">
                          <button
                            type="submit"
                            style={
                              canupdatehwpro === false 
                                ? { minWidth: "85px", whiteSpace: "nowrap",width: "100%",display: "none"}
                                : {  minWidth: "85px", whiteSpace: "nowrap",width: "100%" }
                            } 
                            className="btn pinaple-yellow-btn ml-2"
                            onSubmit={() => handleSubmit(values)}
                            onClick={() => setErrorOnSumit(true)}
                          >
                            <SVG
                              src={toAbsoluteUrl(
                                "/media/svg/icons/Communication/Write.svg"
                              )}
                              title="Edit"
                            />
                            Update
                          </button>
                        </div>
                      </div>
                    </>
                  ),
                },
                {
                  key: "notesHostory",
                  title: "Previous Notes",
                  content: (
                    <>
                      <div style={{ paddingTop: "7px" }}>
                        {notesHistoryData.map((x, index) => {
                          const editorData = EditorState.createWithContent(
                            convertFromRaw(JSON.parse(x.notes))
                          );

                          return (
                            <div
                              key={index}
                              style={
                                x.closure === true || x.confirm === true
                                  ? {
                                      backgroundColor: "#bdc0c3",
                                      borderRadius: "10px",
                                      marginBottom: "10px",
                                    }
                                  : x.cancellation === true
                                  ? {
                                      backgroundColor: "#f14949",
                                      borderRadius: "10px",
                                      marginBottom: "10px",
                                    }
                                  : x.pending === true
                                  ? {
                                      backgroundColor: "#e9e985",
                                      borderRadius: "10px",
                                      marginBottom: "10px",
                                    }
                                  : {
                                      backgroundColor: "#F3F6F9",
                                      borderRadius: "10px",
                                      marginBottom: "10px",
                                    }
                              }
                            >
                              <div
                                style={{ padding: "4px", fontWeight: "bold" }}
                              >
                                {x.modifiedOn} &nbsp;&nbsp; User:&nbsp;
                                {x?.createdByUser?.userName}
                              </div>
                              <div
                                style={{ padding: "4px" }}
                                dangerouslySetInnerHTML={{
                                  __html: draftToHtml(
                                    convertToRaw(editorData.getCurrentContent())
                                  ),
                                }}
                              ></div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ),
                },
                {
                  key: "ticketLogs",
                  title: "Logs",
                  content: (
                    <>
                      <div style={{ paddingTop: "7px" }}>
                        {logs?.map((x, index) => {
                          return (
                            <div
                              key={index}
                              style={{
                                backgroundColor: "#F3F6F9",
                                borderRadius: "10px",
                                marginBottom: "10px",
                              }}
                            >
                              <div
                                style={{ padding: "4px", fontWeight: "bold" }}
                              >
                                {x.modifiedOn} &nbsp;&nbsp; User:&nbsp;
                                {x?.createdByUser?.userName}
                              </div>
                              <div style={{ padding: "4px" }}>{x.message}</div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ),
                },
                (isConfirmed || isPenalty) &&
                !paidOut &&
                hasPayOutAccess &&
                canViewPayOut
                  ? {
                      key: "payOut",
                      title: "Pay Out",
                      content: (
                        <>
                          <div style={{ paddingTop: "7px" }}>
                            <Formik
                              enableReinitialize={true}
                              initialValues={payOutReportRows}
                              onSubmit={(values) => {
                                let val = values
                                  .filter((x) => x.settlement === true)
                                  ?.map((x) => ({
                                    taskMSTId: x.taskId,
                                    userMSTId: x.techId,
                                    payOutPayableValue: x.payableValue,
                                    payOutPayableCurrencyId: x.payOutCurrencyId,
                                    payOutPaidCurrencyId:
                                      x.payOutPaidCurrencyId,
                                    payOutPaidValue: x.payOutPaidValue,
                                    modifiedOn: x.modifiedOn,
                                  }));

                                if (!val || val.length === 0) {
                                  window.alert(
                                    "Please select atleast 1 ticket to perform Settlement !!!"
                                  );
                                  return;
                                }

                                let isReturn = false;

                                for (
                                  let index = 0;
                                  index < val.length;
                                  index++
                                ) {
                                  const x = val[index];
                                  if (!x.payOutPaidValue) {
                                    window.alert("Please Enter Paid Value !!!");
                                    isReturn = true;
                                    break;
                                  }
                                  if (!x.payOutPaidCurrencyId) {
                                    window.alert(
                                      "Please Enter Paid Currency !!!"
                                    );
                                    isReturn = true;
                                    break;
                                  }
                                }

                                if (isReturn) {
                                  return;
                                }

                                const myArrayFiltered = values.filter((el) => {
                                  return val.some((f) => {
                                    return (
                                      f.taskMSTId === el.taskId &&
                                      el.settlement === false
                                    );
                                  });
                                });

                                if (
                                  myArrayFiltered &&
                                  myArrayFiltered.length > 0
                                ) {
                                  window.alert(
                                    "Please Select all the rows of same ticket for Settlement !!!"
                                  );
                                  return;
                                }

                                dispatch(taskMasterActions.startCall());

                                dispatch(reportsPayOutActions.doSettlement(val))
                                  .then((res) => {
                                    dispatch(
                                      taskMasterActions.fetchEntity(entity.id)
                                    )
                                      .then((res1) => {})
                                      .catch((err) => {
                                        dispatch(taskMasterActions.stopCall());
                                        setSaveError(err?.userMessage);
                                      });
                                  })
                                  .catch((err) => {
                                    dispatch(taskMasterActions.stopCall());
                                    console.log(err);
                                  });
                              }}
                            >
                              {({
                                handleSubmit,
                                handleReset,
                                setFieldValue,
                                values,
                              }) => (
                                <Form className="form form-label-right">
                                  {reportPayOutError ? (
                                    <div style={{ color: "red" }}>
                                      Error: {reportPayOutError?.userMessage}
                                    </div>
                                  ) : null}
                                  <div className="form-group row">
                                    <div className="col-md-10 my-auto">
                                      {values && values.length > 0 ? (
                                        <strong>
                                          {getPayOutFormula(values)}
                                        </strong>
                                      ) : null}
                                    </div>
                                    <div className="col-md-2 settlement">
                                      <button
                                        type="submit"
                                        style={
                                          roleCode === "pco"
                                            ? { display: "none" }
                                            : headerButtonStyles
                                        }
                                        className="btn pinaple-yellow-btn ml-2"
                                        onSubmit={(e) => {
                                          handleSubmit();
                                        }}
                                      >
                                        <i
                                          className="fa fa-database"
                                          style={{ color: "#777" }}
                                        ></i>
                                        Settlement
                                      </button>
                                    </div>
                                  </div>
                                  <BootstrapTable
                                    keyField="keyField"
                                    columns={payOutReportCols}
                                    data={values}
                                    noDataIndication={
                                      <div className="text-center bg-light p-2">
                                        No Records Found
                                      </div>
                                    }
                                    style={{ backgroundColor: "#000" }}
                                    // rowStyle={roleCode === "pco" ? {backgroundColor: '#F3F6F9'} : {backgroundColor: 'white'}}
                                    bodyClasses={bodyClassName}
                                    cellEdit={cellEditFactory({
                                      mode: "click",
                                      blurToSave: true,
                                      timeToCloseMessage: 2500,
                                      // afterSaveCell: afterSaveCell,
                                      onStartEdit: (
                                        row,
                                        column,
                                        rowIndex,
                                        columnIndex
                                      ) => {
                                        const AllRows = document.getElementsByClassName(
                                          bodyClassName
                                        )[0].children;
                                        const currentRow = AllRows[rowIndex];
                                        const currentCell =
                                          currentRow.children[columnIndex];
                                        if (
                                          currentCell &&
                                          currentCell.children.length
                                        ) {
                                          currentCell.children[0].addEventListener(
                                            "keydown",
                                            (e) => {
                                              if (e.key === "Tab") {
                                                currentCell.children[0].blur();
                                                const nextEditablCellIndex = payOutReportCols
                                                  .map((x, i) => ({
                                                    ...x,
                                                    index: i,
                                                  }))
                                                  .filter(
                                                    (x) => x.editable !== false
                                                  )
                                                  .find(
                                                    (x) => x.index > columnIndex
                                                  )?.index;
                                                if (nextEditablCellIndex) {
                                                  currentRow.children[
                                                    nextEditablCellIndex
                                                  ].focus();
                                                  currentRow.children[
                                                    nextEditablCellIndex
                                                  ].click();
                                                  e.preventDefault();
                                                } else {
                                                  if (
                                                    rowIndex + 1 <
                                                    AllRows.length
                                                  ) {
                                                    const nextEditablCellIndex = payOutReportCols
                                                      .map((x, i) => ({
                                                        ...x,
                                                        index: i,
                                                      }))
                                                      .filter(
                                                        (x) =>
                                                          x.editable !== false
                                                      )
                                                      .find((x) => x.index >= 0)
                                                      ?.index;
                                                    if (nextEditablCellIndex) {
                                                      AllRows[
                                                        rowIndex + 1
                                                      ].children[
                                                        nextEditablCellIndex
                                                      ].focus();
                                                      AllRows[
                                                        rowIndex + 1
                                                      ].children[
                                                        nextEditablCellIndex
                                                      ].click();
                                                      e.preventDefault();
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          );
                                        }
                                      },
                                    })}
                                  />
                                </Form>
                              )}
                            </Formik>
                          </div>
                        </>
                      ),
                    }
                  : null,
                (isConfirmed || isPenalty) && !paidIn && hasPayInAccess
                  ? {
                      key: "payIn",
                      title: "Pay In",
                      content: (
                        <>
                          <div style={{ paddingTop: "7px" }}>
                            <Formik
                              enableReinitialize={true}
                              initialValues={payInReportRows}
                              onSubmit={(values) => {
                                let val = values
                                  .filter((x) => x.settlement === true)
                                  ?.map((x) => ({
                                    taskMSTId: x.taskId,
                                    userMSTId: x.techId,
                                    payInPayableValue: x.receivableValue,
                                    payInPayableCurrencyId:
                                      x.receivableCurrencyId,
                                    payInPaidCurrencyId: x.payInPaidCurrencyId,
                                    payInPaidValue: x.payInPaidValue,
                                    modifiedOn: x.modifiedOn,
                                  }));
                                if (!val || val.length === 0) {
                                  window.alert(
                                    "Please select atleast 1 ticket to perform Settlement !!!"
                                  );
                                  return;
                                }

                                let isReturn = false;

                                for (
                                  let index = 0;
                                  index < val.length;
                                  index++
                                ) {
                                  const x = val[index];
                                  if (!x.payInPaidValue) {
                                    window.alert("Please Enter Paid Value !!!");
                                    return;
                                  }
                                  if (!x.payInPaidCurrencyId) {
                                    window.alert(
                                      "Please Enter Paid Currency !!!"
                                    );
                                    return;
                                  }
                                }

                                if (isReturn) {
                                  return;
                                }

                                const myArrayFiltered = values.filter((el) => {
                                  return val.some((f) => {
                                    return (
                                      f.taskMSTId === el.taskId &&
                                      el.settlement === false
                                    );
                                  });
                                });

                                if (
                                  myArrayFiltered &&
                                  myArrayFiltered.length > 0
                                ) {
                                  window.alert(
                                    "Please Select all the rows of same ticket for Settlement !!!"
                                  );
                                  return;
                                }

                                dispatch(taskMasterActions.startCall());

                                dispatch(reportsPayInActions.doSettlement(val))
                                  .then((res) => {
                                    dispatch(
                                      taskMasterActions.fetchEntity(entity.id)
                                    )
                                      .then((res1) => {})
                                      .catch((err) => {
                                        setSaveError(err?.userMessage);
                                        dispatch(taskMasterActions.stopCall());
                                      });
                                  })
                                  .catch((err) => {
                                    console.log(err);
                                    dispatch(taskMasterActions.stopCall());
                                  });
                              }}
                            >
                              {({
                                handleSubmit,
                                handleReset,
                                setFieldValue,
                                values,
                              }) => (
                                <Form className="form form-label-right">
                                  {reportPayInError ? (
                                    <div style={{ color: "red" }}>
                                      Error: {reportPayInError?.userMessage}
                                    </div>
                                  ) : null}
                                  <div className="form-group row">
                                    <div className="col-md-10 my-auto">
                                      {values && values.length > 0 ? (
                                        <strong>
                                          {getPayInFormula(values)}
                                        </strong>
                                      ) : null}
                                    </div>
                                    <div className="col-md-2 settlement">
                                      <button
                                        type="submit"
                                        style={headerButtonStyles}
                                        className="btn pinaple-yellow-btn ml-2"
                                        onSubmit={(e) => {
                                          handleSubmit();
                                        }}
                                      >
                                        <i
                                          className="fa fa-database"
                                          style={{ color: "#777" }}
                                        ></i>
                                        Settlement
                                      </button>
                                    </div>
                                  </div>
                                  <BootstrapTable
                                    keyField="keyField"
                                    columns={payInReportCols}
                                    data={values}
                                    noDataIndication={
                                      <div className="text-center bg-light p-2">
                                        No Records Found
                                      </div>
                                    }
                                    style={{ backgroundColor: "#000" }}
                                    bodyClasses={bodyClassName}
                                    cellEdit={cellEditFactory({
                                      mode: "click",
                                      blurToSave: true,
                                      timeToCloseMessage: 2500,
                                      // afterSaveCell: afterSaveCell,
                                      onStartEdit: (
                                        row,
                                        column,
                                        rowIndex,
                                        columnIndex
                                      ) => {
                                        const AllRows = document.getElementsByClassName(
                                          bodyClassName
                                        )[0].children;
                                        const currentRow = AllRows[rowIndex];
                                        const currentCell =
                                          currentRow.children[columnIndex];
                                        if (
                                          currentCell &&
                                          currentCell.children.length
                                        ) {
                                          currentCell.children[0].addEventListener(
                                            "keydown",
                                            (e) => {
                                              if (e.key === "Tab") {
                                                currentCell.children[0].blur();
                                                const nextEditablCellIndex = payInReportCols
                                                  .map((x, i) => ({
                                                    ...x,
                                                    index: i,
                                                  }))
                                                  .filter(
                                                    (x) => x.editable !== false
                                                  )
                                                  .find(
                                                    (x) => x.index > columnIndex
                                                  )?.index;
                                                if (nextEditablCellIndex) {
                                                  currentRow.children[
                                                    nextEditablCellIndex
                                                  ].focus();
                                                  currentRow.children[
                                                    nextEditablCellIndex
                                                  ].click();
                                                  e.preventDefault();
                                                } else {
                                                  if (
                                                    rowIndex + 1 <
                                                    AllRows.length
                                                  ) {
                                                    const nextEditablCellIndex = payInReportCols
                                                      .map((x, i) => ({
                                                        ...x,
                                                        index: i,
                                                      }))
                                                      .filter(
                                                        (x) =>
                                                          x.editable !== false
                                                      )
                                                      .find((x) => x.index >= 0)
                                                      ?.index;
                                                    if (nextEditablCellIndex) {
                                                      AllRows[
                                                        rowIndex + 1
                                                      ].children[
                                                        nextEditablCellIndex
                                                      ].focus();
                                                      AllRows[
                                                        rowIndex + 1
                                                      ].children[
                                                        nextEditablCellIndex
                                                      ].click();
                                                      e.preventDefault();
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          );
                                        }
                                      },
                                    })}
                                  />
                                </Form>
                              )}
                            </Formik>
                          </div>
                        </>
                      ),
                    }
                  : null,
                (paidIn || paidOut) && (hasPayInAccess || hasPayOutAccess)
                  ? {
                      key: "settlement",
                      title: "Settlement History",
                      content: (
                        <>
                          <div style={{ paddingTop: "7px" }}>
                            {paidOut && hasPayOutAccess ? (
                              <BootstrapTable
                                keyField="keyField"
                                columns={settlementCols}
                                data={settlementReportRows}
                                noDataIndication={
                                  <div className="text-center bg-light p-2">
                                    No Records Found
                                  </div>
                                }
                                style={{ backgroundColor: "#000" }}
                              />
                            ) : null}
                            {paidIn && hasPayInAccess ? (
                              <BootstrapTable
                                keyField="keyField"
                                columns={settlementColsPayIn}
                                data={settlementReportRowsPayIn}
                                noDataIndication={
                                  <div className="text-center bg-light p-2">
                                    No Records Found
                                  </div>
                                }
                                style={{ backgroundColor: "#000" }}
                              />
                            ) : null}
                          </div>
                        </>
                      ),
                    }
                  : null,
              ]}
            />

            <ErrorFocus />
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EditForm;