<template>
    <div style="display: flex; flex-flow: column nowrap">
      <ThumbSizeSelector v-if="contents.length !== 0" />
      <div ref="imageContainer" style="display:flex; flex-flow: row wrap; padding: 0; gap: 10px">
        <ImageCard v-for="item in contents" :key="`resource-${item.resourceId}`"
                   :resource="item" :size-type="sizeType"
                   style="flex: 1 1 auto" />
        <span :style="`flex: 1 0 ${emptyItemWidth}px; visibility: hidden;`" v-for="i in hiddenItemCount" :key="`hidden${i}_`"/>
        <el-button type="primary" v-show="!last" plain :loading="loading" style="width: 100%" @click="loadNextPage()">Next Page</el-button>
      </div>
      <div class="empty-view" v-if="last && contents.length === 0">
        <img  src="../assets/pic-album-empty.png" alt="empty-album"/>
        <span>No data</span>
      </div>
    </div>
</template>

<script>
import eventBus from "@/eventBus";
import apis from "@/apis"
import configs from "@/configs";
import ImageCard from "@/components/ImageCard";
import ThumbSizeSelector from "@/components/ThumbSizeSelector";

export default {
  name: "ImageList",
  components: {ThumbSizeSelector, ImageCard},
  props: {
    queryAbnormalState: {
      default: false,
      type: Boolean
    },
    albumId: {
      default: null,
      type: Number
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
    this.loadNextPage()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
    eventBus.bus.$off(eventBus.events.scrollToBottom)
    eventBus.bus.$off(eventBus.events.searchTag)
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
        name: null,
        albumId: null,
        tagId: null,
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
      apis.getResources({...this.query, albumId: this.albumId }).then((payload) => {
        this.contents.push(...payload.data.content)
        this.query.page++
        this.last = payload.data.last
      }).finally(() => {
        this.loading = false
      })
    }
  },
  computed: {
    hiddenItemCount() {
      let thumbnailConfig = configs.thumbnailConfig[this.sizeType]
      return Math.floor((this.containerWidth + 10) / (thumbnailConfig.displaySize + 10))
    },
    emptyItemWidth() {
      return configs.thumbnailConfig[this.sizeType].displaySize
    },
  },
}
</script>

<style scoped>

.empty-view {
  width: 50%;
  max-width: 128px;
  object-fit: cover;
  display: flex;
  flex-flow: column nowrap;
  align-self: center;
}


</style>