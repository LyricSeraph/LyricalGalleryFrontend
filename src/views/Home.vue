<template>
  <div ref="frameContainer" :style="`display: flex; flex-flow: row ${wrapState}; gap: 24px;`">

    <div style="flex: 1 1 auto">
      <el-card shadow="never">
        <ImageList/>
      </el-card>
    </div>
    <div :style="`width: ${sideMenuWidth}; min-width: 240px`">
      <TagList />
    </div>
  </div>
</template>

<script>
import eventBus from "@/eventBus"
import TagList from "@/components/TagList";
import ImageList from "@/components/ImageList";
export default {
  name: "Resources",
  components: {ImageList, TagList},
  mounted() {

    this.updateLayoutStyle(this.$refs.frameContainer.clientWidth)
    eventBus.bus.$on(eventBus.events.screenSizeChanged, () => {
      this.updateLayoutStyle(this.$refs.frameContainer.clientWidth)
    })
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
  },
  data() {
    return {
      wrapState: "nowrap",
      sideMenuWidth: "240px",
    }
  },
  methods: {
    updateLayoutStyle(frameWidth) {
      if (frameWidth >= 500) {
        this.wrapState = "nowrap"
        this.sideMenuWidth = "240px"
      } else {
        this.wrapState = 'wrap'
        this.sideMenuWidth = "100%"
      }
    }
  }
}
</script>

<style scoped>

</style>