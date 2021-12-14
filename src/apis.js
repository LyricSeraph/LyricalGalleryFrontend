import store from "@/store";
import eventBus from "@/eventBus";

const axios = require('axios')
const querystring = require('querystring');
const md5 = require("md5");

const instance = axios.create({
    timeout: 1000
})

instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    let epoch = Date.now() / 1000
    let currentMinute = (epoch - epoch % 60) / 60
    let minutePart = md5("" + currentMinute).toUpperCase()
    let tokenValue = md5(minutePart + store.state.authKey).toUpperCase()
    config.headers.common["TOKEN"] = tokenValue
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
    if (payload.status === null || payload.status !== 0) {
        eventBus.bus.$emit(eventBus.events.showMessage, {
            level: "error",
            message: "Request failed, server error: " + payload.message
        })
        throw "Server error"
    }
    return payload;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    console.log("response error: ", error)
    let response = error.response
    let payload = response.data
    if (response.status === 401 && payload.status !== null && payload.status === 1) {
        eventBus.bus.$emit(eventBus.events.showMessage, {
            level: "error",
            message: "Authentication failed, please config your authentication key!"
        })
    } else {
        eventBus.bus.$emit(eventBus.events.showMessage, {
            level: "error",
            message: "Request failed, http status: " + response.status
        })
    }
    return Promise.reject(error);
});

export default {
    async checkAuthKey() {
        return await instance.get("/api/private/verification")
    },
    async getAlbum(id) {
        return await instance.get("/api/public/album/" + id)
    },
    async createAlbum(data) {
        if (data.name === null || data.name === "") {
            let errorMessage = "Album name cannot be empty!"
            eventBus.bus.$emit(eventBus.events.showMessage, {
                level: "error",
                message: errorMessage
            })
            console.log(errorMessage)
            return Promise.reject(errorMessage);
        }
        return await instance.post("/api/private/album", data)
    },
    async getAlbums(data) {
        return await instance.get("/api/public/album?" + querystring.stringify(data))
    },
    async getTags(data) {
        return await instance.get("/api/public/tag?" + querystring.stringify(data))
    },
    async getResource(id) {
        return await instance.get("/api/public/resource/" + id)
    },
    async removeResource(id) {
        return await instance.delete("/api/private/resource/" + id)
    },
    async updateResource(id, data) {
        return await instance.put("/api/private/resource/" + id, data)
    },
    async createTag(data) {
        return await instance.post("/api/private/tag", data)
    },
    async deleteTag(id) {
        return await instance.delete("/api/private/tag/" + id)
    },
    async updateTag(id, data) {
        return await instance.put("/api/private/tag/" + id, data)
    },
    async addResourceTag(resourceId, tagId) {
        return await instance.post("/api/private/resource/" + resourceId + "/tag/" + tagId)
    },
    async removeResourceTag(resourceId, tagId) {
        return await instance.delete("/api/private/resource/" + resourceId + "/tag/" + tagId)
    },
    async offlineDownload(data) {
        return await instance.post("/api/private/resource/download", data)
    },
    async getResources(data) {
        return await instance.get("/api/public/resource?" + querystring.stringify(data));
    }
}