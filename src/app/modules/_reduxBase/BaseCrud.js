import axios from "axios";
export default class BaseCrud {
    constructor(api_master) {
        this.API_MASTER = api_master
    }

    async create(values, loadingMessage = null) {
        let enitity = { ...values }
        const file_array = []
        if (enitity.ID_FIELD && enitity?.FILE_FIELDS?.length) {
            enitity.FILE_FIELDS.forEach(element => {
                if (enitity[element.name]?.size) {
                    file_array.push({
                        ...element,
                        file: enitity[element.name]
                    })
                }
                delete enitity[element.name]
            });
        }
        if (file_array.length) {
            delete enitity.FILE_FIELDS
            const res = await axios.post(process.env.REACT_APP_API_URL + this.API_MASTER + "/create/", enitity);
            if (res?.data?.data) {
                for (let i = 0; i < file_array.length; i++) {
                    const elm = file_array[i];
                    let fileUploadResponse = await this.uploadFile(res.data.data[enitity.ID_FIELD], elm.file, elm.path, (e) => loadingMessage(`Uploading ${elm.label}...` + parseInt((e.loaded * 100) / e.total) + "%"))

                    if (!fileUploadResponse?.data?.status) {
                        fileUploadResponse.data['message'] = fileUploadResponse.data?.fileName
                        return fileUploadResponse
                    }
                }
            }
            return res
        } else
            return axios.post(process.env.REACT_APP_API_URL + this.API_MASTER + "/create/", enitity);
    }
    getAll() {
        return axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/all/");
    }
    getAllActive() {
        return axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/allActive/");
    }
    getAllFiltered() {
        return axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/allFiltered/");
      }
    getById(id) {
        return axios.get(process.env.REACT_APP_API_URL + this.API_MASTER + "/id/" + id);
    }
    async update(values, loadingMessage = null) {
        let enitity = { ...values }
        const file_array = []
        if (enitity.ID_FIELD && enitity?.FILE_FIELDS?.length) {
            enitity.FILE_FIELDS.forEach(element => {
                if (enitity[element.name]?.size) {
                    file_array.push({
                        ...element,
                        file: enitity[element.name]
                    })
                    delete enitity[element.name]
                }
            });
        }
        if (file_array.length) {
            delete enitity.FILE_FIELDS
            const res = await axios.put(process.env.REACT_APP_API_URL + this.API_MASTER + "/update/", enitity);
            if (res?.data?.data) {
                for (let i = 0; i < file_array.length; i++) {
                    const elm = file_array[i];
                    await this.uploadFile(res.data.data[enitity.ID_FIELD], elm.file, elm.path, (e) => loadingMessage(`Uploading ${elm.label}...` + parseInt((e.loaded * 100) / e.total) + "%"))
                }
            }
            return res
        } else
            return axios.put(process.env.REACT_APP_API_URL + this.API_MASTER + "/update/", enitity);
    }
    delete(id) {
        return axios.delete(process.env.REACT_APP_API_URL + this.API_MASTER + "/delete/" + id);
    }
    uploadFile(id, file, path = "", onUploadProgress = null) {
        let formData = new FormData();
        formData.append('file', file)
        return axios
            .post(
                process.env.REACT_APP_API_URL + this.API_MASTER + `/uploadFile${path ? '/' + path : ''}/id/` + id,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    },
                    onUploadProgress: (e) => onUploadProgress ? onUploadProgress(e) : console.log("Uploading File : ", parseInt((e.loaded * 100) / e.total) + "%")
                },
            );
    }
}