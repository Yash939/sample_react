import React, { useEffect, useMemo, useState } from "react";
import validations from "../../../../_commons/CommonValidations";
import { Formik, Form, Field } from "formik";
import { AutoCompleteSelect } from "../../../../../../_metronic/_partials/controls";
import CheckboxTree from "react-checkbox-tree";
import "react-checkbox-tree/lib/react-checkbox-tree.css";

import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { userAutorizationActions } from "../_redux/UserAuthorizationRedux";
import { userRoleActions } from "../../UserRole/_redux/UserRoleRedux";
import POSEditableTable from "../../../../_commons/components/POSEditableTable";
import { systemMasterActions } from "../../../SystemMaster/_redux/SystemMasterRedux";
import { convertRoleWiseModuleDataToTree } from "../../../../_commons/Utils";
import {
  toAbsoluteUrl,
  checkIsActive,
} from "../../../../../../_metronic/_helpers";
import { useLocation } from "react-router";
import { NavLink } from "react-router-dom";
const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
  const dispatch = useDispatch();
  const location = useLocation();
  const [moduleListData, setModuleListData] = useState([]);
  const [checked, setChecked] = useState([]);
  const [expanded, setExpanded] = useState([]);
  const {
    // currentState,
    systemMasterState,
    userRoleState,
  } = useSelector(
    (state) => ({
      // currentState: state.userAuthorization,
      systemMasterState: state.systemMaster,
      userRoleState: state.userRole,
    }),
    shallowEqual
  );

  useEffect(() => {
    dispatch(systemMasterActions.getAll());
    dispatch(userRoleActions.getAll());
  }, []);

  //code unique validation
  const validationSchema = useMemo(() => {
    return Yup.object().shape({
      userRoleMSTId: Yup.number().min(1, "User Role Required"),
    });
  }, []);

  const fetchModulesList = (systemId, roleId, setFieldValue) => {
    setFieldValue("id", 0);
    setFieldValue("moduleWiseDTLList", []);
    if (roleId) {
      dispatch(userAutorizationActions.getBySystemRoleIds(1, roleId))
        .then((res) => {
          if (res) {
            setFieldValue("id", res.id);
            setFieldValue(
              "moduleWiseDTLList",
              res.moduleWiseDTLList
                .filter((x) => x.active)
                .map((x, i) => ({ ...x, keyField: i }))
                .sort((a, b) => a.moduleMST.sortOrder - b.moduleMST.sortOrder)
            );
            setModuleListData(res.moduleWiseDTLList.filter((x) => x.active));
          }
        })
        .catch((err) => console.log(err));
    }
  };
  const getMenuItemActive = (url, hasSubmenu = false) => {
    return checkIsActive(location, url)
      ? ` ${!hasSubmenu && "menu-item-active"} menu-item-open `
      : "";
  };

  const generateMenues = (parentModules, allModules) => {
    let module = [];
    parentModules.forEach((parentModule) => {
      const subMenu = allModules.filter(
        (x) =>
          x.moduleMST.parentModuleId !== null &&
          x.moduleMST.parentModuleId === parentModule.moduleMST.id
      );
      if (subMenu.length > 0) {
        module.push({
          value: parentModule.moduleMST.id,
          label: parentModule.moduleMST.moduleName,
          children: generateMenues(subMenu, allModules),
          showCheckbox: true,
        });
        // module.push((
        //   <li key={parentModule.moduleMST.id}
        //     className={`menu-item menu-item-submenu ${getMenuItemActive(
        //       path, true
        //     )}`}
        //     aria-haspopup="true"
        //     data-menu-toggle="hover"
        //     title={ parentModule.moduleMST.id }
        //   >
        //     <NavLink className="menu-link menu-toggle" to={path}>
        //       <i className="menu-bullet menu-bullet-dot">
        //         <span />
        //       </i>
        //       <span className="menu-text">{parentModule.moduleMST.moduleName}</span>
        //       <i className="menu-arrow" />
        //     </NavLink>
        //     <div className="menu-submenu ">
        //       <i className="menu-arrow" />
        //       <ul className="menu-subnav">
        //         {generateMenues(subMenu, allModules)}
        //       </ul>
        //     </div>
        //   </li>
        // ))
      } else {
        module.push({
          value: parentModule.moduleMST.id,
          label: parentModule.moduleMST.moduleName,
          showCheckbox: true,
          //nodes:generateMenues(subMenu, allModules)
        });
        // module.push((
        //   <li
        //     key={parentModule.moduleMST.id}
        //     className={`menu-item  ${getMenuItemActive(
        //       path
        //     )}`}
        //     aria-haspopup="true"
        //     title={ parentModule.moduleMST.id }
        //   >
        //     <NavLink className="menu-link"
        //       to={path}>
        //       <i className="menu-bullet menu-bullet-dot">
        //         <span />
        //       </i>
        //       <span className="menu-text">{parentModule.moduleMST.moduleName}</span>
        //     </NavLink>
        //   </li>
        // ))
      }
    });
    return module;
  };
  const getIconById = (id) => {};
  useEffect(() => {
    if (moduleListData && moduleListData.length) {
      let checkedData = [];
      moduleListData.map((row) => {
        if (row.accessRights === "FULL") {
          checkedData.push(row.moduleMST.id);
        }
      });
      setChecked(checkedData);
    }
  }, [moduleListData]);
  const onCheckNodeClick = (checked) => {
    setChecked(checked);
  };
  const getCheckedModuleList = (list) => {
    let arr = [];
    list.map((row) => {
      let data = checked.find((id) => Number(id) === Number(row.moduleMST.id));
      if (data) {
        arr.push({ ...row, accessRights: "FULL" });
      } else {
        arr.push({ ...row, accessRights: "NONE" });
      }
    });
    return arr;
  };
  const genratedMenus = useMemo(() => {
    const rootModules = moduleListData
      .filter((x) => x.moduleMST.parentModuleId === null)
      .map((item) => ({
        ...item,
        moduleImage: getIconById(item.moduleMST.id) ?? null,
      })).sort((a,b)=>  a.moduleMST.sortOrder - b.moduleMST.sortOrder)
    const menu = generateMenues(rootModules, moduleListData?.sort((a,b)=>  a.moduleMST.sortOrder - b.moduleMST.sortOrder));

    if (menu && menu.length) {
      return (
        <div>
          <CheckboxTree
            nodes={menu}
            //nativeCheckboxes
            checked={checked}
            expanded={expanded}
            onCheck={onCheckNodeClick}
            onExpand={(expanded) => setExpanded(expanded)}
            //onCheck={clk=>console.log(clk)}
            iconsClass="fa5"
            checkModel="all"
            showExpandAll
            expandOnClick
            nativeCheckboxes
          />
        </div>
      );
    } else {
      return <div></div>;
    }
  }, [moduleListData, generateMenues]);
  const accessRightsOptions = [
    { value: "FULL", label: "Full" },
    { value: "READONLY", label: "Read Only" },
    { value: "NONE", label: "None" },
  ];
  const accessTypesOptions = [
    { value: "SELF", label: "Self" },
    { value: "TREE", label: "Tree" },
    { value: "ALL", label: "All" },
  ];
  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        id: 0,
        systemMSTId: 1,
        userRoleMSTId: 0,
        moduleWiseDTLList: [],
      }}
      validationSchema={validationSchema}
      onSubmit={(values) => {
        
          let newValue = {
            ...values,
            moduleWiseDTLList: getCheckedModuleList(values.moduleWiseDTLList),
          };
          if (newValue.id) saveRecord(newValue,"update");
          else 
          saveRecord(newValue,"create");
        
      }}
    >
      {({ handleSubmit, handleReset, values, setFieldValue }) => (
        <Form className="form form-label-right">
          <div className="form-group row">
        
            <div className="col-lg-3 offset-lg-4">
              <Field
                name="userRoleMSTId"
                component={AutoCompleteSelect}
                customOptions={{
                  records: userRoleState?.entities,
                  labelField: "roleName",
                  valueField: "id",
                }}
                isLoading={userRoleState.listLoading}
                loadingMessage="Fetching records..."
                placeholder="Select User Role"
                isrequired
                label="User Role"
                onChange={(val) => {
                  setFieldValue("userRoleMSTId", val?.value ?? 0);
                  fetchModulesList(
                    values.systemMSTId,
                    val?.value ?? 0,
                    setFieldValue
                  );
                }}
              />
            </div>
          </div>
          <div className="form-group row p-5">
            <div className="col-lg-8 offset-lg-2">
              {moduleListData && genratedMenus}
              {/* <POSEditableTable
                data={values.moduleWiseDTLList}
                noDataIndication={
                  <div className="text-center">
                    {
                      (!values.userRoleMSTId)
                        ? <span>Please select user role</span>
                        : <span>No modules found</span>
                    }
                  </div>
                }
                columns={[
                  {
                    dataField: "moduleMST.moduleName",
                    text: "Admin Modules",
                    editable: false,
                    headerStyle: { width: '60%' }
                  },
                  {
                    dataField: "accessRights",
                    text: "Access Rights",
                    sort: true,
                    headerStyle: { width: '20%' },
                    editor: {
                      type: 'select', options: accessRightsOptions
                    },
                    editorClasses: 'form-control-sm',
                    headerClasses: "text-center",
                    classes: "text-center",
                    formatter: cell => accessRightsOptions.find(x => x.value === cell)?.label
                  },
                  // {
                  //   dataField: "accessType",
                  //   text: "Access Types",
                  //   sort: true,
                  //   editor: {
                  //     type: 'select', options: accessTypesOptions
                  //   },
                  //   editorClasses: 'form-control-sm',
                  //   headerClasses: "text-center",
                  //   classes: "text-center",
                  //   formatter: cell => accessTypesOptions.find(x => x.value === cell)?.label
                  // },
                ]} 
              />*/}
            </div>
          </div>

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
        </Form>
      )}
    </Formik>
  );
};

export default EditForm;
