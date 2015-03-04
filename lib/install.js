var exec = require('child_process').exec;
var glob = require('glob');
var fs = require('fs');

var installable = glob.sync('lib/*/').filter(fs.existsSync.bind(fs, 'package.json'));

function install(tasks) {
  if (tasks.length < 1) return;

  var task = './' + tasks.shift();
  console.log('cd ' + task);
  console.log(process.cwd());
  process.chdir(task);
  console.log('- npm install');
  exec('npm install', function(err, result) {
    if (err) throw err;
    process.chdir('../../');
    install(tasks);
  });
}

install(installable);
