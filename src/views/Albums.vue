<template>
  <el-card shadow="never">
    <div style="display: flex; flex-flow: column nowrap; ">
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
        <el-breadcrumb-item>Albums</el-breadcrumb-item>
      </el-breadcrumb>
      <AlbumList />
    </div>
  </el-card>
</template>

<script>
import AlbumList from "@/components/AlbumList";

export default {
  name: "Albums",
  components: {AlbumList},
  data() {
    return {}
  }
}
</script>

<style scoped>

</style>