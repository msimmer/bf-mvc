
const { forOwn, isFunction, isPlainObject } = require('lodash')
const Validatable = require('../validatable')
const StrongParams = require('../strong-params')

class Model {
  isValidateable() {
    forOwn(Validatable, (v, k) => {
      Object.defineProperty(this, k, {
        writable: false,
        configurable: false,
        enumerable: true,
        value: isFunction(Validatable[k]) ? Validatable[k](this) : Validatable[k]
      })
    })
  }

  hasStrongParams() {
    forOwn(StrongParams, (v, k) => {
      Object.defineProperty(this, k, {
        writable: false,
        configurable: false,
        enumerable: true,
        value: isFunction(StrongParams[k]) ? StrongParams[k](this) : StrongParams[k]
      })
    })
  }
}

module.exports = Model
