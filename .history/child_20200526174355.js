const Apify = require('apify');
const fs = require('fs-extra');
const path = require('path');
const { utils: { enqueueLinks } } = Apify

// const urls = [
//   'http://www.4kbizhi.com'
// ];

function startCrawel(msg, cb) {
  Apify.main(async () => {
    msg = JSON.parse(msg)
    // fs.emptyDir('/db')
    const urls = msg.urls, type = msg.type;
    // 启动一个浏览器
    // const browser = await Apify.launchPuppeteer({ headless: true });
    // 异步队列
    const queue = []
    // 最大并发数
    const max_parallel = 2
    // 开始指针
    let start = 0

    for (let i = 0; i < urls.length; i++) {
      // 添加异步队列
      // queue.push(fetchPage(browser, i, urls[i]))
      queue.push(crawler(urls[i], type))
      if (i &&
        (i + 1) % max_parallel === 0
        || i === (urls.length - 1)) {
        // 每隔2条执行一次, 实现异步分流执行, 控制并发数
        await Promise.all(queue.slice(start, i + 1))
        start = i
      }
    }
    process.on("uncaughtException", () => {
      cb && cb(0)
    })
    cb && cb(1)
    // await browser.close();

    async function crawler(ourDomain, type) {

      const requestQueue = await Apify.openRequestQueue();
      await requestQueue.addRequest({ url: ourDomain });


      const handlePageFunction = async ({ request, page }) => {
        // 滚动高度
        let scrollStep = 1080;
        // 最大滚动高度
        let max_height = 30000;
        let m = { prevScroll: -1, curScroll: 0 }

        while (m.prevScroll !== m.curScroll && m.curScroll < max_height) {
          m = await page.evaluate((scrollStep) => {
            if (document.scrollingElement) {
              let prevScroll = document.scrollingElement.scrollTop;
              document.scrollingElement.scrollTop = prevScroll + scrollStep;
              let curScroll = document.scrollingElement.scrollTop
              return { prevScroll, curScroll }
            }
          }, scrollStep);

          await sleep(2000);
        }

        const urls = await page.$$eval("img", els => Array.from(els).map(el => el.src));

        //屏幕快照
        let uid = uuid(6, 10);
        await fs.outputFileSync(`./db/${uid}.json`, JSON.stringify(urls))
        const screenshot = await page.screenshot({ path: `db/${uid}.jpg`, fullPage: true, quality: 70 });



        for (let index = 0; index < urls.length; index++) {
          const src = urls[index];
          const pages = await page.browser().newPage();
          const viewSource = await pages.goto(src, { waitUntil: 'domcontentloaded' });
          // await pages.waitFor(1000);
          const buffer = await viewSource.buffer()

          await fs.outputFileSync(`./static/${path.basename(src)}.${path.extname(src)}`, buffer)

          console.log(`${path.basename(src)}下载完成`);
        }
        console.log(`${request.url}下 ${urls.length}个资源下载完成`);


        // if (type == 0) {
        //   const enqueued = await enqueueLinks({
        //     page,
        //     requestQueue,
        //     pseudoUrls: [`${ourDomain}/[.*_.*]`],
        //     // baseUrl: request.loadedUrl
        //   })
        //   console.log(`${enqueued.length} URLS`);
        // }
      }
      const crawler = new Apify.PuppeteerCrawler({
        headless: true,
        maxRequestsPerCrawl: Number(type),
        requestQueue,
        handlePageFunction,
        launchPuppeteerOptions: {
          headless: true
        }
      })

      await crawler.run();

    }
  })
}

process.on('message', async (msg) => {
  console.log('child', msg)
  await fs.emptyDir('/static');
  await fs.removeSync('/apify_storage');
  startCrawel(msg, (flag) => {
    process.send(flag);
  })
});



async function getResourceTree(page) {
  const resource = await page._client.send('Page.getResourceTree');
  return resource.frameTree;
}


const assert = require("assert");

async function getResourceContent(page, url) {
  const { content, base64Encoded } = await page._client.send(
    'Page.getResourceContent',
    { frameId: String(page.mainFrame()._id), url }
  )
  assert.equal(base64Encoded, true);
  return content;
}

//延时函数
function sleep(delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1)
    }, delay)
  })
}

// 生成uuid
function uuid(len, radix) {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
  let uuid = [], i;
  radix = radix || chars.length;

  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix];
  } else {
    let r;
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16;
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
}