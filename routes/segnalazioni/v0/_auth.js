const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

//controller
const authController = require('../../../controllers/segnalazioni/auth');


router.post('/login', [
    body('user')
    .isLength({ min: 8 }).withMessage('Inserire almeno 8 caratteri')
    .exists().withMessage('la user è obligatoria'),
    body('password').trim()
    .isLength({ min: 8 }).withMessage('Inserire almeno 8 caratteri')
    .exists().withMessage('la password è obligatoria')
], authController.loginUser);



/* router.post('/register',
    [
        body('email')
            .isEmail().withMessage('Formato mail non corretto')
            .exists()
            .custom(async (value,{req}) => {
                try {
                    [rows] = await db.execute('select email from user where email = ?',[value]);   
                } catch (error) {
                    return res.status(422).json({ messageError: 'error' });
                }
                if (rows.length){
                    return Promise.reject('Email esistente!');     
                }
            }),
        body('password').trim()
            .isLength({min: 8}).withMessage('Inserire almeno 8 caratteri')
      //query('max').custom((value,{req})=> value >= 100)  
    ]
,authController.registerUser); */







module.exports = router;