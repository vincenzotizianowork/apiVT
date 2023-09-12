
const testRouring = require('./test/test');
const authRoute = require('./auth/auth');



module.exports = function(app) {

    app.use('/v0/test',testRouring);
    app.use('/v0/auth',authRoute);

}

