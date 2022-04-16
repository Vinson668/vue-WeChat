module.exports = {
    publicPath: './',
    // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
    productionSourceMap: false,
    configureWebpack: {
        name: name,
        devtool:'source-map',  // 源码不压缩，方便浏览器调试
        resolve: {
            alias: {
                '@': resolve('src')
            }
        }
    },
}