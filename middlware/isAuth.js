const jwt = require('jsonwebtoken');
const ip = require('my-local-ip')()


module.exports = (req, res, next) => {

    const auth = req.get('Authorization');


    if (!auth) {
        return res.status(401).json({
            status: false,
            message: 'Risorsa non autorizzata',
            customcode: '4001'
        });
    }

    const token = auth.split(' ')[1];

    let decode

    try {
        decode = jwt.verify(token, process.env.JWT_KEY);
        req.jwt = decode;



    } catch (error) {
        return res.status(401).json({
            status: false,
            message: 'TokenExpired',
            customcode: '4001',
            error
        });
    }


    if (!decode) {
        return res.status(401).json({
            status: false,
            message: 'token non decodificato',
            customcode: '4001'
        });
    }
    let userId = decode.id
    let userip = decode.ip

    if (userip != userip) {
        return res.status(500).json({
            message: 'Ip address diverso!',
            IpToken: userip,
            MyIp: userip
        });
    }

    next();
};