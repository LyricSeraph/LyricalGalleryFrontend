<template>
  <div ref="frameContainer" :style="`display: flex; flex-flow: row-reverse ${wrapState}; gap: 24px;`">

    <div :style="`width: ${sideMenuWidth}; min-width: 240px`">
      <el-card shadow="never">
        <TagList :ignoreAlbum="true"/>
      </el-card>
    </div>
    <div style="flex: 1 1 auto">
      <el-card shadow="never">
        <ThumbSizeSelector />
        <ImageList :ignoreAlbumId="true"/>
      </el-card>
    </div>
  </div>
</template>

<script>
import eventBus from "@/eventBus"
import TagList from "@/components/TagList";
import ImageList from "@/components/ImageList";
import ThumbSizeSelector from "@/components/ThumbSizeSelector";
export default {
  name: "Resources",
  components: {ThumbSizeSelector, ImageList, TagList},
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