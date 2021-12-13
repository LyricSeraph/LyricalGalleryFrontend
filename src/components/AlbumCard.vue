<template>
  <el-card>
    <div class="item-wrapper"
         @mouseover="showTitle = true" @mouseleave="showTitle = false">
      <div :style="wrapperStyle" @click="$emit('click')">
        <el-image v-for="item in album.sampleResources" :key="`image-${album.albumId}-${item.resourceId}`"
                   fit="cover" :src="item[thumbnailConfig.thumbnailKey]">
          <div slot="error" class="image-slot" style="width: 100%; height: 100%">
            <img class="img-placeholder" src="../assets/pic-no-thumbnail.png" alt=""/>
          </div>
        </el-image>
        <img v-if="album.sampleResources.length === 0" style="height: 100%; width: 100%; object-fit: contain" src="../assets/pic-album-empty.png" alt=""/>
      </div>
      <transition name="el-zoom-in-bottom">
        <div class="wrapper-info" v-show="showTitle">
          <span class="album-title">{{ album.name }}</span>
          <span class="album-count">{{ album.albumSize }}&nbsp;<i class="el-icon-picture-outline"/></span>
        </div>
      </transition>
    </div>
  </el-card>
</template>

<script>
import configs from "@/configs";

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
    }
  },
  data() {
    return {
      showTitle: false
    }
  },
  methods: {
    openAlbum(id) {
      console.log("open album: ", id)
      this.$router.push("/album/" + id)
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
  flex: 1 1 auto;
}

.album-count {
  font-size: 80%;
  color: white;
  flex-grow: 0;
}

.img-placeholder {
  object-fit: scale-down;
  width: 100%;
  height: 100%;
  alignment: center
}


</style>