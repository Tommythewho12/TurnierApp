import axios from "axios";

export default axios.create({
    baseURL: "http://94.114.43.121:81/api",
    // baseURL: "http://localhost:8080/api",
    headers: {
        "Content-type": "application/json"
    }
});
