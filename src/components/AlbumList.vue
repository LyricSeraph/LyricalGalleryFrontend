<template>
  <div style="display: flex; flex-flow: column nowrap">
    <ThumbSizeSelector />
    <div ref="imageContainer" style="display:flex; flex-flow: row wrap; padding: 0; gap: 10px; justify-content: center">
      <el-card v-if="management">
        <img :src="`${publicPath}/assets/pic-add-new.png`"
             :style="`object-fit: cover; width: ${thumbnailConfig.displaySize}px; height: ${thumbnailConfig.displaySize}px`"
             @click="showCreateDialog = true"  alt="add-new-album"/>
      </el-card>
      <AlbumCard v-for="item in contents" :key="'album' + item.albumId"
                 :album="item" :size-type="sizeType" @click="onAlbumClick(item.albumId)" />
      <el-button type="primary" v-show="!last" plain :loading="loadingForContents" style="width: 100%" @click="loadNextPage()">Next Page</el-button>
    </div>
    <el-dialog
        title="Create New Album"
        :visible.sync="showCreateDialog"
        width="300px">
      <div style="display: flex; flex-flow: column nowrap; gap: 10px">
        <el-input placeholder="Input new album's name" v-model="newAlbumData.name" @keyup.enter.native="createNewAlbum"></el-input>
        <el-button type="primary" @click="createNewAlbum" :loading="loadingForCreate">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import eventBus from "@/eventBus";
import apis from "@/apis"
import AlbumCard from "@/components/AlbumCard";
import ThumbSizeSelector from "@/components/ThumbSizeSelector";
import configs from "@/configs";

export default {
  name: "AlbumList",
  props: {
    management: {
      default: false,
      type: Boolean
    }
  },
  components: {ThumbSizeSelector, AlbumCard},
  mounted() {
    eventBus.bus.$on(eventBus.events.screenSizeChanged, () => {
      this.containerWidth = this.$refs.imageContainer.clientWidth
    })
    eventBus.bus.$on(eventBus.events.scrollToBottom, () => {
      if (!this.last && !this.loadingForContents) {
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
    eventBus.bus.$on(eventBus.events.reloadItems, () => {
      this.query.page = 0
      this.loadNextPage()
    })
    this.loadNextPage()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
    eventBus.bus.$off(eventBus.events.scrollToBottom)
    eventBus.bus.$off(eventBus.events.searchText)
    eventBus.bus.$off(eventBus.events.itemSizeChanged)
    eventBus.bus.$off(eventBus.events.reloadItems)
  },
  data() {
    return  {
      publicPath: process.env.BASE_URL,
      // display parameters
      sizeType: this.$store.state.thumbnailSizeType,
      // query parameters
      query: {
        page: 0,
        size: 10,
        name: null
      },
      contents: [],
      loadingForContents: false,
      last: false,
      // query result

      showCreateDialog: false,
      loadingForCreate: false,
      newAlbumData: {
        name: "",
      }
    }
  },
  methods: {
    onAlbumClick(albumId) {
      if (this.management) {
        this.$router.push("/management/album/" + albumId)
      } else {
        this.$router.push("/album/" + albumId)
      }
    },
    createNewAlbum() {
      this.loadingForCreate = true
      apis.createAlbum(this.newAlbumData).then(() => {
        this.query.page = 0
        this.showCreateDialog = false
        this.loadNextPage()
      }).finally(() => {
        this.loadingForCreate = false
      })
    },
    loadNextPage() {
      if (this.loadingForContents) {
        this.$message.warning("Querying data, please wait a second")
        return ;
      }
      this.loadingForContents = true
      apis.getAlbums(this.query).then((payload) => {
        if (this.query.page === 0) {
          this.contents = []
        }
        this.contents.push(...payload.data.content)
        this.query.page++
        this.last = payload.data.last
      }).finally(() => {
        this.loadingForContents = false
      })
    },
  },
  computed: {
    thumbnailConfig() {
      return configs.thumbnailConfig[this.sizeType]
    },
  },
}
</script>

<style scoped>

</style>