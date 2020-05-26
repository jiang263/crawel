const CompressionWebpackPlugin = require("compression-webpack-plugin");

// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  // chunks:['vendors','umi'],
  chainWebpack:(config)=>{
    config.merge({
      plugins:[
        new CompressionWebpackPlugin({
          filename: "[path].gz[query]",
          algorithm: "gzip",
          test: new RegExp("\\.(js|css)$"),
          threshold: 10240,
          minRatio: 0.8
        })
      ],
      optimization:{
        minimize:true,
        splitChunks:{
          chunks:'all',
          minSize:3000,
          // minChunks:3,
          automaticNameDelimiter:'.',
          cacheGroups:{
            vendor:{
              name:"vendors",
              test({resource}){
                return /[\\/]node_modules[\\/]]/.test(resource)
              },
              priority:10
            },
            antd: {
              name: "chunk-antd", 
              priority: 20, 
              test: /[\\/]node_modules[\\/]_?antd(.*)/
            },
          }
        }
      }
    })
  },
  routes: [
    {
      path: '/',
      component: '../layouts/index',
      routes: [
        { path: '/', component: '../pages/index' }
      ]
    }
  ],
  plugins: [
    // ref: https://umijs.org/plugin/umi-plugin-react.html
    ['umi-plugin-react', {
      antd: true,
      dva: false,
      dynamicImport: false,
      title: 'crawel',
      dll: true,
      
      routes: {
        exclude: [
          /components\//,
        ],
      },
    }],
  ],
}
