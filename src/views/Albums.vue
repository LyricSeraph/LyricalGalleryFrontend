<template>
  <el-card shadow="never">
    <div style="display: flex; flex-flow: column nowrap">
      <ThumbSizeSelector />
      <div ref="imageContainer" style="display:flex; flex-flow: row wrap; padding: 0; gap: 10px">
        <AlbumCard v-for="item in contents" :key="'album' + item.id" :album="item" :size-type="sizeType" />
        <span :style="`flex: 1 0 ${emptyItemWidth}px; visibility: hidden;`" v-for="i in hiddenItemCount" :key="`hidden${i}_`"/>
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
import ThumbSizeSelector from "@/components/ThumbSizeSelector";

export default {
  name: "Albums",
  components: {ThumbSizeSelector, AlbumCard},
  mounted() {
    eventBus.bus.$on(eventBus.events.screenSizeChanged, () => {
      this.containerWidth = this.$refs.imageContainer.clientWidth
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
    eventBus.bus.$on(eventBus.events.itemSizeChanged, (sizeType) => {
      this.sizeType = sizeType
    })
    this.loadNextPage()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
    eventBus.bus.$off(eventBus.events.scrollToBottom)
    eventBus.bus.$off(eventBus.events.searchText)
    eventBus.bus.$off(eventBus.events.itemSizeChanged)
  },
  data() {
    return  {
      // display parameters
      sizeType: this.$store.state.thumbnailSizeType,
      containerWidth: 1024,

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
    },
  },
  computed: {
    hiddenItemCount() {
      let thumbnailConfig = configs.thumbnailConfig[this.sizeType]
      return Math.floor((this.containerWidth + 10) / (thumbnailConfig.displaySize + 10))
    },
    emptyItemWidth() {
      return configs.thumbnailConfig[this.sizeType].displaySize
    }
  },
}
</script>

<style scoped>

</style>