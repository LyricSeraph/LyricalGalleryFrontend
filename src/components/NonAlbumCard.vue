<template>
  <el-card v-if="page.totalElements > 0">
    <div class="item-wrapper"
         @mouseover="showTitle = true" @mouseleave="showTitle = false">
      <div :style="wrapperStyle" @click="$emit('click')">
        <template v-for="item in page.content">
          <template v-if="item.status === 2">
            <el-image :key="`non-album-${item.resourceId}`"
                      fit="cover" :src="item[thumbnailConfig.thumbnailKey]">
              <div slot="error" class="image-slot" style="width: 100%; height: 100%">
                <img class="img-placeholder" :src="`${publicPath}/assets/pic-no-thumbnail.png`" alt=""/>
              </div>
            </el-image>
          </template>
          <template v-else-if="item.status === 0 || item.status === 1">
            <img :key="`non-album-${item.resourceId}`"
                 class="img-placeholder" :src="`${publicPath}/assets/pic-downloading.png`" alt="downloading"/>
          </template>
          <template v-else>
            <img :key="`non-album-${item.resourceId}`"
                 class="img-placeholder" :src="`${publicPath}/assets/pic-download-failed.png`" alt="downloading"/>
          </template>
        </template>
        <img v-if="page.content.length === 0" style="height: 100%; width: 100%; object-fit: contain" :src="`${publicPath}/assets/pic-no-data.png`" alt=""/>
      </div>
      <transition name="el-zoom-in-bottom">
        <div class="wrapper-info" v-show="showTitle">
          <span class="album-title">Recycle bin</span>
          <span class="album-count">{{ page.totalElements }}&nbsp;<i class="el-icon-picture-outline"/></span>
        </div>
      </transition>
    </div>

  </el-card>
</template>

<script>
import configs from "@/configs";
import apis from "@/apis";
import eventBus from "@/eventBus";

export default {
  name: "NonAlbumCard",
  props: {
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
      page: {
        content: [],
        totalElements: 0,
      },
      publicPath: process.env.BASE_URL,
      showTitle: false,
    }
  },
  created() {
    eventBus.bus.$on(eventBus.events.reloadItems, () => {
      this.loadSampleData()
    })
  },
  destroyed() {
    eventBus.bus.$off(eventBus.events.reloadItems)
  },
  mounted() {
    this.loadSampleData()
  },
  methods: {
    loadSampleData() {
      apis.getResources({...this.query, albumId: this.thisId }).then((payload) => {
        this.page = payload.data
      }).finally(() => {})
    },
  },
  computed: {
    thumbnailConfig() {
      return configs.thumbnailConfig[this.sizeType]
    },
    thumbnailEdge() {
      if (this.page.content.length > 1) {
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