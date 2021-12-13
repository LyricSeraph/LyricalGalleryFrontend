<template>
  <div @mouseover="showCover = true" @mouseleave="showCover = false"
       :style="`display: flex; width: ${itemWidth}px; height: ${itemHeight}px; position: relative;`">

    <template v-if="resourceData.status === 2">
      <el-image style="flex: 1 1 auto;" fit="cover" :src="resourceData[thumbnailConfig.thumbnailKey]">
        <div slot="error" class="image-slot" style="width: 100%; height: 100%">
          <img class="img-placeholder" src="../assets/pic-no-thumbnail.png" alt=""/>
        </div>
      </el-image>
    </template>
    <template v-else-if="resourceData.status === 0 || resourceData.status === 1">
      <img class="img-placeholder" src="../assets/pic-downloading.png" alt="downloading"/>
    </template>
    <template v-else>
      <img class="img-placeholder" src="../assets/pic-download-failed.png" alt="downloading"/>
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
                  @click="this.handleCreateTag" small>el-icon-price-tag</v-icon>
          <v-icon v-if="management" class="edit-operation" color="#ffffff"
                  @click="operation.showConfirmDeleteDialog = true" small>el-icon-delete</v-icon>
          </div>

        <div v-if="resourceData.tags.length !== 0" class="tag-container">
          <el-tag v-for="t in resourceData.tags" :key="`tag-${resourceData.resourceId}-${t.tagId}`"
                  size="mini" effect="light" :type="getTagType(t)" :closable="management" @close="deleteTag(t.rtId)">
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
        <el-input placeholder="Please input name" v-model="operation.renameTo" />
        <el-button type="primary" @click="handleRename" :loading="operation.loading">OK</el-button>
      </div>
    </el-dialog>

    <el-dialog
        :visible.sync="operation.showConfirmDeleteDialog" title="Delete Image?">
      <div style="display: flex; flex-flow: row nowrap; gap: 10px; justify-content: center">
        <el-button type="primary" @click="operation.showConfirmDeleteDialog = false">Cancel</el-button>
        <el-button type="danger" @click="handleDelete" :loading="operation.loading">Delete</el-button>
      </div>
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
      }
    }
  },
  methods: {
    handleClick() {
      if (!this.management) {
        this.handlePreview()
      }
    },
    handleCreateTag() {
      console.log("handleCreateTag: ", this.resourceData.resourcdId)
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
    isImage(url) {
      let imageExts = ["png", "jpg", "jpeg", "gif", "bmp"]
      for (const ext of imageExts) {
        if (url.endsWith(ext)) {
          return true;
        }
      }
      return false;
    },
    getTagType(tag) {
      const colorType = ["", "success", "info", "warning", "danger"]
      return colorType[tag.tagId % 5]
    },
    getTagName(tagId) {
      return this.$store.state.tagMap[tagId]
    },
    deleteTag(resourceTagId) {
      apis.removeResourceTag(resourceTagId)
          .then((payload) => {
            if (payload.status === 0) {
              let deletedIndex = this.resourceData.tags.findIndex((value) => {
                return value.rtId === resourceTagId
              })
              this.resourceData.tags.splice(deletedIndex, 1)
            }
          })
          .finally(() => {})
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
}


.img-placeholder {
  object-fit: scale-down;
  width: 100%;
  height: 100%;
  alignment: center
}

</style>