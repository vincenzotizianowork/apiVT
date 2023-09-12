const { validationResult } = require('express-validator');
const db = require('../../../utils/db_apiVT');
const jwt = require('jsonwebtoken');


exports.loginUser = async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Errore formato dato',
            error: errors.array()
        });
    }

    const user = req.body.username;
    const password = req.body.password;

    let rows;
    const env = process.env.NODE_ENV;

    try {
        [rows] = await db.execute('select * from aauth_users where username = ? and pass = ?', [user, password]);
    } catch (error) {
        return res.status(422).json({
            messageError: 'error login!',
            errore: error
        });
    }
    if (!rows.length) {
        return res.status(401).json({
            status: false,
            message: 'Utenza non autorizzata '
        });
    }
    const token = jwt.sign({
            id: rows[0].id,
            username: rows[0].username,
            email: rows[0].email
        },
        process.env.JWT_KEY, { expiresIn: '1h' }
    );

    return res.status(200).json({
        status: true,
        message: 'Success',
        token,
        env
    });



};





// exports.visibilita = async(req, res) => {

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(422).json({
//             message: 'Errore formato dato',
//             customcode: '4222',
//             error: errors.array()
//         });
//     }

//     const user = req.body.user;
//     let rows;

//     try {
//         [rows] = await db.execute('select * from visibilita_ambito_user where USER = ?', [user]);
//     } catch (error) {
//         return res.status(422).json({
//             messageError: 'error login!',
//             errore: error
//         });
//     }

//     if (!rows.length) {
//         return res.status(401).json({
//             status: false,
//             message: 'Utenza non trovata! '
//         });
//     }


//     return res.status(200).json({
//         status: true,
//         message: 'Success!',
//         userLog: rows
//     });

// };

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