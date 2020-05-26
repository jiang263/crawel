
// ref: https://umijs.org/config/
export default {
  treeShaking: true,
  // chunks:['vendors','umi'],
  chainWebpack:(config)=>{
    config.merge({
      optimization:{
        minimize:true,
        splitChunks:{
          chunks:'all',
          minSize:30000,
          minChunk:3,
          automaticNameDelimiter:'',
          cacheGroups:{
            vendor:{
              name:"vendors",
              test({resource}){
                return /[\\/]node_modules[\\/]]/.test(resource)
              },
              priority:10
            }
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
      dll: false,
      
      routes: {
        exclude: [
          /components\//,
        ],
      },
    }],
  ],
}
