<template>
  <div style="display: flex; flex-flow: column nowrap">
    <div ref="imageContainer" style="display:flex; flex-flow: row wrap; padding: 0; gap: 10px; justify-content: center">
      <el-card v-if="management">
        <img :src="`${publicPath}/assets/pic-add-new.png`"
             :style="`object-fit: cover; width: ${thumbnailConfig.displaySize}px; height: ${thumbnailConfig.displaySize}px; cursor: pointer`"
             @click="showCreateDialog = true"  alt="add-new-album"/>
      </el-card>
      <AlbumCard v-for="item in contents" :key="'album' + item.albumId" :deletable="management"
                 :album="item" :size-type="sizeType" @click="onAlbumClick(item.albumId)" />

      <div class="empty-view" v-if="!management && last && contents.length === 0">
        <img style="width: 384px; height: 384px; object-fit: cover" :src="`${publicPath}/assets/pic-no-data.png`" alt="empty-album"/>
        <span>No data</span>
      </div>

      <el-button type="primary" v-show="!last" plain :loading="loadingForContents" style="width: 100%" @click="loadNextPage()">Next Page</el-button>

    </div>
    <el-dialog
        title="Create New Album"
        :visible.sync="showCreateDialog"
        width="300px">
      <div style="display: flex; flex-flow: column nowrap; gap: 10px">
        <el-input placeholder="Input new album's name" v-model="newAlbumData.name" @keyup.enter.native="createNewAlbum"></el-input>
        <el-button type="primary" @click="createNewAlbum" :loading="loadingForCreate">OK</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import eventBus from "@/eventBus";
import apis from "@/apis"
import AlbumCard from "@/components/AlbumCard";
import configs from "@/configs";

export default {
  name: "AlbumList",
  props: {
    management: {
      default: false,
      type: Boolean,
    },
    albumId: {
      default: null,
      type: Number
    }
  },
  components: {AlbumCard},
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
    eventBus.bus.$on(eventBus.events.newAlbumAdded, (album) => {
      this.contents.unshift(album)
    })
    eventBus.bus.$on(eventBus.events.albumRemoved, (album) => {
      let index = this.contents.findIndex((value) => { return value.albumId === album.albumId })
      if (index >= 0) {
        this.contents.splice(index, 1)
      }
    })
    this.loadNextPage()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
    eventBus.bus.$off(eventBus.events.scrollToBottom)
    eventBus.bus.$off(eventBus.events.searchText)
    eventBus.bus.$off(eventBus.events.itemSizeChanged)
    eventBus.bus.$off(eventBus.events.reloadItems)
    eventBus.bus.$off(eventBus.events.newAlbumAdded)
    eventBus.bus.$off(eventBus.events.albumRemoved)
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
        name: null,
        parentId: this.parentId,
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
        this.$router.push({ name: "album-editor", params: { albumId } })
      } else {
        this.$router.push({ name: "album", params: { albumId } })
      }
    },
    createNewAlbum() {
      this.loadingForCreate = true
      apis.createAlbum({name: this.newAlbumData.name, parentId: this.thisId}).then((payload) => {
        this.showCreateDialog = false
        eventBus.bus.$emit(eventBus.events.newAlbumAdded, payload.data)
      }).finally(() => {
        this.loadingForCreate = false
        this.newAlbumData.name = ""
      })
    },
    loadNextPage() {
      if (this.loadingForContents) {
        this.$message.warning("Querying data, please wait a second")
        return ;
      }
      this.loadingForContents = true
      this.query.parentId = this.thisId
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
    thisId() {
      return this.albumId
    },
    thumbnailConfig() {
      return configs.thumbnailConfig[this.sizeType]
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