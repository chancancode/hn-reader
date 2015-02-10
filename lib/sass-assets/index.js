var path = require('path');

module.exports = {
  name: 'sass-assets',

  isDevelopingAddon: function() {
    return true;
  },

  treeForStyles: function() {
    var bourbonPath = path.join(this.app.bowerDirectory, 'bourbon');

    var bourbonTree = this.pickFiles(this.treeGenerator(bourbonPath), {
      srcDir: 'app/assets/stylesheets',
      destDir: '/'
    });

    var neatPath = path.join(this.app.bowerDirectory, 'neat');

    var neatTree = this.pickFiles(this.treeGenerator(neatPath), {
      srcDir: 'app/assets/stylesheets',
      destDir: '/'
    });

    var elusivePath = path.join(this.app.bowerDirectory, 'elusive-iconfont');

    var elusiveTree = this.pickFiles(this.treeGenerator(elusivePath), {
      srcDir: 'sass',
      destDir: '/'
    });

    return this.mergeTrees([bourbonTree, neatTree, elusiveTree]);
  }
};
