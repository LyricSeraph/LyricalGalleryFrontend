<template>
  <div ref="frameContainer" :style="`display: flex; flex-flow: row ${wrapState}; gap: 24px;`">
    <div style="flex: 1 1 auto">
      <el-card shadow="never">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
          <el-breadcrumb-item :to="{ path: '/management/albums' }">Management Albums</el-breadcrumb-item>
          <template v-for="item in parents">
            <el-breadcrumb-item :key="'breadcrumb-' + item.albumId" :to="{ name: 'album-editor', params: { albumId: item.albumId } }">
              {{ item.name }}
            </el-breadcrumb-item>
          </template>
          <el-breadcrumb-item>{{ albumData.name }} ({{ albumData.subAlbumCount }} + {{ albumData.albumSize }})</el-breadcrumb-item>
        </el-breadcrumb>

        <ThumbSizeSelector />

        <el-divider content-position="left">
          <span>Albums</span>
        </el-divider>

        <AlbumList :album-id="albumId" :management="true" />

        <el-divider content-position="left">
          <span>Items</span>
        </el-divider>

        <div style="padding:16px; display: flex; flex-flow: column nowrap; gap: 16px; justify-content: space-around">
          <p>Upload New Files <span style="font-weight: bold">or </span>
            <el-link type="primary" @click="offlineDownload.showDialog = true">
              <span style="font-size: 16px">Offline Download</span>
            </el-link>
          </p>
          <el-upload
              style="flex: 1 1 auto"
              :action="`/api/private/resource/upload?album=${albumId}`"
              drag
              list-type="fileList"
              :file-list="uploadFileList"
              :http-request="httpRequest"
              :on-success="handleUploadSuccess" multiple>
            <i class="el-icon-upload"></i>
            <div class="el-upload__text">Drag files here，or <em>click upload</em></div>
          </el-upload>
        </div>
        <ImageList :query-abnormal-state="true" :album-id="albumId" :management="true"/>
      </el-card>
    </div>
    <div :style="`width: ${sideMenuWidth}; min-width: 240px`">
      <el-card shadow="never">
        <TagList :album-id="albumId"/>
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
import ThumbSizeSelector from "@/components/ThumbSizeSelector";
import AlbumList from "@/components/AlbumList";
export default {
  name: "AlbumEditor",
  components: {AlbumList, ThumbSizeSelector, ImageList, TagList},
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
    eventBus.bus.$on(eventBus.events.albumRemoved, () => {
      this.albumData.subAlbumCount--
    })
    eventBus.bus.$on(eventBus.events.newAlbumAdded, () => {
      this.albumData.subAlbumCount++
    })
    this.loadAlbum()
  },
  beforeDestroy() {
    eventBus.bus.$off(eventBus.events.screenSizeChanged)
    eventBus.bus.$off(eventBus.events.itemSizeChanged)
    eventBus.bus.$off(eventBus.events.newItemAdded)
    eventBus.bus.$off(eventBus.events.itemRemoved)
    eventBus.bus.$off(eventBus.events.albumRemoved)
    eventBus.bus.$off(eventBus.events.newAlbumAdded)
  },
  data() {
    return {
      sizeType: this.$store.state.thumbnailSizeType,
      wrapState: "nowrap",
      sideMenuWidth: "240px",
      albumData: {
        name: "",
        parent: null,
        albumSize: 0,
        subAlbumCount: 0,
      },
      parents: [],
      albumLoading: false,

      uploadFileList: [],
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
    httpRequest(params) {
      const form = new FormData()
      form.append('file', params.file)
      // eslint-disable-next-line no-unused-vars
      const progressHandle = (progressEvent) => {
        let num = progressEvent.loaded / progressEvent.total * 100 | 0;
        params.onProgress({percent: num})
      }
      apis.instance.post("/api/private/resource/upload?album=" + this.albumId.toString(),
          form, { onUploadProgress: progressHandle })
          .then((response) => {
            console.log("upload success: ", params.file)
            params.onSuccess(response)
          })
          .catch(() => {

          })
    },
    loadAlbum() {
      this.albumLoading = true
      apis.getAlbum(this.albumId).then((payload) => {
        this.albumData = payload.data
        this.parents = []
        let current = this.albumData.parent
        while (current !== null) {
          this.parents.push(current)
          current = current.parent
        }
        this.parents.reverse()
      }).finally(() => {
        this.albumLoading = false
      })
    },
    handleUploadSuccess(response) {
      eventBus.bus.$emit(eventBus.events.newItemAdded, response.data)
    },
    async startOfflineDownload() {
      console.log("startOfflineDownload: ", this.offlineDownload.urlsText)
      this.offlineDownload.loading = true
      let lines = this.offlineDownload.urlsText.split('\n')

      let promises = [];
      for (const line of lines) {
        promises.push(apis.offlineDownload({ url: line, albumId: this.albumId }))
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
    albumId() {
      return parseInt(this.$route.params.albumId)
    }
  },
  watch: {
    albumId() {
      this.uploadFileList = []
      this.loadAlbum()
    }
  }
}
</script>

<style scoped>

</style>