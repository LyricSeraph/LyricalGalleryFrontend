<template>
  <div>
    <el-menu :default-active="currentActive" mode="horizontal" @select="handleSelect">
      <el-menu-item index="">
        <a href="/" target="_self">
          <v-img max-height="60" max-width="200" :src="`${publicPath}/assets/logo.png`" alt=""/>
        </a>
      </el-menu-item>
      <el-menu-item index="/">Home</el-menu-item>
      <el-menu-item index="/albums">Album</el-menu-item>
      <template v-if="authSuccess">
        <el-submenu index="/management">
          <template slot="title">Management</template>
          <el-menu-item index="/management/albums">Album Management</el-menu-item>
          <el-menu-item index="/management/tags">Tag Management</el-menu-item>
          <el-menu-item index="/management/recycle-bin">Recycle Bin</el-menu-item>
        </el-submenu>
      </template>
      <el-menu-item class="non-menu-item dock-right">
        <el-link type="primary" @click="showAuthentication">Authentication</el-link>
      </el-menu-item>
      <el-menu-item class="non-menu-item dock-right" >
        <div style="display: flex; flex-flow: row nowrap; align-content: center">
          <el-input v-model="textToSearch" placeholder="Input text to search" maxlength="10" @keyup.enter.native="search"/>
          <el-button style="margin: auto auto auto 10px"
              type="primary" size="small" @click="search">Search</el-button>
        </div>
      </el-menu-item>
    </el-menu>

    <el-dialog
        title="Authentication Key"
        :visible.sync="dialogVisible"
        width="300px">
      <div style="display: flex; flex-flow: column nowrap; gap: 10px">
        <el-input placeholder="Please input auth key" v-model="authKey" show-password></el-input>
        <el-button type="primary" @click="onAuthKeyUpdated">OK</el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>
import eventBus from "@/eventBus"
import apis from "@/apis";

export default {
  "name": "TitleMenu",
  created() {
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      currentActive: "/",
      supportedPath: ["/", "/albums", "/management/albums", "/management/tags"],
      textToSearch: "",
      authKey: "",
      authSuccess: false,
      dialogVisible: false,
    };
  },
  methods: {
    onAuthKeyUpdated() {
      this.$store.commit("setAuthKey", this.authKey)
      this.dialogVisible = false
      apis.checkAuthKey().then(() => {
        this.authSuccess = true
        this.$message.success("Config authentication key success")
      }).catch(() => {
        this.authSuccess = false
      }).finally(() =>{})
    },
    handleSelect(key) {
      if (key != null) {
        if (this.$router.currentRoute.path !== key) {
          this.$router.push(key)
        }
      }
    },
    showAuthentication() {
      this.dialogVisible = true
    },
    search() {
      console.log("search text: " + this.textToSearch)
      eventBus.bus.$emit(eventBus.events.searchText, this.textToSearch)
    }
  },
  watch: {
    $route(to, from) {
      console.log("router: ", from, to)
      if (this.supportedPath.includes(to.path)) {
        this.currentActive = to.path
      } else {
        this.currentActive = ""
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.el-menu--horizontal > .el-menu-item.dock-right {
  float: right;
 }

.non-menu-item {
  cursor: auto;
}

</style>