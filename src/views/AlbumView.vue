<template>
  <div ref="frameContainer" :style="`display: flex; flex-flow: row-reverse ${wrapState}; gap: 24px;`">
    <div :style="`width: ${sideMenuWidth}; min-width: 240px`">
      <el-card shadow="never">
        <TagList :album-id="albumId"/>
      </el-card>
    </div>
    <div style="flex: 1 1 auto">
      <el-card shadow="never">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/albums' }">Albums</el-breadcrumb-item>
          <template v-for="item in parents">
            <el-breadcrumb-item :key="'breadcrumb-' + item.albumId" :to="{ name: 'album', params: { albumId: item.albumId } }">
              {{ item.name }}
            </el-breadcrumb-item>
          </template>
          <el-breadcrumb-item>{{ albumData.name }} ({{ albumData.subAlbumCount }} + {{ albumData.albumSize }})</el-breadcrumb-item>
        </el-breadcrumb>

        <ThumbSizeSelector />

        <template v-if="albumData.subAlbumCount !== 0">
          <el-divider content-position="left">
            <span>Albums</span>
          </el-divider>
          <AlbumList :album-id="albumId" />
          <el-divider content-position="left">
            <span>Items</span>
          </el-divider>
        </template>

        <ImageList :query-abnormal-state="true" :album-id="albumId"/>
      </el-card>
    </div>
  </div>
</template>

<script>
import eventBus from "@/eventBus"
import TagList from "@/components/TagList";
import ImageList from "@/components/ImageList";
import apis from "@/apis";
import AlbumList from "@/components/AlbumList";
import ThumbSizeSelector from "@/components/ThumbSizeSelector";
export default {
  name: "AlbumView",
  components: {ThumbSizeSelector, AlbumList, ImageList, TagList},
  mounted() {
    this.updateLayoutStyle(this.$refs.frameContainer.clientWidth)
    eventBus.bus.$on(eventBus.events.screenSizeChanged, () => {
      this.updateLayoutStyle(this.$refs.frameContainer.clientWidth)
    })
    this.loadAlbum()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
  },
  data() {
    return {
      wrapState: "nowrap",
      sideMenuWidth: "240px",
      albumData: {
        name: '',
        albumSize: 0,
        subAlbumCount: 0,
        parent: null,
      },
      parents: [],
      loading: false,
    }
  },
  methods: {
    updateLayoutStyle(frameWidth) {
      if (frameWidth >= 500) {
        this.wrapState = "nowrap"
        this.sideMenuWidth = "240px"
      } else {
        this.wrapState = 'wrap'
        this.sideMenuWidth = "100%"
      }
    },
    loadAlbum() {
      this.loading = true
      apis.getAlbum(this.$route.params.albumId).then((payload) => {
        this.albumData = payload.data
        this.parents = []
        let current = this.albumData.parent
        while (current !== null) {
          this.parents.push(current)
          current = current.parent
        }
        this.parents.reverse()
      }).finally(() => {
        this.loading = false
      })
    },
  },
  computed: {
    albumId() {
      return parseInt(this.$route.params.albumId)
    }
  },
  watch: {
    albumId() {
      this.loadAlbum()
    }
  }
}
</script>

<style scoped>

</style>