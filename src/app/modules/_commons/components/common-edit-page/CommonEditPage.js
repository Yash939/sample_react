import React, { useRef, useEffect, useState } from 'react';
import {
    Card,
    CardHeader,
    CardHeaderToolbar,
    CardBody
} from '../../../../../_metronic/_partials/controls';
import { useHistory, useRouteMatch } from "react-router-dom";
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { Spinner } from 'react-bootstrap';
// import { values } from 'lodash';
// import { useSubheader } from '../../../../../_metronic/layout';

const headerButtonStyles = {
    minWidth: "85px",
    whiteSpace: 'nowrap'
}

const CommonEditPage = ({ sufixTitle, backURL, actions, EditForm, reducerInfo, dependancies = [], extraBtns = [], hiddenId, goBack = false,showReset=true,showSave=true, saveButtonName="Save", saveButtonIcon = null, customBack = undefined}) => {

    const { params: { id: editID, secId, readonly: isReadOnlyPage, ispopup } } = useRouteMatch()
    const history = useHistory()
    const dispatch = useDispatch()
    const submitBtnRef = useRef()
    const resetBtnRef = useRef()
    const extraBtnSpanRef = useRef()
    const [saveError, setSaveError] = useState();

    useEffect(() => {

        if (editID && secId) {
            // console.log("with sec id")
            dispatch(actions.fetchEntity(editID, secId))
        } else if (editID) {
            // console.log("with one id")
            dispatch(actions.fetchEntity(editID))
        } else if (hiddenId) {
            dispatch(actions.fetchEntity(hiddenId))
        }
        dependancies.forEach(dep => {
            if (dep.callerMethod)
                dispatch(dep.callerMethod())
        })
    }, []);



    const { actionLoading, error, entityForEdit, loadingMessage } = useSelector((state) => ({
        actionLoading: state[reducerInfo.name].actionLoading,
        error: state[reducerInfo.name].error,
        entityForEdit: state[reducerInfo.name].entityForEdit,
        loadingMessage: state[reducerInfo.name].loadingMessage
    }), shallowEqual)

    const dependanciesStates = useSelector(state => {
        let states = []
        dependancies.forEach(dep => {
            states.push({
                reducerName: dep.reducerName,
                ...state[dep.reducerName]
            })
        })
        return states;
    })

    const enitity = ((editID && entityForEdit) || (hiddenId && entityForEdit))
        ? entityForEdit
        : reducerInfo.initialEnitity;

    const backToList = () => {
        if(customBack) {
            dispatch(actions.reIniState())
            customBack()
        }
        else if (ispopup) {
            // window.status = true
            window.close();
        } else if (goBack) {
            dispatch(actions.reIniState())
            if(history?.action === "POP" && backURL) {
                history.push(backURL)
            } else {
                history.goBack()
            }
        }
        else if (backURL) {
            dispatch(actions.reIniState())
            history.push(backURL)
        }
        // else
        //     resetBtnHandler();

    }

    const saveRecord = (value, force = null, custom = null) => {
        if (custom) {
            custom.then(res => {
                backToList()
            }).catch(err => setSaveError(err));
        } else {
            let val = {
                ...value,
            }
            switch (force) {
                case "create":
                    dispatch(actions.create(val)).then(e => {
                        backToList()
                    }).catch(e => console.log(e));
                    break;
                case "update":
                    dispatch(actions.update(val)).then((e) => {
                        backToList()
                    }).catch(e => console.log(e));
                    break;
                default:
                    val.ID_FIELD = reducerInfo.idFieldName
                    if (editID) {
                        dispatch(actions.update(val)).then((e) => {
                            backToList()
                        }).catch(e => console.log(e));
                    } else {
                        dispatch(actions.create(val)).then(e => {
                            backToList()
                        }).catch(e => console.log(e));
                    }
            }
        }
    }
    const saveBtnHandler = () => {
        if (submitBtnRef && submitBtnRef.current)
            submitBtnRef.current.click()
    }
    const resetBtnHandler = () => {
        if (resetBtnRef && resetBtnRef.current)
            resetBtnRef.current.click()
    }
    const extraBtnClickHandler = (btnKey) => {
        if (extraBtnSpanRef && extraBtnSpanRef.current) {
            const btn = extraBtnSpanRef.current.querySelector("#" + btnKey)
            if (btn)
                btn.click();
            else
                console.log(btnKey, "Extra btn not found")
        }
    }

    useEffect(() => {
        const input = document.querySelector("input");
        if (input)
            input.focus();
    }, [])

    return (
        <Card>
            <CardHeader title={(isReadOnlyPage ? "View " : editID ? "Update " : "New ") + sufixTitle}>
                <CardHeaderToolbar>
                    {!isReadOnlyPage && (
                        <>
                            {(backURL || goBack) && (
                                <button
                                    type="button"
                                    onClick={backToList}
                                    className="btn btn-light"
                                    style={headerButtonStyles}
                                >
                                    <i className="fa fa-arrow-left"></i>
                                    Back
                                </button>
                            )}
                            {showReset && <button
                                className="btn btn-light ml-2"
                                style={headerButtonStyles}
                                onClick={resetBtnHandler}
                            >
                                <i className="fa fa-redo"></i>
                                Reset
                            </button>}
                            
                            <span>
                                {extraBtns.length ? (
                                    extraBtns.map((btn, index) => {
                                        return (
                                            <button
                                                key={btn.key}
                                                id={btn.key}
                                                type="button"
                                                style={headerButtonStyles}
                                                className={"btn btn-light ml-2"}
                                                onClick={e => extraBtnClickHandler(btn.key)}
                                            >
                                                <i className={btn.iconClass} style={{ color: "#777" }}></i>
                                                {btn.text}
                                            </button>
                                        )
                                    })
                                ) : null}
                            </span>
                            {showSave && 
                            <button
                                type="submit"
                                style={ !(backURL || goBack)  ? { minWidth: "85px",whiteSpace: 'nowrap',marginLeft:"1.5rem",marginTop:"0px" } : headerButtonStyles }
                                className="btn pinaple-yellow-btn smbtn"
                                onClick={saveBtnHandler}
                            >
                                {saveButtonIcon ? saveButtonIcon : <i className="fa fa-save" style={{ color: "#777" }}></i>}
                                {saveButtonName}
                            </button>}
                        </>
                    )}
                </CardHeaderToolbar>
            </CardHeader>
            <CardBody id="edit-form">
                {
                    actionLoading || dependanciesStates.some(x => x.listLoading || x.actionLoading) ?
                        <div className="text-center">
                            <Spinner animation="grow" variant="warning" /> &nbsp;
                            <Spinner animation="grow" variant="dark" /> &nbsp;
                            <Spinner animation="grow" variant="warning" /> &nbsp;
                            {loadingMessage ? <><br /><br />{loadingMessage}</> : ''}
                        </div> :

                        // editID && !entityForEdit ?
                        //     <div className="text-center text-danger mb-3">
                        //         Error : Id {editID} : {sufixTitle} not Found!!
                        //     </div> :
                            <>
                                {saveError ? (
                                    <div className="text-center text-danger mb-3">
                                         {/* { Error-error.userMessage} */}
                                         Error: {error.userMessage}
                                        {/* <small>({error.error.message})</small> */}
                                    </div>
                                ) : error ? (
                                    <div className="text-center text-danger mb-3">
                                        {/* {Error-error.userMessage} */}
                                        Error: {error.userMessage}
                                        {/* <small>({error.error.message})</small> */}
                                    </div>
                                ) : ""}
                            </>
                }
                <div style={{ display: actionLoading || dependanciesStates.some(x => x.listLoading || x.actionLoading) || (editID && !entityForEdit) ? 'none' : 'initial', /* pointerEvents: isReadOnlyPage ? 'none' : 'initial' */ }}>
                    <EditForm
                        saveRecord={saveRecord}
                        enitity={enitity}
                        submitBtnRef={submitBtnRef}
                        resetBtnRef={resetBtnRef}
                        extraBtnSpanRef={extraBtnSpanRef}
                        extraBtns={extraBtns}
                        hiddenId={hiddenId}
                        isReadOnlyPage={isReadOnlyPage}
                    />
                </div>
            </CardBody>
        </Card>
    );
};

export default CommonEditPage;