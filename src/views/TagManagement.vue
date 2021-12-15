<template>
  <div>
    <el-card shadow="never">
      <div style="display: flex; flex-flow: column nowrap; ">
        <el-breadcrumb separator="/">
          <el-breadcrumb-item :to="{ path: '/' }">Home</el-breadcrumb-item>
          <el-breadcrumb-item>Tag Management</el-breadcrumb-item>
        </el-breadcrumb>

        <div style="position: relative">
          <transition name="el-fade-in">
            <div v-show="searchName === null || searchName === ''"
                style="display: flex; flex-flow: row nowrap; gap: 10px;
                position: absolute; float: top; margin-top: 16px; width: 400px">
              <el-input style="flex: 1 1 auto" placeholder="Input new tag name"
                        v-model="newTagOperation.name"
                        @keyup.enter.native="createNewTag"/>
              <el-button type="primary" @click="createNewTag" :loading="newTagOperation.createTagLoading">+</el-button>
            </div>
          </transition>

          <transition name="el-fade-in">
            <div v-show="searchName !== null && searchName !== ''"
                 style="margin-top: 16px; position: absolute; float: top">
              <p style="display: flex; flex-flow: row nowrap; align-items: center; gap: 10px">
                <span style="font-size: 16px; font-weight: bold">Filter tags containing:</span>
                <el-tag :closable="true" @close="searchName = ''">{{searchName}}</el-tag>
              </p>
            </div>
          </transition>
        </div>

        <div style="display:flex; flex-flow: row wrap; gap: 10px; margin-top: 72px">
          <el-tag v-for="(name, tagId) in tagMap" :key="tagId"
                  :type="getTagType(tagId)" effect="light" :closable="true" @close="handleDeleteTag({tagId, name})">
            <v-icon color="rgba(128, 128, 128, 0.3)" small @click="handleRenameTag({tagId, name})">el-icon-edit</v-icon>
            {{name}}
          </el-tag>
        </div>

        <el-dialog
            :visible.sync="renameTagOperation.showRenameTagDialog" title="Rename Tag">
          <div style="margin: 8px">
            <p style="text-align: start">Renaming tag:</p>
            <p style="text-align: start"><span style="font-weight: 500">{{renameTagOperation.renameTagOperation}}</span></p>
          </div>
          <div style="display: flex; flex-flow: column nowrap; gap: 10px">
            <el-input placeholder="Please input name" v-model="renameTagOperation.renameTo" @keyup.enter.native="renameTag" />
            <el-button type="primary" @click="renameTag" :loading="renameTagOperation.renameLoading">OK</el-button>
          </div>
        </el-dialog>

        <el-dialog
            :visible.sync="deleteTagOperation.showConfirmDeleteDialog" title="Delete Tag?">
          <div style="display: flex; flex-flow: row nowrap; gap: 10px; justify-content: center">
            <el-button type="primary" @click="deleteTagOperation.showConfirmDeleteDialog = false">Cancel</el-button>
            <el-button type="danger" @click="deleteTag" :loading="deleteTagOperation.loading">Delete</el-button>
          </div>
        </el-dialog>

      </div>
    </el-card>
  </div>
</template>

<script>
import apis from "@/apis";
import eventBus from "@/eventBus";

export default {
  name: "TagManagement",
  data() {
    return {
      searchName: "",
      newTagOperation: {
        createTagLoading: false,
        name: ""
      },
      renameTagOperation: {
        showRenameTagDialog: false,
        renameLoading: false,
        tag: {
          tagId: null,
          name: ''
        },
        renameTo: "",
      },
      deleteTagOperation: {
        loading: false,
        showConfirmDeleteDialog: false,
        tagToDelete: {
          tagId: null,
          name: ''
        },
      }
    }
  },
  mounted() {
    eventBus.bus.$on(eventBus.events.searchText, (text) => {
      this.searchName = text
    })
    this.loadTags()
  },
  destroyed() {
    eventBus.bus.$off(eventBus.events.searchText)
  },
  methods: {
    loadTags() {
      apis.getTags({}).then((payload) => {
        this.$store.commit("saveTags", payload.data)
      })
    },
    getTagType(id) {
      const colorType = ["", "success", "info", "warning", "danger"]
      return colorType[id % 5]
    },
    handleDeleteTag(tag) {
      this.deleteTagOperation.tagToDelete = tag
      this.deleteTagOperation.showConfirmDeleteDialog = true
    },
    deleteTag() {
      this.deleteTagOperation.loading = true
      apis.deleteTag(this.deleteTagOperation.tagToDelete.tagId).then(() => {
        this.$store.commit("deleteTag", this.deleteTagOperation.tagToDelete.tagId)
        this.deleteTagOperation.showConfirmDeleteDialog = false
      }).finally(() => {
        this.deleteTagOperation.loading = false
      })
    },
    createNewTag() {
      this.newTagOperation.createTagLoading = true
      apis.createTag({name: this.newTagOperation.name}).then((payload) => {
        this.$store.commit("newTag", payload.data)
      }).finally(() => {
        this.newTagOperation.createTagLoading = false
        this.newTagOperation.name = ""
      })
    },
    handleRenameTag(tag) {
      this.renameTagOperation.tag = tag
      this.renameTagOperation.showRenameTagDialog = true
    },
    renameTag() {
      this.renameTagOperation.renameLoading = true
      apis.updateTag(this.renameTagOperation.tag.tagId, {name: this.renameTagOperation.renameTo}).then((payload) => {
        this.$store.commit("updateTag", payload.data)
        this.renameTagOperation.showRenameTagDialog = false
      }).finally(() => {
        this.renameTagOperation.renameLoading = false
        this.renameTagOperation.renameTo = ""
      })
    }
  },
  computed: {
    tagMap() {
      if (this.searchName !== "" && this.searchName !== null) {
        let fullSet = this.$store.state.tagMap
        let result = {}
        for (const key in fullSet) {
          if (fullSet[key].includes(this.searchName)) {
            result[key] = fullSet[key]
          }
        }
        return result
      } else {
        return this.$store.state.tagMap
      }
    }
  },
}
</script>

<style scoped>

</style>