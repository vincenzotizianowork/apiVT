const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const isAuth = require('../../../middlware/isAuth')
const Utility = require('../../../middlware/utility')

//controller
const resetController = require('../../../controllers/segnalazioni/utility/reset');

router.post('/reset', [isAuth, Utility], [
    body('id_dwh')
    .isInt().withMessage('Tipo dato  errato previsto Integer')
    .exists().withMessage('Dato obligatorio')
], resetController.reset);


module.exports = router;