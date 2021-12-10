import Vue from "vue";
import Vuex from "vuex";

const md5 = require("md5");

Vue.use(Vuex)

let authSalt = "LyricalGallery"

export default new Vuex.Store({
    state: {
        tagMap: {},
        thumbnailSizeType: 'medium',
        authKey: ""
    },
    mutations: {
        saveThumbSize(state, sizeType) {
            state.thumbnailSizeType = sizeType
        },
        saveTags(state, tags) {
            for (let i = 0; i < tags.length; i++) {
                let t = tags[i]
                state.tagMap[t.id] = t.name
            }
        },
        setAuthKey (state, key) {
            state.authKey = md5(key + authSalt)
        }
    }
})


