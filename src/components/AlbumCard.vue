<template>
  <el-card>
    <div class="item-wrapper"
         @mouseover="showTitle = true" @mouseleave="showTitle = false"
         @click="openAlbum(albumData.id)">
      <div class="thumbnail-wrapper">
        <el-image v-for="item in albumData.sampleResources" :key="'image' + item.id"
            fit="cover" :src="item[thumbnailConfig.thumbnailKey]">
          <div slot="error" class="image-slot">
            <i class="el-icon-picture-outline"></i>
          </div>
        </el-image>
      </div>
      <transition name="el-zoom-in-bottom">
        <div class="wrapper-info" v-show="showTitle">
          <span class="album-title">{{ albumData.name }}</span>
          <span class="album-count">{{ albumData.albumSize }}&nbsp;<i class="el-icon-picture-outline"/></span>
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
    sizeType: String,
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
    albumData() {
      return this.album
    },
    thumbnailConfig() {
      return configs.thumbnailConfig[this.sizeType]
    }
  }
}
</script>

<style scoped>

.item-wrapper {
  position: relative;
}

.thumbnail-wrapper {
  display: grid;
  grid-template-columns: 128px 128px;
  grid-template-rows: 128px 128px;
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
}

.album-title {
  font-size: 24px;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: white;
  max-lines: 1;
  flex-grow: 1;
}

.album-count {
  font-size: 16px;
  color: white;
  flex-grow: 0;
}

</style>