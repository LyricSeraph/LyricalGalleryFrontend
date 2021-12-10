<template>

  <el-divider class="no-margin-top-divider" content-position="right">
    <v-icon @click="changeSize('large')" :color="getColor('large')">el-icon-picture</v-icon>
    <v-icon @click="changeSize('medium')" :color="getColor('medium')">el-icon-menu</v-icon>
    <v-icon @click="changeSize('small')" :color="getColor('small')">el-icon-s-grid</v-icon>
  </el-divider>

</template>

<script>
import eventBus from "@/eventBus";

export default {
  name: "ThumbSizeSelector",
  data() {
    return {
      sizeType: this.$store.state.thumbnailSizeType
    }
  },
  methods: {
    getColor(sizeType) {
      if (this.sizeType === sizeType) {
        return "#409EFF"
      } else {
        return "#909399"
      }
    },
    changeSize(sizeType) {
      console.log("change size: ", sizeType)
      this.sizeType = sizeType
      this.$store.commit("saveThumbSize", sizeType)
      eventBus.bus.$emit(eventBus.events.itemSizeChanged, sizeType)
    },
  }
}
</script>

<style scoped>

</style>