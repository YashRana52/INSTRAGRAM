import axios from "axios";

// const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const axiosInstance = axios.create({
  baseURL: `https://instragram-psi.vercel.app/api/v1`,
  withCredentials: true,
});
