import Vue from "vue"
import VueRouter from "vue-router"
// 引入 view 组件
import Views from "@/views"
Vue.use(VueRouter)

export default new VueRouter({
    mode: "history",
    base: "gallery",
    scrollBehavior: () => ({y: 0}),
    routes: [
        {
            path: "/",
            name: "home",
            component: Views.Resources
        },
        {
            path: "/albums",
            name: "albums",
            component: Views.Albums
        },
        {
            path: "/album/:albumId",
            name: "album",
            component: Views.AlbumView
        },
        {
            path: "/management/albums",
            name: "management-albums",
            component: Views.AlbumManagement
        },
        {
            path: "/management/recycle-bin",
            name: "recycle-bin",
            component: Views.RecycleBin
        },
        {
            path: "/management/album/:albumId",
            name: "album-editor",
            component: Views.AlbumEditor
        },
        {
            path: "/management/tags",
            name: "management-tags",
            component: Views.TagManagement
        },
        {
            path: "*",
            redirect: "/"
        }
    ]
})
