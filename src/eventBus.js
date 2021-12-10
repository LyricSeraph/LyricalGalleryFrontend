import Vue from "vue";

const events = {
    showMessage: "show-message", // param: text: string
    screenSizeChanged: "screen-size-changed", // param: {screen-width: float}
    searchText: "search-text", // param: {level: string, text: string}
    searchTag: "search-tag", // param: id: long
    scrollToBottom: "scroll-to-bottom", // no params
    itemSizeChanged: "item-size-changed", // params: size-type: string
}

const bus = new Vue()

export default {
    events,
    bus
}