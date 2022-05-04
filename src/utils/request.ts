import axios from "axios";

const request = axios.create({
  timeout: 8 * 1000,
  baseURL: "/",
});
