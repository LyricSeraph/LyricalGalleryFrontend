import Vue from "vue"
import vuetify from "./plugins/vuetify"
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import store from "@/store";
import router from "@/router";

import App from "./App.vue"

Vue.use(ElementUI);

Vue.config.productionTip = false

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount("#app")
