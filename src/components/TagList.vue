<template>
  <el-card shadow="never">
    <div style="display:flex; flex-flow: row wrap; gap: 10px">
      <el-tag v-for="t in tags" :key="t.id" style="cursor: pointer"
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
  data() {
    return {
      selected_tag_id: null,
      tags: []
    }
  },
  mounted() {
    this.loadTags()
  },
  methods: {
    getTagType(tag) {
      const colorType = ["", "success", "info", "warning", "danger"]
      return colorType[tag.id % 5]
    },
    getTagEffect(tag) {
      if (this.selected_tag_id === tag.id) {
        return "dark"
      } else {
        return "light"
      }
    },
    selectTag(tag) {
      if (this.selected_tag_id === tag.id) {
        this.selected_tag_id = null
      } else {
        this.selected_tag_id = tag.id
      }
      console.log("search tag:", this.selected_tag_id)
      eventBus.bus.$emit(eventBus.events.searchTag, this.selected_tag_id)
    },
    loadTags() {
      apis.getTags().then((payload) => {
        this.tags = payload.data
        this.$store.commit("saveTags", this.tags)
      })
    }
  }
}
</script>

<style scoped>

</style>