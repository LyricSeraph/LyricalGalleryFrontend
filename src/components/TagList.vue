<template>
  <el-card shadow="never">
    <div style="display:flex; flex-flow: row wrap; gap: 10px">
      <el-tag v-for="t in tags" :key="t.tagId" style="cursor: pointer"
              :type="getTagType(t)"
              :effect="getTagEffect(t)"
              @click="selectTag(t)">
        {{t.name}}
      </el-tag>
    </div>
  </el-card>
</template>

<script>
import eventBus from "@/eventBus"
import apis from "@/apis";

export default {
  name: "TagList",
  props: {
    albumId: {
      default: null,
      type: Number,
    }
  },
  data() {
    return {
      selectedTagId: null,
      tags: []
    }
  },
  mounted() {
    this.loadTags()
  },
  methods: {
    getTagType(tag) {
      const colorType = ["", "success", "info", "warning", "danger"]
      return colorType[tag.tagId % 5]
    },
    getTagEffect(tag) {
      if (this.selectedTagId === tag.tagId) {
        return "dark"
      } else {
        return "light"
      }
    },
    selectTag(tag) {
      if (this.selectedTagId === tag.tagId) {
        this.selectedTagId = null
      } else {
        this.selectedTagId = tag.tagId
      }
      console.log("search tag:", this.selectedTagId)
      eventBus.bus.$emit(eventBus.events.searchTag, this.selectedTagId)
    },
    loadTags() {
      apis.getTags({albumId: this.albumId}).then((payload) => {
        this.tags = payload.data
      })
    }
  }
}
</script>

<style scoped>

</style>