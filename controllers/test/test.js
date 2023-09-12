const { validationResult } = require('express-validator');




exports.testSaluto = async(req, res) => {

    const user = req.body.user;
    const passw = req.body.passw;

    console.log(user,passw);


    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Errore formato dato',
            error: errors.array()
        });
    }


    if (user) {
        return res.status(200).json({
            status: true,
            message: 'OK autenticato!',
            user,
            passw
        });
    } 

};
