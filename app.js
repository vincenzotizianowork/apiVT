const express = require('express');
const helmet = require('helmet');
const cors = require("cors");
const app = express();
//const router = express.Router();

const env = process.env.NODE_ENV;

app.use(cors());
app.use(express.json());


app.use(helmet({ hidePoweredBy: { setTo: 'Ater - del Comune di Roma' } }));
app.use(express.static('public'));

//app.use('/', router);

require('./routes')(app);



app.listen(process.env.PORT, function() {
    console.log('server in ascolto su porta ' + process.env.PORT);
});


