<template>
  <div id="app" ref="app">
    <div>
      <TitleMenu />
    </div>
    <div style="overflow-y: auto" @scroll="onScroll">
      <router-view style="margin: 24px;"/>
    </div>
  </div>

</template>

<script>

import TitleMenu from "@/components/TitleMenu";
import eventBus from "@/eventBus"

export default {
  name: 'App',
  components: {
    TitleMenu
  },
  created() {
    window.addEventListener("resize", this.screenSizeChanged)
  },
  mounted() {
    this.screenSizeChanged(this.$refs.app.clientWidth)
    eventBus.bus.$on(eventBus.events.showMessage, data => {
      this.$message[data.level](data.message)
    })
  },
  destroyed() {
    window.removeEventListener("resize", this.screenSizeChanged)
  },
  methods: {
    screenSizeChanged() {
      let windowWidth = this.$refs.app.clientWidth
      console.log("screenSizeChanged size: ", windowWidth)
      eventBus.bus.$emit(eventBus.events.screenSizeChanged, windowWidth)
    },
    onScroll ({ target: { scrollTop, clientHeight, scrollHeight }}) {
      if (scrollTop + clientHeight >= scrollHeight) {
        eventBus.bus.$emit(eventBus.events.scrollToBottom)
      }
    }
  }
}
</script>

<style>
#app {
  display: flex;
  flex-flow: column nowrap;
  height: 100vh;
  background-color: rgba(144, 147, 153, 0.1);
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
}
</style>
