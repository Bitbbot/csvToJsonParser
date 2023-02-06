const numberOfCopies = (function () {
  let value;
  return function (newValue) {
    if (newValue) {
      value = newValue;
    }
    return value;
  };
})();

const readPath = (function () {
  let value;
  return function (newValue) {
    if (newValue) {
      value = newValue;
    }
    return value;
  };
})();

const writePath = (function () {
  let value;
  return function (newValue) {
    if (newValue) {
      value = newValue;
    }
    return value;
  };
})();

const lineSeparator = (function () {
  let value;
  return function (newValue) {
    if (newValue) {
      value = newValue;
    }
    return value;
  };
})();

const valueDelimiter = (function () {
  let value;
  return function (newValue) {
    if (newValue) {
      value = newValue;
    }
    return value;
  };
})();

module.exports = {
  numberOfCopies,
  readPath,
  writePath,
  lineSeparator,
  valueDelimiter,
};
