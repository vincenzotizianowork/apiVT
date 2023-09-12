const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const authController = require('../../controllers/auth/v1/auth');



router.post('/login', [
    body('username')
    .isString().withMessage('Tipo dato errato previsto string'),
    body('password')
    .isString().withMessage('Tipo dato errato previsto string')
], authController.loginUser);



module.exports = router;