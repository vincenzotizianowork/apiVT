const expressFormidable = require('express-formidable');

module.exports = expressFormidable({
  multiples: true,
  uploadDir: './files/temp'
});
