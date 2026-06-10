import axios from "axios"
import { backendUrl } from "../backendUrl";


export default axios.create({
    baseURL:`${backendUrl}/portfolio`,
    withCredentials:true,
})