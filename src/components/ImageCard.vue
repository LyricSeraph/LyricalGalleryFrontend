<template>
  <div @mouseover="showCover = true" @mouseleave="showCover = false"
       :style="`display: flex; width: ${itemWidth}px; height: ${itemHeight}px; position: relative;`">

    <template v-if="resourceData.status === 2">
      <el-image style="flex: 1 1 auto;" fit="cover" :src="resourceData[thumbnailConfig.thumbnailKey]">
        <div slot="error" class="image-slot" style="width: 100%; height: 100%">
          <img class="img-placeholder" :src="`${publicPath}/assets/pic-no-thumbnail.png`" alt=""/>
        </div>
      </el-image>
    </template>
    <template v-else-if="resourceData.status === 0 || resourceData.status === 1">
      <img class="img-placeholder" :src="`${publicPath}/assets/pic-downloading.png`" alt="downloading"/>
    </template>
    <template v-else>
      <img class="img-placeholder" :src="`${publicPath}/assets/pic-download-failed.png`" alt="downloading"/>
    </template>

    <transition name="el-fade-in">
      <div @click="this.handleClick" class="wrapper-info" v-show="showCover">
        <div style="height: min-content; width: 100%; display: flex; flex-flow: row nowrap; gap: 8px; flex-grow: 0">
          <span class="thumbnail-title">{{ resourceData.name }}</span>
          <v-icon v-if="management" class="edit-operation" color="#ffffff"
                  @click="operation.showRenameDialog = true" small>el-icon-edit</v-icon>
          <v-icon v-if="management" class="edit-operation" color="#ffffff"
                  @click="this.handlePreview" small>el-icon-zoom-in</v-icon>
          <v-icon v-if="management" class="edit-operation" color="#ffffff"
                  @click="this.handleEditTag" small>el-icon-price-tag</v-icon>
          <v-icon v-if="management" class="edit-operation" color="#ffffff"
                  @click="operation.showConfirmDeleteDialog = true" small>el-icon-delete</v-icon>
          </div>

        <div v-if="resourceData.tags.length !== 0" class="tag-container">
          <el-tag v-for="t in resourceData.tags" :key="`tag-${resourceData.resourceId}-${t.tagId}`"
                  size="mini" effect="light" :type="getTagType(t.tagId)" :closable="management" @close="removeTag(t.resourceId, t.tagId)">
            {{ getTagName(t.tagId) }}
          </el-tag>
        </div>
      </div>
    </transition>

    <el-dialog :visible.sync="showOrigin.showDialog" :title="showOrigin.title">
      <img width="100%" height="100%" :src="showOrigin.originUrl" alt="">
    </el-dialog>

    <el-dialog
        :visible.sync="operation.showRenameDialog" title="Rename Image">
      <div style="margin: 8px">
        <p style="text-align: start">Renaming image:</p>
        <p style="text-align: start"><span style="font-weight: 500">{{resourceData.name}}</span></p>
      </div>
      <div style="display: flex; flex-flow: column nowrap; gap: 10px">
        <el-input placeholder="Please input name" v-model="operation.renameTo" @keyup.enter.native="handleRename" />
        <el-button type="primary" @click="handleRename" :loading="operation.loading">OK</el-button>
      </div>
    </el-dialog>

    <el-dialog
        :visible.sync="operation.showConfirmDeleteDialog" title="Delete Item?">
      <div style="display: flex; flex-flow: row nowrap; gap: 10px; justify-content: center">
        <el-button type="primary" @click="operation.showConfirmDeleteDialog = false">Cancel</el-button>
        <el-button type="danger" @click="handleDelete" :loading="operation.loading">Delete</el-button>
      </div>
    </el-dialog>

    <el-dialog
        :visible.sync="operation.showEditTagDialog" title="Edit Tag">
      <template v-if="operation.showEditTagDialog">
        <div style="display:flex; flex-flow: row wrap; gap: 10px; margin-top: 16px">
          <el-tag v-for="(name, tagId) in this.tagMap" :key="`tag-${tagId}`" style="cursor: pointer"
                  :type="getTagType(tagId)" :effect="getTagEffect(tagId)" @click="toggleSelectedTag(tagId)">
            {{name}}
          </el-tag>
        </div>
      </template>
    </el-dialog>

  </div>


</template>

<script>
import configs from "@/configs";
import apis from "@/apis";
import eventBus from "@/eventBus";

export default {
  name: "ImageCard",
  props: {
    resource: Object,
    management: {
      default: false,
      type: Boolean
    },
    sizeType: {
      default: 'medium',
      type: String
    },
    maxWidth: {
      default: 512,
      type: Number
    }
  },
  data() {
    return {
      publicPath: process.env.BASE_URL,
      showCover: false,
      resourceData: this.resource,
      showOrigin: {
        title: "",
        showDialog: false,
        originUrl: ""
      },
      operation: {
        loading: false,
        showRenameDialog: false,
        renameTo: "",
        showConfirmDeleteDialog: false,
        showEditTagDialog: false,
      }
    }
  },
  methods: {
    handleClick() {
      if (!this.management) {
        this.handlePreview()
      }
    },
    handleEditTag() {
      this.operation.showEditTagDialog = true
      console.log("handleEditTag: ")
    },
    handleDelete() {
      this.operation.loading = true
      let id = this.resourceData.resourceId
      apis.removeResource(id)
          .then(() => {
            eventBus.bus.$emit(eventBus.events.itemRemoved, this.resourceData)
          })
          .finally(() => {
            this.operation.loading = false
            this.operation.showConfirmDeleteDialog = false
          })
    },
    handleRename() {
      this.operation.showRenameDialog = true
      apis.updateResource(this.resourceData.resourceId, {
        albumId: this.resourceData.albumId,
        name: this.operation.renameTo
      }).then((payload) => {
        this.resourceData = payload.data
      }).finally(() => {
        this.operation.loading = false
        this.operation.showRenameDialog = false
      })
    },
    handlePreview() {
      if (this.resourceData.status === 2) {
        if (this.isImage(this.resourceData.url)) {
          this.showOrigin.title = this.resourceData.name
          this.showOrigin.originUrl = this.resourceData.url;
          this.showOrigin.showDialog = true;
        } else {
          let hostScheme = window.location.protocol + "//" + window.location.host;
          window.open(hostScheme + this.resourceData.url, '_blank');
        }
      }
    },
    toggleSelectedTag(tagId) {
      if (this.hasTag(tagId)) {
        this.removeTag(this.resourceData.resourceId, tagId)
      } else {
        this.addTag(this.resourceData.resourceId, tagId)
      }
    },
    isImage(url) {
      let imageExts = ["png", "jpg", "jpeg", "gif", "bmp"]
      for (const ext of imageExts) {
        if (url.endsWith(ext)) {
          return true;
        }
      }
      return false;
    },
    hasTag(tagId) {
      for (let t of this.resourceData.tags) {
        if (t.tagId.toString() === tagId) {
          return true
        }
      }
      return false
    },
    getTagType(tagId) {
      const colorType = ["", "success", "info", "warning", "danger"]
      return colorType[tagId % 5]
    },
    getTagEffect(tagId) {
      if (this.hasTag(tagId)) {
        return "dark"
      } else {
        return "light"
      }
    },
    getTagName(tagId) {
      return this.$store.state.tagMap[tagId]
    },
    addTag(resourceId, tagId) {
      apis.addResourceTag(resourceId, tagId)
          .then(() => {
            this.resourceData.tags.unshift({resourceId, tagId})
          }).finally(() => {})
    },
    removeTag(resourceId, tagId) {
      apis.removeResourceTag(resourceId, tagId)
          .then(() => {
            let deletedIndex = this.resourceData.tags.findIndex((value) => {
              return value.resourceId === resourceId &&
                  value.tagId === tagId
            })
            this.resourceData.tags.splice(deletedIndex, 1)
          }).finally(() => {})
    }
  },
  computed: {
    thumbnailConfig() {
      return configs.thumbnailConfig[this.sizeType]
    },
    itemHeight() {
      return this.thumbnailConfig.displaySize
    },
    itemWidth() {
      let calculatedWidth = this.itemHeight * this.resourceData.ratio
      if (calculatedWidth > this.maxWidth) {
        return this.maxWidth
      }
      return calculatedWidth
    },
    tagMap() {
      return this.$store.state.tagMap
    }
  }
}
</script>

<style scoped>

.wrapper-info {
  display: flex;
  flex-flow: row wrap;
  position: absolute;
  width: 100%;
  height: 100%;
  padding: 8px;
  overflow-y: hidden;
  background-color: rgba(0, 0, 0, 0.4);
}

.thumbnail-title {
  font-size: 100%;
  text-align: left;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  color: white;
  max-lines: 1;
  flex: 1 1 auto;
}

.edit-operation {
  flex: 0 1 auto;
}

.tag-container {
  width: 100%;
  display: flex;
  flex-flow: row-reverse wrap;
  justify-content: right;
  gap: 4px;
  flex: 1 1 auto;
  align-self: end;
  overflow-x: hidden;
  overflow-y: hidden;
}


.img-placeholder {
  object-fit: scale-down;
  width: 100%;
  height: 100%;
  alignment: center
}

</style>