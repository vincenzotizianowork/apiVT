const db = require('../utils/db_dwh_test');

module.exports = async(req, res, next) => {

    const codiceEnte = req.jwt.codice_ente;
    const FILTER_ID_DWH = req.body.ID_DWH;

    let idSocieta;
    let checkUpdate;

    // Recupero id della societa tramite codiceEnte...
    [idSocieta] = await db.execute("SELECT socapp_id FROM socapp_societa_appalti WHERE socapp_societa_codice = ?", [codiceEnte]);

    try {
        // Controllo se id_dwh è di competenza controllando se idSocieta è di competenza...e se esiste ancora o è stato resettato sulla pradet
        [checkUpdate] = await db.execute("SELECT  relsoc_pradet_id, relsoc_socapp_id " +
            "FROM relsoc_relazione_societa_pradet INNER JOIN PRADET_PRATICHE_DETTAGLIO ON PRADET_ID=relsoc_pradet_id AND relsoc_socapp_id_esterno=id_esterno " +
            "WHERE relsoc_pradet_id = ? AND relsoc_socapp_id = ?", [FILTER_ID_DWH, idSocieta[0]['socapp_id']]);

        if (!checkUpdate.length) {
            return res.status(401).json({
                status: false,
                message: 'ID_DWH non di competenza!',
                customcode: '4001'
            });
        }

    } catch (error) {
        return res.status(422).json({
            status: false,
            messageError: error
        });

    }


    next();


};