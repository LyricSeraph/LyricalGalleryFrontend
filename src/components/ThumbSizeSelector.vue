<template>

  <el-divider class="no-margin-top-divider" content-position="right">
    <i class="el-icon-picture" @click="changeSize('large')"/>
    <i class="el-icon-menu" @click="changeSize('medium')"/>
    <i class="el-icon-s-grid" @click="changeSize('small')"/>
  </el-divider>

</template>

<script>
import eventBus from "@/eventBus";

export default {
  name: "ThumbSizeSelector",
  data() {
    return {}
  },
  methods: {
    changeSize(sizeType) {
      console.log("change size: ", sizeType)
      this.$store.commit("saveThumbSize", sizeType)
      eventBus.bus.$emit(eventBus.events.itemSizeChanged, sizeType)
    },
  }
}
</script>

<style scoped>

</style>