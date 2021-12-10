<template>
  <el-card shadow="never">
    <div style="display: flex; flex-flow: column nowrap">
      <el-divider class="no-margin-top-divider" content-position="right">
        <i class="el-icon-picture" @click="changeSize('large')"/>
        <i class="el-icon-menu" @click="changeSize('medium')"/>
        <i class="el-icon-s-grid" @click="changeSize('small')"/>
      </el-divider>
      <div ref="imageContainer" style="display:flex; flex-flow: row wrap; padding: 0; gap: 10px">
        <ImageCard v-for="item in contents" :key="`resource-${item.id}`"
                   :resource="item" :sizeType="thumbnailConfig.sizeType"
                   style="flex: 1 1 auto" />
        <span :style="`flex: 1 0 ${thumbnailConfig.displaySize}px; visibility: hidden;`" v-for="i in hiddenItemCount" :key="`hidden${i}_`"/>
        <el-button type="primary" v-show="!last" plain :loading="loading" style="width: 100%" @click="loadNextPage()">Next Page</el-button>
      </div>

    </div>
  </el-card>
</template>

<script>
import eventBus from "@/eventBus";
import apis from "@/apis"
import ImageCard from "@/components/ImageCard";
import configs from "@/configs";

export default {
  name: "ImageList",
  components: {ImageCard},
  created() {
  },
  mounted() {
    this.query.albumId = this.$route.params.albumId
    this.thumbnailConfig = configs.thumbnailConfig[this.$store.state.thumbnailSize]
    this.onScreenSizeChanged()
    eventBus.bus.$on(eventBus.events.screenSizeChanged, () => {
      this.onScreenSizeChanged()
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
    this.loadNextPage()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
    eventBus.bus.$off(eventBus.events.scrollToBottom)
    eventBus.bus.$off(eventBus.events.searchTag)
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
        name: null,
        albumId: null,
        tagId: null,
        status: null,
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
    changeSize(sizeType) {
      console.log("change size: ", sizeType)
      this.thumbnailConfig = configs.thumbnailConfig[sizeType]
      this.$store.commit("saveThumbSize", sizeType)
      this.onScreenSizeChanged()
    },
    loadNextPage() {
      if (this.loading) {
        this.$message.warning("Querying data, please wait a second")
        return ;
      }
      this.loading = true
      apis.getResources({...this.query, albumId: this.$route.params.albumId }).then((payload) => {
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

.no-margin-top-divider {
  margin-top: 4px;
}

</style>