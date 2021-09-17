class EventBus {
  constructor() {
    this._listeners = {}
    this._intentData = null
  }

  once(event, callBack) {
    const me = this
    const fn = function() {
      callBack(...arguments)
      me.off(event, fn)
    }
    this.on(event, fn)
    return () => {
      me.off(event, fn)
    }
  }

  emit(event) {
    const listener = this._listeners[event]
    if (!Array.isArray(listener)) return
    const args = [].slice.call(arguments, 1)
    return listener.slice().map(item => item(...args))
  }

  notify(...args) {
    return this.emit(...args)
  }

  off(event, callback) {
    const listener = this._listeners[event]
    if (!listener) {
      return
    }
    const index = listener.indexOf(callback)
    if (index !== -1) {
      listener.splice(index, 1)
    }
  }

  on(event, callback) {
    let listener = this._listeners[event]
    if (!listener) {
      listener = this._listeners[event] = []
    }
    listener.push(callback)
    return () => {
      this.off(event, callback)
    }
  }
}

export default new EventBus()

