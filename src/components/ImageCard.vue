<template>


  <div @mouseover="showTitle = true" @mouseleave="showTitle = false"
       @click="openResource(resource.id)"
       :style="`display: flex; width: ${itemWidth}px; height: ${itemHeight}px; position: relative;`">
    <el-image style="flex: 1 1 auto;" fit="cover" :src="resource[thumbnailConfig.thumbnailKey]">
      <div slot="error" class="image-slot">
        <i class="el-icon-picture-outline"></i>
      </div>
    </el-image>
    <transition name="el-zoom-in-bottom">
      <div class="wrapper-info" v-show="showTitle">
        <span class="thumbnail-title">{{ resource.name }}</span>
        <div class="tag-container">
          <el-tag v-for="t in resource.tags" :key="`tag-${resource.id}-${t.tagId}`"
                  size="mini" effect="light" :type="getTagType(t)">
            {{ getTagName(t.tagId) }}
          </el-tag>
        </div>
      </div>
    </transition>
  </div>

</template>

<script>
import configs from "@/configs";

export default {
  name: "ImageCard",
  props: {
    resource: Object,
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
    getTagType(tag) {
      const colorType = ["", "success", "info", "warning", "danger"]
      return colorType[tag.tagId % 5]
    },
    getTagName(tagId) {
      return this.$store.state.tagMap[tagId]
    },
    openResource(resource) {
      console.log("open resource: ", resource)
    },
  },
  computed: {
    thumbnailConfig() {
      return configs.thumbnailConfig[this.sizeType]
    },
    itemHeight() {
      return this.thumbnailConfig.displaySize
    },
    itemWidth() {
      let calculatedWidth = this.itemHeight * this.resource.ratio
      if (calculatedWidth > this.maxWidth) {
        return this.maxWidth
      }
      return calculatedWidth
    },
  }
}
</script>

<style scoped>

.wrapper-info {
  display: flex;
  flex-flow: column nowrap;
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 8px;
  background-color: rgba(0, 0, 0, 0.4);
}

.thumbnail-title {
  font-size: 100%;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: white;
  max-lines: 1;
  flex-grow: 1;
}

.tag-container {
  display: flex;
  justify-content: center;
  gap: 4px;
}

</style>