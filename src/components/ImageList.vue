<template>
    <div style="display: flex; flex-flow: column nowrap">
      <div ref="imageContainer" style="display:flex; flex-flow: row wrap; padding: 0; gap: 10px">
        <ImageCard v-for="item in contents" :key="`resource-${item.resourceId}`"
                   :resource="item" :size-type="sizeType" :management="management"
                   style="flex: 1 1 auto" />
        <span :style="`flex: 1 0 ${emptyItemWidth}px; visibility: hidden;`" v-for="i in hiddenItemCount" :key="`hidden${i}_`"/>
        <el-button type="primary" v-show="!last" plain :loading="loading" style="width: 100%" @click="loadNextPage()">Next Page</el-button>
      </div>
      <div class="empty-view" v-if="last && contents.length === 0">
        <img style="width: 384px; height: 384px; object-fit: cover" :src="`${publicPath}/assets/pic-no-data.png`" alt="empty-album"/>
        <span>No data</span>
      </div>
    </div>
</template>

<script>
import eventBus from "@/eventBus";
import apis from "@/apis"
import configs from "@/configs";
import ImageCard from "@/components/ImageCard";

export default {
  name: "ImageList",
  components: {ImageCard},
  props: {
    management: {
      default: false,
      type: Boolean,
    },
    queryAbnormalState: {
      default: false,
      type: Boolean
    },
    albumId: {
      default: null,
      type: Number
    },
    ignoreAlbumId: {
      default: false,
      type: Boolean
    }
  },
  created() {
  },
  mounted() {
    this.containerWidth = this.$refs.imageContainer.clientWidth
    this.thumbnailConfig = configs.thumbnailConfig[this.$store.state.thumbnailSizeType]
    eventBus.bus.$on(eventBus.events.screenSizeChanged, () => {
      this.containerWidth = this.$refs.imageContainer.clientWidth
    })
    eventBus.bus.$on(eventBus.events.scrollToBottom, () => {
      if (!this.last && !this.loading) {
        this.loadNextPage()
      }
    })
    eventBus.bus.$on(eventBus.events.searchTag, (tagId) => {
      if (tagId !== null) {
        this.query.tagId = tagId
      } else {
        this.query.tagId = null
      }
      this.query.page = 0
      this.contents = []
      this.loadNextPage()
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
    eventBus.bus.$on(eventBus.events.newItemAdded, (item) => {
      this.contents.unshift(item)
    })
    eventBus.bus.$on(eventBus.events.itemRemoved, (item) => {
      let index = this.contents.findIndex((value) => { return value.resourceId === item.resourceId })
      if (index >= 0) {
        this.contents.splice(index, 1)
      }
    })
    eventBus.bus.$on(eventBus.events.reloadItems, () => {
      this.query.page = 0
      this.loadNextPage()
    })
    this.loadNextPage()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
    eventBus.bus.$off(eventBus.events.scrollToBottom)
    eventBus.bus.$off(eventBus.events.searchTag)
    eventBus.bus.$off(eventBus.events.searchText)
    eventBus.bus.$off(eventBus.events.itemSizeChanged)
    eventBus.bus.$off(eventBus.events.newItemAdded)
    eventBus.bus.$off(eventBus.events.itemRemoved)
    eventBus.bus.$off(eventBus.events.reloadItems)
  },
  data() {
    return  {
      publicPath: process.env.BASE_URL,
      // display parameters
      sizeType: this.$store.state.thumbnailSizeType,
      containerWidth: 1024,

      // query parameters
      query: {
        page: 0,
        size: 30,
        name: null,
        tagId: null,
        ignoreAlbum: this.ignoreAlbumId,
        status: (this.queryAbnormalState === true) ? null : 2,
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
      apis.getResources({...this.query, albumId: this.thisId }).then((payload) => {
        if (this.query.page === 0) {
          this.contents = []
        }
        this.contents.push(...payload.data.content)
        this.query.page++
        this.last = payload.data.last
      }).finally(() => {
        this.loading = false
      })
    }
  },
  computed: {
    thisId() {
      return this.albumId
    },
    hiddenItemCount() {
      let thumbnailConfig = configs.thumbnailConfig[this.sizeType]
      return Math.floor((this.containerWidth + 10) / (thumbnailConfig.displaySize + 10))
    },
    emptyItemWidth() {
      return configs.thumbnailConfig[this.sizeType].displaySize
    },
  },
  watch: {
    thisId() {
      this.query.page = 0
      this.last = false
      this.loadNextPage()
    }
  }
}
</script>

<style scoped>

.empty-view {
  width: 384px;
  display: flex;
  flex-flow: column nowrap;
  align-self: center;
}


</style>