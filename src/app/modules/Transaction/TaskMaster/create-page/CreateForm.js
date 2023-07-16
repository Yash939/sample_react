import React, { useEffect, useMemo, useState } from "react";
import { Formik, Form, Field } from "formik";
import {
  AutoCompleteMultiSelect,
  AutoCompleteSelect,
  Input,
  Switch,
  TextArea,
} from "../../../../../_metronic/_partials/controls";
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
// import { taskMasterActions } from '../_redux/TaskMasterRedux';
import { taskStatusMasterActions } from "../../../Masters/TaskStatusMaster/_redux/TaskStatusMasterRedux";
import { taskPriorityMasterActions } from "../../../Masters/TaskPriorityMaster/_redux/TaskPriorityMasterRedux";
import TabularView from "../../../_commons/components/TabularView";
import { countryMasterActions } from "../../../Masters/CountryMaster/_redux/CountryMasterRedux";
import { stateMasterActions } from "../../../Masters/StateMaster/_redux/StateMasterRedux";
import { cityMasterActions } from "../../../Masters/CityMaster/_redux/CityMasterRedux";
import { currencyMasterActions } from "../../../Masters/CurrencyMaster/_redux/CurrencyMasterRedux";
import { engineerMasterActions } from "../../../Masters/EngineerMaster/_redux/EngineerMasterRedux";
import { projectMasterActions } from "../../ProjectMaster/_redux/ProjectMasterRedux";
import { HTMLEditorField } from "../../../../../_metronic/_partials/controls/forms/HTMLEditorField";
import { organizationMasterActions } from "../../../Masters/OrganizationMaster/_redux/OrganizationMasterRedux";
import { userMasterActions } from "../../../Masters/UserStaff/UserMaster/_redux/UserMasterRedux";
import moment from "moment";
import { reducerInfo, taskMasterActions } from "../_redux/TaskMasterRedux";
import {
  getErrors,
  isValidCurrency,
  isValidNumber,
  isValidZipCode,
  setTimeForDate,
  sortArray,
  useLoggedInUserRoleCode,
} from "../../../_commons/Utils";
import tz_lookup from "tz-lookup";
import { convertFromRaw, EditorState } from "draft-js";
import EngineerModal from "../EngineerModal";
import { taskAttachmentActions } from "../_redux/TaskAttachmentRedux";
import ErrorFocus from "../../../_commons/ErrorFocus";
import { AntdDateTimePickerField } from "../../../../../_metronic/_partials/controls/forms/AntdDateTimePickerField";
import { AntdTimePickerField } from "../../../../../_metronic/_partials/controls/forms/AntdTimePickerField";
import { useHistory } from "react-router-dom";
import { toAbsoluteUrl } from "../../../../../_metronic/_helpers";
import SVG from "react-inlinesvg";
import { components } from "react-select";
import { useDropzone } from "react-dropzone";
import { AutoCompleteSelectWindow } from "../../../../../_metronic/_partials/controls/forms/AutoCompleteSelectWindow";

const isDanger = <span className="text-danger font-weight-bold">*</span>;

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

const CreateForm = ({
  enitity,
  saveRecord,
  submitBtnRef,
  resetBtnRef,
  hiddenId,
}) => {
  const dispatch = useDispatch();
  const history = useHistory();

  // const [isCordinator, setIsCordinator] = useState(false)
  // const [isManager, setIsManager] = useState(false)
  const [isBranchSelected, setIsBranchSelected] = useState(false);
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
  const [validationError, setValidationError] = useState("");
  const [loading, setLoading] = useState(false);
  const roleCode = useLoggedInUserRoleCode();
  const [modal, setModal] = useState(false);
  const [attachmentState, setAttachmentState] = useState([]);
  const [attachmentStateCount, setAttachmentStateCount] = useState(0);
  const [filestoBeDeleted, setFilestoBeDeleted] = useState([]);
  const [projectPayOutRate, setProjectPayOutRate] = useState(0);
  const [projectPayOutCurrencyId, setProjectPayOutCurrencyId] = useState(0);
  const [errorOnSumit, setErrorOnSumit] = useState(false);

  const [remarksCharCount, setRemarksCharCount] = useState({
    payIn: 0,
    payOut: 0,
  });

  const {
    currentState,
    taskStatusMasterState,
    taskPriorityMasterState,
    organizationMasterState,
    countryMasterState,
    stateMasterState,
    cityMasterState,
    currencyMasterState,
    projectMasterState,
    userMasterState,
    engineerMasterState,
    authState,
  } = useSelector(
    (state) => ({
      currentState: state.taskMaster,
      taskStatusMasterState: state.taskStatusMaster,
      taskPriorityMasterState: state.taskPriorityMaster,
      organizationMasterState: state.organizationMaster,
      countryMasterState: state.countryMaster,
      stateMasterState: state.stateMaster,
      cityMasterState: state.cityMaster,
      currencyMasterState: state.currencyMaster,
      projectMasterState: state.projectMaster,
      userMasterState: state.userMaster,
      engineerMasterState: state.engineerMaster,
      authState: state.auth,
    }),
    shallowEqual
  );

  useEffect(() => {
    document.title = "Create Ticket";
    // if (currentState.totalCount === 0 && !currentState.listLoading && !currentState.error) {
    //     dispatch(taskMasterActions.getAll())
    // }
    dispatch(taskStatusMasterActions.getAllActive());
    dispatch(taskPriorityMasterActions.getAllActive());
    dispatch(countryMasterActions.getAllActive());
    // dispatch(stateMasterActions.getAllActive())
    // dispatch(cityMasterActions.getAllActive())
    dispatch(currencyMasterActions.getAllActive());
    dispatch(projectMasterActions.getAllActive());
    dispatch(organizationMasterActions.getAllActive());
    dispatch(userMasterActions.getAllActive());
    dispatch(engineerMasterActions.getAllActive());
  }, []);

  let taskTypes = [];
  if (roleCode.includes("admin") || roleCode.includes("pm")) {
  taskTypes = [
    { label: "Onsite", value: 1 },
    { label: "Remote", value: 2 },
    { label: "HW Procurement", value: 3 },
  ];
}
else
{
  taskTypes = [
    { label: "Onsite", value: 1 },
    { label: "Remote", value: 2 },
  ];
}

  const dayOption = [
    { label: "Full Day", value: "fullday" },
    { label: "Half Day", value: "halfday" },
  ];

  Yup.addMethod(Yup.mixed, "isValidSOW", isValidSOW);
  Yup.addMethod(Yup.mixed, "isValidZipCode", isValidZipCode);
  Yup.addMethod(Yup.mixed, "isValidNumber", isValidNumber);
  Yup.addMethod(Yup.mixed, "isValidCurrency", isValidCurrency);

  //code unique validation
  const editId = currentState?.entityForEdit?.id ?? 0;
  const contactRegExp = /^[\d ()+-]+$/;
  const validationSchema = useMemo(() => {
    return Yup.object().shape({
      taskStatusMSTId: Yup.number().min(1, "Ticket Status Required"),
      organizationMSTId: Yup.number().min(1, "Customer Required"),
      countryMSTId: Yup.number().min(1, "Country Required"),
      cityMSTId: Yup.number().min(1, "City Required"),
      localContactPhone: Yup.string()
        .nullable()
        .matches(contactRegExp, "Invalid Local Contact Phone"),
      planDateTime: Yup.string()
        .nullable()
        .required("Plan Date - Time Required"),
      scopeOfWork: Yup.mixed().isValidSOW("Scope of Work Required"),
      zipCode: Yup.mixed().isValidZipCode(
        Yup.ref("countryCode"),
        "Invalid Zip Code"
      ),
      projectMSTId: Yup.number().min(1, "Project Required"),
      rbhPayoutRate: Yup.mixed().isValidNumber(
        Yup.ref("engineersList"),
        "Rate"
      ),
      abhPayoutRate: Yup.mixed().isValidNumber(
        Yup.ref("engineersList"),
        "Uplift of"
      ),
      obhPayoutRate: Yup.mixed().isValidNumber(
        Yup.ref("engineersList"),
        "Flat Rate"
      ),
      // rbhPayinRate: Yup.mixed().isValidNumber(Yup.ref('engineersList'), 'Rate'),
      // abhPayinRate: Yup.mixed().isValidNumber(Yup.ref('engineersList'), 'Uplift of'),
      // obhPayinRate: Yup.mixed().isValidNumber(Yup.ref('engineersList'), 'Flat Rate'),
      // weekendPayInMultiplier: Yup.mixed().isValidNumber(Yup.ref('engineersList'), "Uplift of"),
      // weekendPayInFlatRate: Yup.mixed().isValidNumber(Yup.ref('engineersList'), "Flat Rate"),
      weekendPayOutMultiplier: Yup.mixed().isValidNumber(
        Yup.ref("engineersList"),
        "Uplift of"
      ),
      weekendPayOutFlatRate: Yup.mixed().isValidNumber(
        Yup.ref("engineersList"),
        "Flat Rate"
      ),
      // travelChargesPayIn: Yup.mixed().isValidNumber(Yup.ref('noRef'), 'Travel Charges'),
      // materialChargesPayIn: Yup.mixed().isValidNumber(Yup.ref('noRef'), 'Material Charges'),
      // parkingChargesPayIn: Yup.mixed().isValidNumber(Yup.ref('noRef'), 'Parking Charges'),
      // otherChargesPayIn: Yup.mixed().isValidNumber(Yup.ref('noRef'), 'Other Charges'),
      travelCharges: Yup.mixed().isValidNumber(
        Yup.ref("noRef"),
        "Travel Charges"
      ),
      materialCharges: Yup.mixed().isValidNumber(
        Yup.ref("noRef"),
        "Material Charges"
      ),
      parkingCharges: Yup.mixed().isValidNumber(
        Yup.ref("noRef"),
        "Parking Charges"
      ),
      otherCharges: Yup.mixed().isValidNumber(
        Yup.ref("noRef"),
        "Other Charges"
      ),
      // minHoursPayIn: Yup.mixed().isValidNumber(Yup.ref('engineersList'), 'Min Hours'),
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
        .isValidNumber(Yup.ref("engineersList"), "Min Hours")
        .test("max-check", "Min Hours should be 8 or less", (val) => {
          if (val && val !== "" && val !== undefined) {
            if (parseFloat(val) > 8) {
              return false;
            }
          }
          return true;
        }),
      // fullDayRatesPayIn: Yup.mixed().isValidNumber(Yup.ref('engineersList'), 'Full Day Rates'),
      fullDayRatesPayOut: Yup.mixed().isValidNumber(
        Yup.ref("engineersList"),
        "Full Day Rates"
      ),
      summary: Yup.string()
        .nullable()
        .required("Ticket Summary Required")
        .max(100, "Must not exceed 100 characters"),
      payOutRemarks: Yup.string()
        .nullable()
        .max(500, "Pay Out Remarks: Must not exceed 500 characters"),
      payInRemarks: Yup.string()
        .nullable()
        .max(500, "Pay In Remarks: Must not exceed 500 characters"),
      payOutCurrencyId: Yup.mixed().isValidCurrency(
        Yup.ref("engineersList"),
        "Currency"
      ),
      // payInCurrencyId: Yup.mixed().isValidCurrency(Yup.ref('engineersList'), 'Currency'),
    });
  }, [currentState.entities, editId]);

  const openEngineerModal = () => {
    const modal = <EngineerModal closeModalHandler={() => setModal(null)} />;
    setModal(modal);
  };

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

  const handleUploadAttachments = (e) => {
    const files = e.target.files;

    if (attachmentState?.length + files.length > 20) {
      alert("You can't upload more than 20 files!!!");
      e.target.value = "";
      return;
    }
    let tmp = [];
    let currentCount = attachmentStateCount;

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
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

  const Option = (props) => {
    return (
      <div>
        <components.Option {...props}>
          <input
            type="checkbox"
            checked={props.isSelected}
            onChange={() => null}
          />{" "}
          <label>{props.label}</label>
        </components.Option>
      </div>
    );
  };

  const getGenericTabs = (
    setFieldValue,
    values,
    setFieldError,
    setFieldTouched,
    handleSubmit
  ) => {
    return [
      {
        key: "details",
        title: "Ticket Details",
        content: (
          <>
            <div className="form-group row">
              <div className="col-12 col-md-3 ">
                <Field
                  name="organizationMSTId"
                  label="Customer"
                  component={AutoCompleteSelect}
                  customOptions={{
                    records: organizationMasterState?.entities,
                    labelField: "organizationName",
                    valueField: "id",
                  }}
                  isrequired
                  isLoading={organizationMasterState?.listLoading}
                  loadingMessage="Fetching records..."
                  placeholder="Select Customer"
                  onChange={(option) => {
                    const id = option?.value ?? null;
                    setFieldValue("projectBranchDTLId", 0);
                    setFieldValue("projectMSTId", 0);
                    setFieldValue("countryMSTId", 0);
                    setFieldValue("countryCode", null);
                    setFieldValue("stateMSTId", 0);
                    setFieldValue("cityMSTId", 0);
                    setFieldValue("zipCode", "");
                    setFieldValue("address", "");
                    setIsBranchSelected(false);
                    setFieldValue("organizationMSTId", id);
                  }}
                />
              </div>
              <div className="col-12 col-md-3">
                <Field
                  name="projectMSTId"
                  component={AutoCompleteSelect}
                  label="Project"
                  customOptions={{
                    records: projectMasterState?.entities
                      ?.filter(
                        (x) =>
                          x.projectStatusType === "ACTIVE" &&
                          x.organizationMSTId === values.organizationMSTId
                      )
                      ?.map((x) => ({
                        ...x,
                        active: x.projectStatusType === "ACTIVE",
                      })),
                    labelField: "projectName",
                    valueField: "id",
                  }}
                  isLoading={projectMasterState?.listLoading}
                  loadingMessage="Fetching records..."
                  placeholder="Select Project"
                  isrequired
                  onChange={(option) => {
                    const projectMSTId = option?.value ?? null;
                    dispatch(projectMasterActions.getById(projectMSTId)).then(
                      (res) => {
                        let projectMST = { ...res };
                        if (projectMST) {
                          if (
                            projectMST?.projectTaskUserId &&
                            values?.countryMSTId ===
                              projectMST?.projectTaskUser?.countryMSTId
                          ) {
                            setFieldValue(
                              "taskUserId",
                              projectMST?.projectTaskUserId
                            );
                            let engData = engineerMasterState?.entities?.filter(
                              (x) => x.id === projectMST?.projectTaskUserId
                            )?.[0];
                            let tmpList = [
                              {
                                value: engData?.id,
                                label: engData?.engineerName,
                              },
                            ];
                            setFieldValue("engineersList", tmpList);
                          }

                          projectMST.projectRBHStartTiming = projectMST.projectRBHStartTiming
                            ? moment(
                                projectMST.projectRBHStartTiming,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectOBHStartTiming = projectMST.projectOBHStartTiming
                            ? moment(
                                projectMST.projectOBHStartTiming,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectABHStartTiming = projectMST.projectABHStartTiming
                            ? moment(
                                projectMST.projectABHStartTiming,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectOBHEndTiming = projectMST.projectOBHEndTiming
                            ? moment(
                                projectMST.projectOBHEndTiming,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectRBHEndTiming = projectMST.projectRBHEndTiming
                            ? moment(
                                projectMST.projectRBHEndTiming,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectABHEndTiming = projectMST.projectABHEndTiming
                            ? moment(
                                projectMST.projectABHEndTiming,
                                "HH:mm"
                              ).toDate()
                            : null;

                          projectMST.projectRBHStartTimingPayIn = projectMST.projectRBHStartTimingPayIn
                            ? moment(
                                projectMST.projectRBHStartTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectOBHStartTimingPayIn = projectMST.projectOBHStartTimingPayIn
                            ? moment(
                                projectMST.projectOBHStartTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectABHStartTimingPayIn = projectMST.projectABHStartTimingPayIn
                            ? moment(
                                projectMST.projectABHStartTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectOBHEndTimingPayIn = projectMST.projectOBHEndTimingPayIn
                            ? moment(
                                projectMST.projectOBHEndTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectRBHEndTimingPayIn = projectMST.projectRBHEndTimingPayIn
                            ? moment(
                                projectMST.projectRBHEndTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectABHEndTimingPayIn = projectMST.projectABHEndTimingPayIn
                            ? moment(
                                projectMST.projectABHEndTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;

                          setFieldValue(
                            "projectCoOrdinatorId",
                            projectMST?.projectCoordinatorId
                          );
                          setFieldValue(
                            "projectManagerId",
                            projectMST?.projectManagerId
                          );
                          setFieldValue(
                            "rbhStartTiming",
                            projectMST?.projectRBHStartTiming
                              ? moment(
                                  projectMST.projectRBHStartTiming,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "rbhEndTiming",
                            projectMST?.projectRBHEndTiming
                              ? moment(
                                  projectMST.projectRBHEndTiming,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "obhStartTiming",
                            projectMST?.projectOBHStartTiming
                              ? moment(
                                  projectMST.projectOBHStartTiming,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "obhEndTiming",
                            projectMST?.projectOBHEndTiming
                              ? moment(
                                  projectMST.projectOBHEndTiming,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "abhStartTiming",
                            projectMST?.projectABHStartTiming
                              ? moment(
                                  projectMST.projectABHStartTiming,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "abhEndTiming",
                            projectMST?.projectABHEndTiming
                              ? moment(
                                  projectMST.projectABHEndTiming,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "rbhStartTimingPayIn",
                            projectMST?.projectRBHStartTimingPayIn
                              ? moment(
                                  projectMST.projectRBHStartTimingPayIn,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "rbhEndTimingPayIn",
                            projectMST?.projectRBHEndTimingPayIn
                              ? moment(
                                  projectMST.projectRBHEndTimingPayIn,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "obhStartTimingPayIn",
                            projectMST?.projectOBHStartTimingPayIn
                              ? moment(
                                  projectMST.projectOBHStartTimingPayIn,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "obhEndTimingPayIn",
                            projectMST?.projectOBHEndTimingPayIn
                              ? moment(
                                  projectMST.projectOBHEndTimingPayIn,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "abhStartTimingPayIn",
                            projectMST?.projectABHStartTimingPayIn
                              ? moment(
                                  projectMST.projectABHStartTimingPayIn,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "abhEndTimingPayIn",
                            projectMST?.projectABHEndTimingPayIn
                              ? moment(
                                  projectMST.projectABHEndTimingPayIn,
                                  "HH:mm"
                                ).toDate()
                              : null
                          );
                          setFieldValue(
                            "rbhPayoutRate",
                            projectMST?.projectRBHRatePayOut ?? ""
                          );
                          setFieldValue(
                            "rbhPayinRate",
                            projectMST?.projectRBHRatePayIn ?? ""
                          );
                          setFieldValue(
                            "obhPayoutRate",
                            projectMST?.projectOBHRatePayOut ?? ""
                          );
                          setFieldValue(
                            "obhPayinRate",
                            projectMST?.projectOBHRatePayIn ?? ""
                          );
                          setFieldValue(
                            "abhPayoutRate",
                            projectMST?.projectABHRatePayOut ?? ""
                          );
                          setFieldValue(
                            "abhPayinRate",
                            projectMST?.projectABHRatePayIn ?? ""
                          );
                          setFieldValue(
                            "payOutCurrencyId",
                            projectMST?.projectPayOutCurrencyId
                          );
                          setFieldValue(
                            "payInCurrencyId",
                            projectMST?.projectPayInCurrencyId
                          );
                          setFieldValue(
                            "payOutRemarks",
                            projectMST?.projectPayOutRemarks
                          );
                          setFieldValue(
                            "payInRemarks",
                            projectMST?.projectPayInRemarks
                          );
                          setFieldValue(
                            "weekendPayInFlatRate",
                            projectMST?.weekendPayInFlatRate ?? ""
                          );
                          setFieldValue(
                            "weekendPayInMultiplier",
                            projectMST?.weekendPayInMultiplier ?? ""
                          );
                          setFieldValue(
                            "weekendPayOutFlatRate",
                            projectMST?.weekendPayOutFlatRate ?? ""
                          );
                          setFieldValue(
                            "weekendPayOutMultiplier",
                            projectMST?.weekendPayOutMultiplier ?? ""
                          );
                          setFieldValue(
                            "travelCharges",
                            projectMST?.travelChargesPayOut ?? ""
                          );
                          setFieldValue(
                            "materialCharges",
                            projectMST?.materialChargesPayOut ?? ""
                          );
                          setFieldValue(
                            "parkingCharges",
                            projectMST?.parkingChargesPayOut ?? ""
                          );
                          setFieldValue(
                            "otherCharges",
                            projectMST?.otherChargesPayOut ?? ""
                          );
                          setFieldValue(
                            "travelChargesPayIn",
                            projectMST?.travelChargesPayIn ?? ""
                          );
                          setFieldValue(
                            "materialChargesPayIn",
                            projectMST?.materialChargesPayIn ?? ""
                          );
                          setFieldValue(
                            "parkingChargesPayIn",
                            projectMST?.parkingChargesPayIn ?? ""
                          );
                          setFieldValue(
                            "otherChargesPayIn",
                            projectMST?.otherChargesPayIn ?? ""
                          );
                          setFieldValue(
                            "minHoursPayOut",
                            projectMST.minHoursPayOut === "" ||
                              projectMST.minHoursPayOut === null ||
                              projectMST.minHoursPayOut === undefined
                              ? ""
                              : projectMST?.minHoursPayOut / 60
                          );
                          setFieldValue(
                            "minHoursPayIn",
                            projectMST.minHoursPayIn === "" ||
                              projectMST.minHoursPayIn === null ||
                              projectMST.minHoursPayIn === undefined
                              ? ""
                              : projectMST?.minHoursPayIn / 60
                          );
                          setFieldValue(
                            "fullDayRatesPayIn",
                            projectMST?.fullDayRatesPayIn ?? ""
                          );
                          setFieldValue(
                            "fullDayRatesPayOut",
                            projectMST?.fullDayRatesPayOut ?? ""
                          );
                          setFieldValue(
                            "payInDayOption",
                            projectMST?.payInDayOption
                          );
                          setFieldValue(
                            "payOutDayOption",
                            projectMST?.payOutDayOption
                          );
                          setFieldValue(
                            "projectBranchDTLList",
                            projectMST?.projectBranchDTLList
                          );
                          setProjectPayOutCurrencyId(
                            projectMST?.projectPayOutCurrencyId
                          );
                          setProjectPayOutRate(
                            projectMST?.projectRBHRatePayOut ?? ""
                          );

                          if (projectMST?.projectABHRatePayIn) {
                            setIsUpliftPayIn(true);
                          } else {
                            setIsUpliftPayIn(false);
                          }

                          if (projectMST?.projectABHRatePayOut) {
                            setIsUplift(true);
                          } else {
                            setIsUplift(false);
                          }

                          if (projectMST?.projectOBHRatePayOut) {
                            setIsFlatRate(true);
                          } else {
                            setIsFlatRate(false);
                          }

                          if (projectMST?.projectOBHRatePayIn) {
                            setIsFlatRatePayIn(true);
                          } else {
                            setIsFlatRatePayIn(false);
                          }

                          if (projectMST?.weekendPayInFlatRate) {
                            setIsFlatRatePayInWeekend(true);
                          } else {
                            setIsFlatRatePayInWeekend(false);
                          }

                          if (projectMST?.weekendPayInMultiplier) {
                            setIsUpliftPayInWeekend(true);
                          } else {
                            setIsUpliftPayInWeekend(false);
                          }

                          if (projectMST?.weekendPayOutFlatRate) {
                            setIsFlatRateWeekend(true);
                          } else {
                            setIsFlatRateWeekend(false);
                          }

                          if (projectMST?.weekendPayOutMultiplier) {
                            setIsUpliftWeekend(true);
                          } else {
                            setIsUpliftWeekend(false);
                          }

                          if (projectMST?.fullDayRatesPayIn) {
                            setIsFullDayRatePayIn(true);
                          } else {
                            setIsFullDayRatePayIn(false);
                          }

                          if (projectMST?.fullDayRatesPayOut) {
                            setIsFullDayRate(true);
                          } else {
                            setIsFullDayRate(false);
                          }

                          if (projectMST?.minHoursPayIn) {
                            setIsMinHoursPayIn(true);
                          } else {
                            setIsMinHoursPayIn(false);
                          }

                          if (projectMST?.minHoursPayOut) {
                            setIsMinHours(true);
                          } else {
                            setIsMinHours(false);
                          }
                        } else {
                          setFieldValue("taskUserId", 0);
                          setFieldValue("projectCoOrdinatorId", 0);
                          setFieldValue("projectManagerId", 0);
                          setFieldValue("rbhStartTiming", null);
                          setFieldValue("rbhEndTiming", null);
                          setFieldValue("obhStartTiming", null);
                          setFieldValue("obhEndTiming", null);
                          setFieldValue("abhStartTiming", null);
                          setFieldValue("abhEndTiming", null);
                          setFieldValue("rbhStartTimingPayIn", null);
                          setFieldValue("rbhEndTimingPayIn", null);
                          setFieldValue("obhStartTimingPayIn", null);
                          setFieldValue("obhEndTimingPayIn", null);
                          setFieldValue("abhStartTimingPayIn", null);
                          setFieldValue("abhEndTimingPayIn", null);
                          setFieldValue("rbhPayoutRate", 0);
                          setFieldValue("rbhPayinRate", 0);
                          setFieldValue("obhPayoutRate", 0);
                          setFieldValue("obhPayinRate", 0);
                          setFieldValue("abhPayoutRate", 0);
                          setFieldValue("abhPayinRate", 0);
                          setFieldValue("payOutCurrencyId", 0);
                          setFieldValue("payInCurrencyId", 0);
                          setFieldValue("payOutRemarks", "");
                          setFieldValue("payInRemarks", "");
                          setFieldValue("weekendPayInFlatRate", "");
                          setFieldValue("weekendPayInMultiplier", "");
                          setFieldValue("weekendPayOutFlatRate", "");
                          setFieldValue("weekendPayOutMultiplier", "");
                          setFieldValue("travelCharges", "");
                          setFieldValue("materialCharges", "");
                          setFieldValue("parkingCharges", "");
                          setFieldValue("otherCharges", "");
                          setFieldValue("travelChargesPayIn", "");
                          setFieldValue("materialChargesPayIn", "");
                          setFieldValue("parkingChargesPayIn", "");
                          setFieldValue("otherChargesPayIn", "");
                          setFieldValue("minHoursPayOut", "");
                          setFieldValue("minHoursPayIn", "");
                          setFieldValue("fullDayRatesPayIn", "");
                          setFieldValue("fullDayRatesPayOut", "");
                          setFieldValue("payInDayOption", "");
                          setFieldValue("payOutDayOption", "");
                          setFieldValue("projectBranchDTLList", []);
                          setProjectPayOutCurrencyId(0);
                          setProjectPayOutRate(0);
                        }
                      }
                    );

                    setIsBranchSelected(false);
                    setFieldValue("projectMSTId", projectMSTId);
                  }}
                  setDefault={false}
                  // noOptionsMessage={() => 'No active projects found, Please create project!'}
                />
              </div>
              <div className="col-12 col-md-3">
                <Field
                  name="projectBranchDTLId"
                  component={AutoCompleteSelect}
                  label="Project Branch"
                  customOptions={{
                    records: sortArray(
                      values?.projectBranchDTLList ?? [],
                      "id"
                    ),
                    labelField: "branchName",
                    valueField: "id",
                  }}
                  placeholder="Select Branch"
                  onChange={(option) => {
                    const id = option?.value ?? null;

                    if (id) {
                      const branchData = values?.projectBranchDTLList?.find(
                        (x) => x.id === id
                      );
                      setFieldValue(
                        "countryMSTId",
                        branchData?.countryMSTId ?? 0
                      );
                      setFieldValue("stateMSTId", branchData?.stateMSTId ?? 0);
                      setFieldValue("cityMSTId", branchData?.cityMSTId ?? 0);
                      setFieldValue("zipCode", branchData?.zipCode);
                      setFieldValue("address", branchData?.address);
                      let countryCode = countryMasterState?.entities?.filter(
                        (x) => x.id === branchData?.countryMSTId ?? 0
                      )?.[0]?.countryCode;
                      setFieldValue("countryCode", countryCode);
                      dispatch(
                        stateMasterActions.getByCountry(
                          branchData?.countryMSTId
                        )
                      );
                      if (branchData?.stateMSTId) {
                        dispatch(
                          cityMasterActions.getByCountryAndState(
                            branchData?.countryMSTId,
                            branchData?.stateMSTId
                          )
                        );
                      } else {
                        dispatch(
                          cityMasterActions.getByCountry(
                            branchData?.countryMSTId
                          )
                        );
                      }
                      setIsBranchSelected(true);
                    } else {
                      setFieldValue("countryMSTId", 0);
                      setFieldValue("countryCode", null);
                      setFieldValue("stateMSTId", 0);
                      setFieldValue("cityMSTId", 0);
                      setFieldValue("zipCode", "");
                      setFieldValue("address", "");
                      setFieldValue("selectedProjectBranch", {});
                      setIsBranchSelected(false);
                    }
                    setFieldValue("projectBranchDTLId", id);
                  }}
                />
              </div>
              <div className="col-12 col-md-3">
                <Field
                  name="externalCustomer"
                  label="End Customer"
                  component={Input}
                  placeholder="Enter End Customer"
                />
              </div>
            </div>

            <div className="form-group row">
              <div className="col-12 col-md-3">
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
                    let countryCode = countryMasterState?.entities?.filter(
                      (x) => x.id === countryMSTId
                    )?.[0]?.countryCode;
                    setFieldValue("countryCode", countryCode);
                    dispatch(stateMasterActions.getByCountry(countryMSTId));
                    dispatch(cityMasterActions.getByCountry(countryMSTId));
                    setFieldValue("countryMSTId", countryMSTId);
                  }}
                  nonEditable={isBranchSelected}
                />
              </div>
              <div className="col-12 col-md-3">
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
                    setFieldValue("stateMSTId", stateMSTId);
                  }}
                  nonEditable={isBranchSelected}
                />
              </div>
              <div className="col-12 col-md-3">
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
                    setFieldValue("cityMSTId", option?.value ?? null);
                  }}
                  nonEditable={isBranchSelected}
                />
              </div>
              <div className="col-12 col-md-3">
                <Field
                  name="address"
                  label="Address"
                  component={TextArea}
                  placeholder="Enter Address"
                  disabled={isBranchSelected}
                  // isrequired
                />
              </div>
            </div>

            <div className="form-group row">
              <div className="col-12 col-md-3">
                <Field
                  name="zipCode"
                  label="Zip Code"
                  component={Input}
                  placeholder="Enter Zip Code"
                  // isrequired
                  disabled={isBranchSelected}
                />
              </div>

              <div className="col-12 col-md-3">
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
                  isLoading={userMasterState?.listLoading}
                  loadingMessage="Fetching records..."
                  label="Project Co-ordinator"
                  placeholder="Select Co-ordinator"
                  // isrequired
                />
              </div>
              <div className="col-12 col-md-3">
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
                  placeholder="Select Project Manager"
                  // isrequired
                />
              </div>
              <div className="col-12 col-md-3">
                <Field
                  name="requestedBy"
                  label="Requested By"
                  component={Input}
                  placeholder="Enter Requested By"
                />
              </div>
            </div>

            <div className="form-group row">
              <div className="col-12 col-md-3">
                <Field
                  name="planDateTime"
                  component={AntdDateTimePickerField}
                  label="Plan Date - Time"
                  placeholder="DD-MMM-YYYY HH:MM"
                  // ampm={false}
                  // clearable
                  isrequired
                  showTime={{
                    format: "HH:mm",
                    defaultValue: moment()
                      .set("hours", 8)
                      .set("minutes", 30),
                  }}
                  // format="yyyy-MM-dd HH:mm"
                />
              </div>
              <div className="col-12 col-md-3">
                <Field
                  name="dueDateTime"
                  component={AntdDateTimePickerField}
                  label="Due Date - Time"
                  placeholder="DD-MMM-YYYY HH:MM"
                  showTime={{
                    format: "HH:mm",
                    defaultValue: moment()
                      .set("hours", 17)
                      .set("minutes", 0),
                  }}
                  // ampm={false}
                  // clearable
                  // format="yyyy-MM-dd HH:mm"
                />
              </div>
              <div className="col-12 col-md-3">
                <Field
                  name="engineersList"
                  component={AutoCompleteMultiSelect}
                  customOptions={{
                    records: values.stateMSTId
                      ? engineerMasterState?.entities?.filter(
                          (x) =>
                            x.countryMSTId === values.countryMSTId &&
                            x.stateMSTId === values.stateMSTId
                        )
                      : engineerMasterState?.entities?.filter(
                          (x) => x.countryMSTId === values.countryMSTId
                        ),
                    labelField: "engineerName",
                    valueField: "id",
                  }}
                  isLoading={engineerMasterState?.listLoading}
                  loadingMessage="Fetching records..."
                  label="Assigned Engineer"
                  placeholder="Select Assigned Engineer"
                  onChange={(option) => {
                    let options = option ?? [];
                    if (options?.length > 10) {
                      alert("Max 10 Engineers allowed !!!");
                      return;
                    }

                    if (options?.length === 1) {
                      let engineerRow = engineerMasterState?.entities?.filter(
                        (x) => x.id === options[0]?.value
                      )?.[0];
                      if (
                        values?.rbhPayoutRate === null ||
                        values?.rbhPayoutRate === 0
                      ) {
                        setFieldValue(
                          "rbhPayoutRate",
                          engineerRow?.ratePerHour
                        );
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
                      setFieldValue(
                        "POC",
                        engineerRow?.pointOfContact?.engineerName
                      );
                    } else {
                      setFieldValue("rbhPayoutRate", projectPayOutRate);
                      setFieldValue(
                        "payOutCurrencyId",
                        projectPayOutCurrencyId
                      );
                      setFieldValue("POC", "");
                    }

                    setFieldValue("engineersList", options);
                  }}
                  components={{ Option }}
                  closeMenuOnSelect={false}
                  hideSelectedOptions={false}
                />
                <div
                  style={{
                    paddingTop: "10px",
                    cursor: "pointer",
                    color: "blue",
                  }}
                >
                  <span
                    onClick={() => {
                      openEngineerModal();
                      // let win = window.open(
                      //     process.env.PUBLIC_URL +
                      //     "/masters/engineer/master/new/ispopup",
                      //     "popUpWindow",
                      //     "width=" + window.screen.width + ",height=" + window.screen.height + ",scrollbars=yes,menubar=no",
                      // );

                      // let timer = setInterval(function () {
                      //     if (win.closed) {
                      //         clearInterval(timer);
                      //         dispatch(engineerMasterActions.getAllActive())
                      //     }
                      // }, 500);
                    }}
                  >
                    Not In List? Add Engineer
                  </span>
                </div>
              </div>
              <div className="col-12 col-md-3">
                <Field name="POC" label="POC" component={Input} disabled />
              </div>
            </div>

            <div className="form-group row">
              <div className="col-12 col-md-3">
                <Field
                  name="localContactName"
                  label="LCON Name"
                  component={Input}
                  placeholder="Enter LCON Name"
                  // isrequired
                />
              </div>

              <div className="col-12 col-md-3">
                <Field
                  name="localContactPhone"
                  label="LCON Phone"
                  component={Input}
                  placeholder="Enter LCON Phone"
                  // isrequired
                />
              </div>
              <div className="col-md-3">
                <Field
                  name="localContactEmail"
                  label="LCON Email"
                  component={Input}
                  placeholder="Enter LCON Email"
                  // isrequired
                />
              </div>
              <div className="col-12 col-md-3">
                <Field
                  name="reference1"
                  label="Reference Ticket# 1"
                  component={Input}
                  placeholder="Enter Reference Ticket# 1"
                />
              </div>
            </div>
            <div className="form-group row">
              <div className="col-12 col-md-3">
                <Field
                  name="reference2"
                  label="Reference Ticket# 2"
                  component={Input}
                  placeholder="Enter Reference Ticket# 2"
                />
              </div>
              <div className="col-12 col-md-3">
                <Field
                  name="poNumber"
                  label="PO Number"
                  component={Input}
                  placeholder="Enter PO Number"
                />
              </div>
              <div className="col-md-6">
                <Field
                  name="summary"
                  label="Ticket Summary"
                  component={TextArea}
                  placeholder="Enter Ticket Summary"
                  isrequired
                />
              </div>
            </div>

            <div className="form-group row">
              <div className="col-12">
                <label className="justify-content-start">
                  Scope of Work {isDanger}
                </label>
              </div>
              <div className="col-12">
                <Field
                  name="scopeOfWork"
                  component={HTMLEditorField}
                  isrequired
                />
              </div>
            </div>

            <hr />

            <div className="form-group row pt-5">
              <div className="col-md-2">
                <label>Attachment(s)</label>
              </div>
              <div className="col-md-8">
                {/* <input
                                type="file"
                                // ref={hiddenFileInputRef}
                                onChange={(e) => handleUploadAttachments(e, setFieldValue)}
                                // style={{ display: 'none' }}
                                multiple
                            /> */}

                <div {...getRootProps({ className: "dropzone" })}>
                  <input {...getInputProps()} />
                  <p>Drag 'n' drop some files here, or click to select files</p>
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
                      <i
                        className="fas fa-times-circle"
                        style={{
                          float: "right",
                          color: "#e62020",
                          cursor: "pointer",
                        }}
                        onClick={(e) => handleDeleteAttachment(x.key)}
                      ></i>
                    </div>
                    <a download={x?.fileName} href={x?.fileDownloadUri}>
                      <div>{x?.fileName}</div>
                    </a>
                  </div>
                );
              })}
            </div>

            <hr />

            <div className="form-group row mt-7">
              {roleCode.includes("admin") || roleCode.includes("pm") ? (
                <div className="col-12 col-md-6 border-right">
                  <div className="row">
                    <div className="col-12" style={{ textAlign: "center" }}>
                      <label
                        className="justify-content-center"
                        style={{ fontWeight: "600" }}
                      >
                        Pay In
                      </label>
                    </div>
                  </div>
                  <div className="form-group row">
                    <div
                      className="col-12 col-md-3"
                      style={{ marginBlock: "auto" }}
                    >
                      <label className="justify-content-start">RBH Rates</label>
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
                              let startTime = setTimeForDate(today, 8, 30, 0);
                              let endTime = setTimeForDate(today, 17, 0, 0);
                              setFieldValue("rbhStartTimingPayIn", startTime);
                              setFieldValue("rbhEndTimingPayIn", endTime);
                            } else if (day === "halfday") {
                              let today = new Date();
                              let startTime = setTimeForDate(today, 8, 30, 0);
                              let endTime = setTimeForDate(today, 12, 30, 0);
                              setFieldValue("rbhStartTimingPayIn", startTime);
                              setFieldValue("rbhEndTimingPayIn", endTime);
                            }
                          }
                          setFieldValue("payInDayOption", day);
                        }}
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <Field
                        name="rbhStartTimingPayIn"
                        component={AntdTimePickerField}
                        label="Start Time"
                        placeholder="HH:MM"
                        defaultPickerValue={moment().set("hour", 8)}
                        // ampm={false}
                        // clearable
                        // format="HH:mm"
                      />
                    </div>
                    <div className="col-12 col-md-4 offset-md-3">
                      <Field
                        name="rbhEndTimingPayIn"
                        component={AntdTimePickerField}
                        label="End Time"
                        placeholder="HH:MM"
                        // ampm={false}
                        // clearable
                        // format="HH:mm"
                      />
                    </div>
                    <div className="col-12 col-md-4">
                      <Field
                        name="rbhPayinRate"
                        component={Input}
                        label="Rates/hour"
                        type="number"
                        step="any"
                        min="0"
                        onBlur={() => {
                          const val =
                            values.rbhPayinRate === null ||
                            values.rbhPayinRate === undefined ||
                            values.rbhPayinRate === ""
                              ? ""
                              : parseFloat(values.rbhPayinRate).toFixed(2);
                          setFieldValue("rbhPayinRate", val);
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
                        disabled={isMinHoursPayIn}
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
                          setFieldValue("fullDayRatesPayIn", e.target.value);
                        }}
                        onBlur={() => {
                          const val =
                            values.fullDayRatesPayIn === null ||
                            values.fullDayRatesPayIn === undefined ||
                            values.fullDayRatesPayIn === ""
                              ? ""
                              : parseFloat(values.fullDayRatesPayIn).toFixed(2);
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
                        disabled={isFullDayRatePayIn}
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
                          setFieldValue("minHoursPayIn", e.target.value);
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-group row">
                    <div
                      className="col-12 col-md-3 "
                      style={{ marginBlock: "auto" }}
                    >
                      <label className="justify-content-start">OBH Rates</label>
                    </div>
                    <div className="col-12 col-md-4">
                      <Field
                        name="abhPayinRate"
                        component={Input}
                        label="Uplift of"
                        type="number"
                        step="any"
                        disabled={isFlatRatePayIn}
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
                          setFieldValue("abhPayinRate", e.target.value);
                        }}
                        onBlur={() => {
                          const val =
                            values.abhPayinRate === null ||
                            values.abhPayinRate === undefined ||
                            values.abhPayinRate === ""
                              ? ""
                              : parseFloat(values.abhPayinRate).toFixed(2);
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
                        disabled={isUpliftPayIn}
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
                          setFieldValue("obhPayinRate", e.target.value);
                        }}
                        onBlur={() => {
                          const val =
                            values.obhPayinRate === null ||
                            values.obhPayinRate === undefined ||
                            values.obhPayinRate === ""
                              ? ""
                              : parseFloat(values.obhPayinRate).toFixed(2);
                          setFieldValue("obhPayinRate", val);
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
                        disabled={isFlatRatePayInWeekend}
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
                            values.weekendPayInMultiplier === undefined ||
                            values.weekendPayInMultiplier === ""
                              ? ""
                              : parseFloat(
                                  values.weekendPayInMultiplier
                                ).toFixed(2);
                          setFieldValue("weekendPayInMultiplier", val);
                          setFieldTouched("weekendPayInMultiplier", true);
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
                        disabled={isUpliftPayInWeekend}
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
                          setFieldValue("weekendPayInFlatRate", e.target.value);
                        }}
                        onBlur={() => {
                          const val =
                            values.weekendPayInFlatRate === null ||
                            values.weekendPayInFlatRate === undefined ||
                            values.weekendPayInFlatRate === ""
                              ? ""
                              : parseFloat(values.weekendPayInFlatRate).toFixed(
                                  2
                                );
                          setFieldValue("weekendPayInFlatRate", val);
                          setFieldTouched("weekendPayInFlatRate", true);
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-group row mt-10">
                    <div
                      className="col-12 col-md-3 "
                      style={{ marginBlock: "auto" }}
                    >
                      <label className="justify-content-start">Currency</label>
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

                  {values?.engineersList && values.engineersList.length > 0 && (
                    <div className="form-group row">
                      <div
                        className="col-12 col-md-3 "
                        style={{ marginBlock: "auto" }}
                      >
                        <label className="justify-content-start">Charges</label>
                      </div>
                      <div className="col-12 col-md-4">
                        <Field
                          name="travelChargesPayIn"
                          component={Input}
                          placeholder="Enter Travel"
                          label="Travel"
                          type="number"
                          step="any"
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
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              <div className="col-12 col-md-6">
                <div className="row">
                  <div className="col-12" style={{ textAlign: "center" }}>
                    <label
                      className="justify-content-center"
                      style={{ fontWeight: "600" }}
                    >
                      Pay Out
                    </label>
                  </div>
                </div>
                <div className="form-group row">
                  <div
                    className="col-12 col-md-3"
                    style={{ marginBlock: "auto" }}
                  >
                    <label className="justify-content-start">RBH Rates</label>
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
                            let startTime = setTimeForDate(today, 8, 30, 0);
                            let endTime = setTimeForDate(today, 17, 0, 0);
                            setFieldValue("rbhStartTiming", startTime);
                            setFieldValue("rbhEndTiming", endTime);
                          } else if (day === "halfday") {
                            let today = new Date();
                            let startTime = setTimeForDate(today, 8, 30, 0);
                            let endTime = setTimeForDate(today, 12, 30, 0);
                            setFieldValue("rbhStartTiming", startTime);
                            setFieldValue("rbhEndTiming", endTime);
                          }
                        }
                        setFieldValue("payOutDayOption", day);
                      }}
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Field
                      name="rbhStartTiming"
                      component={AntdTimePickerField}
                      label="Start Time"
                      placeholder="HH:MM"
                      // ampm={false}
                      // clearable
                      // format="HH:mm"
                    />
                  </div>
                  <div className="col-12 col-md-4 offset-md-3">
                    <Field
                      name="rbhEndTiming"
                      component={AntdTimePickerField}
                      label="End Time"
                      placeholder="HH:MM"
                      // ampm={false}
                      // clearable
                      // format="HH:mm"
                    />
                  </div>
                  <div className="col-12 col-md-4">
                    <Field
                      name="rbhPayoutRate"
                      component={Input}
                      label="Rates/hour"
                      type="number"
                      step="any"
                      onBlur={() => {
                        const val =
                          values.rbhPayoutRate === null ||
                          values.rbhPayoutRate === undefined ||
                          values.rbhPayoutRate === ""
                            ? ""
                            : parseFloat(values.rbhPayoutRate).toFixed(2);
                        setFieldValue("rbhPayoutRate", val);
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
                      disabled={isMinHours}
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
                        setFieldValue("fullDayRatesPayOut", e.target.value);
                      }}
                      onBlur={() => {
                        const val =
                          values.fullDayRatesPayOut === null ||
                          values.fullDayRatesPayOut === undefined ||
                          values.fullDayRatesPayOut === ""
                            ? ""
                            : parseFloat(values.fullDayRatesPayOut).toFixed(2);
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
                      disabled={isFullDayRate}
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
                        setFieldValue("minHoursPayOut", e.target.value);
                      }}
                    />
                  </div>
                </div>
                <div className="form-group row">
                  <div
                    className="col-12 col-md-3"
                    style={{ marginBlock: "auto" }}
                  >
                    <label className="justify-content-start">OBH Rates</label>
                  </div>
                  <div className="col-12 col-md-4">
                    <Field
                      name="abhPayoutRate"
                      component={Input}
                      label="Uplift of"
                      type="number"
                      step="any"
                      disabled={isFlatRate}
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
                        setFieldValue("abhPayoutRate", e.target.value);
                      }}
                      onBlur={() => {
                        const val =
                          values.abhPayoutRate === null ||
                          values.abhPayoutRate === undefined ||
                          values.abhPayoutRate === ""
                            ? ""
                            : parseFloat(values.abhPayoutRate).toFixed(2);
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
                      disabled={isUplift}
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
                        setFieldValue("obhPayoutRate", e.target.value);
                      }}
                      onBlur={() => {
                        const val =
                          values.obhPayoutRate === null ||
                          values.obhPayoutRate === undefined ||
                          values.obhPayoutRate === ""
                            ? ""
                            : parseFloat(values.obhPayoutRate).toFixed(2);
                        setFieldValue("obhPayoutRate", val);
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
                      disabled={isFlatRateWeekend}
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
                          values.weekendPayOutMultiplier === undefined ||
                          values.weekendPayOutMultiplier === ""
                            ? ""
                            : parseFloat(
                                values.weekendPayOutMultiplier
                              ).toFixed(2);
                        setFieldValue("weekendPayOutMultiplier", val);
                        setFieldTouched("weekendPayOutMultiplier", true);
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
                      disabled={isUpliftWeekend}
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
                        setFieldValue("weekendPayOutFlatRate", e.target.value);
                      }}
                      onBlur={() => {
                        const val =
                          values.weekendPayOutFlatRate === null ||
                          values.weekendPayOutFlatRate === undefined ||
                          values.weekendPayOutFlatRate === ""
                            ? ""
                            : parseFloat(values.weekendPayOutFlatRate).toFixed(
                                2
                              );
                        setFieldValue("weekendPayOutFlatRate", val);
                        setFieldTouched("weekendPayOutFlatRate", true);
                      }}
                    />
                  </div>
                </div>
                <div className="form-group row mt-10">
                  <div
                    className="col-12 col-md-3"
                    style={{ marginBlock: "auto" }}
                  >
                    <label className="justify-content-start">Currency</label>
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
                          payOut: e?.target?.value?.length ?? null,
                        });
                      }}
                    />
                    {remarksCharCount.payOut} / 500 Characters
                  </div>
                </div>
                {values?.engineersList && values.engineersList.length > 0 && (
                  <div className="form-group row">
                    <div
                      className="col-12 col-md-3 "
                      style={{ marginBlock: "auto" }}
                    >
                      <label className="justify-content-start">Charges</label>
                    </div>
                    <div className="col-12 col-md-4">
                      <Field
                        name="travelCharges"
                        component={Input}
                        placeholder="Enter Travel"
                        label="Travel"
                        type="number"
                        step="any"
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
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group row">
              <div className="col-md-2 offset-md-10 ">
                <button
                  type="submit"
                  className="btn pinaple-yellow-btn smbtn"
                  onSubmit={() => handleSubmit()}
                >
                  <span className="svv b-icon svg-icon-md svg-icon-dark">
                    <SVG
                      src={toAbsoluteUrl("/media/svg/icons/Code/Plus.svg")}
                    />
                  </span>
                  Create
                </button>
              </div>
            </div>
          </>
        ),
      },
    ];
  };

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

  let entity = useMemo(() => {
    let tmpEntity = { ...enitity };
    if (hiddenId) {
      tmpEntity = { ...reducerInfo };
      tmpEntity.taskPriorityMSTId = taskPriorityMasterState?.entities?.filter(
        (x) => x.taskDefaultFlag === true
      )?.[0]?.id;
      tmpEntity.scopeOfWork = enitity?.scopeOfWork;
      tmpEntity.rbhStartTiming = enitity?.rbhStartTiming
        ? moment(enitity.rbhStartTiming, "HH:mm").toDate()
        : null;
      tmpEntity.rbhEndTiming = enitity?.rbhEndTiming
        ? moment(enitity.rbhEndTiming, "HH:mm").toDate()
        : null;
      tmpEntity.rbhPayoutRate = enitity?.rbhPayoutRate;
      tmpEntity.abhPayoutRate = enitity?.abhPayoutRate;
      tmpEntity.obhPayoutRate = enitity?.obhPayoutRate;
      tmpEntity.payOutCurrencyId = enitity?.payOutCurrencyId;
      tmpEntity.payOutRemarks = enitity?.payOutRemarks;
      // return tmpEntity
    } else {
      tmpEntity.taskPriorityMSTId = taskPriorityMasterState?.entities?.filter(
        (x) => x.taskDefaultFlag === true
      )?.[0]?.id;
    }
    tmpEntity.countryCode = null;
    if (tmpEntity?.countryMSTId) {
      tmpEntity.countryCode = countryMasterState?.entities?.filter(
        (x) => x.id === tmpEntity.countryMSTId
      )?.[0]?.countryCode;
    }

    return tmpEntity;
  }, [enitity, taskPriorityMasterState, hiddenId, countryMasterState]);

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

  return (
    <>
      {modal ? modal : null}
      <Formik
        enableReinitialize={true}
        initialValues={entity}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          debugger;
          setErrorOnSumit(false);
          let val = { ...values };
          convertBlankToNull(val);
          let timezone = moment.tz.guess(true);

          val.minHoursPayIn =
            val.minHoursPayIn !== null ? val.minHoursPayIn * 60 : null;
          val.minHoursPayOut =
            val.minHoursPayOut !== null ? val.minHoursPayOut * 60 : null;

          if (val?.cityMSTId && val?.cityMSTId !== 0) {
            const cityMST = cityMasterState?.entities?.filter(
              (x) => x.id === val.cityMSTId
            )?.[0];
            if (cityMST?.latitude && cityMST?.longitude) {
              timezone = tz_lookup(cityMST.latitude, cityMST.longitude);
            }
          }

          val.timezone = timezone;

          const utcOffset = moment.tz(val.timezone).utcOffset();

          val.utcOffset = utcOffset;

          // val.rbhStartTiming = values.rbhStartTiming
          //     ? moment.tz(moment(values.rbhStartTiming, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;
          // val.obhStartTiming = values.obhStartTiming
          //     ? moment.tz(moment(values.obhStartTiming, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;
          // val.abhStartTiming = values.abhStartTiming
          //     ? moment.tz(moment(values.abhStartTiming, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;
          // val.obhEndTiming = values.obhEndTiming
          //     ? moment.tz(moment(values.obhEndTiming, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;
          // val.rbhEndTiming = values.rbhEndTiming
          //     ? moment.tz(moment(values.rbhEndTiming, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;
          // val.abhEndTiming = values.abhEndTiming
          //     ? moment.tz(moment(values.abhEndTiming, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;

          // val.rbhStartTimingPayIn = values.rbhStartTimingPayIn
          //     ? moment.tz(moment(values.rbhStartTimingPayIn, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;
          // val.obhStartTimingPayIn = values.obhStartTimingPayIn
          //     ? moment.tz(moment(values.obhStartTimingPayIn, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;
          // val.abhStartTimingPayIn = values.abhStartTimingPayIn
          //     ? moment.tz(moment(values.abhStartTimingPayIn, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;
          // val.obhEndTimingPayIn = values.obhEndTimingPayIn
          //     ? moment.tz(moment(values.obhEndTimingPayIn, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;
          // val.rbhEndTimingPayIn = values.rbhEndTimingPayIn
          //     ? moment.tz(moment(values.rbhEndTimingPayIn, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;
          // val.abhEndTimingPayIn = values.abhEndTimingPayIn
          //     ? moment.tz(moment(values.abhEndTimingPayIn, 'HH:mm').format("HH:mm"), 'HH:mm', val.timezone).tz("utc").format('HH:mm')
          //     : null;

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

          if (val.rbhEndTiming && !val.rbhStartTiming) {
            setValidationError("Pay Out Tab: RBH Start Time Required");
            return;
          } else if (!val.rbhEndTiming && val.rbhStartTiming) {
            setValidationError("Pay Out Tab: RBH End Time Required");
            return;
          }

          if (val.rbhEndTimingPayIn && !val.rbhStartTimingPayIn) {
            setValidationError("Pay In Tab: RBH Start Time Required");
            return;
          } else if (!val.rbhEndTimingPayIn && val.rbhStartTimingPayIn) {
            setValidationError("Pay In Tab: RBH End Time Required");
            return;
          }

          if (!values?.engineersList?.length > 0) {
            val.travelChargesPayIn = null;
            val.travelCharges = null;
            val.materialChargesPayIn = null;
            val.materialCharges = null;
            val.parkingChargesPayIn = null;
            val.parkingCharges = null;
            val.otherChargesPayIn = null;
            val.otherCharges = null;
          }

          val.engineersList = values?.engineersList?.map((x) => x.value);

          let tmpTimeZone = moment.tz.guess(true);

          if (val?.cityMSTId) {
            const cityMST = cityMasterState?.entities?.filter(
              (x) => x.id === val.cityMSTId
            )?.[0];
            if (cityMST?.latitude && cityMST?.longitude) {
              tmpTimeZone = tz_lookup(cityMST.latitude, cityMST.longitude);
            }
          }

          val.planDateTime = val?.planDateTime
            ? moment(val.planDateTime)
                .subtract(utcOffset, "minutes")
                .format("YYYY-MM-DD HH:mm")
            : null;
          val.dueDateTime = val?.dueDateTime
            ? moment(val.dueDateTime)
                .subtract(utcOffset, "minutes")
                .format("YYYY-MM-DD HH:mm")
            : null;

          // val.FILE_FIELDS = [{ name: "attachment", label: "Attachment", path: "" }]

          const saveTicket = (val) => {
            dispatch(taskMasterActions.create(val))
              .then((res) => {
                if (res && res.length > 0) {
                  let successCount = 0;
                  res.forEach((ticket) => {
                    const attRes = taskAttachmentActions.uploadMultiple(
                      attachmentState
                        ?.filter((x) => x.file !== null)
                        ?.map((x) => x.file),
                      ticket.id
                    );

                    attRes
                      .then((res2) => {
                        successCount = successCount + 1;
                        if (res.length === 1) {
                          history.push(`/ticket/${ticket.id}/edit`);
                        } else {
                          saveRecord(null, null, Promise.resolve(res2));
                        }
                      })
                      .catch((err) =>
                        saveRecord(null, null, Promise.reject(err))
                      );
                  });
                } else {
                  saveRecord(
                    null,
                    null,
                    Promise.reject({ userMessage: "Error in Creating Ticket" })
                  );
                }
              })
              .catch((err) => saveRecord(null, null, Promise.reject(err)));
          };

          // dispatch(taskMasterActions.validateEngineer(val)).then(engRes => {
          //     if (engRes && engRes.length > 0) {
          //         let msg = "The assigned engineer conflict with ticket(s): "
          //         engRes.forEach(x => {
          //             msg = msg + x.ticketCode + ", "
          //         })
          //         msg = msg.slice(0, msg.length - 2)
          //         if (
          //             window.confirm(
          //                 msg
          //             )
          //         ) {
          //             saveTicket(val);
          //         } else {
          //             return;
          //         }
          //     } else {
          //         saveTicket(val);
          //     }
          // })

          saveTicket(val);

          // saveRecord(val);
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
          <Form className="form form-label-right">
            <div>
              {errors && errorOnSumit ? (
                <div style={{ color: "red" }}>
                  {/* {errors?.taskStatusMSTId ? `${errors?.taskStatusMSTId},` : ""} {errors?.organizationMSTId ? `${errors?.organizationMSTId}` : ""} {errors?.projectMSTId ? `${errors?.projectMSTId},` : ""} {errors?.countryMSTId ? `${errors?.countryMSTId}` : ""} {errors?.cityMSTId ? `${errors?.cityMSTId},` : ""} {errors?.planDateTime ? `${errors?.planDateTime},` : ""} {errors?.summary ? `${errors?.summary},` : ""} {errors?.scopeOfWork}</div>  */}
                  {getErrors(errors)}
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="form-group row">
              <div className="col-lg-3">
                <Field
                  name="taskType"
                  component={AutoCompleteSelect}
                  placeholder="Select Ticket Type"
                  label="Ticket Type"
                  options={taskTypes}
                />
              </div>
              <div className="col-lg-3">
                <Field
                  name="taskStatusMSTId"
                  component={AutoCompleteSelect}
                  placeholder="Select Status"
                  label="Ticket Status"
                  customOptions={{
                    records: taskStatusMasterState?.entities?.filter(
                      (x) => x.defaultFlag === true
                    ),
                    labelField: "taskStatusName",
                    valueField: "id",
                  }}
                  isLoading={taskStatusMasterState?.listLoading}
                  loadingMessage="Fetching records"
                  isrequired
                />
              </div>
              <div className="col-lg-3">
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
                />
              </div>
              <div className="col-lg-3" style={{ width: "100%" }}>
                <div style={{ float: "left", width: "65%" }}>
                  <Field
                    name="taskCode"
                    label="Copy Ticket#"
                    component={Input}
                    placeholder="Ticket# to Copy"
                  />
                </div>
                <div style={{ float: "right", width: "35%" }}>
                  <label className="mt-4" style={{ visibility: "hidden" }}>
                    Copy
                  </label>
                  <button
                    style={{
                      whiteSpace: "nowrap",
                    }}
                    className="btn pinaple-yellow-btn ml-2"
                    onClick={(e) => {
                      e.preventDefault();
                      if (!values.taskCode) {
                        return window.alert("Please enter Ticket# to Copy");
                      }
                      setLoading(true);
                      dispatch(taskMasterActions.getTaskByCode(values.taskCode))
                        .then((res) => {
                          setFieldValue("taskType", res?.taskType);
                          setFieldValue(
                            "taskPriorityMSTId",
                            res?.taskPriorityMSTId
                          );
                          setFieldValue(
                            "organizationMSTId",
                            res?.organizationMSTId
                          );
                          setFieldValue(
                            "projectBranchDTLId",
                            res?.projectBranchDTLId
                          );
                          setFieldValue(
                            "projectBranchDTLList",
                            res?.projectMST?.projectBranchDTLList
                          );
                          setFieldValue(
                            "externalCustomer",
                            res?.externalCustomer
                          );
                          setFieldValue("countryMSTId", res?.countryMSTId);
                          setFieldValue("stateMSTId", res?.stateMSTId);
                          setFieldValue("cityMSTId", res?.cityMSTId);
                          setFieldValue("address", res?.address);
                          setFieldValue("zipCode", res?.zipCode);
                          setFieldValue("projectMSTId", res?.projectMSTId);
                          setFieldValue(
                            "projectCoOrdinatorId",
                            res?.projectMST?.projectCoordinatorId
                          );
                          setFieldValue(
                            "projectManagerId",
                            res?.projectMST?.projectManagerId
                          );
                          setFieldValue("requestedBy", "");
                          setFieldValue("scopeOfWork", res?.scopeOfWork);
                          setFieldValue("summary", res?.summary);
                          setFieldValue("localContactPhone", "");
                          setFieldValue("localContactName", "");
                          setFieldValue("localContactEmail", "");
                          setFieldValue("reference1", "");
                          setFieldValue("reference2", "");
                          setFieldValue("planDateTime", null);
                          setFieldValue("dueDateTime", null);
                          setFieldValue("engineersList", []);

                          dispatch(
                            stateMasterActions.getByCountry(res?.countryMSTId)
                          );
                          if (res?.stateMSTId && res?.countryMSTId) {
                            dispatch(
                              cityMasterActions.getByCountryAndState(
                                res.countryMSTId,
                                res.stateMSTId
                              )
                            );
                          } else {
                            dispatch(
                              cityMasterActions.getByCountry(res.countryMSTId)
                            );
                          }

                          let projectMST = res?.projectMST
                            ? { ...res.projectMST }
                            : {};

                          projectMST.projectRBHStartTiming = projectMST.projectRBHStartTiming
                            ? moment(
                                projectMST.projectRBHStartTiming,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectOBHStartTiming = projectMST.projectOBHStartTiming
                            ? moment(
                                projectMST.projectOBHStartTiming,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectABHStartTiming = projectMST.projectABHStartTiming
                            ? moment(
                                projectMST.projectABHStartTiming,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectOBHEndTiming = projectMST.projectOBHEndTiming
                            ? moment(
                                projectMST.projectOBHEndTiming,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectRBHEndTiming = projectMST.projectRBHEndTiming
                            ? moment(
                                projectMST.projectRBHEndTiming,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectABHEndTiming = projectMST.projectABHEndTiming
                            ? moment(
                                projectMST.projectABHEndTiming,
                                "HH:mm"
                              ).toDate()
                            : null;

                          projectMST.projectRBHStartTimingPayIn = projectMST.projectRBHStartTimingPayIn
                            ? moment(
                                projectMST.projectRBHStartTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectOBHStartTimingPayIn = projectMST.projectOBHStartTimingPayIn
                            ? moment(
                                projectMST.projectOBHStartTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectABHStartTimingPayIn = projectMST.projectABHStartTimingPayIn
                            ? moment(
                                projectMST.projectABHStartTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectOBHEndTimingPayIn = projectMST.projectOBHEndTimingPayIn
                            ? moment(
                                projectMST.projectOBHEndTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectRBHEndTimingPayIn = projectMST.projectRBHEndTimingPayIn
                            ? moment(
                                projectMST.projectRBHEndTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;
                          projectMST.projectABHEndTimingPayIn = projectMST.projectABHEndTimingPayIn
                            ? moment(
                                projectMST.projectABHEndTimingPayIn,
                                "HH:mm"
                              ).toDate()
                            : null;

                          convertNullToBlank(projectMST);

                          setFieldValue(
                            "rbhStartTiming",
                            projectMST?.projectRBHStartTiming
                          );
                          setFieldValue(
                            "rbhEndTiming",
                            projectMST?.projectRBHEndTiming
                          );
                          setFieldValue(
                            "obhStartTiming",
                            projectMST?.projectOBHStartTiming
                          );
                          setFieldValue(
                            "obhEndTiming",
                            projectMST?.projectOBHEndTiming
                          );
                          setFieldValue(
                            "abhStartTiming",
                            projectMST?.projectABHStartTiming
                          );
                          setFieldValue(
                            "abhEndTiming",
                            projectMST?.projectABHEndTiming
                          );
                          setFieldValue(
                            "rbhStartTimingPayIn",
                            projectMST?.projectRBHStartTimingPayIn
                          );
                          setFieldValue(
                            "rbhEndTimingPayIn",
                            projectMST?.projectRBHEndTimingPayIn
                          );
                          setFieldValue(
                            "obhStartTimingPayIn",
                            projectMST?.projectOBHStartTimingPayIn
                          );
                          setFieldValue(
                            "obhEndTimingPayIn",
                            projectMST?.projectOBHEndTimingPayIn
                          );
                          setFieldValue(
                            "abhStartTimingPayIn",
                            projectMST?.projectABHStartTimingPayIn
                          );
                          setFieldValue(
                            "abhEndTimingPayIn",
                            projectMST?.projectABHEndTimingPayIn
                          );
                          setFieldValue(
                            "rbhPayoutRate",
                            projectMST?.projectRBHRatePayOut
                          );
                          setFieldValue(
                            "rbhPayinRate",
                            projectMST?.projectRBHRatePayIn
                          );
                          setFieldValue(
                            "obhPayoutRate",
                            projectMST?.projectOBHRatePayOut
                          );
                          setFieldValue(
                            "obhPayinRate",
                            projectMST?.projectOBHRatePayIn
                          );
                          setFieldValue(
                            "abhPayoutRate",
                            projectMST?.projectABHRatePayOut
                          );
                          setFieldValue(
                            "abhPayinRate",
                            projectMST?.projectABHRatePayIn
                          );
                          setFieldValue(
                            "payOutCurrencyId",
                            projectMST?.projectPayOutCurrencyId
                          );
                          setFieldValue(
                            "payInCurrencyId",
                            projectMST?.projectPayInCurrencyId
                          );
                          setFieldValue(
                            "payOutRemarks",
                            projectMST?.projectPayOutRemarks
                          );
                          setFieldValue(
                            "payInRemarks",
                            projectMST?.projectPayInRemarks
                          );
                          setFieldValue(
                            "weekendPayInFlatRate",
                            projectMST?.weekendPayInFlatRate
                          );
                          setFieldValue(
                            "weekendPayInMultiplier",
                            projectMST?.weekendPayInMultiplier
                          );
                          setFieldValue(
                            "weekendPayOutFlatRate",
                            projectMST?.weekendPayOutFlatRate
                          );
                          setFieldValue(
                            "weekendPayOutMultiplier",
                            projectMST?.weekendPayOutMultiplier
                          );
                          setFieldValue(
                            "minHoursPayIn",
                            projectMST.minHoursPayIn === ""
                              ? ""
                              : projectMST.minHoursPayIn / 60
                          );
                          setFieldValue(
                            "minHoursPayOut",
                            projectMST?.minHoursPayOut === ""
                              ? ""
                              : projectMST.minHoursPayOut / 60
                          );
                          setFieldValue(
                            "fullDayRatesPayIn",
                            projectMST?.fullDayRatesPayIn
                          );
                          setFieldValue(
                            "fullDayRatesPayOut",
                            projectMST?.fullDayRatesPayOut
                          );
                          setFieldValue(
                            "payInDayOption",
                            projectMST?.payInDayOption
                          );
                          setFieldValue(
                            "payOutDayOption",
                            projectMST?.payOutDayOption
                          );
                          setProjectPayOutCurrencyId(
                            projectMST?.projectPayOutCurrencyId
                          );
                          setProjectPayOutRate(
                            projectMST?.projectRBHRatePayOut
                          );

                          if (projectMST?.projectABHRatePayIn) {
                            setIsUpliftPayIn(true);
                          } else {
                            setIsUpliftPayIn(false);
                          }

                          if (projectMST?.projectABHRatePayOut) {
                            setIsUplift(true);
                          } else {
                            setIsUplift(false);
                          }

                          if (projectMST?.projectOBHRatePayOut) {
                            setIsFlatRate(true);
                          } else {
                            setIsFlatRate(false);
                          }

                          if (projectMST?.projectOBHRatePayIn) {
                            setIsFlatRatePayIn(true);
                          } else {
                            setIsFlatRatePayIn(false);
                          }

                          if (projectMST?.weekendPayInMultiplier) {
                            setIsUpliftPayInWeekend(true);
                          } else {
                            setIsUpliftPayInWeekend(false);
                          }

                          if (projectMST?.weekendPayInFlatRate) {
                            setIsFlatRatePayInWeekend(true);
                          } else {
                            setIsFlatRatePayInWeekend(false);
                          }

                          if (projectMST?.weekendPayOutMultiplier) {
                            setIsUpliftWeekend(true);
                          } else {
                            setIsUpliftWeekend(false);
                          }

                          if (projectMST?.weekendPayOutFlatRate) {
                            setIsFlatRateWeekend(true);
                          } else {
                            setIsFlatRateWeekend(false);
                          }

                          if (projectMST?.fullDayRatesPayIn) {
                            setIsFullDayRatePayIn(true);
                          } else {
                            setIsFullDayRatePayIn(false);
                          }

                          if (projectMST?.fullDayRatesPayOut) {
                            setIsFullDayRate(true);
                          } else {
                            setIsFullDayRate(false);
                          }

                          if (projectMST?.minHoursPayIn) {
                            setIsMinHoursPayIn(true);
                          } else {
                            setIsMinHoursPayIn(false);
                          }

                          if (projectMST?.minHoursPayOut) {
                            setIsMinHours(true);
                          } else {
                            setIsMinHours(false);
                          }

                          let countryCode = countryMasterState?.entities?.filter(
                            (x) => x.id === res?.countryMSTId ?? 0
                          )?.[0]?.countryCode;
                          setFieldValue("countryCode", countryCode);

                          setLoading(false);
                        })
                        .catch((err) => {
                          setLoading(false);
                        });
                    }}
                  >
                    <i className="fa fa-copy" style={{ color: "#777" }}></i>
                    Copy
                    {loading && (
                      <span className="ml-3 spinner spinner-white"></span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {validationError ? (
              <div style={{ color: "red", paddingBottom: "15px" }}>
                {validationError}
              </div>
            ) : null}

            <TabularView
              tabs={[
                ...getGenericTabs(
                  setFieldValue,
                  values,
                  setFieldError,
                  setFieldTouched,
                  handleSubmit
                ),
              ]}
            />

            <button
              type="submit"
              style={{ display: "none" }}
              ref={submitBtnRef}
              onSubmit={() => handleSubmit()}
              onClick={() => setErrorOnSumit(true)}
            />
            <button
              type="reset"
              style={{ display: "none" }}
              ref={resetBtnRef}
              onSubmit={() => handleReset()}
            />
            <ErrorFocus />
          </Form>
        )}
      </Formik>
    </>
  );
};

export default CreateForm;
