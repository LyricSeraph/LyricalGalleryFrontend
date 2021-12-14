<template>
  <div ref="frameContainer" :style="`display: flex; flex-flow: row-reverse ${wrapState}; gap: 24px;`">
    <div :style="`width: ${sideMenuWidth}; min-width: 240px`">
      <el-card shadow="never">
        <TagList :album-id="parseInt(this.$route.params.albumId)"/>
      </el-card>
    </div>
    <div style="flex: 1 1 auto">
      <el-card shadow="never">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/albums' }">Albums</el-breadcrumb-item>
          <el-breadcrumb-item>{{ albumData.name }} ({{ albumData.albumSize }})</el-breadcrumb-item>
        </el-breadcrumb>
        <ImageList :query-abnormal-state="true" :album-id="parseInt(this.$route.params.albumId)"/>
      </el-card>
    </div>
  </div>
</template>

<script>
import eventBus from "@/eventBus"
import TagList from "@/components/TagList";
import ImageList from "@/components/ImageList";
import apis from "@/apis";
export default {
  name: "AlbumView",
  components: {ImageList, TagList},
  mounted() {
    this.updateLayoutStyle(this.$refs.frameContainer.clientWidth)
    eventBus.bus.$on(eventBus.events.screenSizeChanged, () => {
      this.updateLayoutStyle(this.$refs.frameContainer.clientWidth)
    })
    this.loadAlbum()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
  },
  data() {
    return {
      wrapState: "nowrap",
      sideMenuWidth: "240px",
      albumData: {
        albumId: null,
        name: '',
        albumSize: 0,
      },
      loading: false,
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
    },
    loadAlbum() {
      this.loading = true
      apis.getAlbum(this.$route.params.albumId).then((payload) => {
        this.albumData = payload.data
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>