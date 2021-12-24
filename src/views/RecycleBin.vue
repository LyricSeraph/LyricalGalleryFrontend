<template>
  <div ref="frameContainer" :style="`display: flex; flex-flow: row-reverse ${wrapState}; gap: 24px;`">
    <div :style="`width: ${sideMenuWidth}; min-width: 240px`">
      <el-card shadow="never">
        <TagList :album-id="null"/>
      </el-card>
    </div>
    <div style="flex: 1 1 auto">
      <el-card shadow="never">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
          <el-breadcrumb-item>Recycle bin({{count}})</el-breadcrumb-item>
        </el-breadcrumb>
        <ThumbSizeSelector />
        <ImageList :management="true" :query-abnormal-state="true" :album-id="null" :ignoreAlbumId="false"/>
      </el-card>
    </div>
  </div>
</template>

<script>
import eventBus from "@/eventBus"
import TagList from "@/components/TagList";
import ImageList from "@/components/ImageList";
import ThumbSizeSelector from "@/components/ThumbSizeSelector";
import apis from "@/apis";
export default {
  name: "RecycleBin",
  components: {ThumbSizeSelector, ImageList, TagList},
  mounted() {
    this.updateLayoutStyle(this.$refs.frameContainer.clientWidth)
    eventBus.bus.$on(eventBus.events.screenSizeChanged, () => {
      this.updateLayoutStyle(this.$refs.frameContainer.clientWidth)
    })
    eventBus.bus.$on(eventBus.events.newItemAdded, () => {
      this.count++
    })
    eventBus.bus.$on(eventBus.events.itemRemoved, () => {
      this.count--
    })
    this.loadImageCount()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
    eventBus.bus.$off(eventBus.events.newItemAdded)
    eventBus.bus.$off(eventBus.events.itemRemoved)
  },
  data() {
    return {
      wrapState: "nowrap",
      sideMenuWidth: "240px",
      loading: false,
      count: 0,
      query: {
        page: 0,
        size: 0,
        albumId: null,
        ignoreAlbum: false,
        status: null,
      },
    }
  },
  methods: {
    loadImageCount() {
      apis.getResources(this.query).then((payload) => {
        this.count = payload.data.totalElements
      }).finally(() => {})
    },
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