const resolve = require('../lib/index')


resolve("/some/path/to/folder", "module/dir", (err, result) => {
    console.log('plugins流转完毕');
});