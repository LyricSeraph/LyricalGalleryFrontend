<template>
  <el-card>
    <div class="item-wrapper"
         @mouseover="showTitle = true" @mouseleave="showTitle = false">
      <div :style="wrapperStyle" @click="$emit('click')">
        <template v-for="item in album.sampleResources">
          <template v-if="item.status === 2">
            <el-image :key="`album${album.albumId}-${item.resourceId}`"
                      fit="cover" :src="item[thumbnailConfig.thumbnailKey]">
              <div slot="error" class="image-slot" style="width: 100%; height: 100%">
                <img class="img-placeholder" :src="`${publicPath}/assets/pic-no-thumbnail.png`" alt=""/>
              </div>
            </el-image>
          </template>
          <template v-else-if="item.status === 0 || item.status === 1">
            <img :key="`album${album.albumId}-${item.resourceId}`"
                 class="img-placeholder" :src="`${publicPath}/assets/pic-downloading.png`" alt="downloading"/>
          </template>
          <template v-else>
            <img :key="`album${album.albumId}-${item.resourceId}`"
                 class="img-placeholder" :src="`${publicPath}/assets/pic-download-failed.png`" alt="downloading"/>
          </template>
        </template>
        <img v-if="album.sampleResources.length === 0" style="height: 100%; width: 100%; object-fit: contain" :src="`${publicPath}/assets/pic-album-empty.png`" alt=""/>
      </div>
      <transition name="el-zoom-in-bottom">
        <div class="wrapper-info" v-show="showTitle">
          <span class="album-title">{{ album.name }}</span>
          <span class="album-count">{{ album.subAlbumCount }}&nbsp;<i class="el-icon-collection"/></span>
          <span class="album-count">{{ album.albumSize }}&nbsp;<i class="el-icon-picture-outline"/></span>
          <span v-if="deletable" style="font-size: 80%; color: white; flex-grow: 1; cursor: pointer">
            <i class="el-icon-delete" @click="confirmDeleteAlbum(album)"/>
          </span>
        </div>
      </transition>
    </div>

    <el-dialog
        :visible.sync="operation.showDeleteDialog" title="Delete Album?">
      <div style="margin: 8px">
        <p style="text-align: start">Deleting album: <span style="font-weight: 500">{{operation.albumName}}</span></p>
        <p style="text-align: start">All items directly inside will be moved to <el-link type="danger" style="font-size: 18px">RECYCLE BIN</el-link></p>
        <p style="text-align: start">All sub-albums inside will be move to <el-link type="primary" style="font-size: 18px">TOP LEVEL</el-link></p>

      </div>
      <div style="display: flex; flex-flow: row nowrap; gap: 10px; justify-content: center">
        <el-button type="primary" @click="operation.showDeleteDialog = false">Cancel</el-button>
        <el-button type="danger" @click="handleDelete" :loading="operation.loading">Delete</el-button>
      </div>
    </el-dialog>

  </el-card>
</template>

<script>
import configs from "@/configs";
import apis from "@/apis";
import eventBus from "@/eventBus";

export default {
  name: "AlbumCard",
  props: {
    album: Object,
    sizeType: {
      default: 'medium',
      type: String
    },
    maxWidth: {
      default: 512,
      type: Number
    },
    deletable: {
      default: false,
      type: Boolean
    }
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      showTitle: false,
      operation: {
        albumName: '',
        showDeleteDialog: false,
        loading: false
      }
    }
  },
  methods: {
    confirmDeleteAlbum(album) {
      this.operation.albumName = album.name
      this.operation.showDeleteDialog = true
    },
    handleDelete() {
      this.operation.loading = true
      apis.deleteAlbum(this.album.albumId).then(() => {
        this.operation.showDeleteDialog = false
        eventBus.bus.$emit(eventBus.events.albumRemoved, this.album)
      }).finally(() => {
        this.operation.loading = false
      })
    }
  },
  computed: {
    thumbnailConfig() {
      return configs.thumbnailConfig[this.sizeType]
    },
    thumbnailEdge() {
      if (this.album.sampleResources.length > 1) {
        return 2
      } else {
        return 1
      }
    },
    thumbnailSize() {
        return this.thumbnailConfig.displaySize / this.thumbnailEdge
    },
    wrapperStyle() {
      let edge = this.thumbnailEdge
      let gridStyle = "display: grid;"
      let columnStyle = "grid-template-columns:"
      let rowStyle = "grid-template-rows:"
      for (let i = 0; i < edge; i++) {
        columnStyle += ` ${this.thumbnailSize}px`
        rowStyle += ` ${this.thumbnailSize}px`
      }
      columnStyle += ";"
      rowStyle += ";"
      return gridStyle + columnStyle + rowStyle
    }
  }
}
</script>

<style scoped>

.item-wrapper {
  position: relative;
}

.wrapper-info {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.4);
  align-self: center;
}

.album-title {
  font-size: 100%;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: white;
  max-lines: 1;
  flex: 20 1 auto;
}

.album-count {
  font-size: 80%;
  color: white;
  flex-grow: 1;
}

.img-placeholder {
  object-fit: scale-down;
  width: 100%;
  height: 100%;
  alignment: center
}


</style>