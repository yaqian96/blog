/*
 * @Description: 常用的函数
 * @Author: LianYaqian
 * @Date: 2021-09-02 14:33:58
 * @LastEditTime: 2021-09-02 14:34:00
 * @LastEditors: LianYaqian
 */
/* eslint-disable import/no-mutable-exports */
/* eslint-disable no-unused-vars */
import Taro from "@tarojs/taro";
import { isUnActiveStudent } from '@/config/constant';
import NP from '@/utils/number-precision';
import { getStore, STORAGE_KEYS } from './store';

const infoImg = "/assets/toast/info.png";
const errorImg = "/assets/toast/error.png";
const successImg = "/assets/toast/success.png";

const covertParamsToPath = (url, params) => {
  let query = "";
  for (const key in params) {
    if (params[key] != -1) {
      query = `${query}${key}=${params[key]}&`;
    }
  }
  query = query.substring(0, query.length - 1);
  return `${url}?${query}`;
};

export const showError = (title = "", complete, duration = 1500) => {
  if (title) {
    Taro.showToast({
      title,
      image: errorImg,
      complete,
      duration
    });
  }
};

export const showInfo = (title = "", complete, duration = 1500) => {
  if (title) {
    Taro.showToast({
      title,
      image: infoImg,
      complete,
      duration
    });
  }
};

export const showSuccess = (title = "", complete, duration = 1500) => {
  if (title) {
    Taro.showToast({
      title,
      image: successImg,
      complete,
      duration
    });
  }
};

export const showSheet = (actions, cb) => {
  Taro.showActionSheet({
    itemList: actions,
    complete: cb
  });
};

export const showModal = ({
  title = '',
  content,
  cancelText = '',
  showCancel = true
}, cb) => {
  Taro.showModal({
      confirmText: '确定',
      content,
      title,
      cancelText,
      showCancel,
      success: (cancel, confirm) => {
        cb && cb (confirm || cancel)
      }
  })
}

export const showLoading = (title = "", mask = true) => {
  Taro.showLoading({
    title,
    mask
  });
};

export const hiddenLoading = () => {
  Taro.hideLoading();
};

export const showAlert = (title = "", content, cb, options = {}) => {
  Taro.showModal({
    title,
    content,
    success: ({ cancel, confirm }) => {
      cb(cancel ? false : true);
    },
    ...options
  });
};

// TODO:
export const showShare = () => {
  Taro.showShareMenu();
};

export const navigateTo = ({ url, params }, options) => {
  return Taro.navigateTo({
    url: covertParamsToPath(url, params),
    ...options
  });
};

export function isNumber(c) {
  return /^-?\d+(\.\d+)?$/.test(c);
}

export const dateFormat = (fmt, date) => {
  let formateDate = null;
  if (!date) {
    return " ";
  }
  if (date instanceof Date) {
    formateDate = date;
  } else {
    formateDate = new Date(date);
  }
  let ret;
  const opt = {
    "Y+": formateDate.getFullYear().toString(), // 年
    "M+": (formateDate.getMonth() + 1).toString(), // 月
    "D+": formateDate.getDate().toString(), // 日
    "H+": formateDate.getHours().toString(), // 时
    "m+": formateDate.getMinutes().toString(), // 分
    "s+": formateDate.getSeconds().toString() // 秒
  };
  for (let k in opt) {
    ret = new RegExp("(" + k + ")").exec(fmt);
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length == 1 ? opt[k] : padStart(opt[k], ret[1].length, "0")
      );
    }
  }
  return fmt;
};

function padStart (str, maxLen, letter) {
  const ret = String(str);
  const len = ret.length;
  const letterLen = letter.length;
  if (len >= maxLen) {
    return ret;
  }
  const num = maxLen - len;
  const arr = new Array(Math.ceil(num / letterLen)).fill(letter).join('');
  return `${arr.substring(0, num)}${ret}`;
}

export function requireLogin() {
  // token是单独存的没有放在userInfo里面
  // 后面获取的微信用户信息会放在userInfo里面
  const token = getStore(STORAGE_KEYS.token);
  const currentStudent = getStore(STORAGE_KEYS.currentStudent);
  const userInfo = getStore(STORAGE_KEYS.userInfo);
  if (!token || !userInfo || !userInfo.phone) {
    Taro.showModal({
      title: '温馨提示',
      content: '当前状态未登录',
      confirmText: '去登录',
      cancelText: '稍后'
    }).then(({ confirm }) => {
      if (confirm) {
        Taro.navigateTo({
          url: '/subPackages/mine/login/index'
        })
      }
    })
    return false
  }
  if (!currentStudent || isUnActiveStudent(currentStudent)) {
    Taro.showModal({
      title: '温馨提示',
      content: '需要学生信息，才能进一步操作',
      confirmText: '新建学生',
      cancelText: '稍后'
    }).then(({ confirm }) => {
      if (confirm) {
        Taro.navigateTo({
          url: '/subPackages/mine/addStudent/index'
        })
      }
    })
    return false
  }
  return {}
}


export function toFixed(value, decimal = 2) {
  return parseFloat(value || 0).toFixed(decimal)
}

export function equal(leftV, rightV) {
  if (typeof leftV !== typeof rightV) {
    return false
  } else {
    if (Object.prototype.toString.call(leftV) === Object.prototype.toString.call(rightV)) {
      return JSON.stringify(leftV) === JSON.stringify(rightV)
    } else {
      return false
    }
  }
}

export function formateTimeRange(start, end, formate = 'YYYY.MM.DD') {
  let formateStr = ''
  if (start) {
    formateStr = dateFormat(formate, start)
  }
  if (end) {
    const endFormate = dateFormat(formate, end)
    if (/^2099/g.test(endFormate)) {
      return formateStr
    }
    formateStr += ` - ${endFormate}` 
  }
  return formateStr
}

export const formatMoney = (val) => {
  if (!/^\d+$/.test(val)) return 0;

  return NP.round(val / 100, 2);
}

let currentLocation = null;
let currentLocationPromise = null;

export function getLocation () {
  if (currentLocation) {
    return Promise.resolve(currentLocation);
  }

  if (currentLocationPromise) {
    return currentLocationPromise;
  }

  return (currentLocationPromise = Taro.getLocation({
      type: 'gcj02',
    })
    .then(res => {
      currentLocation = res;
      return res;
    })
    .catch(error => {
      currentLocationPromise = null;
      throw error;
    })
  )
}

export function parseQuery (queryString) {
  if (!queryString) return {}
  const query = decodeURIComponent(queryString)
  const paramArr = query.split('&');
  return paramArr.filter(Boolean).reduce((ret, item) => {
    let index = item.indexOf('=')
    if (index === 0) return ret
    if (index === -1) {
      ret[item] = true
      return ret
    }
    const a = item.substring(0, index)
    const b = item.substring(index + 1)
    ret[a] = b
    return ret
  }, {})
}


export function getOrderStatusName (status) {
  switch (status) {
    case -1:  {
      return '订单失效'
    }
    case 0: {
      return '待支付'
    }
    case 1:
    case 2: {
      return '已支付'
    }
    case 5:
    case 3: {
      return '退款中'
    }
    // case 5: {
    //   return '退款失败'
    // }
    case 4: {
      return '已退款'
    }
    case 6: {
      return '订单取消'
    }
  }
  return '';
}

/**
 * 延迟
 * @param {*} ms 延迟多少毫秒
 */
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 过滤指定属性
 * @param {string[]} keys 需要过滤的属性
 * @param {object} obj 需要过滤的对象
 */
export const omit = (keys, obj) => {
  if (!obj || !Array.isArray(keys)) {
    return {};
  }
  const objKeys = Object.keys(obj);
  return objKeys.reduce((ret, item) => {
    if (keys.indexOf(item) === -1) {
      ret[item] = obj[item];
    }
    return ret;
  }, {})
}

// let shouldUpdateCartCount = true;
let cartCount = 0;

export const setShouldUpdateCartCount = val => {
  // shouldUpdateCartCount = true
  cartCount = val
}

/**
 * 更新购物车数量
 * @param {*} count 
 */
export const updateTabbarCartCount = () => {
  Promise.resolve().then(() => {
    if (cartCount) {
      return Taro.setTabBarBadge({
        index: 1,
        text: `${cartCount}`
      });
    }
    return Taro.removeTabBarBadge({
      index: 1
    });
  }).catch(e => {
    console.log(e)
  })
}
const defaultModalError = '请求失败，请稍后再试'

export const showErrorModal = (error, defaultMessage = defaultModalError) => {
  let message = error.message || defaultMessage
  // if (message.length > 30) {
  //   message = defaultMessage
  // }
  return Taro.showModal({
    content: message,
    showCancel: false
  })
}


export const toValidRmb = v => {
  if (!v) return 0;
  return +v.toFixed(2);
};

export const formatSeat = v => {
  if (!v) {
    return ''
  }
  const arr = v.split('-');
  return `${arr[0]}排${arr[1]}行`
}

export const getShareUrlPath = (url, params) => {
  let ret = url;
  const currentStudent = getStore(STORAGE_KEYS.currentStudent);
  const newParams = {
    ...params,
    shareStudentId: currentStudent ? currentStudent.studentId : '',
    shareStudent: currentStudent ? currentStudent.studentName : ''
  }
  const keys = Object.keys(newParams);
  const paramsString = keys.map(c => `${c}=${newParams[c] || ''}`).join('&');
  const len = ret.length;
  const index = ret.indexOf('?');

  if (index === -1) {
    return `${url}?${paramsString}`
  }
  if (ret[len - 1] !== '&') {
    return `${url}&${paramsString}`
  }
  return `${url}${paramsString}`
}

export const convertParamsToString = (params) => {
  if (!params) return '';
  const keys = Object.keys(params);
  return keys.map(c => `${c}=${params[c] || ''}`).join('&');
}


export class Deferred {
  _promise = null;
  _resolve = null;
  _reject = null;
  constructor () {
    this._promise = new Promise((resolve, reject) => {
      this._resolve = resolve;
      this._reject = reject;
    })
  }

  resolve (data) {
    this._resolve && this._resolve(data);
  }

  reject (reason) {
    this.reject && this._reject(reason);
  }

  then (res) {
    return this._promise.then(res);
  }

  catch (res) {
    return this._promise.catch(res);
  }
}

/**缓存用户信息 */
let cachedUserProfile = null;
const cachedKey = `${process.env.TARO_STORAGE_KEY}_${process.env.NODE_ENV === 'development' ? 'userProfile' : '_11'}`;
try {
  const val = Taro.getStorageSync(cachedKey) || null;
  if (val && val.expire > Date.now()) {
    cachedUserProfile = val.value;
  }
} catch (error) {}

export function updateUserProfile (val) {
  cachedUserProfile = val;
  try {
    Taro.setStorageSync(cachedKey, {
      value: val,
      /**一个月过期 */
      expire: Date.now() + 31 * 24 * 60 * 60 * 1000
    });
  } catch (err) {}
}

export function getUserProfile () {
  return cachedUserProfile;
}

