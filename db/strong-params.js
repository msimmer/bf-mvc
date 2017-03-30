const { difference, union } = require('lodash')

function* entries(obj) {
  for (const key of Object.keys(obj)) {
    yield [key, obj[key]]
  }
}

class Errors {
  add(field, message) {
    if (!this[field]) {
      this[field] = [message]
    } else {
      this[field].push(message)
    }
  }
}

class StrongParams {
  static bindParams(name) {
    return (inst) => {
      return function () {
        return StrongParams.configure(inst, name, arguments)
      }
    }
  }

  static validateParams() {
    return (inst) => {
      return function (params, callback) {
        return StrongParams.validate(inst, params, callback)
      }
    }
  }

  static configure(cls, name, args) {
    if (!cls._parameters) {
      Object.defineProperty(cls, '_parameters', {
        writable: true,
        configurable: true,
        enumerable: false,
        value: []
      })
    }

    cls._parameters.push({
      [name]: Array.prototype.slice.call(args, 0),
      validator: cls.paramValidators[name]
    })
  }

  static requireParams(_reqs, params) {
    const reqs = Array.prototype.slice.call(_reqs, 0)
    const err = difference(reqs, params)
    if (err.length !== 0) {
      this.paramsErrors.add('require', { message: `Unmet requirements: [${[err]}]` })
    }

    return { err, params }
  }

  static permitParams(_reqs, params) {
    const reqs = Array.prototype.slice.call(_reqs, 0)
    const err = difference(params, reqs)
    if (err.length !==  0) {
      this.paramsErrors.add('permit', { message: `Illegal arguments: [${[err]}]` })
    }
    return { err, params }
  }

  static validate(cls, _args, callback) {
    const args = []
    const result = {}
    for (const [k] of entries(_args)) {
      args.push(k)
    }

    Object.defineProperty(cls, 'paramsErrors', {
      enumerable: false,
      configurable: true,
      value: new Errors()
    })

    if (!cls._parameters) {
      if (callback && typeof callback === 'function') {
        callback(null, args)
      }
      return args
    }

    cls._parameters.forEach((_) => {
      const reqs = _[Object.keys(_)[0]]
      const name = Object.keys(_)[0]
      result[name] = _.validator.call(cls, reqs, args)
    })

    const errors = Object.keys(cls.paramsErrors).length ? cls.paramsErrors : null
    const params = union(result.require.params, result.permit.params)
    if (callback && typeof callback === 'function') {
      return callback(errors, params)
    }

    return [errors, params]
  }
}

StrongParams.paramValidators = {
  require: StrongParams.requireParams,
  permit: StrongParams.permitParams
}

StrongParams.require = StrongParams.bindParams('require')
StrongParams.permit = StrongParams.bindParams('permit')
StrongParams.params = StrongParams.validateParams()

module.exports = StrongParams
