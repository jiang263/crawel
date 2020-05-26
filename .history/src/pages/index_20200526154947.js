import { Select, Button, Spin, notification, Drawer, Result, Empty } from 'antd';
import { useState, useEffect } from 'react';
import classnames from 'classnames';

import styles from './index.css';

const { Option } = Select;

const SERVER_URL = 'http://localhost:8083';
let data,selected;

export default function () {
  const [list, setList] = useState([
    'http://www.4kbizhi.com',
  ]);
  const [fetchData, setFetchData] = useState([]);
  const [recentData, setRecentData] = useState(() => {
    try {
      let dataStr = localStorage.getItem('recent') || []
      return JSON.parse(dataStr)
    } catch (err) {
      return []
    }
  });
  const [isLoading, setLoading] = useState(false);
  const handleChange = (value) => {
    console.log(`selected ${value}`);
    data = value;
  }
  const handleChangeType = (value) => {
    console.log(`selected ${value}`);
    selected = value;
  }
  const crawel = () => {
    setLoading(true)
    data && fetch(`${SERVER_URL}/mz/fetch`, {
      method: 'POST',
      body: data
    }).then(res => res.json()).then(res => {
      if (res.state) {
        notification.success({
          message: '抓取完成',
          description: `已成功截取${data.length}张图和网页文本`
        })
        if (res.data) {
          // 求出数据增量
          let curAddItem = res.data.filter(item => !recentData.includes(item))
          setFetchData(curAddItem)
          // 更新最近爬取数据
          setRecentData(res.data)
          // 将爬取数据存入storage
          localStorage.setItem('recent', JSON.stringify(res.data))
        }
      } else {
        notification.error({
          message: '抓取失败',
          description: res.msg
        })
      }
      res && setLoading(false)
    })
  }

  useEffect(() => {

  }, [])
  return (
    <div className={styles.normal}>
      <Spin tip="正在疯狂爬取中..." spinning={isLoading}>
        <>
          <Select mode="tags" style={{ width: '50%', marginRight: '20px' }} placeholder="输入爬取地址" onChange={handleChange}>
            {list.map(item => {
              return <Option key={item}>{item}</Option>
            })}
          </Select>
          <Select defaultValue="" placeholder="选择爬取方式" onChange={handleChangeType}>
            <Option value='0'>全部</Option>
            <Option value='5'>5页</Option>
            <Option value='5'>5页</Option>
            <Option value='10'>10页</Option>
          </Select>
          <Button type="primary" onClick={crawel}>爬取</Button>
          <h3>抓取结果</h3>
          <div className={styles.result}>
            {
              fetchData.length ? fetchData.map(item => {
                return <div className={styles.item} key={item}>
                  <div className={styles.bg} style={{ backgroundImage: `url(${SERVER_URL$}/${item}.jpg})` }}></div>
                  <div className={styles.viewLink}>
                    <a href={`${SERVER_URL}/${item}.json`} download={`${item}.json`} target="_blank">下载数据</a>
                    <a href={`${SERVER_URL}/${item}.jpg`} target="_blank">查看图片</a>
                  </div>
                </div>
              }) :
                <Result
                  status="404"
                  title="赶快试试搜索你想要爬取的网站吧~"
                  subTitle="在搜索框输入网址,即可自动抓取网页, 支持多选输入."
                />
            }
          </div>
        </>
      </Spin>
      <Drawer
        title="最近抓取"
        placement="right"
        closable={false}
        visible={true}
        mask={false}
        width={360}
      >
        {
          recentData.length ? recentData.map(item => {
            return <div className={classnames(styles.item, styles.recent)} key={item}>
              <div className={styles.bg} style={{ backgroundImage: `url(${`${SERVER_URL}/${item}.jpg`})` }}></div>
              <div className={styles.viewLink}>
                <a href={`${SERVER_URL}/${item}.json`} download={`${item}.json`} target="_blank">下载数据</a>
                <a href={`${SERVER_URL}/${item}.jpg`} target="_blank">查看图片</a>
              </div>
            </div>
          }) :
            <div style={{ marginTop: '160px' }}><Empty description="还没有爬取数据哦~" /></div>
        }
      </Drawer>
    </div >
  );
}
