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
            let newTagMap = {}
            for (let i = 0; i < tags.length; i++) {
                let t = tags[i]
                newTagMap[t.tagId] = t.name
            }
            state.tagMap = newTagMap
        },
        newTag(state, tag) {
            state.tagMap = {
                ...state.tagMap,
                [tag.tagId]: tag.name
            }
        },
        deleteTag(state, tagId) {
            let newTagMap = { ...state.tagMap }
            delete newTagMap[tagId]
            state.tagMap = newTagMap
        },
        updateTag(state, tag) {
            state.tagMap = {
                ...state.tagMap,
                [tag.tagId]: tag.name
            }
        },
        setAuthKey (state, key) {
            state.authKey = md5(key + authSalt).toUpperCase()
        }
    }
})


