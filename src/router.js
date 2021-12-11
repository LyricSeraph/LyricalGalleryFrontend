import Vue from "vue"
import VueRouter from "vue-router"
// 引入 view 组件
import Views from "@/views"
Vue.use(VueRouter)

export default new VueRouter({
    mode: "history",
    base: "",
    scrollBehavior: () => ({y: 0}),
    routes: [
        {
            path: "/home",
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
            path: "*",
            redirect: "/home"
        }
    ]
})
