const express = require('express');
const router = express.Router();
const isAuth = require('../../../middlware/isAuth')
const { body } = require('express-validator');

//controller
const patrimonioController = require('../../../controllers/segnalazioni/patrimonio');


router.post('/getPatrimonio', isAuth, [
    body('start')
    .isInt().withMessage('Tipo dato  errato previsto Integer')
    .exists().withMessage('Dato obligatorio')
], patrimonioController.getPatrimonio);




module.exports = router;