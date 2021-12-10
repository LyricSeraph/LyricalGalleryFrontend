import store from "@/store";
import eventBus from "@/eventBus";

const axios = require('axios')
const querystring = require('querystring');

const instance = axios.create({
    timeout: 1000
})

instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    config.headers.common["TOKEN"] = store.state.authKey
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    console.log("response: ", response)
    let payload = response.data
    if (payload.status !== null && payload.status === 1) {
        eventBus.bus.$emit(eventBus.events.showMessage, {
            level: "error",
            message: "Authentication required, please config the AuthKey in management page!"
        })
        throw "Authentication required"
    }
    else if (payload.status === null || payload.status !== 0) {
        eventBus.bus.$emit(eventBus.events.showMessage, {
            level: "error",
            message: "Request failed, status: " + payload.status
        })
        throw "server error"
    }
    return payload;
}, function (error) {
    console.log("response error: ", error)
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    eventBus.bus.$emit(eventBus.events.showMessage, {
        level: "error",
        message: "Request failed, status"
    })
    return Promise.reject(error);
});

let baseUrl = ""
if (process.env.NODE_ENV === "development") {
    baseUrl = "http://localhost"
}

export default {
    baseUrl,
    async getAlbums(data) {
        try {
            return await instance.get("/public/api/album?" + querystring.stringify(data))
        } catch (error) {
            console.log(error)
        }
    },
    async getTags() {
        try {
            return await instance.get("/public/api/tag")
        } catch (error) {
            console.log(error)
        }
    },
    async getResources(data) {
        try {
            return await instance.get("/public/api/resource?" + querystring.stringify(data));
        } catch (error) {
            console.error(error)
        }
    }
}