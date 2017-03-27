/*

  This is a slightly modified version of _CaminteJS_'s Validateable class
  found [here](https://github.com/biggora/caminte/blob/master/lib/validatable.js).

  License for the CaminteJS project [here](https://github.com/biggora/caminte/blob/master/LICENSE).

 */

/**
 * Return true when v is undefined, blank array, null or empty string
 * otherwise returns false
 *
 * @param {Mix} v
 * @returns {Boolean} whether `v` blank or not
 */
function blank(v) {
  if (typeof v === 'undefined') return true
  if (v instanceof Array && v.length === 0) return true
  if (v === null) return true
  if (typeof v === 'string' && v === '') return true
  return false
}


function cleanErrors(inst) {
  Object.defineProperty(inst, 'errors', {
    enumerable: false,
    configurable: true,
    value: false
  })
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

const defaultMessages = {
  presence: 'can\'t be blank',
  length: {
    min: 'too short',
    max: 'too long',
    is: 'length is wrong'
  },
  common: {
    blank: 'is blank',
    'null': 'is null'
  },
  numericality: {
    'int': 'is not an integer',
    'number': 'is not a number'
  },
  inclusion: 'is not included in the list',
  exclusion: 'is reserved',
  uniqueness: 'is not unique'
}

function skipValidation(inst, conf, kind) {
  let doValidate = true
  if (typeof conf[kind] === 'function') {
    doValidate = conf[kind].call(inst)
    if (kind === 'unless') doValidate = !doValidate
  } else if (typeof conf[kind] === 'string') {
    if (typeof inst[conf[kind]] === 'function') {
      doValidate = inst[conf[kind]].call(inst)
      if (kind === 'unless') doValidate = !doValidate
    } else if (inst.__data.hasOwnProperty(conf[kind])) {
      doValidate = inst[conf[kind]]
      if (kind === 'unless') doValidate = !doValidate
    } else {
      doValidate = kind === 'if'
    }
  }
  return !doValidate
}

function validationFailed(inst, v, cb) {
  const attr = v[0]
  const conf = v[1]
  const opts = v[2] || {}

  if (typeof attr !== 'string') return false

  // here we should check skip validation conditions (if, unless) that can be
  // specified in conf
  if (skipValidation(inst, conf, 'if')) return false
  if (skipValidation(inst, conf, 'unless')) return false

  let fail = false
  const validator = Validatable.propValidators[conf.validation]
  const validatorArguments = []

  validatorArguments.push(attr)
  validatorArguments.push(conf)
  validatorArguments.push(function onerror(kind) {
    let message
    if (conf.message) {
      message = conf.message
    }
    if (!message && defaultMessages[conf.validation]) {
      message = defaultMessages[conf.validation]
    }
    if (!message) {
      message = 'is invalid'
    }
    if (kind) {
      if (message[kind]) {
        // get deeper
        message = message[kind]
      } else if (defaultMessages.common[kind]) {
        message = defaultMessages.common[kind]
      }
    }
    inst.errors.add(attr, message)
    fail = true
    if (cb) {
      return cb && cb(fail)
    }
  })
  if (cb) {
    validatorArguments.push(function onsuccess() {
      return cb && cb(fail)
    })
  }
  validator.apply(inst, validatorArguments)
  return fail
}


class Validatable {
  static configVindaloo(name, options) {
    return (inst) =>
      function () {
        return Validatable.configure(inst, name, arguments, options)
      }
  }

  static configure(cls, validation, args, opts) {
    if (!cls._validations) {
      Object.defineProperty(cls, '_validations', {
        writable: true,
        configurable: true,
        enumerable: false,
        value: []
      })
    }
    args = [].slice.call(args)
    let conf
    if (typeof args[args.length - 1] === 'object') {
      conf = args.pop()
    } else {
      conf = {}
    }
    if (validation === 'custom' && typeof args[args.length - 1] === 'function') {
      conf.customValidator = args.pop()
    }
    conf.validation = validation
    args.forEach((attr) => {
      cls._validations.push([attr, conf, opts])
    })

  }

  static isValid() {
    return function (callback) {
      let valid = true
      let inst = this
      let wait = 0
      let async = false

      // exit with success when no errors
      if (!this._validations) {
        cleanErrors(this)
        if (callback) {
          callback(valid)
        }
        return valid
      }

      Object.defineProperty(this, 'errors', {
        enumerable: false,
        configurable: true,
        value: new Errors()
      })

      ;
      ((validationsDone) => {
        this._validations.forEach((v) => {
          if (v[2] && v[2].async) {
            async = true
            wait += 1
            validationFailed(this, v, done)
          } else {
            if (validationFailed(this, v)) {
              valid = false
            }
          }
        })

        if (!async) {
          validationsDone()
        }

        let asyncFail = false
        const done = (fail) => {
          asyncFail = asyncFail || fail
          if (--wait === 0 && callback) {
            validationsDone.call(this, () => {
              if (valid && !asyncFail) cleanErrors(this)
              callback(valid && !asyncFail)
            })
          }
        }
      }).call(this, _ => _)

      if (!async) {
        if (valid) cleanErrors(this)
        if (callback) callback(valid)
        return valid
      } else {
        // in case of async validation we should return undefined here,
        // because not all validations are finished yet
        return
      }
    }
  }


  /**
   * Presence validator
   * @param {mixed} attr
   * @param {mixed} conf
   * @param {mixed} err
   */
  static validatePresence(attr, conf, err) {
    if (blank(this[attr])) {
      err()
    }
  }

  /**
   * Length validator
   * @param {mixed} attr
   * @param {mixed} conf
   * @param {mixed} err
   */
  static validateLength(attr, conf, err) {
    if (nullCheck.call(this, attr, conf, err)) return

    const len = this[attr].length
    if (conf.min && len < conf.min) {
      err('min')
    }
    if (conf.max && len > conf.max) {
      err('max')
    }
    if (conf.is && len !== conf.is) {
      err('is')
    }
  }

  /**
   * Numericality validator
   * @param {mixed} attr
   * @param {mixed} conf
   * @param {mixed} err
   */
  static validateNumericality(attr, conf, err) {
    if (nullCheck.call(this, attr, conf, err)) return

    if (typeof this[attr] !== 'number') {
      return err('number')
    }
    if (conf.int && this[attr] !== Math.round(this[attr])) {
      return err('int')
    }
  }

  /**
   * Inclusion validator
   * @param {mixed} attr
   * @param {mixed} conf
   * @param {mixed} err
   */
  static validateInclusion(attr, conf, err) {
    if (nullCheck.call(this, attr, conf, err)) return

    if (!~conf.in.indexOf(this[attr])) {
      err()
    }
  }

  /**
   * Exclusion validator
   * @param {mixed} attr
   * @param {mixed} conf
   * @param {mixed} err
   */
  static validateExclusion(attr, conf, err) {
    if (nullCheck.call(this, attr, conf, err)) return

    if (~conf.in.indexOf(this[attr])) {
      err()
    }
  }

  /**
   * Format validator
   * @param {mixed} attr
   * @param {mixed} conf
   * @param {mixed} err
   */
  static validateFormat(attr, conf, err) {
    if (nullCheck.call(this, attr, conf, err)) return
    if (typeof this[attr] === 'string') {
      if (!this[attr].match(conf['with'])) {
        err()
      }
    } else {
      err()
    }
  }

  /**
   * Custom validator
   * @param {mixed} attr
   * @param {mixed} conf
   * @param {mixed} err
   * @param {Function} done
   */
  static validateCustom(attr, conf, err, done) {
    conf.customValidator.call(this, err, done)
  }

  /**
   * Uniqueness validator
   * @param {mixed} attr
   * @param {mixed} conf
   * @param {mixed} err
   * @param {Function} done
   */
  static validateUniqueness(attr, conf, err, done) {
    const cond = {
      where: {}
    }
    cond.where[attr] = this[attr]
    this.constructor.all(cond, (error, found) => {
      if (found.length > 1) {
        err()
      } else if (found.length === 1 && (!this.id || !found[0].id || found[0].id.toString() !== this.id.toString())) {
        err()
      }
      done()
    })
  }
}


Validatable.propValidators = {
  presence: Validatable.validatePresence,
  length: Validatable.validateLength,
  numericality: Validatable.validateNumericality,
  inclusion: Validatable.validateInclusion,
  exclusion: Validatable.validateExclusion,
  format: Validatable.validateFormat,
  custom: Validatable.validateCustom,
  uniqueness: Validatable.validateUniqueness
}

Validatable.validatesPresenceOf = Validatable.configVindaloo('presence')
Validatable.validatesLengthOf = Validatable.configVindaloo('length')
Validatable.validatesNumericalityOf = Validatable.configVindaloo('numericality')
Validatable.validatesInclusionOf = Validatable.configVindaloo('inclusion')
Validatable.validatesExclusionOf = Validatable.configVindaloo('exclusion')
Validatable.validatesFormatOf = Validatable.configVindaloo('format')
// Validatable.validate = Validatable.configVindaloo('custom')
Validatable.validatesUniquenessOf = Validatable.configVindaloo('uniqueness', { async: true })
Validatable.validateAsync = Validatable.configVindaloo('custom', { async: true })

Validatable.validate = Validatable.isValid

module.exports = Validatable
