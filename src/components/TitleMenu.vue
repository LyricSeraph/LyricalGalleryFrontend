<template>
  <div>
    <el-menu default-active="/latest" mode="horizontal" @select="handleSelect">
      <el-menu-item index="/">
        <a href="/" target="_self">
          <v-img max-height="60" max-width="200" src="../../src/assets/logo.png" alt=""/>
        </a>
      </el-menu-item>
      <el-menu-item index="/latest">Latest</el-menu-item>
      <el-menu-item index="/albums">Album</el-menu-item>
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
  </div>
</template>

<script>
import eventBus from "@/eventBus"

export default {
  "name": "TitleMenu",
  created() {
  },
  data() {
    return {
      albumList: [],
      textToSearch: "",
    };
  },
  methods: {
    created() {
    },
    handleSelect(key) {
      if (key != null) {
        if (this.$router.currentRoute.path !== key) {
          this.$router.push(key)
        }
      }
    },
    showAuthentication() {
      console.log("show authentication dialog")
    },
    search() {
      console.log("search text: " + this.textToSearch)
      eventBus.bus.$emit(eventBus.events.searchText, this.textToSearch)
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