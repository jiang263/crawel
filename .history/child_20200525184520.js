const Apify = require('apify');
const fs = require('fs');

const urls = [
  'http://www.4kbizhi.com/'
];

function startCrawel(urls, cb) {
  Apify.main(async () => {
    // 启动一个浏览器
    const browser = await Apify.launchPuppeteer({ headless: true });
    // 异步队列
    const queue = []
    // 最大并发数
    const max_parallel = 2
    // 开始指针
    let start = 0

    for (let i = 0; i < urls.length; i++) {
      // 添加异步队列
      queue.push(fetchPage(browser, i, urls[i]))
      if (i &&
        (i + 1) % max_parallel === 0
        || i === (urls.length - 1)) {
        // 每隔2条执行一次, 实现异步分流执行, 控制并发数
        await Promise.all(queue.slice(start, i + 1))
        start = i
      }
    }

    cb && cb(1)
    await browser.close();
    async function splider()[
      const requestList = await Apify.openRequestList('categroies', sources);
      const requestQueue = await Apify.openRequestQueue()
  
      const handlePageFunction: Apify.CheerioHandlePage = async ({ request, $ }) => {
          console.log(`页面地址：${request.url}`)
          const urlArr = request.url.split('/').slice(-2);
          // const uniqueIdentifier = urlArr.join('/');
          // const owner = urlArr[0];
          if (request.userData.detailPage) {
              const results = {
                  url: request.url,
                  uniqueIdentifier: urlArr.join('/'),
                  owner: urlArr[0],
                  title: $('header h1').text(),
                  description: $('header p[class^=Text__Paragraph]').text(),
                  lastRunDate: new Date(
                      Number($('time').eq(1).attr('datetime'))
                  ),
                  runCount: Number(
                      $('ul.stats li:nth-of-type(3)').text().match(/\d+/)[0]
                  )
              }
              console.log(`结果数据：`,results);
              await Apify.pushData(results);
          }
  
          if (!request.userData.detailPage) {
              await enqueueLinks({
                  $,
                  requestQueue,
                  selector: 'div.item > a',
                  baseUrl: request.loadedUrl,
                  transformRequestFunction: req => {
                      (req.userData as { detailPage: boolean }).detailPage = true;
                      return req;
                  }
              })
          }
      }
  
      const crawler = new Apify.CheerioCrawler({
          maxRequestsPerCrawl: 50,
          requestList,
          requestQueue,
          handlePageFunction
      })
  
      await crawler.run();
  
    ]
    async function fetchPage(browser, index, url) {
      // 在浏览器中打开新标签
      const page = await browser.newPage();

      // 设置页面分辨率
      await page.setViewport({ width: 1920, height: 1080 });

      // 导航到url
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      // 等待页面加载
      await page.waitFor(1000);

      // let title = await page.title();

      // 滚动高度
      // let scrollStep = 1080;
      // 最大滚动高度
      // let max_height = 30000;
      // let m = { prevScroll: -1, curScroll: 0 }

      // while (m.prevScroll !== m.curScroll && m.curScroll < max_height) {
      //   m = await page.evaluate((scrollStep) => {
      //     if (document.scrollingElement) {
      //       let prevScroll = document.scrollingElement.scrollTop;
      //       document.scrollingElement.scrollTop = prevScroll + scrollStep;
      //       let curScroll = document.scrollingElement.scrollTop
      //       return { prevScroll, curScroll }
      //     }
      //   }, scrollStep);

      //   await sleep(3600);
      // }

      const pageCount = await page.$eval(".page ")
      const urls = await page.$$eval(".col img", els => Array.from(els).map(el => el.src));
    
      console.log(urls);
      let uid = uuid(6, 10);
      await fs.writeFileSync(`./db/${uid}.json`, JSON.stringify(urls))
      const screenshot = await page.screenshot({ path: `static/${uid}.jpg`, fullPage: true, quality: 70 });
    }

  });
}

process.on('message', (msg) => {
  console.log('child', msg)
  startCrawel(msg ? msg.split(',') : urls, (flag) => {
    process.send(flag);
  })
});


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