var fs = require("fs");
var path = require("path");
var walkSync = require("walk-sync");
var mkdirp = require("mkdirp").sync;
var CachingWriter = require("broccoli-caching-writer");

module.exports = Mapper;

function Mapper(inputTree, options) {
  if (!(this instanceof Mapper)) {
    return new Mapper(inputTree, options);
  }

  options = options || {};

  options.enforceSingleInputTree = true;

  options.filterFromCache = options.filterFromCache || {};

  if (options.include) {
    options.filterFromCache.include = options.include;
  }

  if (options.exclude) {
    options.filterFromCache.exclude = options.exclude;
  }

  CachingWriter.call(this, inputTree, options);
}

Mapper.prototype = Object.create(CachingWriter.prototype);
Mapper.prototype.constructor = Mapper;

function isDir(path) {
  return path.slice(-1) === "/";
}

function isFile(path) {
  return ! isDir(path);
}

Mapper.prototype.updateCache = function (srcDir, destDir) {
  var mapper = this;

  var paths = walkSync(srcDir).filter(function(relativePath) {
    file = isDir(relativePath) ? relativePath.slice(0, -1) : relativePath;
    return ! mapper.shouldBeIgnored(path.join(srcDir, relativePath));
  });

  paths.filter(isFile).forEach(function(relativePath) {
    if (typeof mapper.processFile === "function") {
      mapper.processFile(relativePath, srcDir, destDir);
    } else if (typeof mapper.processString === "function") {
      var fullSrc  = path.join(srcDir, relativePath);
      var fullDest = path.join(destDir, relativePath);

      mapper.mapFile(fullSrc, fullDest, mapper.processString, [relativePath, srcDir, destDir]);
    }
  });

  paths.filter(isDir).forEach(function(relativePath) {
    if (typeof mapper.processDir === "function") {
      mapper.processDir(relativePath, srcDir, destDir);
    }
  });
};

Mapper.prototype.mapFile = function(srcFile, destFile, callback, args) {
  var content = fs.readFileSync(srcFile, { encoding: "utf8" });
  mkdirp(path.dirname(destFile));
  fs.writeFileSync(destFile, callback.apply(this, [content].concat(args)), { encoding: "utf8" });
};
