import {toast} from "react-toastify";

export default function defaultErrorHandle(err: any) {
    if(err.response?.status === 500) {
        toast.error("Проблемы с обработкой данных, повторите запрос");
    }
}