import React, { useEffect, useMemo, useState } from "react";
import validations from "../../../../_commons/CommonValidations";
import { Formik, Form, Field } from "formik";
import {
  Input,
  AutoCompleteSelect,
  Switch,
  Image,
  TextArea
} from "../../../../../../_metronic/_partials/controls";
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import TabularView from "../../../../_commons/components/TabularView";
import { userMasterActions } from "../_redux/UserMasterRedux";
import { userRoleActions } from "../../UserRole/_redux/UserRoleRedux";
import { organizationMasterActions } from "../../../OrganizationMaster/_redux/OrganizationMasterRedux";
import { organizationBranchActions } from "../../../OrganizationMaster/_redux/OrganizationBranchRedux";
import { countryMasterActions } from "../../../CountryMaster/_redux/CountryMasterRedux";
import { stateMasterActions } from "../../../StateMaster/_redux/StateMasterRedux";
import { cityMasterActions } from "../../../CityMaster/_redux/CityMasterRedux";
import { currencyMasterActions } from "../../../CurrencyMaster/_redux/CurrencyMasterRedux";
import {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  isValidPhoneNumber,
  isPossiblePhoneNumber
} from "react-phone-number-input";
import { postcodeValidator, postcodeValidatorExistsForCountry } from 'postcode-validator';
import ErrorFocus from "../../../../_commons/ErrorFocus";
import { isValidContactForCountry, isValidZipCode } from "../../../../_commons/Utils";
import { useHistory } from 'react-router';
import {Link} from "react-router-dom";

const isDanger = <span className="text-danger font-weight-bold">*</span>;
const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
  const dispatch = useDispatch();
  const history = useHistory()
  const [tab, setTab] = useState("");
  const [hasManualError, setHasManualError] = useState(false)
  const [checkErr, setCheckErr] = useState(false)
  const [openProject, setOpenProject] = useState()
  const [openTicket, setOpenTicket] = useState()
  const {
    currentState,
    userRoleState,
    organizationMasterState,
    countryMasterState,
    stateMasterState,
    cityMasterState,
    currencyMasterState
  } = useSelector(
    (state) => ({
      currentState: state.userMaster,
      userRoleState: state.userRole,
      organizationMasterState: state.organizationMaster,
      countryMasterState: state.countryMaster,
      stateMasterState: state.stateMaster,
      cityMasterState: state.cityMaster,
      currencyMasterState: state.currencyMaster,
    }),
    shallowEqual
  );

  useEffect(() => {
    if (currentState.totalCount === 0 && !currentState.listLoading && !currentState.error) {
      dispatch(userMasterActions.getAll());
    }
    dispatch(userRoleActions.getAllActive())
    dispatch(organizationMasterActions.getAll())
    dispatch(countryMasterActions.getAllActive())
    dispatch(currencyMasterActions.getAllActive())
  }, []);

  //code unique validation
  const editId = currentState?.entityForEdit?.id ?? 0;
  const contactRegExp = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
  const userNameRegEx = /^[a-zA-Z0-9.]*$/

  Yup.addMethod(Yup.mixed, "isValidZipCode", isValidZipCode);
  Yup.addMethod(Yup.mixed, "isValidContactForCountry", isValidContactForCountry);

  const validationSchema = useMemo(() => {
    return Yup.object().shape({
      userName: validations.name().matches(userNameRegEx, "Invalid User Name"),
      password: Yup.string().required("Password Required"),
      firstName: Yup.string().required("First Name Required"),
      lastName: Yup.string().required("Last Name Required"),
      organizationMSTId: Yup.number().min(1, 'Customer Required'),
      userRoleMSTId: Yup.number().min(1, 'User Role Required'),
      primaryEmailId: Yup.string().required("E-mail Required").email("Invalid e-mail"),
      secondaryEmailId: Yup.string().nullable().email("Invalid e-mail"),
      primaryContactNumber: Yup.mixed().required("Contact# Required").isValidContactForCountry(Yup.ref('primaryCountry')),
      secondaryContactNumber: Yup.mixed().nullable().isValidContactForCountry(Yup.ref('secondaryCountry')),
      // primaryContactNumber: Yup.string().required("Primary Contact# Required")
      //   .test(function (value) {
      //     const { primaryContactNumber, primaryDialingCode } = this.parent;
      //     try {
      //       return isValidPhoneNumber(primaryDialingCode + primaryContactNumber);
      //     } catch (e) {
      //       return false
      //     }
      //     //return true
      //   }),
      // secondaryContactNumber: Yup.string().nullable()
      //   .test(function (value) {
      //     const { secondaryContactNumber, secondaryDialingCode } = this.parent;
      //     if (secondaryContactNumber && secondaryDialingCode) {
      //       try{
      //         return isValidPhoneNumber(secondaryDialingCode + secondaryContactNumber);
      //       } catch (e) {
      //         return false
      //       }
      //     }
      //     return true;
      //     //return true
      //   }),//.matches(contactRegExp, 'Invalid Secondary Contact#'),
      // zipCode: Yup.string().required("Zip Code Required"),
      countryMSTId: Yup.number().min(1, 'Country Required'),
      cityMSTId: Yup.number().min(1, 'City Required'),
      primaryCountry: Yup.string().required("Primary Contact# Country Required"),
      zipCode: Yup.mixed().isValidZipCode(Yup.ref('primaryCountry'), "Invalid Zip Code"),
    });
  }, [currentState.entities, editId]);
  const validateZipCode = (countryCode, zipCode, setFieldError) => {
    setFieldError("zipCode", null)
    setHasManualError(false)
    if (zipCode) {
      if (countryCode) {
        if (postcodeValidatorExistsForCountry(countryCode)) {
          if (!postcodeValidator(zipCode, countryCode)) {
            setFieldError("zipCode", "Invalid Zip Code")
            setHasManualError(true)
          }
        } else {
          if (!postcodeValidator(zipCode, 'INTL')) {
            setFieldError("zipCode", "Invalid Zip Code")
            setHasManualError(true)
          }
        }
      } else {
        if (!postcodeValidator(zipCode, 'INTL')) {
          setFieldError("zipCode", "Invalid Zip Code")
          setHasManualError(true)
        }
      }
    }
  }
  let entity = useMemo(() => {

    let tmpEntity = { ...enitity }
    if (editId) {
      const primaryCode = countryMasterState?.entities?.filter(x => x.countryCode === tmpEntity.primaryCountry)?.[0]?.dialingCode
      tmpEntity.primaryDialingCode = primaryCode
      const secondaryCode = countryMasterState?.entities?.filter(x => x.countryCode === tmpEntity.secondaryCountry)?.[0]?.dialingCode
      tmpEntity.secondaryDialingCode = secondaryCode
    }
    return tmpEntity
  }, [enitity, editId, countryMasterState])

  useEffect(() => {
    if(currentState?.error?.customError){
        let error=currentState?.error?.customError
        setCheckErr(true)
        let ticket =[]
        let project =[]
        if(error?.length){
            error.map((dl)=>{
                    if(dl.ticketId){
                        ticket.push(dl)
                    }else{
                        project.push(dl)
                    }
            })
            if(project?.length){setOpenProject(project)}
            if(ticket?.length){setOpenTicket(ticket)}
        }
    }
}, [currentState])

  return (
    <Formik
      enableReinitialize={true}
      initialValues={entity}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        if (hasManualError) {
          return
        }
        if (values?.stateMST) {
          if (!values?.stateMSTId) {
            values.stateMST = null
          }
        }
        let val = {
          ...values,
          FILE_FIELDS: [{ name: "profilePhoto", label: "Profile Image", path: "" }]
        }

        if(val.id){
          dispatch(userMasterActions.updateCustom(val))
          .then(res => {
              history.goBack()
          }).catch(err => {
              console.log(err?.userMessage)
          })
      }else{
          saveRecord(val);
      }
      }}
    >
      {({ handleSubmit, handleReset, values, setFieldValue, setFieldError, setFieldTouched }) => (
        <Form className="form form-label-right">
          { checkErr ?
                            <div className='text-danger d-flex flex-wrap' >
                                {openProject ?
                                    <div className="ml-3"> Open Projects :-
                                        { openProject?.map(el=>{
                                            return (<Link to={`/project/${el.projectId}/edit`} ><span>{`${el.projectCode},`} </span></Link>);
                                        })
                                        }
                                    </div>
                                :""}
                                {openTicket ?
                                <div className="ml-3">
                                    Open Tickets :-
                                    { openTicket?.map(el=>{
                                        return (<Link to={`/ticket/${el.ticketId}/edit`} ><span>{`${el.ticketCode},`}</span></Link>);
                                    })
                                    }
                                </div>
                                :""}
                             </div> 
                        :""}
          <div className="form-group row">
            <div className="col-12 col-md-3">
              <Field
                name="userName"
                component={Input}
                placeholder="Enter User Name"
                label="User Name"
                isrequired
                tabIndex="1"
              />
            </div>
            <div className="col-12 col-md-3">
              <Field
                name="password"
                component={Input}
                label="Password"
                placeholder="Password"
                tabIndex="2"
                isrequired
                type="password"
              />
            </div>
            <div className="col-3 col-md-1">
              <Field
                name="active"
                component={Switch}
                label="Active"
                color="primary"
              />
            </div>
          </div>
          <br />
          <TabularView
            onTabChange={(key) => setTab(key)}
            tabs={[
              {
                key: "userDetails",
                title: "User Details",
                content: (<>
                  <div className="form-group row form-inline mt-7">
                    <div className="col-12 col-md-2 offset-0 offset-md-1">
                      <label className="justify-content-start">
                        Customer{isDanger}
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                      <Field
                        name="organizationMSTId"
                        component={AutoCompleteSelect}
                        customOptions={{
                          records: organizationMasterState?.entities,
                          labelField: "organizationName",
                          valueField: "id"
                        }}
                        isLoading={organizationMasterState?.listLoading}
                        loadingMessage="Fetching records..."
                        placeholder="Select Customer"
                        isrequired
                      />
                    </div>
                    <div className="col-12 col-md-2">
                      <label className="justify-content-start">
                        Customer Branch
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                      <Field
                        name="organizationBranchDTLId"
                        component={AutoCompleteSelect}
                        customOptions={{
                          records: organizationMasterState?.entities?.filter(x => x.id === values?.organizationMSTId)?.[0]?.organizationBranchDTLList ?? [],
                          labelField: "branchName",
                          valueField: "id"
                        }}
                        placeholder="Select Branch"
                        isrequired
                      />
                    </div>
                  </div>
                  <div className="form-group row form-inline mt-7">
                    <div className="col-12 col-md-2 offset-0 offset-md-1">
                      <label className="justify-content-start">
                        User Role{isDanger}
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                      <Field
                        name="userRoleMSTId"
                        component={AutoCompleteSelect}
                        customOptions={{
                          records: userRoleState?.entities,
                          labelField: "roleName",
                          valueField: "id",
                          valueToBeSkipped:
                            currentState?.entityForEdit?.userRoleMSTId,
                        }}
                        isLoading={userRoleState.listLoading}
                        loadingMessage="Fetching records..."
                        placeholder="Select User Role"
                        isrequired
                      />
                    </div>
                    <div className="col-12 col-md-2">
                      <label className="justify-content-start">
                        User First Name{isDanger}
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                      <Field
                        name="firstName"
                        component={Input}
                        placeholder="Enter First Name"
                      />
                    </div>

                  </div>

                  <div className="form-group row form-inline mt-7">
                    <div className="col-12 col-md-2 offset-0 offset-md-1">
                      <label className="justify-content-start">
                        User Middle Name
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                      <Field
                        name="middleName"
                        component={Input}
                        placeholder="Enter Middle Name"
                      />
                    </div>
                    <div className="col-12 col-md-2">
                      <label className="justify-content-start">
                        User Last Name{isDanger}
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                      <Field
                        name="lastName"
                        component={Input}
                        placeholder="Enter Last Name"
                      />
                    </div>

                  </div>

                  <div className="form-group row form-inline mt-7">
                    <div className="col-12 col-md-2 offset-0 offset-md-1">
                      <label className="justify-content-start">
                        Designation
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                     <Field
                        name="designation"
                        component={Input}
                        placeholder="Enter Designation"
                      />
                    </div>
                    <div className="col-12 col-md-2">
                    <label className="justify-content-start">
                        Primary Email{isDanger}
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                      <Field
                        name="primaryEmailId"
                        component={Input}
                        placeholder="Enter Primary Email"
                      />
                    </div>
                    </div>
                    <div className="form-group row form-inline mt-7">
                      <div className="col-2 offset-1">
                      <label className="justify-content-start">
                        Secondary Email
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                    <Field
                        name="secondaryEmailId"
                        component={Input}
                        placeholder="Enter Secondary Email"
                      />
                    </div>

                    <div className="col-12 col-md-2">
                    <label className="justify-content-start">
                        Country{isDanger}
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                    <Field
                        name="countryMSTId"
                        component={AutoCompleteSelect}
                        customOptions={{
                          records: countryMasterState?.entities,
                          labelField: "countryName",
                          valueField: "id"
                        }}
                        isLoading={countryMasterState?.listLoading}
                        loadingMessage="Fetching records..."
                        placeholder="Select Country"
                        isrequired
                        onChange={(option) => {
                          let countryMSTId = option?.value ?? null
                          const code = countryMasterState?.entities?.filter(x => x.id === countryMSTId)?.[0]?.countryCode
                          // const code = countryMasterState?.entities?.filter(x => x.countryCode === countryMSTId)?.[0]?.countryCode
                          setFieldValue("primaryCountry", code)
                          setFieldValue("secondaryCountry", code)
                          const dialingCode =  countryMasterState?.entities?.filter(x => x.id === countryMSTId)?.[0]?.dialingCode
                          setFieldValue("primaryDialingCode", dialingCode)
                          setFieldValue("secondaryDialingCode", dialingCode)
                          dispatch(stateMasterActions.getByCountry(countryMSTId))
                          dispatch(cityMasterActions.getByCountry(countryMSTId))
                          setFieldValue("stateMSTId", 0)
                          setFieldValue("cityMSTId", 0)
                          setFieldValue("countryMSTId", countryMSTId)
                        }}
                      />
                    </div>
                  </div>
                  <div className="form-group row form-inline mt-7">

                    <div className="col-12 col-md-2 offset-0 offset-md-1">
                    <label className="justify-content-start">
                        State
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                    <Field
                        name="stateMSTId"
                        component={AutoCompleteSelect}
                        customOptions={{
                          records: stateMasterState?.entities,
                          labelField: "stateName",
                          valueField: "id"
                        }}
                        isLoading={stateMasterState?.listLoading}
                        loadingMessage="Fetching records..."
                        placeholder="Select State"
                        onChange={(option) => {
                          let stateMSTId = option?.value ?? null
                          if (stateMSTId && values.countryMSTId) {
                            dispatch(cityMasterActions.getByCountryAndState(values.countryMSTId, stateMSTId))
                          } else {
                            dispatch(cityMasterActions.getByCountry(values.countryMSTId))
                          }
                          setFieldValue("cityMSTId", 0)
                          setFieldValue("stateMSTId", stateMSTId)
                        }}
                      />
                    </div>

                    <div className="col-12 col-md-2">
                    <label className="justify-content-start">
                        City{isDanger}
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                    <Field
                        name="cityMSTId"
                        component={AutoCompleteSelect}
                        customOptions={{
                          records: cityMasterState?.entities,
                          labelField: "cityName",
                          valueField: "id"
                        }}
                        isLoading={cityMasterState?.listLoading}
                        loadingMessage="Fetching records..."
                        placeholder="Select City"
                        isrequired
                        onChange={(option) => {
                          dispatch(organizationBranchActions.getByOrganizationMSTId(option.value))
                          setFieldValue("cityMSTId", option?.value ?? null)
                        }}
                      />
                    </div>
                  </div>

                  <div className="form-group row form-inline mt-7">
                    <div className="col-12 col-md-2 offset-0 offset-md-1">
                    <label className="justify-content-start">
                        Address
                      </label>
                    </div>
                    <div className="col-12 col-md-3">
                    <Field
                        name="address"
                        component={TextArea}
                        placeholder="Enter Address"
                      />
                      
                    </div>
                    <div className="col-md-2">
                    <label className="justify-content-start">
                        Zip Code
                      </label>
                    </div>
                    <div className="col-md-3">
                    <Field
                        name="zipCode"
                        component={Input}
                        placeholder="Enter Zip Code"
                      //   onChange={(e) => {
                      //     const zipCode = e.target.value
                      //     setFieldValue("zipCode", zipCode, false)
                      //     setHasManualError(false)
                      //     setFieldError("zipCode", null)
                      //     validateZipCode(values.primaryCountry, zipCode, setFieldError)
                      // }}
                      // onBlur={() => setFieldTouched("zipCode", true, false)}
                      />
                    </div>
                  </div>

                  <div className="form-group row mt-7">
                    <div className="col-12 col-md-2 offset-0 offset-md-1" style={{ marginBlock: 'auto' }}>
                      <label className="justify-content-start">
                        Primary Contact#{isDanger}
                      </label>
                    </div>
                    <div className="col-12 col-md-2">
                      <Field
                        name="primaryCountry"
                        component={AutoCompleteSelect}
                        customOptions={{
                          records: countryMasterState?.entities,
                          labelField: "countryName",
                          valueField: "countryCode"
                        }}
                        isLoading={countryMasterState?.listLoading}
                        loadingMessage="Fetching records..."
                        placeholder="Select"
                        isrequired
                        onChange={(option) => {
                          const code = countryMasterState?.entities?.filter(x => x.countryCode === option?.value)?.[0]?.dialingCode
                          setFieldValue("primaryDialingCode", code)
                          setFieldValue("primaryCountry", option?.value ?? null)
                        }}
                        label="Country"
                      />
                    </div>
                    <div className="col-12 col-md-2">
                      <Field
                        name="primaryDialingCode"
                        component={Input}
                        disabled
                        label="Dialing Code"
                      />
                    </div>
                    {/* <div className="col-12 col-md-2">
                      <label className="justify-content-start">
                        Primary Contact#{isDanger}
                      </label>
                    </div> */}
                    <div className="col-12 col-md-3">
                      <Field
                        name="primaryContactNumber"
                        component={Input}
                        placeholder="Enter Primary Contact#"
                        isrequired
                        label="Contact#"
                      />
                    </div>
                  </div>
                  <div className="form-group row mt-7">
                    <div className="col-12 col-md-2 offset-0 offset-md-1" style={{ marginBlock: 'auto', whiteSpace: 'nowrap' }}>
                      <label className="justify-content-start">
                        Secondary Contact#
                      </label>
                    </div>
                    <div className="col-12 col-md-2">
                      <Field
                        name="secondaryCountry"
                        component={AutoCompleteSelect}
                        customOptions={{
                          records: countryMasterState?.entities,
                          labelField: "countryName",
                          valueField: "countryCode"
                        }}
                        isLoading={countryMasterState?.listLoading}
                        loadingMessage="Fetching records..."
                        placeholder="Select"
                        onChange={(option) => {
                          let code = countryMasterState?.entities?.filter(x => x.countryCode === option?.value)?.[0]?.dialingCode
                          if (code) {
                          } else {
                            code = ''
                          }
                          setFieldValue("secondaryDialingCode", code)
                          setFieldValue("secondaryCountry", option?.value ?? null)
                        }}
                        label="Country"
                      />
                    </div>
                    <div className="col-12 col-md-2">
                      <Field
                        name="secondaryDialingCode"
                        component={Input}
                        disabled
                        label="Dialing Code"
                      />
                    </div>
                    <div className="col-12 col-md-3">
                      <Field
                        name="secondaryContactNumber"
                        component={Input}
                        placeholder="Enter Secondary Contact#"
                        label="Contact#"
                      />
                    </div>
                  </div>

                </>),
              },
            ]}
          />

          <button
            type="submit"
            style={{ display: "none" }}
            ref={submitBtnRef}
            onSubmit={() => handleSubmit()}
          />
          <button
            type="reset"
            style={{ display: "none" }}
            ref={resetBtnRef}
            onSubmit={() => handleReset()}
          />
          <ErrorFocus />
        </Form>
      )
      }
    </Formik>
  );
};

export default EditForm;
