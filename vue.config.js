

module.exports = {
  // options...
  devServer: {
    hot: true,
    proxy: 'http://localhost:80',
  },
  publicPath: '/static/dist',
  transpileDependencies: [
    'vuetify'
  ]
}
