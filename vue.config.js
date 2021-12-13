
module.exports = {
  // options...
  devServer: {
    proxy: 'http://localhost:80',
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/static/dist' : '',
  transpileDependencies: [
    'vuetify'
  ]
}
