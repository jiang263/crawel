
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
              priority: 20, /ll be packaged into libs or app
              test: /[\\/]node_modules[\\/]_?antd(.*)/ // in order to adapt to cnpm
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
      dll: false,
      
      routes: {
        exclude: [
          /components\//,
        ],
      },
    }],
  ],
}
