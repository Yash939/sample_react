import BaseCrud from "../../../_reduxBase/BaseCrud"
import BaseSlice from "../../../_reduxBase/BaseSlice"
import BaseActions from "../../../_reduxBase/BaseActions"
import baseInitialEntity from "../../../_reduxBase/BaseIntialEntity"
import Axios from "axios"
import { customServerErrorMessageFormatter, errorMessageFormatter } from "../../../_commons/Utils"

export const reducerInfo = {
    name: "projectAttachment",
    idFieldName: 'id',
    initialEnitity: {
        ...baseInitialEntity,
        "attachment": "",
        "projectMSTId": null,
    }
}

class Crud extends BaseCrud {
    async uploadMultiple(values, id) {
        let formData = new FormData();
        values.forEach((file, index) => formData.append('files', file))

        return Axios
            .post(
                process.env.REACT_APP_API_URL + this.API_MASTER + `/uploadFile/multiple/id/` + id,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    // onUploadProgress: (e) => onUploadProgress ? onUploadProgress(e) : console.log("Uploading File : ", parseInt((e.loaded * 100) / e.total) + "%")
                },
            );
    }

    async deleteMultiple(values) {
        return Axios.delete(process.env.REACT_APP_API_URL + this.API_MASTER + "/delete/multiple/id/" , { data: values });
    }
}

class Action extends BaseActions {

    uploadMultiple(values, id) {
        return new Promise(async (res1, reje) => {
            try {
                if (values.length > 0) {
                    const res = await this.requestFromServer.uploadMultiple(values, id)
                    let errors = []
                    let responseArray = []
                    if (res?.data) {
                        res.data.forEach(x => {
                            if (x.status) {
                                responseArray.push(x)
                            } else {
                                errors.push(x.fileName)
                            }
                        })

                        if (errors.length > 0) {
                            return reje({ ...res, userMessage: errors.join(", ") })
                        } else {
                            return res1({ res })
                        }
                    } else {
                        return reje({ ...res, userMessage: "Error uploading files" })
                    }

                } else {
                    return res1("Nothing to Save")
                }

            } catch (error) {
                return reje(error)
            }
        })
    }

    deleteMultiple(values) {
        if (!values || values?.length ===0 ) {
            return Promise.resolve("Nothing to Delete")
        }
        return this.requestFromServer
            .deleteMultiple(values)
            .then(response => {
                if (response?.data.status) {
                    return Promise.resolve(response.data.data)
                } else {
                    const err = {
                        userMessage: errorMessageFormatter(response.data),
                        error: response.data
                    }
                    return Promise.reject({ ...response.data, userMessage: response.data.message })
                }
            })
            .catch(error => {
                if(!error?.userMessage) {
                    const err = {
                        userMessage: customServerErrorMessageFormatter(error.response),//errorMessageFormatter(error),
                        error: error
                    }
                    return Promise.reject(err)
                } else {
                    return Promise.reject(error)
                } 
            });
    };

}

export const projectAttachmentCrud = new Crud("projectAttachment")
export const projectAttachmentSlice = new BaseSlice(reducerInfo.name, reducerInfo.idFieldName)
export const projectAttachmentActions = new Action(projectAttachmentCrud, projectAttachmentSlice)
