const express = require('express');
const router = express.Router();
const isAuth = require('../../../middlware/isAuth');
const Utility = require('../../../middlware/utility');
const isUpdate = require('../../../middlware/isUpdate');
const { body } = require('express-validator');

//controller
//const aperte_syncController = require('../../../controllers/v1/segnalazioni/segnalazioni_aperte_sync');
const aperte_syncController = require('../../../controllers/segnalazioni/v1/segnalazioni_aperte_sync');


router.post('/', [isAuth, Utility], [
        body('ID_DWH')
        .exists().withMessage('Dato obligatorio')
        .isInt().withMessage('Tipo dato  errato previsto Integer'),
        body('id_esterno')
        .exists().withMessage('Dato obligatorio')
        .isInt().withMessage('Tipo dato  errato previsto Integer')
    ],
    aperte_syncController.aperte_sync);



module.exports = router;