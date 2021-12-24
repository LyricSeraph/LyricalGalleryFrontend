<template>
  <el-card shadow="never">
    <div style="display: flex; flex-flow: column nowrap; ">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
        <el-breadcrumb-item>Album Management</el-breadcrumb-item>
      </el-breadcrumb>
      <ThumbSizeSelector />
      <AlbumList :management="true" />
    </div>
  </el-card>

</template>

<script>

import AlbumList from "@/components/AlbumList";
import ThumbSizeSelector from "@/components/ThumbSizeSelector";
export default {
  name: "AlbumManagement",
  components: {AlbumList, ThumbSizeSelector},
  data() {
    return {}
  }
}
</script>

<style scoped>

</style>