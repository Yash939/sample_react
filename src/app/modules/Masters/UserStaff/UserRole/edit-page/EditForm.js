import React, { useEffect, useMemo, useState } from 'react';
import validations from "../../../../_commons/CommonValidations";
import { Formik, Form, Field } from 'formik';
import { Input, Switch } from '../../../../../../_metronic/_partials/controls';
import * as Yup from "yup";
import { useSelector, shallowEqual, useDispatch } from 'react-redux';
import { userRoleActions } from "../_redux/UserRoleRedux";
import { taskStatusMasterActions } from "../../../TaskStatusMaster/_redux/TaskStatusMasterRedux";
import POSEditableTable from '../../../../_commons/components/POSEditableTable';
import { reducerInfo as statusAccessReducer } from '../_redux/UserRoleStatusAccessRedux';

const EditForm = ({ enitity, saveRecord, submitBtnRef, resetBtnRef }) => {
    const dispatch = useDispatch()
    const [selected, setSelected] = useState([])

    const { currentState, taskStatusMasterState } = useSelector((state) =>
    ({
        currentState: state.userRole,
        taskStatusMasterState: state.taskStatusMaster
    }),
        shallowEqual
    )

    useEffect(() => {
        if (currentState.totalCount === 0 && !currentState.listLoading && !currentState.error) {
            dispatch(userRoleActions.getAll())
        }
        dispatch(taskStatusMasterActions.getAll())
    }, [])

    //code unique validation
    const editId = currentState?.entityForEdit?.id ?? 0;
    const validationSchema = useMemo(() => {
        return Yup.object().shape({
            roleName: validations.name(),
            roleCode: validations.code(currentState.entities?.map((x) => x.id !== editId ? x.roleCode?.toLowerCase() : null)),
        });
    }, [currentState.entities, editId])

    const accessRightsOptions = [
        { value: "FULL", label: "Full" },
        // { value: "READONLY", label: "Read Only" },
        { value: "NONE", label: "None" }
    ]

    let entity = useMemo(() => {

        let tmpEntity = { ...enitity, statusAccessList: [] }

        if (taskStatusMasterState?.entities) {

            let tmpSelected = []
            taskStatusMasterState.entities.map((x, i) => {

                let tmp = { ...statusAccessReducer.initialEnitity }
                tmp.statusMSTId = x.id
                tmp.userRoleMSTId = enitity.id
                tmp.accessRights = "FULL"
                tmp.keyField = i

                let dbEntity = enitity?.statusAccessList?.filter(y => y.statusMSTId === tmp.statusMSTId
                    && y.userRoleMSTId === tmp.userRoleMSTId)?.[0]

                if (dbEntity) {
                    tmp.id = dbEntity.id
                    tmp.active = dbEntity.active
                    tmp.accessRights = dbEntity.accessRights
                    if (dbEntity.active) {
                        tmpSelected = [...tmpSelected, i]
                    }
                }

                tmpEntity.statusAccessList.push({ ...tmp })
            })

            setSelected(tmpSelected)
        }

        return tmpEntity

    }, [enitity, editId, taskStatusMasterState])

    const handleOnSelect = (row, isSel) => {
        if (isSel) {
            row.active = true
            setSelected([...selected, row.keyField])
        }
        else {
            row.active = false
            setSelected(selected.filter(x => x !== row.keyField))
        }
    }

    const handleOnSelectAll = (isSelect, rows) => {
        if (isSelect) {
            const ids = rows.map(r => r.keyField);
            rows.map(r => r.active = true)
            setSelected(ids)
        }
        else {
            rows.map(r => r.active = false)
            setSelected([])
        }
    }

    const selectRow = {

        mode: 'checkbox',
        // clickToSelect: true,
        selected: selected,
        onSelect: handleOnSelect,
        onSelectAll: handleOnSelectAll,
        style: { backgroundColor: '#f9f9f9' }
    }


    return (
        <Formik
            enableReinitialize={true}
            initialValues={entity}
            validationSchema={validationSchema}
            onSubmit={(values) => {
                //debugger
                let val = { ...values }
                val.statusAccessList = values.statusAccessList.filter(x => (x.active === true) || (x.id && x.active === false))
                saveRecord(val);
            }}
        >
            {
                ({ handleSubmit, handleReset, values }) => (
                    <Form className="form form-label-right">
                        <div className="form-group row">
                            <div className="col-lg-2">
                                <Field
                                    name="roleCode"
                                    component={Input}
                                    placeholder="Enter Code"
                                    label="User Role Code"
                                    isrequired
                                />
                            </div>
                            <div className="col-lg-3">
                                <Field
                                    name="roleName"
                                    component={Input}
                                    placeholder="Enter Name"
                                    label="User Role Name"
                                    isrequired
                                />
                            </div>
                            <div className="col-lg-2">
                                <Field
                                    name="sortOrder"
                                    component={Input}
                                    type="number"
                                    label="Sort Order"
                                    placeholder="Sort Order"
                                />
                            </div>
                            <div className="col-lg-2">
                                <Field
                                    name="active"
                                    component={Switch}
                                    label="Active"
                                    color="primary"
                                />
                            </div>
                        </div>

                        <div className="form-group row">
                            <div className="col-lg-8">
                                <POSEditableTable
                                    data={values.statusAccessList ?? []}
                                    noDataIndication={
                                        <div className="text-center">
                                            {
                                                <span>No status found</span>
                                            }
                                        </div>
                                    }
                                    columns={[
                                        {
                                            dataField: "statusMSTId",
                                            text: "Status",
                                            editable: false,
                                            // headerStyle: { width: '60%' },
                                            formatter: cell => cell ? taskStatusMasterState?.entities?.find(x => x.id.toString() === cell.toString())?.taskStatusName : ""
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
                                    ]}
                                    // selectRow={selectRow}
                                />
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
                )
            }
        </Formik>
    );
};

export default EditForm;