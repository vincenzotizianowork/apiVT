
const testRouring = require('./test/test');



module.exports = function(app) {

    app.use('/v0/test',testRouring);

}

