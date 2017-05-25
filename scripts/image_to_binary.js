var fs = require('fs');
var path = process.cwd() + '/test/images/';
var image = fs.readFileSync(path + 'sample.jpg');

console.log('Image-binary ', image.toString('binary'));