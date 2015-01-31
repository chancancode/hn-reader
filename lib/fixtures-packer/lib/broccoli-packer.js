var fs = require("fs");
var path = require("path");
var walkSync = require("walk-sync");
var mkdirp = require("mkdirp").sync;
var Mapper = require("./broccoli-mapper");

module.exports = Packer;

function Packer(inputTree, options) {
  if (!(this instanceof Packer)) {
    return new Packer(inputTree, options);
  }

  options = options || {};

  this.importPrefix = options.importPrefix;

  Mapper.call(this, inputTree, options);
}

Packer.prototype = Object.create(Mapper.prototype);
Packer.prototype.constructor = Packer;

function isJSON(path) {
  return /\.json$/.test(path);
}

function isDir(path) {
  return path.slice(-1) === "/";
}

function quote(str) {
  return JSON.stringify(str);
}

function wrapContent(str, relativePath) {
  return isJSON(relativePath) ? str : quote(str);
};

Packer.prototype.processString = function(str, relativePath) {
  return "/* jshint ignore:start */\nexport default " + wrapContent(str, relativePath) + ";\n/* jshint ignore:end */"
};

Packer.prototype.processFile = function(relativePath, srcDir, destDir) {
  var srcPath  = path.join(srcDir, relativePath);
  var destPath = path.join(destDir, relativePath) + ".js";

  this.mapFile(srcPath, destPath, this.processString, [relativePath]);
};

Packer.prototype.processDir = function(relativePath, srcDir, destDir) {
  var packer = this, packed = [];

  relativePath = relativePath.slice(0,-1);

  var srcPath  = path.join(srcDir, relativePath);
  var destPath = path.join(destDir, relativePath) + ".js";

  var paths = walkSync(srcPath).filter(function(subPath) {
    file = isDir(subPath) ? subPath.slice(0, -1) : subPath;
    return ! packer.shouldBeIgnored(path.join(srcDir, subPath));
  });

  packed.push("/* jshint ignore:start */\nvar packed = {}");

  paths.forEach(function(subPath, i) {
    var dir = relativePath.split("/").slice(-1)[0];
    var importPath = "./" + path.join(dir, subPath);

    if (isDir(importPath)) {
      importPath = importPath.slice(0, -1);
    }

    if (isDir(subPath)) {
      subPath = subPath.slice(0, -1);
    }

    packed.push("import import" + i + " from " + quote(importPath));

    var parts = subPath.split("/");

    parts.reduce(function(built, toBuild, j) {
      built = built + "[" + quote(toBuild) + "]";

      if (j === (parts.length - 1)) {
        packed.push(built + " = import" + i);
      } else {
        packed.push(built + " = " + built + " || {}");
      }

      return built;
    }, "packed");
  });

  packed.push("export default packed;\n/* jshint ignore:end */");

  mkdirp(path.dirname(destPath));

  fs.writeFileSync(destPath, packed.join(";\n"), { encoding: "utf8" });
};
