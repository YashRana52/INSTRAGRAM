import axios from "axios";

const backendUrl = "https://instragram-e0of.onrender.com";

export const axiosInstance = axios.create({
  baseURL: `${backendUrl}/api/v1`,
  withCredentials: true,
});
