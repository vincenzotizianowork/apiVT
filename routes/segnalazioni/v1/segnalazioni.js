const express = require('express');
const router = express.Router();
const isAuth = require('../../../middlware/isAuth');
const Utility = require('../../../middlware/utility');
const isUpdate = require('../../../middlware/isUpdate');
const { body } = require('express-validator');

//controller
//const segnalazioniController = require('../../../controllers/v1/segnalazioni/segnalazioni');
const segnalazioniController = require('../../../controllers/segnalazioni/v1/segnalazioni');





router.post('/aperte_dwh', isAuth, [
    body('FIELD')
    .isString().withMessage('Tipo dato errato previsto string'),
    body('VALUE')
    .isString().withMessage('Tipo dato errato previsto string'),

    body('START')
    .isInt().withMessage('Tipo dato  errato previsto Integer')
    .exists().withMessage('Dato obligatorio')
], segnalazioniController.getSegnalazioni);




router.post('/insert', [isAuth, Utility], [
    body('id_esterno')
    .isInt().withMessage('Tipo dato  errato previsto Integer')
    .exists().withMessage('Dato obligatorio'),

    body('PRAUFF_PRIPRA_ID')
    .isInt().withMessage('Tipo dato  errato previsto Integer')
    .exists().withMessage('Dato obligatorio'),

    body('PRAUFF_CONLOC_ID')
    .isInt().withMessage('Tipo dato  errato previsto Integer')
    .exists().withMessage('Dato obligatorio'),

    body('PRAUFF_UNIIMM_CODICE')
    .isString().withMessage('Tipo dato errato previsto string')
    .exists().withMessage('Dato obligatorio'),

    body('PRAUFF_NOTE')
    .isString().withMessage('Tipo dato errato previsto string'),

    body('AREA_COMUNE')
    .isBoolean().withMessage('Tipo dato  errato previsto boolean'),

    body('PRADET_TIPPRA_CODICE')
    .isString().withMessage('Tipo dato errato previsto string')
    .exists().withMessage('Dato obligatorio')
], segnalazioniController.createSegnalazione);





router.post('/update', [isAuth, isUpdate, Utility], [
    body('ID_DWH')
    .exists().withMessage('Dato obligatorio')
    .isInt().withMessage('Tipo dato  errato previsto Integer'),

    body('PRAUFF_PRIPRA_ID')
    .isInt().withMessage('Tipo dato  errato previsto Integer')
    .exists().withMessage('Dato obligatorio'),

    body('PRADET_NOTE')
    .isString().withMessage('Tipo dato errato previsto string'),

    body('AREA_COMUNE')
    .isBoolean().withMessage('Tipo dato  errato previsto boolean'),

    body('ATTIVA')
    .isBoolean().withMessage('Tipo dato  errato previsto boolean'),

    body('PRADET_TIPPRA_CODICE')
    .isString().withMessage('Tipo dato errato previsto string')
    .exists().withMessage('Dato obligatorio')

], segnalazioniController.updateSegnalazione);


router.post('/updatestato', [isAuth, isUpdate, Utility], [
    body('ID_DWH')
    .exists().withMessage('Dato obligatorio')
    .isInt().withMessage('Tipo dato  errato previsto Integer'),

    body('PRADET_TIPSLO_CODICE')
    .isString().withMessage('Tipo dato errato previsto string')
    .exists().withMessage('Dato obligatorio'),

    body('PRADET_NOTE')
    .isString().withMessage('Tipo dato errato previsto string')

], segnalazioniController.updateSegnalazioneStato);




router.post('/detail', isAuth, [
        body('ID_DWH')
        .exists().withMessage('Dato obligatorio')
        .isInt().withMessage('Tipo dato  errato previsto Integer')
    ],
    segnalazioniController.detailSegnalazione);

 router.post('/reset', [isAuth, isUpdate, Utility], [
    body('ID_DWH')
    .isInt().withMessage('Tipo dato  errato previsto Integer')
    .exists().withMessage('Dato obligatorio')
], segnalazioniController.reset); 

router.get('/stati', isAuth, segnalazioniController.getStati);
router.get('/tipologia', isAuth, segnalazioniController.getTipologia);
router.get('/priorita', isAuth, segnalazioniController.getPriorita);



module.exports = router;