import Taro, { useCallback, useEffect, useState } from "@tarojs/taro";
import EventBus from "@/utils/event-bus";

/**
 *  使用存储状态
 * @param {*} key 键
 * @param {*} defaultValue 默认值
 */
const useStorageState = (key, defaultValue) => {
  if (!key) {
    throw new Error('key required');
  }

  const storageKey = `useStorageState.${key}`;

  const [state, updateState] = useState(() => {
    let defaultVal = defaultValue;
    try {
      defaultVal = Taro.getStorageSync(storageKey) || defaultValue;
    } catch (error) {
      console.log("get storage error", error);
    }
    return defaultVal;
  });

  useEffect(() => {
    EventBus.on(storageKey, updateState);
    return () => EventBus.off(storageKey, updateState);
  }, [storageKey]);

  const setState = useCallback(
    val => {
      let newVal = val;
      if (typeof val === "function") {
        newVal = val(state);
      }

      // 如果和原值一样就不更新了
      if (newVal === state) {
        return;
      }

      if (newVal === undefined) {
        try {
          Taro.removeStorageSync(storageKey)
        } catch (error) {
          console.log("remove storage error", error);
        }
        EventBus.emit(storageKey, null);
      } else {
        try {
          Taro.setStorageSync(storageKey, newVal);
        } catch (error) {
          console.log("update storage error", error);
        }
        EventBus.emit(storageKey, newVal);
      }
    },
    [storageKey, state]
  );

  const remove = useCallback(() => {
    setState(null);
  }, [setState]);

  return [state, setState, remove];
};

export default useStorageState;

