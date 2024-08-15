import axios from "axios"
export const set_backend_path = (path: string) => {
    axios.defaults.baseURL = path
}