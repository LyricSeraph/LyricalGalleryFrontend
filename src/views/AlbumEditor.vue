<template>
  <div ref="frameContainer" :style="`display: flex; flex-flow: row ${wrapState}; gap: 24px;`">
    <div style="flex: 1 1 auto">
      <el-card shadow="never">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/management/albums' }">Management Albums</el-breadcrumb-item>
          <el-breadcrumb-item>{{ albumData.name }} ({{ albumData.albumSize }})</el-breadcrumb-item>
        </el-breadcrumb>
        <div style="padding:16px; display: flex; flex-flow: column nowrap; gap: 16px; justify-content: space-around">
          <p>Upload New Files <span style="font-weight: bold">or </span>
            <el-link type="primary" @click="offlineDownload.showDialog = true">
              <span style="font-size: 16px">Offline Download</span>
            </el-link>
          </p>
          <el-upload
              style="flex: 1 1 auto"
              :action="`/private/api/resource/upload?album=${albumData.albumId}`"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :on-success="handleUploadSuccess" multiple>
            <i class="el-icon-plus"></i>
          </el-upload>
        </div>
        <ImageList :query-abnormal-state="true" :album-id="parseInt(this.$route.params.albumId)" :management="true"/>
      </el-card>
    </div>
    <div :style="`width: ${sideMenuWidth}; min-width: 240px`">
      <el-card shadow="never">
        <TagList :album-id="parseInt(this.$route.params.albumId)"/>
      </el-card>
    </div>
    <el-dialog :visible.sync="uploadPreview.showDialog">
      <img width="100%" :src="uploadPreview.imageUrl" alt="">
    </el-dialog>
    <el-dialog :visible.sync="offlineDownload.showDialog"
               title="Offline Download">
      <el-input
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4}"
          placeholder="Input urls to download, one per row."
          v-model="offlineDownload.urlsText">
      </el-input>
      <el-button type="primary" style="margin-top: 16px; width: 100%" @click="startOfflineDownload"
                 :loading="offlineDownload.loading">Start Download</el-button>
      <div v-if="offlineDownload.failedUrls.length > 0"
           style="margin-top: 16px">
        <p style="display: flex; text-align: start;">
          <span>Failed upload records:&nbsp;</span>
          <el-link type="primary" @click="offlineDownload.failedUrls=[]">(Clear)</el-link>
        </p>
        <p v-for="(url, index) in offlineDownload.failedUrls"
           :key="`failed-url-${index}`"
           style="text-align: start">
          {{ url }}
        </p>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import eventBus from "@/eventBus"
import TagList from "@/components/TagList";
import ImageList from "@/components/ImageList";
import apis from "@/apis";
import configs from "@/configs";
export default {
  name: "AlbumEditor",
  components: {ImageList, TagList},
  mounted() {
    this.updateLayoutStyle(this.$refs.frameContainer.clientWidth)
    eventBus.bus.$on(eventBus.events.screenSizeChanged, () => {
      this.updateLayoutStyle(this.$refs.frameContainer.clientWidth)
    })
    eventBus.bus.$on(eventBus.events.itemSizeChanged, (sizeType) => {
      this.sizeType = sizeType
    })
    eventBus.bus.$on(eventBus.events.newItemAdded, () => {
      this.albumData.albumSize++
    })
    eventBus.bus.$on(eventBus.events.itemRemoved, () => {
      this.albumData.albumSize--
    })
    this.loadAlbum()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
    eventBus.bus.$off(eventBus.events.itemSizeChanged)
    eventBus.bus.$off(eventBus.events.newItemAdded)
    eventBus.bus.$off(eventBus.events.itemRemoved)
  },
  data() {
    return {
      sizeType: this.$store.state.thumbnailSizeType,
      wrapState: "nowrap",
      sideMenuWidth: "240px",
      albumData: {
        albumId: null,
        name: "",
        albumSize: 0,
      },
      albumLoading: false,

      uploadPreview: {
        imageUrl: "",
        showDialog: false,
      },
      offlineDownload: {
        loading: false,
        urlsText: "",
        showDialog: false,
        failedUrls: []
      }
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
      this.albumLoading = true
      apis.getAlbum(this.$route.params.albumId).then((payload) => {
        this.albumData = payload.data
      }).finally(() => {
        this.albumLoading = false
      })
    },
    handleRemove(file) {
      let id = file.response.data.resourceId
      apis.removeResource(id)
          .then(() => {
            eventBus.bus.$emit(eventBus.events.itemRemoved, file.response.data)
          })
          .finally(() => {})
    },
    handlePictureCardPreview(file) {
      this.uploadPreview.imageUrl = file.url;
      this.uploadPreview.showDialog = true;
    },
    handleUploadSuccess(response) {
      this.albumData.albumSize++
      eventBus.bus.$emit(eventBus.events.newItemAdded, response.data)
    },
    async startOfflineDownload() {
      console.log("startOfflineDownload: ", this.offlineDownload.urlsText)
      this.offlineDownload.loading = true
      let lines = this.offlineDownload.urlsText.split('\n')

      let promises = [];
      for (const line of lines) {
        promises.push(apis.offlineDownload({ url: line, albumId: this.albumData.albumId }))
      }
      promises = promises.map(p => p.catch(() => null));
      let results = await Promise.all(promises);
      for (let i = 0; i < results.length; i++) {
        if (results[i] === null) {
          this.offlineDownload.failedUrls.push(lines[i])
        } else {
          eventBus.bus.$emit(eventBus.events.newItemAdded, results[i].data)
        }
      }
      this.offlineDownload.loading = false
      if (this.offlineDownload.failedUrls.length === 0) {
        this.offlineDownload.showDialog = false

      }
    }
  },
  computed: {
    thumbnailConfig() {
      return configs.thumbnailConfig[this.sizeType]
    },
  }
}
</script>

<style scoped>

</style>