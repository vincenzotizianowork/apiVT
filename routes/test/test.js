const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const testController = require('../../controllers/test/test');





router.post('/testSaluto', [
    body('user')
    .isString().withMessage('Tipo dato errato previsto string'),
    body('passw')
    .isString().withMessage('Tipo dato errato previsto string')
], testController.testSaluto);



module.exports = router;