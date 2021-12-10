<template>
  <el-card shadow="never">
    <div style="display: flex; flex-flow: column nowrap">
      <div ref="imageContainer" style="display:flex; flex-flow: row wrap; padding: 0; gap: 10px">
        <AlbumCard v-for="item in contents" :key="'album' + item.id" :album="item" :sizeType="thumbnailConfig.sizeType" />
        <span :style="`flex: 1 0 ${thumbnailConfig.displaySize}px; visibility: hidden;`" v-for="i in hiddenItemCount" :key="`hidden_item_${i}`"/>
        <el-button type="primary" v-show="!last" plain :loading="loading" style="width: 100%" @click="loadNextPage()">Next Page</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>
import eventBus from "@/eventBus";
import apis from "@/apis"
import AlbumCard from "@/components/AlbumCard";
import configs from "@/configs";

export default {
  name: "Albums",
  components: {AlbumCard},
  mounted() {
    // this.onScreenSizeChanged()
    eventBus.bus.$on(eventBus.events.screenSizeChanged, () => {
      this.onScreenSizeChanged()
    })
    eventBus.bus.$on(eventBus.events.scrollToBottom, () => {
      if (!this.last && !this.loading) {
        this.loadNextPage()
      }
    })
    eventBus.bus.$on(eventBus.events.searchText, (text) => {
      if (text !== null && text !== "") {
        this.query.name = text
      } else {
        this.query.name = null
      }
      this.query.page = 0
      this.contents = []
      this.loadNextPage()
    })
    this.loadNextPage()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
    eventBus.bus.$off(eventBus.events.scrollToBottom)
    eventBus.bus.$off(eventBus.events.searchText)
  },
  data() {
    return  {
      // display parameters
      thumbnailConfig: configs.thumbnailConfig[this.$store.state.thumbnailSize],
      hiddenItemCount: 8,

      // query parameters
      query: {
        page: 0,
        size: 20,
        name: null
      },
      loading: false,
      last: false,

      // query result
      contents: [],
    }
  },
  methods: {
    onScreenSizeChanged() {
      this.hiddenItemCount = Math.floor((this.$refs.imageContainer.clientWidth + 10) / (this.thumbnailConfig.displaySize + 10))
    },
    loadNextPage() {
      if (this.loading) {
        this.$message.warning("Querying data, please wait a second")
        return ;
      }
      this.loading = true
      apis.getAlbums(this.query).then((payload) => {
        this.contents.push(...payload.data.content)
        this.query.page++
        this.last = payload.data.last
      }).finally(() => {
        this.loading = false
      })
    }
  }
}
</script>

<style scoped>

</style>