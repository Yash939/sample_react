import * as Yup from "yup";
export default {
    code: (codes) => {
        return Yup.string()
            .required("Code Required").test("unique", "Code must be unique", (val) => {
                return !codes.includes(val?.toLowerCase());
            })
    },
    name: () => Yup.string().required("Name Required"),
    image: () => {
        const SUPPORTED_FORMATS = [
            "image/jpg",
            "image/jpeg",
            "image/gif",
            "image/png"
        ];
        return Yup.mixed().test("fileFormat", "Unsupported Format", value => value && SUPPORTED_FORMATS.includes(value.type))
    },
    hasUniqueElements: (elements) => {return new Set(elements).size === elements.length} 
}