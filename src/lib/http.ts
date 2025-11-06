import axios from "axios";
import { NEXT_PUBLIC_URL } from "@/lib/constants";

export const http = axios.create({
    baseURL: NEXT_PUBLIC_URL,
    withCredentials: true,
    timeout: 15000,
});
