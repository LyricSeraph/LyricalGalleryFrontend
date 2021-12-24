<template>
  <el-card shadow="never">
    <div style="display: flex; flex-flow: column nowrap; ">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
        <el-breadcrumb-item>Albums</el-breadcrumb-item>
      </el-breadcrumb>

      <ThumbSizeSelector />
      <AlbumList />
    </div>
  </el-card>
</template>

<script>
import AlbumList from "@/components/AlbumList";
import ThumbSizeSelector from "@/components/ThumbSizeSelector";

export default {
  name: "Albums",
  components: {ThumbSizeSelector, AlbumList},
  data() {
    return {}
  }
}
</script>

<style scoped>

</style>