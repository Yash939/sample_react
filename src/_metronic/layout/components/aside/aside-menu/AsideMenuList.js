/* eslint-disable no-script-url,jsx-a11y/anchor-is-valid */
import React, { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router";
import { NavLink, useHistory } from "react-router-dom";
import SVG from "react-inlinesvg";
import { toAbsoluteUrl, checkIsActive } from "../../../../_helpers";
import { useSelector, useDispatch } from "react-redux";
import { moduleMasterActions } from "../../../../../app/modules/Masters/ModuleMaster/_redux/ModuleMasterRedux";
import { xor } from "lodash";
import { sortArray } from "../../../../../app/modules/_commons/Utils";

const isDevelopment = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')

export function AsideMenuList({ layoutProps }) {
  const location = useLocation();
  const dispatch = useDispatch()

  const getMenuItemActive = (url, hasSubmenu = false) => {
    return checkIsActive(location, url)
      ? ` ${!hasSubmenu && "menu-item-active"} menu-item-open `
      : "";
  };
  const history = useHistory();

  const redirectTo = (e, path) => {
    history.push(path)
    e.preventDefault()
  }
  const generateMenues = (parentModules, allModules) => {
    const module = []
    parentModules.forEach(parentModule => {
      const path = parentModule.path ?? "nopath"//`/module/${parentModule.moduleMSTId}`
      let subMenu = allModules.filter(x => x.parentModuleId === parentModule.id && x.moduleCode !== "TASK_CREATION")
      if (parentModule.moduleCode === "TASK") {
        subMenu = [
          {
            id: "id1",
            parentModuleId: parentModule.id,
            path: path + "?filter=Open",
            moduleName: "Open"
          },
          {
            id: "id4",
            parentModuleId: parentModule.id,
            path: path + "?filter=Assigned",
            moduleName: "Assigned"
          },
          {
            id: "id2",
            parentModuleId: parentModule.id,
            path: path + "?filter=WIP",
            moduleName: "WIP"
          },
          {
            id: "id3",
            parentModuleId: parentModule.id,
            path: path + "?filter=Closed",
            moduleName: "Closed"
          },
          {
            id: "id6",
            parentModuleId: parentModule.id,
            path: path + "?filter=Cancelled",
            moduleName: "Cancelled"
          },
          {
            id: "id5",
            parentModuleId: parentModule.id,
            path: path + "?filter=Confirmed",
            moduleName: "Confirm"
          },
          // {
          //   id: "id5",
          //   parentModuleId: parentModule.id,
          //   path: path + "?filter=All",
          //   moduleName: "All"
          // },
        ]
      }
      if (subMenu.length > 0) {
        module.push((
          <li key={parentModule.id}
            className={`menu-item menu-item-submenu ${getMenuItemActive(
              path, true
            )}`}
            aria-haspopup="true"
            data-menu-toggle="hover"
            title={isDevelopment ? parentModule.id : undefined}
          >
            {parentModule.moduleCode === "TASK" ?
              <NavLink className="menu-link " to={path} id={path}>
                <i className="menu-bullet menu-bullet-dot">
                  <span />
                </i>
                <span className="menu-text" onClick={(e) => redirectTo(e, path + "?filter=All")}>{parentModule.moduleName}</span>
                <i className="menu-arrow menu-toggle" />
              </NavLink>
              :
              <NavLink className="menu-link menu-toggle" to={path} id={path}>
                <i className="menu-bullet menu-bullet-dot">
                  <span />
                </i>
                <span className="menu-text">{parentModule.moduleName}</span>
                <i className="menu-arrow" />
              </NavLink>
            }

            <div className="menu-submenu ">
              <i className="menu-arrow" />
              <ul className="menu-subnav">
                {generateMenues(subMenu, allModules)}
              </ul>
            </div>
          </li>
        ))
      } else {
        module.push((
          <li
            key={parentModule.id}
            className={`menu-item  ${getMenuItemActive(
              path
            )}`}
            aria-haspopup="true"
            title={isDevelopment ? parentModule.id : undefined}
          >
            {["id1", "id2", "id3", "id4", "id5", "id6"].includes(parentModule.id) ?
              <NavLink className="menu-link"
                to={path}
                id={path}
                
              >
                <i className="menu-bullet menu-bullet-dot">
                  <span />
                </i>
                <span className="menu-text" onClick={(e) => {
                  history.push(path)
                  window.location.reload()
                }}>{parentModule.moduleName}</span>
              </NavLink> :
              <NavLink className="menu-link"
                to={path}
                id={path}
              >
                <i className="menu-bullet menu-bullet-dot">
                  <span />
                </i>
                <span className="menu-text">{parentModule.moduleName}</span>
              </NavLink>}
          </li>
        ))
      }
    });
    return module
  }

  const getIconById = (id) => {

  }

  const { moduleMasterState } = useSelector(state => {
    return {
      moduleMasterState: state.moduleMaster
    }
  })

  useEffect(() => {
    //When you change Module Master getAll to by user access you need also changes SubHeader file 'ListLoading' (_metronic\layout\components\subheader\SubHeader.js)
    // dispatch(moduleMasterActions.getAllActive())
    dispatch(moduleMasterActions.getByRole())
    // eslint-disable-next-line
  }, [])
  const genratedMenus = useMemo(() => {

    const dashboardId = moduleMasterState.entities.filter(x => x.moduleCode === 'DASHBOARD')?.[0]?.id

    const logsId = moduleMasterState.entities.filter(x => x.moduleCode === 'LOGS')?.[0]?.id

    let rootModules = moduleMasterState.entities.filter(x => x.parentModuleId == null).map(item => ({ ...item, moduleImage: getIconById(item.id) ?? null }))
    if (dashboardId) {
      if (moduleMasterState.entities.filter(x => x.id === dashboardId)?.length === 1) {
        rootModules = rootModules.filter(x => x.moduleCode !== 'DASHBOARD')
        let tmp = sortArray(moduleMasterState.entities.filter(x => x.parentModuleId === dashboardId), "sortOrder", 'desc')
        tmp.forEach(x => {
          rootModules.unshift(x)
        })
      }
    }

    if (logsId) {
      if (moduleMasterState.entities.filter(x => x.id === logsId)?.length === 1) {
        rootModules = rootModules.filter(x => x.moduleCode !== 'LOGS')
        let tmp = sortArray(moduleMasterState.entities.filter(x => x.parentModuleId === logsId), "sortOrder", 'desc')
        tmp.forEach(x => {
          rootModules.push(x)
        })
      }
    }


    return generateMenues(rootModules, moduleMasterState.entities);
    // setGeneratedMenus(genMenus)
    // eslint-disable-next-line
  }, [location, moduleMasterState.entities, generateMenues])

  return (moduleMasterState.listLoading
    ? <h4 className="text-warning text-center">
      <div className="spinner-grow text-warning" role="status">
        <span className="sr-only">Loading...</span>
      </div>
      <br />
      <br />
      Loading...
    </h4>
    : moduleMasterState.error
      ? <div className="text-danger text-center"><h4>Error</h4> <hr />{moduleMasterState.error.userMessage}"</div>
      : <ul className={`menu-nav ${layoutProps.ulClasses}`}>{genratedMenus}</ul>);

  // return (error ? <div className="text-danger text-center"><h4>Error</h4> <hr />Can't acccess modules/menus due to "{error}"</div> :
  //   <>
  //     {/* begin::Menu Nav */}
  //     <ul className={`menu-nav ${layoutProps.ulClasses}`}>
  //       {/*begin::1 Level*/}
  //       <li
  //         className={`menu-item ${getMenuItemActive("/dashboard", false)}`}
  //         aria-haspopup="true"
  //       >
  //         <NavLink className="menu-link" to="/dashboard">
  //           <span className="svg-icon menu-icon">
  //             <SVG src={toAbsoluteUrl("/media/svg/icons/Design/Layers.svg")} />
  //           </span>
  //           <span className="menu-text">Dashboard</span>
  //         </NavLink>
  //       </li>
  //       {/*end::1 Level*/}


  //       {/*begin::1 Level*/}
  //       <li
  //         className={`menu-item menu-item-submenu ${getMenuItemActive("/builder", false)}`}
  //         aria-haspopup="true"
  //       >
  //         <NavLink className="menu-link" to="/builder">
  //           <span className="svg-icon menu-icon">
  //             <SVG src={toAbsoluteUrl("/media/svg/icons/Home/Library.svg")} />
  //           </span>
  //           <span className="menu-text">Layout Builder</span>
  //         </NavLink>
  //       </li>
  //       {/*end::1 Level*/}

  //       {/*begin::1 Level*/}
  //       <li
  //         className={`menu-item menu-item-submenu ${getMenuItemActive(
  //           "/masters", true
  //         )}`}
  //         aria-haspopup="true"
  //         data-menu-toggle="hover"
  //       >
  //         <NavLink className="menu-link menu-toggle" to="/masters">
  //           <span className="svg-icon menu-icon">
  //             <SVG src={toAbsoluteUrl("/media/svg/icons/Layout/Layout-top-panel-6.svg")} />
  //           </span>
  //           <span className="menu-text">Masters</span>
  //           <i className="menu-arrow" />
  //         </NavLink>
  //         <div className="menu-submenu ">
  //           <i className="menu-arrow" />
  //           <ul className="menu-subnav">
  //             <li className="menu-item  menu-item-parent" aria-haspopup="true">
  //               <span className="menu-link">
  //                 <span className="menu-text">Masters</span>
  //               </span>
  //             </li>

  //             {/* Inputs */}
  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item menu-item-submenu ${getMenuItemActive(
  //                 "/masters/geography", true
  //               )}`}
  //               aria-haspopup="true"
  //               data-menu-toggle="hover"
  //             >
  //               <NavLink className="menu-link menu-toggle" to="/masters/geography">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Geography</span>
  //                 <i className="menu-arrow" />
  //               </NavLink>
  //               <div className="menu-submenu ">
  //                 <i className="menu-arrow" />
  //                 <ul className="menu-subnav">
  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item  ${getMenuItemActive(
  //                       "/masters/geography/type"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link"
  //                       to="/masters/geography/type">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Geography Types</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}
  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item  ${getMenuItemActive(
  //                       "/masters/geography/master"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link"
  //                       to="/masters/geography/master">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Geography Master</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}
  //                 </ul>
  //               </div>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/* Navigation */}
  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item menu-item-submenu  ${getMenuItemActive(
  //                 "/google-material/navigation", true
  //               )}`}
  //               aria-haspopup="true"
  //               data-menu-toggle="hover"
  //             >
  //               <NavLink className="menu-link menu-toggle" to="/google-material/navigation">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Navigation</span>
  //                 <i className="menu-arrow" />
  //               </NavLink>
  //               <div className="menu-submenu">
  //                 <i className="menu-arrow" />
  //                 <ul className="menu-subnav">
  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/navigation/bottom-navigation"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/navigation/bottom-navigation">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Bottom Navigation</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/navigation/breadcrumbs"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/navigation/breadcrumbs">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Breadcrumbs</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/navigation/drawern"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/navigation/drawer">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Drawers</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/navigation/links"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/navigation/links">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">NavLinks</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/navigation/menus"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/navigation/menus">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Menus</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/navigation/steppers"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/navigation/steppers">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Steppers</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/navigation/tabs"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/navigation/tabs">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Tabs</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}
  //                 </ul>
  //               </div>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/* Surfaces */}
  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item menu-item-submenu ${getMenuItemActive(
  //                 "/google-material/surfaces", true
  //               )}`}
  //               aria-haspopup="true"
  //               data-menu-toggle="hover"
  //             >
  //               <NavLink className="menu-link menu-toggle" to="/google-material/surfaces">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Surfaces</span>
  //                 <i className="menu-arrow" />
  //               </NavLink>
  //               <div className="menu-submenu">
  //                 <i className="menu-arrow" />
  //                 <ul className="menu-subnav">
  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/surfaces/app-bar"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/surfaces/app-bar">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">App Bar</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/surfaces/paper"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/surfaces/paper">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Paper</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/surfaces/cards"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/surfaces/cards">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Cards</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/surfaces/expansion-panels"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/surfaces/expansion-panels">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Expansion Panels</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}
  //                 </ul>
  //               </div>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/* Feedback */}
  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item menu-item-submenu ${getMenuItemActive(
  //                 "/google-material/feedback", true
  //               )}`}
  //               aria-haspopup="true"
  //               data-menu-toggle="hover"
  //             >
  //               <NavLink className="menu-link menu-toggle" to="/google-material/feedback">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Feedback</span>
  //                 <i className="menu-arrow" />
  //               </NavLink>
  //               <div className="menu-submenu">
  //                 <i className="menu-arrow" />
  //                 <ul className="menu-subnav">
  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/feedback/progress"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/feedback/progress">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Progress</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/feedback/dialogs"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/feedback/dialogs">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Dialogs</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/feedback/snackbars"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/feedback/snackbars">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Snackbars</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}
  //                 </ul>
  //               </div>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/* Data Display */}
  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item menu-item-submenu ${getMenuItemActive(
  //                 "/google-material/data-displays", true
  //               )}`}
  //               aria-haspopup="true"
  //               data-menu-toggle="hover"
  //             >
  //               <NavLink className="menu-link menu-toggle" to="/google-material/data-displays">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Data Display</span>
  //                 <i className="menu-arrow" />
  //               </NavLink>
  //               <div className="menu-submenu">
  //                 <i className="menu-arrow" />
  //                 <ul className="menu-subnav">
  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/data-displays/avatars"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/data-displays/avatars">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Avatars</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/data-displays/badges"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/data-displays/badges">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Badges</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/data-displays/chips"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/data-displays/chips">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Chips</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/data-displays/dividers"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/data-displays/dividers">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Dividers</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/data-displays/icons"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/data-displays/icons">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Icons</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/data-displays/lists"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/data-displays/lists">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Lists</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/data-displays/tables"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/data-displays/tables">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Tables</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/data-displays/tooltips"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/data-displays/tooltips">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Tooltips</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/data-displays/typography"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/data-displays/typography">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Typography</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}
  //                 </ul>
  //               </div>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/* Utils */}
  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item menu-item-submenu ${getMenuItemActive(
  //                 "/google-material/utils", true
  //               )}`}
  //               aria-haspopup="true"
  //               data-menu-toggle="hover"
  //             >
  //               <NavLink className="menu-link menu-toggle" to="/google-material/utils">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Utils</span>
  //                 <i className="menu-arrow" />
  //               </NavLink>
  //               <div className="menu-submenu">
  //                 <i className="menu-arrow" />
  //                 <ul className="menu-subnav">
  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/utils/click-away-listener"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/utils/click-away-listener">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Click Away Listener</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/utils/no-ssr"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/utils/no-ssr">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">No SSR</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/utils/popover"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/utils/popover">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Popover</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/utils/popper"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/utils/popper">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Popper</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/utils/portal"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/utils/portal">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Portal</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/utils/transitions"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/utils/transitions">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Transitions</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/utils/use-media-query"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/utils/use-media-query">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">useMediaQuery</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}
  //                 </ul>
  //               </div>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/* Layout */}
  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item menu-item-submenu ${getMenuItemActive(
  //                 "/google-material/layout", true
  //               )}`}
  //               aria-haspopup="true"
  //               data-menu-toggle="hover"
  //             >
  //               <NavLink className="menu-link menu-toggle" to="/google-material/layout">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Layout</span>
  //                 <i className="menu-arrow" />
  //               </NavLink>
  //               <div className="menu-submenu">
  //                 <i className="menu-arrow" />
  //                 <ul className="menu-subnav">
  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/layout/box"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/layout/box">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Box</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/layout/container"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/layout/container">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Container</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/layout/grid"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/layout/grid">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Grid</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/layout/grid-list"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/layout/grid-list">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Grid list</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}

  //                   {/*begin::3 Level*/}
  //                   <li
  //                     className={`menu-item ${getMenuItemActive(
  //                       "/google-material/layout/hidden"
  //                     )}`}
  //                     aria-haspopup="true"
  //                   >
  //                     <NavLink className="menu-link" to="/google-material/layout/hidden">
  //                       <i className="menu-bullet menu-bullet-dot">
  //                         <span />
  //                       </i>
  //                       <span className="menu-text">Hidden</span>
  //                     </NavLink>
  //                   </li>
  //                   {/*end::3 Level*/}
  //                 </ul>
  //               </div>
  //             </li>
  //             {/*end::2 Level*/}
  //           </ul>
  //         </div>
  //       </li>
  //       {/*end::1 Level*/}

  //       {/* Bootstrap */}
  //       {/*begin::1 Level*/}
  //       <li
  //         className={`menu-item menu-item-submenu ${getMenuItemActive(
  //           "/react-bootstrap", true
  //         )}`}
  //         aria-haspopup="true"
  //         data-menu-toggle="hover"
  //       >
  //         <NavLink className="menu-link menu-toggle" to="/react-bootstrap">
  //           <span className="svg-icon menu-icon">
  //             <SVG src={toAbsoluteUrl("/media/svg/icons/Shopping/Box2.svg")} />
  //           </span>
  //           <span className="menu-text">Bootstrap</span>
  //           <i className="menu-arrow" />
  //         </NavLink>
  //         <div className="menu-submenu ">
  //           <ul className="menu-subnav">
  //             <ul className="menu-subnav">
  //               <li
  //                 className="menu-item  menu-item-parent"
  //                 aria-haspopup="true"
  //               >
  //                 <span className="menu-link">
  //                   <span className="menu-text">Bootstrap</span>
  //                 </span>
  //               </li>

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/alert"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/alert">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Alerts</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/badge"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/badge">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Badge</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/breadcrumb"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/breadcrumb">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Breadcrumb</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/buttons"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/buttons">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Buttons</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/button-group"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/button-group">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Button Group</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/cards"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/cards">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Cards</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/carousel"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/carousel">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Carousel</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/dropdowns"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/dropdowns">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Dropdowns</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/forms"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/forms">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Forms</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/input-group"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/input-group">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Input Group</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/images"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/images">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Images</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/figures"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/figures">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Figures</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/jumbotron"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/jumbotron">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Jumbotron</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/list-group"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/list-group">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">List group</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/modal"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/modal">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Modal</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/navs"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/navs">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Navs</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/navbar"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/navbar">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Navbar</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/overlays"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/overlays">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Overlays</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/pagination"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/pagination">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Pagination</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/popovers"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/popovers">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Popovers</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/progress"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/progress">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Progress</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/spinners"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/spinners">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Spinners</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/table"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/table">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Table</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/tabs"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/tabs">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Tabs</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/tooltips"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/tooltips">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Tooltips</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}

  //               {/*begin::2 Level*/}
  //               <li
  //                 className={`menu-item ${getMenuItemActive(
  //                   "/react-bootstrap/toasts"
  //                 )}`}
  //                 aria-haspopup="true"
  //               >
  //                 <NavLink className="menu-link" to="/react-bootstrap/toasts">
  //                   <i className="menu-bullet menu-bullet-dot">
  //                     <span />
  //                   </i>
  //                   <span className="menu-text">Toasts</span>
  //                 </NavLink>
  //               </li>
  //               {/*end::2 Level*/}
  //             </ul>
  //           </ul>
  //         </div>
  //       </li>
  //       {/*end::1 Level*/}

  //       {/* Applications */}
  //       {/* begin::section */}
  //       <li className="menu-section ">
  //         <h4 className="menu-text">Applications</h4>
  //         <i className="menu-icon flaticon-more-v2"></i>
  //       </li>
  //       {/* end:: section */}

  //       {/* eCommerce */}
  //       {/*begin::1 Level*/}
  //       <li
  //         className={`menu-item menu-item-submenu ${getMenuItemActive(
  //           "/e-commerce", true
  //         )}`}
  //         aria-haspopup="true"
  //         data-menu-toggle="hover"
  //       >
  //         <NavLink className="menu-link menu-toggle" to="/e-commerce">
  //           <span className="svg-icon menu-icon">
  //             <SVG src={toAbsoluteUrl("/media/svg/icons/Shopping/Bag2.svg")} />
  //           </span>
  //           <span className="menu-text">eCommerce</span>
  //         </NavLink>
  //         <div className="menu-submenu">
  //           <i className="menu-arrow" />
  //           <ul className="menu-subnav">
  //             <li className="menu-item menu-item-parent" aria-haspopup="true">
  //               <span className="menu-link">
  //                 <span className="menu-text">eCommerce</span>
  //               </span>
  //             </li>
  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item ${getMenuItemActive(
  //                 "/e-commerce/customers"
  //               )}`}
  //               aria-haspopup="true"
  //             >
  //               <NavLink className="menu-link" to="/e-commerce/customers">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Customers</span>
  //               </NavLink>
  //             </li>
  //             {/*end::2 Level*/}
  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item ${getMenuItemActive(
  //                 "/e-commerce/products"
  //               )}`}
  //               aria-haspopup="true"
  //             >
  //               <NavLink className="menu-link" to="/e-commerce/products">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Products</span>
  //               </NavLink>
  //             </li>
  //             {/*end::2 Level*/}
  //           </ul>
  //         </div>
  //       </li>
  //       {/*end::1 Level*/}

  //       {/* Custom */}
  //       {/* begin::section */}
  //       <li className="menu-section ">
  //         <h4 className="menu-text">Custom</h4>
  //         <i className="menu-icon flaticon-more-v2"></i>
  //       </li>
  //       {/* end:: section */}

  //       {/* Error Pages */}
  //       {/*begin::1 Level*/}
  //       <li
  //         className={`menu-item menu-item-submenu ${getMenuItemActive(
  //           "/error", true
  //         )}`}
  //         aria-haspopup="true"
  //         data-menu-toggle="hover"
  //       >
  //         <NavLink className="menu-link menu-toggle" to="/error">
  //           <span className="svg-icon menu-icon">
  //             <SVG
  //               src={toAbsoluteUrl("/media/svg/icons/Code/Error-circle.svg")}
  //             />
  //           </span>
  //           <span className="menu-text">Error Pages</span>
  //           <i className="menu-arrow" />
  //         </NavLink>
  //         <div className="menu-submenu ">
  //           <i className="menu-arrow" />
  //           <ul className="menu-subnav">
  //             <li className="menu-item  menu-item-parent" aria-haspopup="true">
  //               <span className="menu-link">
  //                 <span className="menu-text">Error Pages</span>
  //               </span>
  //             </li>

  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item ${getMenuItemActive("/error/error-v1")}`}
  //               aria-haspopup="true"
  //             >
  //               <NavLink className="menu-link" to="/error/error-v1">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Error Page - 1</span>
  //               </NavLink>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item ${getMenuItemActive("/error/error-v2")}`}
  //               aria-haspopup="true"
  //             >
  //               <NavLink className="menu-link" to="/error/error-v2">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Error Page -2</span>
  //               </NavLink>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item ${getMenuItemActive("/error/error-v3")}`}
  //               aria-haspopup="true"
  //             >
  //               <NavLink className="menu-link" to="/error/error-v3">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Error Page - 3</span>
  //               </NavLink>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item ${getMenuItemActive("/error/error-v4")}`}
  //               aria-haspopup="true"
  //             >
  //               <NavLink className="menu-link" to="/error/error-v4">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Error Page - 4</span>
  //               </NavLink>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item ${getMenuItemActive("/error/error-v5")}`}
  //               aria-haspopup="true"
  //             >
  //               <NavLink className="menu-link" to="/error/error-v5">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Error Page - 5</span>
  //               </NavLink>
  //             </li>
  //             {/*end::2 Level*/}

  //             {/*begin::2 Level*/}
  //             <li
  //               className={`menu-item ${getMenuItemActive("/error/error-v6")}`}
  //               aria-haspopup="true"
  //             >
  //               <NavLink className="menu-link" to="/error/error-v6">
  //                 <i className="menu-bullet menu-bullet-dot">
  //                   <span />
  //                 </i>
  //                 <span className="menu-text">Error Page - 6</span>
  //               </NavLink>
  //             </li>
  //             {/*end::2 Level*/}
  //           </ul>
  //         </div>
  //       </li>
  //       {/*end::1 Level*/}
  //     </ul>

  //     {/* end::Menu Nav */}
  //   </>
  // );
}
