const { validationResult } = require('express-validator');
const db = require('../../../utils/db_auth');
const jwt = require('jsonwebtoken');
const ip = require('my-local-ip')()




exports.loginUser = async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Errore formato dato',
            customcode: '4222',
            error: errors.array()
        });
    }


    const user = req.body.user;
    const password = req.body.password;

    //const ipSrv = req.ipInfo;


    let rows;
    const env = process.env.NODE_ENV;

    try {
        //[rows] = await db.execute('select USER, PASSWORD, ID from TB_USER where ATTIVO = 1 and USER = ? and PASSWORD = ? and SERVER = ?', [user, password, env]);
        [rows] = await db.execute('select TB_USER.USER, TB_USER.PASSWORD, TB_USER.ID, TB_ENTE.CODICE_ENTE from TB_USER, TB_ENTE where TB_USER.ID_ENTE = TB_ENTE.ID and ATTIVO = 1 and USER = ? and PASSWORD = ? and SERVER = ?', [user, password, env]);

    } catch (error) {
        return res.status(422).json({
            messageError: 'error login!',
            errore: error,
            customcode: '4220'
        });
    }
    if (!rows.length) {
        return res.status(401).json({
            status: false,
            message: 'Utenza non autorizzata ',
            customcode: '4001'
        });
    }
    const token = jwt.sign({
            id: rows[0].id,
            user: rows[0].user,
            codice_ente: rows[0].CODICE_ENTE
        },
        process.env.JWT_KEY, { expiresIn: '1h' }
    );

    return res.status(200).json({
        status: true,
        message: 'Success',
        customcode: '2000',
        token,
        env
        //ipSrv
        //counter
    });



};





exports.visibilita = async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Errore formato dato',
            customcode: '4222',
            error: errors.array()
        });
    }

    const user = req.body.user;
    let rows;

    try {
        [rows] = await db.execute('select * from visibilita_ambito_user where USER = ?', [user]);
    } catch (error) {
        return res.status(422).json({
            messageError: 'error login!',
            errore: error
        });
    }

    if (!rows.length) {
        return res.status(401).json({
            status: false,
            message: 'Utenza non trovata! '
        });
    }


    return res.status(200).json({
        status: true,
        message: 'Success!',
        userLog: rows
    });

};

/* exports.registerUser = async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Errore inserimento dato',
            error: errors.array()
        });
    }

    const email = req.body.email;

    let rows;

    try {
        [rows] = await db.execute('insert into user (email) values (?)', [email]);
    } catch (error) {
        return res.status(422).json({ messageError: error });
    }
    if (rows) {
        const ID = rows.insertId;
        return res.status(201).json({
            status: 'Success',
            message: 'created user',
            email: email,
            idInserito: ID
        });
    }
    return res.status(422).json({
        status: 'ko',
        message: 'problema con insert '
    });



}; */