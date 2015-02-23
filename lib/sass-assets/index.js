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

    var entypoPlusPath = path.join(this.app.bowerDirectory, 'entypo-plus');

    var entypoPlusTree = this.pickFiles(this.treeGenerator(entypoPlusPath), {
      srcDir: 'scss',
      destDir: '/'
    });

    return this.mergeTrees([bourbonTree, neatTree, entypoPlusTree]);
  }
};
