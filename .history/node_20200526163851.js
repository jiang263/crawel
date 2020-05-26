const Koa = require('koa');
const { resolve } = require('path');
const staticServer = require('koa-static');
const koaBody = require('koa-body');
const cors = require('koa2-cors');
const logger = require('koa-logger');
// const fs = require('fs');
const glob = require('glob');
const { fork } = require('child_process');

const app = new Koa();
app.use(staticServer(resolve(__dirname, './static')));
app.use(staticServer(resolve(__dirname, './db')));
app.use(koaBody());
app.use(logger());

const config = {
  imgPath: resolve('./', 'static'),
  txtPath: resolve('./', 'db')
}

// 设置跨域
app.use(cors())

// 创建异步线程
function createPromisefork(childUrl, data) {
  const res = fork(childUrl)
  data && res.send(data)
  return new Promise(reslove => {
    res.on('message', f => {
      reslove(f)
    })
  })
}


app.use(async (ctx, next) => {
  console.log(ctx.url)
  if (ctx.url === '/mz/fetch') {
    const data = ctx.request.body;
    const res = await createPromisefork('./child.js', data)
    // 获取文件路径
    const txtUrls = [];
    let reg = /.*?(\d+)\.\w*$/;
    glob.sync(`${config.txtPath}/*.*`).forEach(item => {
      if (reg.test(item)) {
        txtUrls.push(item.replace(reg, '$1'))
      }
    })

    ctx.body = {
      state: res,
      data: txtUrls,
      img
      msg: res ? '抓取完成' : '抓取失败,原因可能是非法的url或者请求超时或者服务器内部错误'
    }
  }
  await next()
})

app.listen(8083)

