import Vue from "vue";

const events = {
    showMessage: "show-message", // param: text: string
    screenSizeChanged: "screen-size-changed", // param: {screen-width: float}
    searchText: "search-text", // param: {level: string, text: string}
    searchTag: "search-tag", // param: id: long
    scrollToBottom: "scroll-to-bottom", // no params
    itemSizeChanged: "item-size-changed", // params: size-type: string
    newItemAdded: "new-item-added", // params: { resource object }
    itemRemoved: "item-removed", // params: { resource object }
    reloadItems: "reload-items", // no params
}

const bus = new Vue()

export default {
    events,
    bus
}