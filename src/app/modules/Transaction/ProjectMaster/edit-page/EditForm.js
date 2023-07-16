import React, { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field } from "formik";
import {
  AutoCompleteSelect,
  Input,
  TextArea,
} from "../../../../../_metronic/_partials/controls";
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { projectMasterActions } from "../_redux/ProjectMasterRedux";
import { projectAttachmentActions } from "../_redux/ProjectAttachmentRedux";
import TabularView from "../../../_commons/components/TabularView";
import CheckboxGroup from "react-checkbox-group";
import { organizationMasterActions } from "../../../Masters/OrganizationMaster/_redux/OrganizationMasterRedux";
import { countryMasterActions } from "../../../Masters/CountryMaster/_redux/CountryMasterRedux";
import { currencyMasterActions } from "../../../Masters/CurrencyMaster/_redux/CurrencyMasterRedux";
import { userMasterActions } from "../../../Masters/UserStaff/UserMaster/_redux/UserMasterRedux";
import moment from "moment-timezone";
import { HTMLEditorField } from "../../../../../_metronic/_partials/controls/forms/HTMLEditorField";
import { engineerMasterActions } from "../../../Masters/EngineerMaster/_redux/EngineerMasterRedux";
import {
  getErrors,
  isValidCurrency,
  isValidNumber,
  isValidZipCode,
  MAX_LENGTH,
  setTimeForDate,
  shallowDiffObjects,
  useLoggedInUserRoleCode,
} from "../../../../modules/_commons/Utils";
import { DatePickerMultiSelectField } from "../../../../../_metronic/_partials/controls/forms/DatePickerMultiSelectField";
import { convertFromRaw } from "draft-js";
import { EditorState } from "draft-js";
import tz_lookup from "tz-lookup";
import ErrorFocus from "../../../_commons/ErrorFocus";
import { AntdDatePickerField } from "../../../../../_metronic/_partials/controls/forms/AntdDatePickerField";
import { AntdTimePickerField } from "../../../../../_metronic/_partials/controls/forms/AntdTimePickerField";
import { requireHeaderFormatter } from "../../../_commons/components/col-formattors/RequireHeaderFormatter";
import POSEditableTable from "../../../_commons/components/POSEditableTable";
import { StatusColumnFormatter } from "../../../_commons/components/col-formattors/StatusColumnFormatter";
import { reducerInfo as branchDtl_reducerInfo } from "../_redux/ProjectBranchRedux";
import {
  postcodeValidator,
  postcodeValidatorExistsForCountry,
} from "postcode-validator";
import { PhoneNumberUtil } from "google-libphonenumber";
import BranchDetailModal from "./BranchDetailModal";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import SVG from "react-inlinesvg";
// import DocViewer, { DocViewerRenderers } from "react-doc-viewer";
import { useDropzone } from "react-dropzone";
import { Link, useHistory } from "react-router-dom";

const isDanger = <span className="text-danger font-weight-bold">*</span>;

function isValidProjectDescription(message) {
  return this.test("isValidProjectDescription", message, function(value) {
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

const EditForm = ({
  enitity,
  saveRecord,
  submitBtnRef,
  resetBtnRef,
  isHistory = false,
  historyData = [],
}) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const {
    currentState,
    organizationMasterState,
    countryMasterState,
    stateMasterState,
    cityMasterState,
    currencyMasterState,
    userMasterState,
    engineerMasterState,
    authState,
  } = useSelector(
    (state) => ({
      currentState: state.projectMaster,
      organizationMasterState: state.organizationMaster,
      countryMasterState: state.countryMaster,
      stateMasterState: state.stateMaster,
      cityMasterState: state.cityMaster,
      currencyMasterState: state.currencyMaster,
      userMasterState: state.userMaster,
      engineerMasterState: state.engineerMaster,
      authState: state.auth,
    }),
    shallowEqual
  );

  const [preferedDays, setPreferedDays] = useState([]);
  const [validationError, setValidationError] = useState("");
  const [isUplift, setIsUplift] = useState(false);
  const [isFlatRate, setIsFlatRate] = useState(false);
  const [isUpliftWeekend, setIsUpliftWeekend] = useState(false);
  const [isFlatRateWeekend, setIsFlatRateWeekend] = useState(false);
  const [isUpliftPayIn, setIsUpliftPayIn] = useState(false);
  const [isFlatRatePayIn, setIsFlatRatePayIn] = useState(false);
  const [isUpliftPayInWeekend, setIsUpliftPayInWeekend] = useState(false);
  const [isFullDayRate, setIsFullDayRate] = useState(false);
  const [isMinHours, setIsMinHours] = useState(false);
  const [isFullDayRatePayIn, setIsFullDayRatePayIn] = useState(false);
  const [isMinHoursPayIn, setIsMinHoursPayIn] = useState(false);
  const [isFlatRatePayInWeekend, setIsFlatRatePayInWeekend] = useState(false);
  const [diffData, setDiffData] = useState({ abc: "" });
  const [attachmentState, setAttachmentState] = useState([]);
  const [attachmentStateCount, setAttachmentStateCount] = useState(0);
  const [filestoBeDeleted, setFilestoBeDeleted] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [modal, setModal] = useState(false);
  const [errorOnSumit, setErrorOnSumit] = useState(false);
  const [checkPco, setCheckPco] = useState(false);
  const [checkErr, setCheckErr] = useState(false);
  const [openProject, setOpenProject] = useState();
  const [openTicket, setOpenTicket] = useState();
  const [remarksCharCount, setRemarksCharCount] = useState({
    payIn: 0,
    payOut: 0,
  });

  const roleCode = useLoggedInUserRoleCode();

  useEffect(() => {
    if (
      currentState.totalCount === 0 &&
      !currentState.listLoading &&
      !currentState.error &&
      !isHistory
    ) {
      dispatch(projectMasterActions.getAll());
    }
    dispatch(countryMasterActions.getAllActive());
    // dispatch(stateMasterActions.getAllActive());
    // dispatch(cityMasterActions.getAllActive());
    dispatch(currencyMasterActions.getAllActive());
    dispatch(userMasterActions.getAll());
    dispatch(organizationMasterActions.getAllActive());
    dispatch(engineerMasterActions.getAll());
  }, []);

  useEffect(() => {
    // console.log(authState?.user?.userRoleMST?.roleCode);
    if (authState?.user?.userRoleMST?.roleCode === "PCO") {
      setCheckPco(true);
    }
  }, [authState]);

  const statusTypes = [
    { label: "Active", value: "ACTIVE" },
    { label: "Close", value: "CLOSE" },
  ];

  const taskTypes = [
    { label: "Onsite", value: 0 },
    { label: "Remote", value: 1 },
    { label: "HW Procurement", value: 2 },
  ];

  const taskCreationTypes = [
    { label: "Single", value: "SINGLE" },
    { label: "Day Wise", value: "DAYWISE" },
    { label: "Date Wise", value: "DATEWISE" },
    { label: "None", value: "NONE" },
  ];
  const dayOption = [
    { label: "Full Day", value: "fullday" },
    { label: "Half Day", value: "halfday" },
  ];
  //code unique validation
  const editId = isHistory ? 0 : currentState?.entityForEdit?.id ?? 0;
  const contactRegExp = /^[\d ()+-]+$/;
  const emailRegEx = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  Yup.addMethod(
    Yup.mixed,
    "isValidProjectDescription",
    isValidProjectDescription
  );
  Yup.addMethod(Yup.mixed, "isValidZipCode", isValidZipCode);
  Yup.addMethod(Yup.mixed, "isValidNumber", isValidNumber);
  Yup.addMethod(Yup.mixed, "isValidCurrency", isValidCurrency);

  const validationSchema = useMemo(() => {
    return Yup.object().shape({
      projectName: Yup.string().required("Project Name Required"),
      projectStatusType: Yup.string().required("Status Required"),
      projectStartDate: Yup.string()
        .nullable()
        .required("Start Date Required"),
      projectEndDate: Yup.string()
        .nullable()
        .required("End Date Required"),
      organizationMSTId: Yup.number().min(1, "Customer Required"),
      projectRBHRatePayOut: Yup.mixed().isValidNumber(
        Yup.ref("projectTaskUserId"),
        "Rate"
      ),
      // projectRBHRatePayIn: Yup.mixed().isValidNumber(Yup.ref('projectTaskUserId'), "Rate"),
      projectOBHRatePayOut: Yup.mixed().isValidNumber(
        Yup.ref("projectTaskUserId"),
        "Flat Rate"
      ),
      // projectOBHRatePayIn: Yup.mixed().isValidNumber(Yup.ref('projectTaskUserId'), "Flat Rate"),
      projectABHRatePayOut: Yup.mixed().isValidNumber(
        Yup.ref("projectTaskUserId"),
        "Uplift of"
      ),
      // projectABHRatePayIn: Yup.mixed().isValidNumber(Yup.ref('projectTaskUserId'), "Uplift of"),
      // travelChargesPayIn: Yup.mixed().isValidNumber(Yup.ref('noRef'), 'Travel Charges'),
      // materialChargesPayIn: Yup.mixed().isValidNumber(Yup.ref('noRef'), 'Material Charges'),
      // parkingChargesPayIn: Yup.mixed().isValidNumber(Yup.ref('noRef'), 'Parking Charges'),
      // otherChargesPayIn: Yup.mixed().isValidNumber(Yup.ref('noRef'), 'Other Charges'),
      travelChargesPayOut: Yup.mixed().isValidNumber(
        Yup.ref("noRef"),
        "Travel Charges"
      ),
      materialChargesPayOut: Yup.mixed().isValidNumber(
        Yup.ref("noRef"),
        "Material Charges"
      ),
      parkingChargesPayOut: Yup.mixed().isValidNumber(
        Yup.ref("noRef"),
        "Parking Charges"
      ),
      otherChargesPayOut: Yup.mixed().isValidNumber(
        Yup.ref("noRef"),
        "Other Charges"
      ),
      // weekendPayInMultiplier: Yup.mixed().isValidNumber(Yup.ref('projectTaskUserId'), 'Uplift of'),
      // weekendPayInFlatRate: Yup.mixed().isValidNumber(Yup.ref('projectTaskUserId'), 'Flat Rate'),
      weekendPayOutMultiplier: Yup.mixed().isValidNumber(
        Yup.ref("projectTaskUserId"),
        "Uplift of"
      ),
      weekendPayOutFlatRate: Yup.mixed().isValidNumber(
        Yup.ref("projectTaskUserId"),
        "Flat Rate"
      ),
      // minHoursPayIn: Yup.mixed().isValidNumber(Yup.ref('projectTaskUserId'), 'Min Hours'),
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
        .isValidNumber(Yup.ref("projectTaskUserId"), "Min Hours")
        .test("max-check", "Min Hours should be 8 or less", (val) => {
          if (val && val !== "" && val !== undefined) {
            if (parseFloat(val) > 8) {
              return false;
            }
          }
          return true;
        }),
      // fullDayRatesPayIn: Yup.mixed().isValidNumber(Yup.ref('projectTaskUserId'), 'Full Day Rates'),
      fullDayRatesPayOut: Yup.mixed().isValidNumber(
        Yup.ref("projectTaskUserId"),
        "Full Day Rates"
      ),
      projectDescription: Yup.mixed().isValidProjectDescription(
        "Project Description Required"
      ),
      scopeOfWork: Yup.mixed().isValidProjectDescription(
        "Scope Of Work Required"
      ),
      // scopeOfWork: Yup.string().nullable().max(5632, "Scope of Work must not exceed 5500 characters"),
      projectLocalContactPhone: Yup.string()
        .nullable()
        .matches(contactRegExp, "Invalid Local Contact Phone"),
      projectRequestedByPhone: Yup.string()
        .nullable()
        .matches(contactRegExp, "Invalid Requestor's Phone"),
      projectRequestedByEmail: Yup.string()
        .nullable()
        .email("Invalid Requestor's Email"),
      projectPayOutRemarks: Yup.string()
        .nullable()
        .max(500, "Pay Out Remarks: Must not exceed 500 characters"),
      projectPayInRemarks: Yup.string()
        .nullable()
        .max(500, "Pay In Remarks: Must not exceed 500 characters"),
      projectTaskCreationType: Yup.string()
        .nullable()
        .required("Ticket Creation Required"),
      projectPayOutCurrencyId: Yup.mixed().isValidCurrency(
        Yup.ref("projectTaskUserId"),
        "Currency"
      ),
      // projectPayInCurrencyId: Yup.mixed().isValidCurrency(Yup.ref('engineersList'), 'Currency'),
    });
  }, [currentState.entities, editId]);

  const convertBlankToNull = (val) => {
    const colArray = [
      "projectABHRatePayIn",
      "projectABHRatePayOut",
      "projectOBHRatePayIn",
      "projectOBHRatePayOut",
      "projectRBHRatePayIn",
      "projectRBHRatePayOut",
      "weekendPayInFlatRate",
      "weekendPayInMultiplier",
      "weekendPayOutFlatRate",
      "weekendPayOutMultiplier",
      "travelChargesPayIn",
      "materialChargesPayIn",
      "parkingChargesPayIn",
      "otherChargesPayIn",
      "travelChargesPayOut",
      "materialChargesPayOut",
      "parkingChargesPayOut",
      "otherChargesPayOut",
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
      "projectABHRatePayIn",
      "projectABHRatePayOut",
      "projectOBHRatePayIn",
      "projectOBHRatePayOut",
      "projectRBHRatePayIn",
      "projectRBHRatePayOut",
      "weekendPayInFlatRate",
      "weekendPayInMultiplier",
      "weekendPayOutFlatRate",
      "weekendPayOutMultiplier",
      "travelChargesPayIn",
      "materialChargesPayIn",
      "parkingChargesPayIn",
      "otherChargesPayIn",
      "travelChargesPayOut",
      "materialChargesPayOut",
      "parkingChargesPayOut",
      "otherChargesPayOut",
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
    let tmp = {};
    if (isHistory) {
      document.title = "Project History";
      if (historyData) {
        tmp = { ...historyData?.currentLog };
        setDiffData(
          shallowDiffObjects(
            historyData?.currentLog ?? {},
            historyData?.previousLog ?? {}
          )
        );
      }
    } else {
      if (editId) {
        document.title = "Update Project";
      } else {
        document.title = "Create Project";
      }
      tmp = { ...enitity };
    }

    tmp.countryCode = null;

    if (tmp?.projectPreferredDay) {
      setPreferedDays(tmp.projectPreferredDay.split(","));
    }

    tmp.projectBranchDTLList = tmp?.projectBranchDTLList?.map((x, i) => ({
      ...x,
      keyField: i + 1,
      countryCode: x?.countryMST?.countryCode,
    }));
    tmp.keyField = tmp?.projectBranchDTLList?.length + 1;
    const selectedBranch = tmp?.projectBranchDTLList?.find((x) => x.selected);

    if (selectedBranch) {
      setSelectedRows([selectedBranch.keyField]);
    }

    let timezone = moment.tz.guess(true);

    if (selectedBranch?.cityMSTId && selectedBranch?.cityMSTId !== 0) {
      if (
        selectedBranch?.cityMST?.latitude &&
        selectedBranch?.cityMST?.longitude
      ) {
        timezone = tz_lookup(
          selectedBranch.cityMST.latitude,
          selectedBranch.cityMST.longitude
        );
      }
    }

    tmp.timezone = timezone;

    if (editId || isHistory) {
      if (
        tmp?.projectTaskCreationType === "DATEWISE" &&
        tmp?.projectPreferredDay
      ) {
        tmp.dates = tmp.projectPreferredDay.split(",");
      }

      if (tmp?.projectABHRatePayIn) {
        setIsUpliftPayIn(true);
      } else {
        setIsUpliftPayIn(false);
      }

      if (tmp?.projectABHRatePayOut) {
        setIsUplift(true);
      } else {
        setIsUplift(false);
      }

      if (tmp?.projectOBHRatePayOut) {
        setIsFlatRate(true);
      } else {
        setIsFlatRate(false);
      }

      if (tmp?.projectOBHRatePayIn) {
        setIsFlatRatePayIn(true);
      } else {
        setIsFlatRatePayIn(false);
      }

      if (tmp?.weekendPayInMultiplier) {
        setIsUpliftPayInWeekend(true);
      } else {
        setIsUpliftPayInWeekend(false);
      }

      if (tmp?.weekendPayInFlatRate) {
        setIsFlatRatePayInWeekend(true);
      } else {
        setIsFlatRatePayInWeekend(false);
      }

      if (tmp?.weekendPayOutMultiplier) {
        setIsUpliftWeekend(true);
      } else {
        setIsUpliftWeekend(false);
      }

      if (tmp?.weekendPayOutFlatRate) {
        setIsFlatRateWeekend(true);
      } else {
        setIsFlatRateWeekend(false);
      }

      if (tmp?.fullDayRatesPayIn) {
        setIsFullDayRatePayIn(true);
      } else {
        setIsFullDayRatePayIn(false);
      }

      if (tmp?.fullDayRatesPayOut) {
        setIsFullDayRate(true);
      } else {
        setIsFullDayRate(false);
      }

      if (tmp?.minHoursPayIn) {
        setIsMinHoursPayIn(true);
      } else {
        setIsMinHoursPayIn(false);
      }

      if (tmp?.minHoursPayOut) {
        setIsMinHours(true);
      } else {
        setIsMinHours(false);
      }
    }

    if (tmp?.externalCustomer === null) {
      tmp.externalCustomer = "";
    }

    tmp.projectRBHStartTiming = tmp.projectRBHStartTiming
      ? moment(tmp.projectRBHStartTiming, "HH:mm").toDate()
      : null;
    tmp.projectOBHStartTiming = tmp.projectOBHStartTiming
      ? moment(tmp.projectOBHStartTiming, "HH:mm").toDate()
      : null;
    tmp.projectABHStartTiming = tmp.projectABHStartTiming
      ? moment(tmp.projectABHStartTiming, "HH:mm").toDate()
      : null;
    tmp.projectOBHEndTiming = tmp.projectOBHEndTiming
      ? moment(tmp.projectOBHEndTiming, "HH:mm").toDate()
      : null;
    tmp.projectRBHEndTiming = tmp.projectRBHEndTiming
      ? moment(tmp.projectRBHEndTiming, "HH:mm").toDate()
      : null;
    tmp.projectABHEndTiming = tmp.projectABHEndTiming
      ? moment(tmp.projectABHEndTiming, "HH:mm").toDate()
      : null;

    tmp.projectRBHStartTimingPayIn = tmp.projectRBHStartTimingPayIn
      ? moment(tmp.projectRBHStartTimingPayIn, "HH:mm").toDate()
      : null;
    tmp.projectOBHStartTimingPayIn = tmp.projectOBHStartTimingPayIn
      ? moment(tmp.projectOBHStartTimingPayIn, "HH:mm").toDate()
      : null;
    tmp.projectABHStartTimingPayIn = tmp.projectABHStartTimingPayIn
      ? moment(tmp.projectABHStartTimingPayIn, "HH:mm").toDate()
      : null;
    tmp.projectOBHEndTimingPayIn = tmp.projectOBHEndTimingPayIn
      ? moment(tmp.projectOBHEndTimingPayIn, "HH:mm").toDate()
      : null;
    tmp.projectRBHEndTimingPayIn = tmp.projectRBHEndTimingPayIn
      ? moment(tmp.projectRBHEndTimingPayIn, "HH:mm").toDate()
      : null;
    tmp.projectABHEndTimingPayIn = tmp.projectABHEndTimingPayIn
      ? moment(tmp.projectABHEndTimingPayIn, "HH:mm").toDate()
      : null;

    tmp.minHoursPayIn = tmp.minHoursPayIn ? tmp.minHoursPayIn / 60 : null;
    tmp.minHoursPayOut = tmp.minHoursPayOut ? tmp.minHoursPayOut / 60 : null;

    convertNullToBlank(tmp);

    // Handle Attachments

    if (tmp?.projectAttachments && tmp?.projectAttachments?.length > 0) {
      let tmpUploadedFiles = [];
      let currentCount = attachmentStateCount;

      tmp.projectAttachments.forEach((x) => {
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
    }

    //Handle Decimals

    tmp.projectRBHRatePayIn =
      tmp.projectRBHRatePayIn !== null &&
      tmp.projectRBHRatePayIn !== undefined &&
      tmp.projectRBHRatePayIn !== ""
        ? parseFloat(tmp.projectRBHRatePayIn).toFixed(2)
        : tmp.projectRBHRatePayIn;
    tmp.fullDayRatesPayIn =
      tmp.fullDayRatesPayIn !== null &&
      tmp.fullDayRatesPayIn !== undefined &&
      tmp.fullDayRatesPayIn !== ""
        ? parseFloat(tmp.fullDayRatesPayIn).toFixed(2)
        : tmp.fullDayRatesPayIn;
    tmp.projectABHRatePayIn =
      tmp.projectABHRatePayIn !== null &&
      tmp.projectABHRatePayIn !== undefined &&
      tmp.projectABHRatePayIn !== ""
        ? parseFloat(tmp.projectABHRatePayIn).toFixed(2)
        : tmp.projectABHRatePayIn;
    tmp.projectOBHRatePayIn =
      tmp.projectOBHRatePayIn !== null &&
      tmp.projectOBHRatePayIn !== undefined &&
      tmp.projectOBHRatePayIn !== ""
        ? parseFloat(tmp.projectOBHRatePayIn).toFixed(2)
        : tmp.projectOBHRatePayIn;
    tmp.weekendPayInMultiplier =
      tmp.weekendPayInMultiplier !== null &&
      tmp.weekendPayInMultiplier !== undefined &&
      tmp.weekendPayInMultiplier !== ""
        ? parseFloat(tmp.weekendPayInMultiplier).toFixed(2)
        : tmp.weekendPayInMultiplier;
    tmp.weekendPayInFlatRate =
      tmp.weekendPayInFlatRate !== null &&
      tmp.weekendPayInFlatRate !== undefined &&
      tmp.weekendPayInFlatRate !== ""
        ? parseFloat(tmp.weekendPayInFlatRate).toFixed(2)
        : tmp.weekendPayInFlatRate;
    tmp.projectRBHRatePayOut =
      tmp.projectRBHRatePayOut !== null &&
      tmp.projectRBHRatePayOut !== undefined &&
      tmp.projectRBHRatePayOut !== ""
        ? parseFloat(tmp.projectRBHRatePayOut).toFixed(2)
        : tmp.projectRBHRatePayOut;
    tmp.fullDayRatesPayOut =
      tmp.fullDayRatesPayOut !== null &&
      tmp.fullDayRatesPayOut !== undefined &&
      tmp.fullDayRatesPayOut !== ""
        ? parseFloat(tmp.fullDayRatesPayOut).toFixed(2)
        : tmp.fullDayRatesPayOut;
    tmp.projectABHRatePayOut =
      tmp.projectABHRatePayOut !== null &&
      tmp.projectABHRatePayOut !== undefined &&
      tmp.projectABHRatePayOut !== ""
        ? parseFloat(tmp.projectABHRatePayOut).toFixed(2)
        : tmp.projectABHRatePayOut;
    tmp.projectOBHRatePayOut =
      tmp.projectOBHRatePayOut !== null &&
      tmp.projectOBHRatePayOut !== undefined &&
      tmp.projectOBHRatePayOut !== ""
        ? parseFloat(tmp.projectOBHRatePayOut).toFixed(2)
        : tmp.projectOBHRatePayOut;
    tmp.weekendPayOutMultiplier =
      tmp.weekendPayOutMultiplier !== null &&
      tmp.weekendPayOutMultiplier !== undefined &&
      tmp.weekendPayOutMultiplier !== ""
        ? parseFloat(tmp.weekendPayOutMultiplier).toFixed(2)
        : tmp.weekendPayOutMultiplier;
    tmp.weekendPayOutFlatRate =
      tmp.weekendPayOutFlatRate !== null &&
      tmp.weekendPayOutFlatRate !== undefined &&
      tmp.weekendPayOutFlatRate !== ""
        ? parseFloat(tmp.weekendPayOutFlatRate).toFixed(2)
        : tmp.weekendPayOutFlatRate;

    return tmp;
  }, [editId, enitity, countryMasterState]);

  const checkOverlap = (timeSegments) => {
    if (timeSegments.length === 1) return false;

    timeSegments.sort((timeSegment1, timeSegment2) =>
      timeSegment1[0].localeCompare(timeSegment2[0])
    );

    for (let i = 0; i < timeSegments.length; i++) {
      let j = i + 1;
      if (i === timeSegments.length - 1) {
        if (
          moment(timeSegments[i][0], "HH:mm").isAfter(
            moment(timeSegments[i][1], "HH:mm")
          )
        ) {
          j = 0;
        } else {
          break;
        }
      } else {
        if (
          moment(timeSegments[i][0], "HH:mm").isAfter(
            moment(timeSegments[i][1], "HH:mm")
          )
        ) {
          return true;
        }
      }
      if (
        moment(timeSegments[i][0], "HH:mm").isAfter(
          moment(timeSegments[i][1], "HH:mm")
        ) &&
        moment(timeSegments[j][0], "HH:mm").isAfter(
          moment(timeSegments[j][1], "HH:mm")
        )
      ) {
        return true;
      }
      if (
        moment(timeSegments[i][1], "HH:mm").isAfter(
          moment(timeSegments[j][0], "HH:mm")
        )
      ) {
        return true;
      }
    }

    return false;
  };

  const getMinDate = (projectStartDate) => {
    const currentDate = moment()
      .startOf("day")
      .toDate();

    if (projectStartDate) {
      if (
        moment(projectStartDate)
          .startOf("day")
          .toDate() > currentDate
      ) {
        return moment(projectStartDate).toDate();
      }
    }
    return currentDate;
  };

  const getMaxDate = (projectStartDate, projectEndDate) => {
    if (projectEndDate) {
      if (
        projectStartDate &&
        moment(projectStartDate).startOf("day") > moment().startOf("day")
      ) {
        if (
          moment(projectEndDate).startOf("day") <
          moment(projectStartDate)
            .startOf("day")
            .add(30, "days")
        ) {
          return moment(projectEndDate)
            .startOf("day")
            .toDate();
        } else {
          return moment(projectStartDate)
            .startOf("day")
            .add(30, "days")
            .toDate();
        }
      } else {
        if (
          moment(projectEndDate).startOf("day") <
          moment()
            .startOf("day")
            .add(30, "days")
        ) {
          return moment(projectEndDate)
            .startOf("day")
            .toDate();
        }
      }
    }
    return moment()
      .startOf("day")
      .add(30, "days")
      .toDate();
  };

  const getUpdatedDates = (projectStartDate, projectEndDate, dates) => {
    const minDate = getMinDate(projectStartDate);
    const maxDate = getMaxDate(projectStartDate, projectEndDate);

    let tmpDates = [];

    if (dates && dates.length > 0) {
      dates.forEach((x) => {
        const currentDate = moment(x)
          .startOf("day")
          .toDate();
        if (currentDate < minDate || currentDate > maxDate) {
        } else {
          tmpDates.push(x);
        }
      });

      // setFieldValue("dates", tmpDates);
    }

    return tmpDates;
  };

  const onDrop = React.useCallback(
    (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const files = acceptedFiles;

        if (attachmentState?.length + files.length > 10) {
          alert("You can't upload more than 10 files!!!");
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

  const handleUploadAttachments = (e) => {
    const files = e.target.files;

    if (attachmentState?.length + files.length > 10) {
      alert("You can't upload more than 10 files!!!");
      e.target.value = "";
      return;
    }
    let tmp = [];
    let currentCount = attachmentStateCount;

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      if (file.name?.includes(" ")) {
        alert("File name should not contain space");
        e.target.value = "";
        return;
      }
      tmp.push({
        file: file,
        fileDownloadUri: URL.createObjectURL(file),
        fileName: file.name,
        id: null,
        key: currentCount,
      });
      currentCount = currentCount + 1;
    }
    setAttachmentState([...attachmentState, ...tmp]);
    setAttachmentStateCount(currentCount);
    e.target.value = "";
  };

  const handleDeleteAttachment = (key) => {
    const id = attachmentState?.filter((x) => x.key === key)?.[0]?.id;
    if (id) {
      setFilestoBeDeleted([...filestoBeDeleted, id]);
    }
    setAttachmentState(attachmentState?.filter((x) => x.key !== key));
  };

  const submitValidations = (values) => {
    let branchList = [];
    let selectedBranch = [];
    for (let i = 0; i < values.projectBranchDTLList.length; i++) {
      const element = values.projectBranchDTLList[i];

      if (localStorage.getItem("contentLength") > MAX_LENGTH) {
        setErrorOnSumit(true);
        setValidationError(`Scope of work must not exceed ${MAX_LENGTH}`);
        window.scrollTo(0, 0);
        return;
      } else {
        setErrorOnSumit(false);
        localStorage.removeItem("contentLength");
      }

      if (!element.branchName) {
        setValidationError("Branch Name Required");
        return false;
      } else if (!element.countryMSTId) {
        setValidationError("Country Required");
        return false;
      } else if (!element.cityMSTId) {
        setValidationError("City Required");
        return false;
      }

      branchList.push(element.branchName);
      if (element.selected) {
        selectedBranch.push(element);
      }

      const countryCode = countryMasterState?.entities?.filter(
        (x) => x.id.toString() === element?.countryMSTId?.toString()
      )?.[0]?.countryCode;

      if (element.zipCode) {
        if (countryCode) {
          if (postcodeValidatorExistsForCountry(countryCode)) {
            if (!postcodeValidator(element.zipCode, countryCode)) {
              setValidationError("Invalid Zip Code");
              return false;
            }
          } else {
            if (!postcodeValidator(element.zipCode, "INTL")) {
              setValidationError("Invalid Zip Code");
              return false;
            }
          }
        } else {
          if (!postcodeValidator(element.zipCode, "INTL")) {
            setValidationError("Invalid Zip Code");
            return false;
          }
        }
      }

      if (element.contactNumber) {
        let valid = false;
        try {
          const phoneUtil = PhoneNumberUtil.getInstance();
          valid = phoneUtil.isValidNumberForRegion(
            phoneUtil.parse(element.contactNumber, countryCode),
            countryCode
          );
        } catch (e) {
          valid = false;
        }
        if (!valid) {
          setValidationError("Invalid Contact Number");
          return false;
        }
      }

      if (element.email) {
        if (!element.email.match(emailRegEx)) {
          setValidationError("Invalid Email");
          return false;
        }
      }
    }

    if (branchList.length > 0) {
      let uniqueList = [...new Set(branchList)];
      if (branchList.length !== uniqueList.length) {
        setValidationError("Duplicate Branch Name");
        return false;
      }
    }

    if (
      values.projectTaskCreationType === "DAYWISE" ||
      values.projectTaskCreationType === "DATEWISE" ||
      values.projectTaskCreationType === "SINGLE"
    ) {
      if (selectedBranch.length < 1) {
        alert("Please select atleast one branch to auto create ticket.");
        return false;
      }
      const countryMSTId = selectedBranch[0]?.countryMSTId;
      if (
        countryMasterState?.entities?.find((x) => x.id === countryMSTId)
          ?.countryCode === "GLOBAL"
      ) {
        alert("You can't auto create ticket for GLOBAL country");
        return false;
      }
    }

    return true;
  };

  const openBranchDetailModal = (
    id,
    values,
    setFieldValue,
    row,
    editable,
    checkPco
  ) => {
    const branchDetailModal = (
      <BranchDetailModal
        closeModalHandler={(isSave = false) => {
          if (isSave) {
            if (
              window.confirm(
                "Please click Save button on main page to save changes."
              )
            ) {
              setModal(null);
            }
          } else {
            setModal(null);
          }
        }}
        values={values}
        setFieldValue={setFieldValue}
        initialValues={row ? row : branchDtl_reducerInfo.initialEnitity}
        editable={editable}
        setSelectedRows={setSelectedRows}
        id={id}
        checkPco={checkPco}
      />
    );
    setModal(branchDetailModal);
  };

  const checkSubmitt = () => {
    if (roleCode.includes("admin") || roleCode.includes("pm")) {
    } else {
      window.alert("You are not Authorized to Save the Project");
      return;
    }
  };

  useEffect(() => {
    if (currentState?.error?.customError) {
      console.log(currentState?.error);
      let error = currentState?.error?.customError;
      setCheckErr(true);
      let ticket = [];
      let project = [];
      if (error?.length) {
        error.map((dl) => {
          if (dl.ticketId) {
            ticket.push(dl);
          } else {
            project.push(dl);
          }
        });
        if (project?.length) {
          setOpenProject(project);
        }
        if (ticket?.length) {
          setOpenTicket(ticket);
        }
      }
    }
  }, [currentState]);

  const getEngineerList = (values, setFieldValue) => {
    const selectedBranch = values?.projectBranchDTLList?.find(
      (x) => x.selected
    );

    let engineerList = [];

    if (selectedBranch) {
      if (selectedBranch?.stateMSTId) {
        engineerList = engineerMasterState?.entities?.filter(
          (x) =>
            x.countryMSTId ===
              values?.projectBranchDTLList?.find((x) => x.selected)
                ?.countryMSTId &&
            x.stateMSTId ===
              values?.projectBranchDTLList?.find((x) => x.selected)?.stateMSTId
        );
      } else {
        engineerList = engineerMasterState?.entities?.filter(
          (x) =>
            x.countryMSTId ===
            values?.projectBranchDTLList?.find((x) => x.selected)?.countryMSTId
        );
      }
    }

    if (values?.projectTaskUserId) {
      if (!engineerList.find((x) => x.id === values.projectTaskUserId)) {
        setFieldValue("projectTaskUserId", null);
      }
    }

    return engineerList;
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={entity}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        setErrorOnSumit(false);

        if (roleCode.includes("admin") || roleCode.includes("pm")) {
        } else {
          window.alert("You are not Authorized to Save the Project");
          return;
        }
        setValidationError("");
        if (
          values?.projectBranchDTLList?.filter((x) => x.active === true)
            ?.length === 0
        ) {
          window.alert("Please add atleast one branch to continue");
          return;
        }
        if (!submitValidations(values)) {
          return;
        }
        let val = { ...values };

        // if(localStorage.getItem('contentLength') > MAX_LENGTH){
        //   setErrorOnSumit(true)
        //   setValidationError(`Scope of work must not exceed ${MAX_LENGTH}`)
        //   return
        // }
        // else{
        //   setErrorOnSumit(false)
        //   localStorage.removeItem('contentLength')
        // }

        convertBlankToNull(val);

        val.minHoursPayIn =
          val.minHoursPayIn !== null ? val.minHoursPayIn * 60 : null;
        val.minHoursPayOut =
          val.minHoursPayOut !== null ? val.minHoursPayOut * 60 : null;

        delete val?.projectTaskUser;
        delete val?.projectLogs;
        val.projectPreferredDay = preferedDays.join(",");

        let timezone = moment.tz.guess(true);

        val.projectBranchDTLList.forEach((x) => {
          if (x.selected) {
            if (x?.cityMST?.latitude && x?.cityMST?.longitude) {
              timezone = tz_lookup(x.cityMST.latitude, x.cityMST.longitude);
            }
          }
          delete x?.countryMST;
          delete x?.stateMST;
          delete x?.cityMST;
        });

        val.timezone = timezone;

        val.startOffset = moment
          .tz("08:30", "HH:mm", timezone)
          .tz("utc")
          .format("HH:mm");
        val.endOffset = moment
          .tz("23:59", "HH:mm", timezone)
          .tz("utc")
          .format("HH:mm");

        val.projectRBHStartTiming = values.projectRBHStartTiming
          ? moment(values.projectRBHStartTiming, "HH:mm").format("HH:mm")
          : null;
        val.projectOBHStartTiming = values.projectOBHStartTiming
          ? moment(values.projectOBHStartTiming, "HH:mm").format("HH:mm")
          : null;
        val.projectABHStartTiming = values.projectABHStartTiming
          ? moment(values.projectABHStartTiming, "HH:mm").format("HH:mm")
          : null;
        val.projectOBHEndTiming = values.projectOBHEndTiming
          ? moment(values.projectOBHEndTiming, "HH:mm").format("HH:mm")
          : null;
        val.projectRBHEndTiming = values.projectRBHEndTiming
          ? moment(values.projectRBHEndTiming, "HH:mm").format("HH:mm")
          : null;
        val.projectABHEndTiming = values.projectABHEndTiming
          ? moment(values.projectABHEndTiming, "HH:mm").format("HH:mm")
          : null;

        val.projectRBHStartTimingPayIn = values.projectRBHStartTimingPayIn
          ? moment(values.projectRBHStartTimingPayIn, "HH:mm").format("HH:mm")
          : null;
        val.projectOBHStartTimingPayIn = values.projectOBHStartTimingPayIn
          ? moment(values.projectOBHStartTimingPayIn, "HH:mm").format("HH:mm")
          : null;
        val.projectABHStartTimingPayIn = values.projectABHStartTimingPayIn
          ? moment(values.projectABHStartTimingPayIn, "HH:mm").format("HH:mm")
          : null;
        val.projectOBHEndTimingPayIn = values.projectOBHEndTimingPayIn
          ? moment(values.projectOBHEndTimingPayIn, "HH:mm").format("HH:mm")
          : null;
        val.projectRBHEndTimingPayIn = values.projectRBHEndTimingPayIn
          ? moment(values.projectRBHEndTimingPayIn, "HH:mm").format("HH:mm")
          : null;
        val.projectABHEndTimingPayIn = values.projectABHEndTimingPayIn
          ? moment(values.projectABHEndTimingPayIn, "HH:mm").format("HH:mm")
          : null;

        if (val.projectRBHEndTiming && !val.projectRBHStartTiming) {
          setValidationError("Payment Tab: RBH Start Time Required");
          return;
        } else if (!val.projectRBHEndTiming && val.projectRBHStartTiming) {
          setValidationError("Payment Tab: RBH End Time Required");
          return;
        }

        if (val.projectABHEndTiming && !val.projectABHStartTiming) {
          setValidationError("Payment Tab: ABH Start Time Required");
          return;
        } else if (!val.projectABHEndTiming && val.projectABHStartTiming) {
          setValidationError("Payment Tab: ABH End Time Required");
          return;
        }

        if (val.projectOBHEndTiming && !val.projectOBHStartTiming) {
          setValidationError("Payment Tab: OBH Start Time Required");
          return;
        } else if (!val.projectOBHEndTiming && val.projectOBHStartTiming) {
          setValidationError("Payment Tab: OBH End Time Required");
          return;
        }

        let timeArray = [];

        if (val.projectRBHStartTiming) {
          let tmpArray = [];
          tmpArray[0] = val.projectRBHStartTiming;
          tmpArray[1] = val.projectRBHEndTiming;
          timeArray.push(tmpArray);
        }

        if (val.projectOBHStartTiming) {
          let tmpArray = [];
          tmpArray[0] = val.projectOBHStartTiming;
          tmpArray[1] = val.projectOBHEndTiming;
          timeArray.push(tmpArray);
        }

        if (val.projectABHStartTiming) {
          let tmpArray = [];
          tmpArray[0] = val.projectABHStartTiming;
          tmpArray[1] = val.projectABHEndTiming;
          timeArray.push(tmpArray);
        }

        if (
          val.projectRBHStartTiming === val.projectOBHStartTiming &&
          val.projectRBHEndTiming === val.projectOBHEndTiming &&
          val.projectRBHStartTiming !== null &&
          val.projectRBHEndTiming !== null
        ) {
          setValidationError("RBH & OBH Timings must not be same");
          return;
        }

        if (
          val.projectRBHStartTiming === val.projectABHStartTiming &&
          val.projectRBHEndTiming === val.projectABHEndTiming &&
          val.projectRBHStartTiming !== null &&
          val.projectRBHEndTiming !== null
        ) {
          setValidationError("RBH & ABH Timings must not be same");
          return;
        }

        if (
          val.projectOBHStartTiming === val.projectABHStartTiming &&
          val.projectOBHEndTiming === val.projectABHEndTiming &&
          val.projectABHStartTiming !== null &&
          val.projectABHEndTiming !== null
        ) {
          setValidationError("OBH & ABH Timings must not be same");
          return;
        }

        if (checkOverlap(timeArray)) {
          setValidationError("Payment Tab: Timings Overlapped !!!");
          return;
        }

        const utcOffset = moment.tz(val.timezone).utcOffset();
        val.offsetSign = utcOffset > 0 ? "+" : utcOffset < 0 ? "-" : "N";
        val.utcOffset = utcOffset;

        val.dates = getUpdatedDates(
          val?.projectStartDate,
          val?.projectEndDate,
          val?.dates
        );
        val.dateList = val.dates.map((x) => {
          const tmpStartTime = "08:30";
          const tmpEndTime = "23:59";

          const tmpStartDateTime = moment(x + " " + tmpStartTime)
            .subtract(val.utcOffset, "minutes")
            .format("YYYY-MM-DD HH:mm");
          const tmpEndDateTime = moment(x + " " + tmpEndTime)
            .subtract(val.utcOffset, "minutes")
            .format("YYYY-MM-DD HH:mm");

          return {
            startDateTime: tmpStartDateTime,
            endDateTime: tmpEndDateTime,
          };
        });

        delete val?.organizationMST;
        delete val?.organizationBranchDTL;
        delete val?.stateMST;
        delete val?.cityMST;
        delete val?.countryMST;
        delete val?.projectTaskUser;
        delete val?.projectCoordinator;
        delete val?.projectManager;
        delete val?.projectPayOutCurrency;
        delete val?.projectPayInCurrency;

        delete val?.projectAttachments;

        if (!values?.projectTaskUserId) {
          val.travelChargesPayIn = null;
          val.travelChargesPayOut = null;
          val.materialChargesPayIn = null;
          val.materialChargesPayOut = null;
          val.parkingChargesPayIn = null;
          val.parkingChargesPayOut = null;
          val.otherChargesPayIn = null;
          val.otherChargesPayOut = null;
        }

        const saveProject = (val, a) => {
          if (val?.id && val.id !== 0) {
            // if (a === true) {
            dispatch(projectMasterActions.updateCustom(val)).then((res) => {
              projectAttachmentActions
                .deleteMultiple(filestoBeDeleted)
                .then((res1) => {
                  projectAttachmentActions
                    .uploadMultiple(
                      attachmentState
                        ?.filter((x) => x.file !== null)
                        ?.map((x) => x.file),
                      res.id
                    )
                    .then((res2) => {
                      // saveRecord(null, null, Promise.resolve(res))
                      dispatch(projectMasterActions.fetchEntity(res.id));
                    })
                    .catch((err) =>
                      saveRecord(null, null, Promise.reject(err))
                    );
                })
                .catch((err) => saveRecord(null, null, Promise.reject(err)));
            });
            // .catch((err) => saveRecord(null, null, Promise.reject(err)));
            // }
            // else{

            // }
          } else {
            // debugger
            dispatch(projectMasterActions.create(val))
              .then((res) => {
                projectAttachmentActions
                  .deleteMultiple(filestoBeDeleted)
                  .then((res1) => {
                    projectAttachmentActions
                      .uploadMultiple(
                        attachmentState
                          ?.filter((x) => x.file !== null)
                          ?.map((x) => x.file),
                        res.id
                      )
                      .then((res2) => {
                        // saveRecord(null, null, Promise.resolve(res))
                        history.push(`/project/${res.id}/edit`);
                      })
                      .catch((err) =>
                        saveRecord(null, null, Promise.reject(err))
                      );
                  })
                  .catch((err) => saveRecord(null, null, Promise.reject(err)));
              })
              .catch((err) => saveRecord(null, null, Promise.reject(err)));
          }
        };

        const editorData = EditorState.createWithContent(
          convertFromRaw(JSON.parse(val.scopeOfWork))
        );
        const scopeOfWork = editorData.getCurrentContent().getPlainText();

        val.ticketSummary = scopeOfWork.substring(0, 100);
        if (
          val.projectTaskCreationType === "DAYWISE" ||
          (val.projectTaskCreationType === "DATEWISE" &&
            val.projectForceEndDate)
        ) {
          //here
          dispatch(projectMasterActions.getTicketCount(val))
            .then((res) => {
              let a = window.confirm(
                "This will autoclose " +
                  res +
                  " tickets. Do you want to continue?"
              );
              if (a === true) {
                saveProject(val, a);
              } else {
                return;
              }
            })
            .catch((err) => saveRecord(null, null, Promise.reject(err)));
          //here
          dispatch(projectMasterActions.getTaskCount(val))
            .then((res) => {
              let a = window.confirm(
                "This will create " + res + " tickets. Do you want to continue?"
              );
              if (a === true) {
                saveProject(val, a);
              } else {
                return;
              }
            })
            .catch((err) => saveRecord(null, null, Promise.reject(err)));
        }
        // else {
        //   saveProject(val);
        // }
        else if (val.projectForceEndDate) {
          dispatch(projectMasterActions.getTicketCount(val))
            .then((res) => {
              let a = window.confirm(
                "This will autoclose " +
                  res +
                  " tickets. Do you want to continue?"
              );
              if (a === true) {
                saveProject(val, a);
              } else {
                return;
              }
            })
            .catch((err) => saveRecord(null, null, Promise.reject(err)));
        } else {
          // debugger
          if (
            val.projectTaskCreationType === "DAYWISE" ||
            val.projectTaskCreationType === "DATEWISE"
          ) {
            dispatch(projectMasterActions.getTaskCount(val))
              .then((res) => {
                let a = window.confirm(
                  "This will create " +
                    res +
                    " tickets. Do you want to continue?"
                );
                if (a === true) {
                  saveProject(val, a);
                } else {
                  return;
                }
              })
              .catch((err) => saveRecord(null, null, Promise.reject(err)));
          } else {
            saveProject(val);
          }
        }
      }}
    >
      {({
        values,
        handleSubmit,
        handleReset,
        setFieldValue,
        setFieldError,
        setFieldTouched,
        errors,
      }) => (
        <div>
          <Form className="form form-label-right">
            {/* {errors && errorOnSumit ? <div style={{ color: "red" }} > {errors?.projectName ? `${errors?.projectName},` : ""}  {errors?.projectStartDate ? `${errors?.projectStartDate},` : ""} {errors?.projectEndDate ? `${errors?.projectEndDate},` : ""} {errors?.organizationMSTId ? `${errors?.organizationMSTId},` : ""} {errors?.scopeOfWork ? `${errors?.scopeOfWork},` : ""} {errors?.projectDescription}</div> : ""} */}
            {/* <div>
              {errors && errorOnSumit ?
                <div style={{ color: "red" }} >
                  {getErrors(errors)}123456
                </div>
                : ""}
            </div> */}
            {checkErr ? (
              <div className="text-danger d-flex flex-wrap">
                {openProject ? (
                  <div className="ml-3">
                    {" "}
                    Open Projects :-
                    {openProject?.map((el) => {
                      return (
                        <Link to={`/project/${el.projectId}/edit`}>
                          <span>{`${el.projectCode},`} </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  ""
                )}
                {openTicket ? (
                  <div className="ml-3">
                    Open Tickets :-
                    {openTicket?.map((el) => {
                      return (
                        <Link to={`/ticket/${el.ticketId}/edit`}>
                          <span>{`${el.ticketCode},`}</span>
                        </Link>
                      );
                    })}
                  </div>
                ) : (
                  ""
                )}
              </div>
            ) : (
              ""
            )}
            {validationError ? (
              <div style={{ color: "red", paddingBottom: "15px" }}>
                {validationError}
              </div>
            ) : null}
            <div className="form-group row">
              <div className="col-lg-3">
                <Field
                  name="projectName"
                  component={Input}
                  placeholder="Enter Project Name"
                  label="Project Name"
                  isrequired
                  disabled={checkPco}
                />
              </div>
              <div className="col-lg-3">
                <Field
                  name="projectStatusType"
                  component={AutoCompleteSelect}
                  label="Status"
                  isrequired
                  options={statusTypes}
                  placeholder="Select Status"
                  nonEditable={checkPco}
                />
              </div>
            </div>

            {modal ? modal : null}

            <TabularView
              tabs={[
                {
                  key: "details1",
                  title: "Details",
                  content: (
                    <>
                      <div className="form-group row">
                        <div className="col-12 col-md-3 ">
                          <Field
                            name="projectStartDate"
                            component={AntdDatePickerField}
                            placeholder="DD-MMM-YYYY"
                            // format="YYYY-MM-DD"
                            label="Start Date"
                            isrequired
                            onChange={(val) => {
                              const projectStartDate = val
                                ? val.format("yyyy-MM-DD")
                                : null;
                              setFieldValue(
                                "dates",
                                getUpdatedDates(
                                  projectStartDate,
                                  values?.projectEndDate,
                                  values?.dates
                                )
                              );
                              setFieldValue(
                                "projectStartDate",
                                projectStartDate
                              );
                            }}
                            disabled={checkPco}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectEndDate"
                            component={AntdDatePickerField}
                            placeholder="DD-MMM-YYYY"
                            // format="YYYY-MM-DD"
                            label="End Date"
                            isrequired
                            onChange={(val) => {
                              const projectEndDate = val
                                ? val.format("yyyy-MM-DD")
                                : null;
                              setFieldValue(
                                "dates",
                                getUpdatedDates(
                                  values?.projectStartDate,
                                  projectEndDate,
                                  values?.dates
                                )
                              );
                              setFieldValue("projectEndDate", projectEndDate);
                            }}
                            disabled={checkPco}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectForceEndDate"
                            component={AntdDatePickerField}
                            placeholder="DD-MMM-YYYY"
                            label="Force End Date "
                            // format="YYYY-MM-DD"
                            disabled={checkPco}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <Field
                            name="organizationMSTId"
                            component={AutoCompleteSelect}
                            customOptions={{
                              records: organizationMasterState?.entities,
                              labelField: "organizationName",
                              valueField: "id",
                            }}
                            isLoading={organizationMasterState?.listLoading}
                            loadingMessage="Fetching records..."
                            placeholder="Select Customer"
                            onChange={(option) => {
                              const id = option?.value ?? null;
                              setFieldValue("countryMSTId", 0);
                              setFieldValue("countryCode", 0);
                              setFieldValue("stateMSTId", 0);
                              setFieldValue("cityMSTId", 0);
                              setFieldValue("projectZipcode", "");
                              setFieldValue("projectAddress", "");
                              setFieldValue("organizationMSTId", id);
                            }}
                            isrequired
                            label="Customer"
                            nonEditable={checkPco}
                          />
                        </div>
                      </div>
                      <div className="form-group row">
                        <div className="col-12 col-md-3">
                          <Field
                            name="externalCustomer"
                            component={Input}
                            placeholder="Enter End Customer"
                            label="End Customer"
                            disabled={checkPco}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectRequestedBy"
                            component={Input}
                            placeholder="Enter Requested By"
                            label="Requested By"
                            disabled={checkPco}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectRequestedByPhone"
                            component={Input}
                            placeholder="Enter Requestor's Phone"
                            label="Requestor's Phone"
                            disabled={checkPco}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectRequestedByEmail"
                            component={Input}
                            placeholder="Enter Requestor's Email"
                            label="Requestor's Email"
                            disabled={checkPco}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectLocalContactName"
                            component={Input}
                            placeholder="Enter Local Contact Name"
                            label="Local Contact Name"
                            disabled={checkPco}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectLocalContactPhone"
                            component={Input}
                            placeholder="Enter Local Contact Phone"
                            label="Local Contact Phone"
                            disabled={checkPco}
                          />
                        </div>

                        <div className="col-12 col-md-3">
                          <Field
                            name="projectTaskUserId"
                            component={AutoCompleteSelect}
                            customOptions={{
                              records: getEngineerList(values, setFieldValue),
                              labelField: "engineerName",
                              valueField: "id",
                            }}
                            isLoading={engineerMasterState?.listLoading}
                            loadingMessage="Fetching records..."
                            onChange={(option) => {
                              let id = option?.value ?? null;
                              if (
                                values?.projectRBHRatePayOut === null ||
                                values?.projectRBHRatePayOut === 0
                              ) {
                                let engineerRow = engineerMasterState?.entities?.filter(
                                  (x) => x.id === id
                                )?.[0];
                                setFieldValue(
                                  "projectRBHRatePayOut",
                                  engineerRow?.ratePerHour
                                );
                                setFieldValue(
                                  "projectPayOutCurrencyId",
                                  engineerRow?.currencyMSTId
                                );
                              }
                              setFieldValue("projectTaskUserId", id);
                            }}
                            label="Assigned Engineer"
                            nonEditable={checkPco}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectCoordinatorId"
                            component={AutoCompleteSelect}
                            customOptions={{
                              records: userMasterState?.entities?.filter(
                                (x) =>
                                  x?.organizationMST?.organizationType ===
                                    "SELF" &&
                                  x?.userRoleMST?.roleCode !== "admin"
                              ),
                              labelField: "userName",
                              valueField: "id",
                            }}
                            isLoading={userMasterState?.listLoading}
                            loadingMessage="Fetching records..."
                            // isrequired
                            label="Project Co-ordinator"
                            nonEditable={checkPco}
                          />
                        </div>
                      </div>

                      <div className="form-group row">
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectManagerId"
                            component={AutoCompleteSelect}
                            customOptions={{
                              records: userMasterState?.entities?.filter(
                                (x) =>
                                  x?.organizationMST?.organizationType ===
                                    "SELF" &&
                                  x?.userRoleMST?.roleCode !== "admin"
                              ),
                              labelField: "userName",
                              valueField: "id",
                            }}
                            isLoading={userMasterState?.listLoading}
                            loadingMessage="Fetching records..."
                            // isrequired
                            label="Project Manager"
                            nonEditable={checkPco}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectReference1"
                            component={Input}
                            placeholder="Enter Reference1"
                            label="Reference1"
                            disabled={checkPco}
                          />
                        </div>

                        <div className="col-12 col-md-3">
                          <Field
                            name="projectReference2"
                            component={Input}
                            placeholder="Enter Reference2"
                            label="Reference2"
                            disabled={checkPco}
                          />
                        </div>
                        <div className="col-12 col-md-3">
                          <Field
                            name="projectTaskCreationType"
                            component={AutoCompleteSelect}
                            options={taskCreationTypes}
                            label="Ticket Creation"
                            onChange={(option) => {
                              setPreferedDays([]);
                              setFieldValue(
                                "projectTaskCreationType",
                                option?.value ?? null
                              );
                            }}
                            nonEditable={checkPco}
                            isrequired
                          />
                        </div>
                        {values?.projectTaskCreationType === "NONE" ||
                        values?.projectTaskCreationType === null ? null : (
                          <div className="col-12 col-md-3">
                            <Field
                              name="taskType"
                              component={AutoCompleteSelect}
                              placeholder="Select Ticket Type"
                              label="Ticket Type"
                              options={taskTypes}
                              disabled={checkPco}
                              nonEditable={checkPco}
                            />
                          </div>
                        )}
                        {values?.projectTaskCreationType === "NONE" ||
                        values?.projectTaskCreationType ===
                          null ? null : values?.projectTaskCreationType === // <div className="form-group row">
                          "DATEWISE" ? (
                          <div className="col-12 col-md-3">
                            <Field
                              name="dates"
                              component={DatePickerMultiSelectField}
                              label="Date Selection"
                              minDate={getMinDate(values?.projectStartDate)}
                              maxDate={getMaxDate(
                                values?.projectStartDate,
                                values?.projectForceEndDate
                              )}
                              disabled={checkPco}
                              // minDate={values?.projectStartDate ?
                              //     moment(values.projectStartDate) > moment() ?
                              //       moment(values.projectStartDate).toDate() : new Date() :
                              //   new Date()}
                              // maxDate={values?.projectEndDate ?
                              //   moment(values.projectEndDate) > moment().add(30, 'days') ?
                              //     moment().add(30, 'days').toDate() : moment(values.projectEndDate).toDate() :
                              //   moment().add(30, 'days').toDate()}
                            />
                          </div>
                        ) : null
                        // </div>
                        }

                        {values?.projectTaskCreationType === "DAYWISE" ? (
                          <div className="form-group row mt-10 col-12">
                            <>
                              <div className="col-12 col-md-2">
                                <label className="justify-content-start">
                                  Prefered Days
                                </label>
                              </div>
                              <div className="col-12 col-md-9">
                                <CheckboxGroup
                                  name="projectPreferredDay"
                                  value={preferedDays}
                                  onChange={setPreferedDays}
                                >
                                  {(Checkbox) => (
                                    <>
                                      <label>
                                        <Checkbox
                                          value="1"
                                          disabled={checkPco}
                                        />
                                        &nbsp; Monday
                                      </label>
                                      &nbsp; &nbsp; &nbsp;
                                      <label>
                                        <Checkbox
                                          value="2"
                                          disabled={checkPco}
                                        />
                                        &nbsp; Tuesday
                                      </label>
                                      &nbsp; &nbsp; &nbsp;
                                      <label>
                                        <Checkbox value="3" />
                                        &nbsp; Wednesday
                                      </label>
                                      &nbsp; &nbsp; &nbsp;
                                      <label>
                                        <Checkbox
                                          value="4"
                                          disabled={checkPco}
                                        />
                                        &nbsp; Thursday
                                      </label>
                                      &nbsp; &nbsp; &nbsp;
                                      <label>
                                        <Checkbox
                                          value="5"
                                          disabled={checkPco}
                                        />
                                        &nbsp; Friday
                                      </label>
                                      &nbsp; &nbsp; &nbsp;
                                      <label>
                                        <Checkbox
                                          value="6"
                                          disabled={checkPco}
                                        />
                                        &nbsp; Saturday
                                      </label>
                                      &nbsp; &nbsp; &nbsp;
                                      <label>
                                        <Checkbox
                                          value="7"
                                          disabled={checkPco}
                                        />
                                        &nbsp; Sunday
                                      </label>
                                    </>
                                  )}
                                </CheckboxGroup>
                              </div>
                            </>
                          </div>
                        ) : null}
                      </div>

                      <hr />

                      <div className="form-group row pt-5">
                        <div className="col-md-2">
                          <label>Attachment(s)</label>
                        </div>
                        <div className="col-md-10">
                          {/* <input
                          type="file"
                          // ref={hiddenFileInputRef}
                          onChange={(e) => handleUploadAttachments(e, setFieldValue)}
                          // style={{ display: 'none' }}
                          multiple
                          disabled={checkPco}
                        /> */}
                          <div {...getRootProps({ className: "dropzone" })}>
                            <input {...getInputProps()} disabled={checkPco} />
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
                                {roleCode.includes("admin") ||
                                roleCode.includes("pm") ? (
                                  <>
                                    {!checkPco ? (
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
                                    <a
                                      href={x?.fileDownloadUri}
                                      download={x?.fileName}
                                    >
                                      <i
                                        className="fa fa-download"
                                        style={{
                                          float: "left",
                                          color: "#3F4254",
                                          cursor: "pointer",
                                        }}
                                      ></i>
                                    </a>
                                  </>
                                ) : null}
                              </div>
                              <a href={x?.fileDownloadUri} target="_blank">
                                {/* <DocViewer
                                pluginRenderers={DocViewerRenderers}
                                documents={[
                                  { uri: x?.fileDownloadUri },
                                ]} /> */}
                                <div>{x?.fileName}</div>
                              </a>
                            </div>
                          );
                        })}
                      </div>

                      <hr />

                      <div
                        className="card"
                        style={{
                          boxShadow: "0px 0px 2px #555",
                          marginTop: "30px",
                          marginBottom: "30px",
                        }}
                      >
                        <h5
                          className="card-header text-center p-1"
                          style={{ backgroundColor: "#f4f4f4", color: "#777" }}
                        >
                          Branch Details
                        </h5>
                        {/* {validationError ?
                          validationError.includes("Scope of work must not exceed 5500") ? null :
                          <div style={{ color: 'red', paddingBottom: '15px' }}>
                            {validationError}
                          </div>
                          : null
                        } */}
                        <div className="card-body pt-0 px-2 pb-7 mt-7">
                          <div
                            style={{ float: "right", paddingBottom: "10px" }}
                          >
                            <button
                              disabled={checkPco}
                              onClick={() =>
                                openBranchDetailModal(
                                  null,
                                  values,
                                  setFieldValue
                                )
                              }
                              type="button"
                              className="btn pinaple-yellow-btn col-xs-12"
                              style={{ float: "right" }}
                            >
                              + Add
                            </button>
                          </div>
                          <POSEditableTable
                            data={values.projectBranchDTLList}
                            columns={[
                              {
                                dataField: "branchName",
                                text: "Branch Name",
                                headerFormatter: (column, columnIndex) =>
                                  requireHeaderFormatter(column, columnIndex),
                                editable: false,
                              },
                              {
                                dataField: "address",
                                text: "Address",
                                editable: false,
                              },
                              {
                                dataField: "zipCode",
                                text: "Zip Code",
                                editable: false,
                              },
                              {
                                dataField: "countryMST.countryName",
                                text: "Country",
                                headerFormatter: (column, columnIndex) =>
                                  requireHeaderFormatter(column, columnIndex),
                                editable: false,
                              },
                              {
                                dataField: "stateMST.stateName",
                                text: "State",
                                editable: false,
                              },
                              {
                                dataField: "cityMST.cityName",
                                text: "City",
                                headerFormatter: (column, columnIndex) =>
                                  requireHeaderFormatter(column, columnIndex),
                                editable: false,
                              },
                              {
                                dataField: "contactName",
                                text: "Contact Name",
                                editable: false,
                              },
                              {
                                dataField: "contactNumber",
                                text: "Contact Number",
                                editable: false,
                              },
                              {
                                dataField: "email",
                                text: "Email",
                                editable: false,
                              },
                              {
                                dataField: "edit",
                                text: "Edit",
                                headerStyle: { whiteSpace: "nowrap" },
                                formatExtraData: values,
                                formatter: (cell, row, rowIndex, values) => {
                                  return (
                                    <a
                                      title="Edit this record"
                                      className="btn btn-icon btn-light btn-hover-warning btn-sm mx-3"
                                      onClick={() => {
                                        console.log("utton clikced", row.id);
                                        openBranchDetailModal(
                                          row.id,
                                          values,
                                          setFieldValue,
                                          row,
                                          true,
                                          checkPco
                                        );
                                      }}
                                    >
                                      <span className="svg-icon svg-icon-md svg-icon-dark">
                                        <SVG
                                          src={toAbsoluteUrl(
                                            "/media/svg/icons/Communication/Write.svg"
                                          )}
                                          title="Edit"
                                        />
                                      </span>
                                    </a>
                                  );
                                },
                                editable: false,
                              },
                              {
                                dataField: "active",
                                text: "Active",
                                formatter: StatusColumnFormatter,
                                style: { width: "2%" },
                                editorClasses: "form-control-sm",
                                classes: "text-center",
                                headerClasses: "text-center",
                                editable: false,
                              },
                            ]}
                            // addRowBtnHandler={(newKey, data) => {
                            //   setFieldValue("projectBranchDTLList", [
                            //     ...data,
                            //     {
                            //       ...branchDtl_reducerInfo.initialEnitity,
                            //       keyField: newKey
                            //     }
                            //   ])
                            // }}
                            deleteRowBtnHandler={(key, data) => {
                              let newData = [];
                              if (!checkPco) {
                                data.forEach((row) => {
                                  if (row.keyField === key) {
                                    if (row.id) {
                                      row.active = false;
                                      newData = [...newData, row];
                                    }
                                  } else newData = [...newData, row];
                                });
                                setFieldValue("projectBranchDTLList", newData);
                              }
                            }}
                            selectRow={{
                              mode: "checkbox",
                              hideSelectAll: true,
                              selected: selectedRows,
                              onSelect: (row, isSelect, rowIndex, e) => {
                                let projectBranchDTLList = [
                                  ...values.projectBranchDTLList,
                                ];
                                if (isSelect) {
                                  setSelectedRows([row.keyField]);
                                  projectBranchDTLList = projectBranchDTLList.map(
                                    (x) => {
                                      if (x.keyField === row.keyField) {
                                        return {
                                          ...x,
                                          selected: true,
                                        };
                                      } else {
                                        return {
                                          ...x,
                                          selected: false,
                                        };
                                      }
                                    }
                                  );
                                } else {
                                  setSelectedRows(
                                    selectedRows.filter(
                                      (x) => x !== row.keyField
                                    )
                                  );
                                  projectBranchDTLList.find(
                                    (x) => x.keyField === row.keyField
                                  ).selected = false;
                                }
                                setFieldValue(
                                  "projectBranchDTLList",
                                  projectBranchDTLList
                                );
                              },
                            }}
                          />
                        </div>
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
                                  disabled={checkPco}
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
                                          "projectRBHStartTimingPayIn",
                                          startTime
                                        );
                                        setFieldValue(
                                          "projectRBHEndTimingPayIn",
                                          endTime
                                        );
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
                                          "projectRBHStartTimingPayIn",
                                          startTime
                                        );
                                        setFieldValue(
                                          "projectRBHEndTimingPayIn",
                                          endTime
                                        );
                                      }
                                    }
                                    setFieldValue("payInDayOption", day);
                                  }}
                                  nonEditable={checkPco}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="projectRBHStartTimingPayIn"
                                  component={AntdTimePickerField}
                                  label="Start Time"
                                  placeholder="HH:MM"
                                  disabled={checkPco}
                                  // ampm={false}
                                  // clearable
                                  // format="HH:mm"
                                />
                              </div>
                            </div>
                            <div className="form-group row">
                              <div className="col-12 col-md-4 offset-md-3">
                                <Field
                                  name="projectRBHEndTimingPayIn"
                                  component={AntdTimePickerField}
                                  label="End Time"
                                  placeholder="HH:MM"
                                  disabled={checkPco}
                                  // ampm={false}
                                  // clearable
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="projectRBHRatePayIn"
                                  component={Input}
                                  label="Rates/hour"
                                  type="number"
                                  step="any"
                                  min="0"
                                  onBlur={() => {
                                    const val =
                                      values.projectRBHRatePayIn === null ||
                                      values.projectRBHRatePayIn ===
                                        undefined ||
                                      values.projectRBHRatePayIn === ""
                                        ? ""
                                        : parseFloat(
                                            values.projectRBHRatePayIn
                                          ).toFixed(2);
                                    setFieldValue("projectRBHRatePayIn", val);
                                    setFieldTouched(
                                      "projectRBHRatePayIn",
                                      true
                                    );
                                  }}
                                  disabled={checkPco}
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
                                  disabled={isMinHoursPayIn || checkPco}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === undefined
                                        ? ""
                                        : e.target.value;
                                    if (val && val !== "0") {
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
                                      values.fullDayRatesPayIn === undefined ||
                                      values.fullDayRatesPayIn === ""
                                        ? ""
                                        : parseFloat(
                                            values.fullDayRatesPayIn
                                          ).toFixed(2);
                                    setFieldValue("fullDayRatesPayIn", val);
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
                                  disabled={isFullDayRatePayIn || checkPco}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === undefined
                                        ? ""
                                        : e.target.value;
                                    if (val && val !== "0") {
                                      setIsMinHoursPayIn(true);
                                    } else {
                                      setIsMinHoursPayIn(false);
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
                                  name="projectABHRatePayIn"
                                  component={Input}
                                  label="Uplift of"
                                  type="number"
                                  step="any"
                                  disabled={isFlatRatePayIn || checkPco}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === undefined
                                        ? ""
                                        : e.target.value;
                                    if (val && val !== "0") {
                                      setIsUpliftPayIn(true);
                                    } else {
                                      setIsUpliftPayIn(false);
                                    }
                                    setFieldValue(
                                      "projectABHRatePayIn",
                                      e.target.value
                                    );
                                  }}
                                  onBlur={() => {
                                    const val =
                                      values.projectABHRatePayIn === null ||
                                      values.projectABHRatePayIn ===
                                        undefined ||
                                      values.projectABHRatePayIn === ""
                                        ? ""
                                        : parseFloat(
                                            values.projectABHRatePayIn
                                          ).toFixed(2);
                                    setFieldValue("projectABHRatePayIn", val);
                                    setFieldTouched(
                                      "projectABHRatePayIn",
                                      true
                                    );
                                  }}
                                />
                              </div>
                              <div className="col-12 col-md-4">
                                <Field
                                  name="projectOBHRatePayIn"
                                  component={Input}
                                  label="Flat rates/hour"
                                  type="number"
                                  step="any"
                                  disabled={isUpliftPayIn || checkPco}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === undefined
                                        ? ""
                                        : e.target.value;
                                    if (val && val !== "0") {
                                      setIsFlatRatePayIn(true);
                                    } else {
                                      setIsFlatRatePayIn(false);
                                    }
                                    setFieldValue(
                                      "projectOBHRatePayIn",
                                      e.target.value
                                    );
                                  }}
                                  onBlur={() => {
                                    const val =
                                      values.projectOBHRatePayIn === null ||
                                      values.projectOBHRatePayIn ===
                                        undefined ||
                                      values.projectOBHRatePayIn === ""
                                        ? ""
                                        : parseFloat(
                                            values.projectOBHRatePayIn
                                          ).toFixed(2);
                                    setFieldValue("projectOBHRatePayIn", val);
                                    setFieldTouched(
                                      "projectOBHRatePayIn",
                                      true
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
                                  disabled={isFlatRatePayInWeekend || checkPco}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === undefined
                                        ? ""
                                        : e.target.value;
                                    if (val && val !== "0") {
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
                                  disabled={isUpliftPayInWeekend || checkPco}
                                  onChange={(e) => {
                                    const val =
                                      e.target.value === null ||
                                      e.target.value === undefined
                                        ? ""
                                        : e.target.value;
                                    if (val && val !== "0") {
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
                                      values.weekendPayInFlatRate ===
                                        undefined ||
                                      values.weekendPayInFlatRate === ""
                                        ? ""
                                        : parseFloat(
                                            values.weekendPayInFlatRate
                                          ).toFixed(2);
                                    setFieldValue("weekendPayInFlatRate", val);
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
                                  name="projectPayInCurrencyId"
                                  component={AutoCompleteSelect}
                                  customOptions={{
                                    records: currencyMasterState?.entities,
                                    labelField: "currencyName",
                                    valueField: "id",
                                  }}
                                  isLoading={currencyMasterState?.listLoading}
                                  loadingMessage="Fetching records..."
                                  nonEditable={checkPco}
                                />
                              </div>
                              <div className="col-12 col-md-4 saveMobileBtn">
                                <Field
                                  name="projectPayInRemarks"
                                  component={TextArea}
                                  placeholder="Enter Pay In Remarks"
                                  disabled={checkPco}
                                  onChange={(e) => {
                                    setFieldValue(
                                      "projectPayInRemarks",
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

                            {values?.projectTaskUserId &&
                              values.projectTaskUserId !== 0 && (
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
                                      disabled={checkPco}
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
                                      disabled={checkPco}
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
                                      disabled={checkPco}
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
                                      disabled={checkPco}
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
                                        "projectRBHStartTiming",
                                        startTime
                                      );
                                      setFieldValue(
                                        "projectRBHEndTiming",
                                        endTime
                                      );
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
                                        "projectRBHStartTiming",
                                        startTime
                                      );
                                      setFieldValue(
                                        "projectRBHEndTiming",
                                        endTime
                                      );
                                    }
                                  }
                                  setFieldValue("payOutDayOption", day);
                                }}
                                nonEditable={checkPco}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="projectRBHStartTiming"
                                component={AntdTimePickerField}
                                label="Start Time"
                                placeholder="HH:MM"
                                disabled={checkPco}
                                // ampm={false}
                                // clearable
                                // format="HH:mm"
                              />
                            </div>
                          </div>
                          <div className="form-group row">
                            <div className="col-12 col-md-4 offset-md-3">
                              <Field
                                name="projectRBHEndTiming"
                                component={AntdTimePickerField}
                                label="End Time"
                                // ampm={false}
                                // clearable
                                placeholder="HH:MM"
                                disabled={checkPco}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="projectRBHRatePayOut"
                                component={Input}
                                label="Rates/hour"
                                type="number"
                                min="0"
                                step="any"
                                onBlur={() => {
                                  const val =
                                    values.projectRBHRatePayOut === null ||
                                    values.projectRBHRatePayOut === undefined ||
                                    values.projectRBHRatePayOut === ""
                                      ? ""
                                      : parseFloat(
                                          values.projectRBHRatePayOut
                                        ).toFixed(2);
                                  setFieldValue("projectRBHRatePayOut", val);
                                  setFieldTouched("projectRBHRatePayOut", true);
                                }}
                                disabled={checkPco}
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
                                disabled={isMinHours || checkPco}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === undefined
                                      ? ""
                                      : e.target.value;
                                  if (val && val !== "0") {
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
                                    values.fullDayRatesPayOut === undefined ||
                                    values.fullDayRatesPayOut === ""
                                      ? ""
                                      : parseFloat(
                                          values.fullDayRatesPayOut
                                        ).toFixed(2);
                                  setFieldValue("fullDayRatesPayOut", val);
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
                                disabled={isFullDayRate || checkPco}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === undefined
                                      ? ""
                                      : e.target.value;
                                  if (val && val !== "0") {
                                    setIsMinHours(true);
                                  } else {
                                    setIsMinHours(false);
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
                              className="col-12 col-md-3 "
                              style={{ marginBlock: "auto" }}
                            >
                              <label className="justify-content-start">
                                OBH Rates
                              </label>
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="projectABHRatePayOut"
                                component={Input}
                                label="Uplift of"
                                type="number"
                                step="any"
                                disabled={isFlatRate || checkPco}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === undefined
                                      ? ""
                                      : e.target.value;
                                  if (val && val !== "0") {
                                    setIsUplift(true);
                                  } else {
                                    setIsUplift(false);
                                  }
                                  setFieldValue(
                                    "projectABHRatePayOut",
                                    e.target.value
                                  );
                                }}
                                onBlur={() => {
                                  const val =
                                    values.projectABHRatePayOut === null ||
                                    values.projectABHRatePayOut === undefined ||
                                    values.projectABHRatePayOut === ""
                                      ? ""
                                      : parseFloat(
                                          values.projectABHRatePayOut
                                        ).toFixed(2);
                                  setFieldValue("projectABHRatePayOut", val);
                                  setFieldTouched("projectABHRatePayOut", true);
                                }}
                              />
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="projectOBHRatePayOut"
                                component={Input}
                                label="Flat rates/hour"
                                type="number"
                                step="any"
                                disabled={isUplift || checkPco}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === undefined
                                      ? ""
                                      : e.target.value;

                                  if (val && val !== "0") {
                                    setIsFlatRate(true);
                                  } else {
                                    setIsFlatRate(false);
                                  }
                                  setFieldValue(
                                    "projectOBHRatePayOut",
                                    e.target.value
                                  );
                                }}
                                onBlur={() => {
                                  const val =
                                    values.projectOBHRatePayOut === null ||
                                    values.projectOBHRatePayOut === undefined ||
                                    values.projectOBHRatePayOut === ""
                                      ? 0
                                      : parseFloat(
                                          values.projectOBHRatePayOut
                                        ).toFixed(2);
                                  setFieldValue("projectOBHRatePayOut", val);
                                  setFieldTouched("projectOBHRatePayOut", true);
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
                                disabled={isFlatRateWeekend || checkPco}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === undefined
                                      ? ""
                                      : e.target.value;
                                  if (val && val !== "0") {
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
                                disabled={isUpliftWeekend || checkPco}
                                onChange={(e) => {
                                  const val =
                                    e.target.value === null ||
                                    e.target.value === undefined
                                      ? ""
                                      : e.target.value;
                                  if (val && val !== "0") {
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
                                    values.weekendPayOutFlatRate ===
                                      undefined ||
                                    values.weekendPayOutFlatRate === ""
                                      ? ""
                                      : parseFloat(
                                          values.weekendPayOutFlatRate
                                        ).toFixed(2);
                                  setFieldValue("weekendPayOutFlatRate", val);
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
                              className="col-12 col-md-3 "
                              style={{ marginBlock: "auto" }}
                            >
                              <label className="justify-content-start">
                                Currency
                              </label>
                            </div>
                            <div className="col-12 col-md-4">
                              <Field
                                name="projectPayOutCurrencyId"
                                component={AutoCompleteSelect}
                                customOptions={{
                                  records: currencyMasterState?.entities,
                                  labelField: "currencyName",
                                  valueField: "id",
                                }}
                                isLoading={currencyMasterState?.listLoading}
                                loadingMessage="Fetching records..."
                                nonEditable={checkPco}
                              />
                            </div>
                            <div className="col-12 col-md-4 saveMobileBtn">
                              <Field
                                name="projectPayOutRemarks"
                                component={TextArea}
                                placeholder="Enter Payout Remarks"
                                disabled={checkPco}
                                onChange={(e) => {
                                    setFieldValue(
                                      "projectPayOutRemarks",
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

                          {values?.projectTaskUserId &&
                            values.projectTaskUserId !== 0 && (
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
                                    name="travelChargesPayOut"
                                    component={Input}
                                    placeholder="Enter Travel"
                                    label="Travel"
                                    type="number"
                                    step="any"
                                    disabled={checkPco}
                                  />
                                </div>
                                <div className="col-12 col-md-4">
                                  <Field
                                    name="materialChargesPayOut"
                                    component={Input}
                                    placeholder="Enter Material"
                                    label="Material"
                                    type="number"
                                    step="any"
                                    disabled={checkPco}
                                  />
                                </div>
                                <div className="col-12 col-md-4 offset-md-3">
                                  <Field
                                    name="parkingChargesPayOut"
                                    component={Input}
                                    placeholder="Enter Parking"
                                    label="Parking"
                                    type="number"
                                    step="any"
                                    disabled={checkPco}
                                  />
                                </div>
                                <div className="col-12 col-md-4">
                                  <Field
                                    name="otherChargesPayOut"
                                    component={Input}
                                    placeholder="Enter Other"
                                    label="Other"
                                    type="number"
                                    step="any"
                                    disabled={checkPco}
                                  />
                                </div>
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="form-group row">
                        <div className="col-12">
                          <label className="justify-content-start">
                            Scope Of Work{isDanger}
                          </label>
                        </div>

                        <div className="col-12">
                          <Field
                            name="scopeOfWork"
                            component={HTMLEditorField}
                            isrequired
                            readOnly={checkPco}
                          />
                        </div>
                        {/* {validationError ?
                          <div style={{ color: 'red', paddingBottom: '15px' }}>
                            {validationError}
                          </div>
                          : null
                        } */}
                      </div>

                      <div className="form-group row">
                        <div className="col-12">
                          <label className="justify-content-start">
                            Project Description{isDanger}
                          </label>
                        </div>
                        <div className="col-12">
                          <Field
                            name="projectDescription"
                            component={HTMLEditorField}
                            isrequired
                            readOnly={checkPco}
                          />
                        </div>
                      </div>
                    </>
                  ),
                },
              ]}
            />

            {!checkPco ? (
              <button
                type="submit"
                style={{ display: "none" }}
                ref={submitBtnRef}
                onSubmit={() => handleSubmit()}
                onClick={() => setErrorOnSumit(true)}
              />
            ) : null}
            <button
              type="reset"
              style={{ display: "none" }}
              ref={resetBtnRef}
              onSubmit={() => handleReset()}
            />
            <ErrorFocus />
          </Form>
          {checkPco ? (
            <button
              style={{ display: "none" }}
              ref={submitBtnRef}
              onClick={() => checkSubmitt()}
            />
          ) : null}
        </div>
      )}
    </Formik>
  );
};

export default EditForm;