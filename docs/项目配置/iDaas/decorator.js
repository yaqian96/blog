/*
 * @Author: Gavin ZHANG
 * @Date: 2021-10-15 08:54:05
 * @Description: 交互装饰器
 */

//数组空验证
export function arrayEmpty(valueKey, message = '请勾选相关数据') {
  return function (target, name, decorator) {
    const fn = decorator.value

    decorator.value = function (...args) {
      if (!this[valueKey].length) {
        if (this.$_messageInstance) return
        this.$_messageInstance = this.$message({
          type: 'error',
          message: message,
          onClose: () => {
            this.$_messageInstance = null
          },
        })
        return
      }
      fn.call(this, ...args)
    }
  }
}

//二次确认
export function confirm(
  title = '删除',
  content = '确认移除所选内容?',
  options = {
    closeOnClickModal: false,
    iconClass: 'el-icon-info',
  }
) {
  return function (target, name, decorator) {
    const fn = decorator.value

    decorator.value = function (...args) {
      this.$confirm(content, title, options)
        .then(() => {
          fn.call(this, ...args)
        })
        .catch(foo)
    }
  }
}

//二次确认
export function confirmOne(
  content = '确认移除该内容?',
  options = {
    closeOnClickModal: false,
    customClass: 'alert-one',
  }
) {
  return function (target, name, decorator) {
    const fn = decorator.value

    decorator.value = function (...args) {
      this.$confirm(content, options)
        .then(() => {
          fn.call(this, ...args)
        })
        .catch(foo)
    }
  }
}

/**
 * form表单验证
 * @param {string} ref
 * @param {string} loadingKey
 * @returns
 */
export function formValidate(ref, loadingKey = 'loading', needPromise) {
  return function (target, name, decorator) {
    const fn = decorator.value

    decorator.value = async function (...args) {
      if (this[loadingKey]) return

      this[loadingKey] = true
      const v = await this.$refs[ref].validate().catch(() => {
        this[loadingKey] = false
        if (needPromise) return Promise.reject()
      })
      if (!v) return
      return fn.call(this, ...args).finally(() => {
        this[loadingKey] = false
      })
    }
  }
}

import rootStore from '@/plugins/store'
import { foo } from '.'

/**
 * 页面注册store
 * @param {object} store store初始化对象
 * @returns
 */
export function registerStore(store) {
  return function (target, name, decorator) {
    const fn = decorator.value

    decorator.value = function (...args) {
      if (!rootStore.hasModule(store.name)) {
        rootStore.registerModule(store.name, store)
      }

      fn.call(this, ...args)
    }
  }
}

/**
 * 卸载页面store
 * @param {object} store store初始化对象
 * @returns
 */
export function unregisterStore(store) {
  return function (target, name, decorator) {
    const fn = decorator.value

    decorator.value = function (...args) {
      let unregister = foo
      function unstore() {
        if (rootStore.hasModule(store.name)) {
          rootStore.unregisterModule(store.name)
        }
        unregister()
      }

      const has = this.$router.afterHooks.some((fn) => fn.name === unstore.name)
      if (!has) {
        unregister = this.$router.afterEach(unstore)
      }

      fn.call(this, ...args)
    }
  }
}

/**
 * 点击按钮之后loading
 * @param {string} key loading 属性名称
 * @returns
 */
export function loading(key = 'loading') {
  return function (target, name, decorator) {
    const fn = decorator.value
    decorator.value = async function (...args) {
      if (this[key]) return
      this[key] = true
      await fn.call(this, ...args)
      this[key] = false
    }
  }
}

/**
 * 分页请求，最后一页没有数据时，page需要减1
 * @param {string} key loading 属性名称
 * @returns
 */
export function fetchDataByLastPage({
  pageNoKey = 'pageNo',
  dataListKey = 'dataList',
  setPageNoCbName = '',
} = {}) {
  return function (target, name, decorator) {
    const fn = decorator.value
    decorator.value = async function (...args) {
      const res = await fn.call(this, ...args)
      const { success, data } = res
      // 业务大于1，且没有数据时，page-1，重新获取数据
      if (
        success &&
        data[pageNoKey] > 1 &&
        Array.isArray(data[dataListKey]) &&
        !data[dataListKey].length
      ) {
        const $store = args[0]
        if (setPageNoCbName) {
          if (typeof this[setPageNoCbName] === 'function') {
            this[setPageNoCbName]()
          }
        } else {
          $store.commit('SET_STATE', {
            name: 'pageNo',
            data: $store.state.pageNo - 1,
          })
        }
        fn.call(this, ...args)
      }
      return res
    }
  }
}
