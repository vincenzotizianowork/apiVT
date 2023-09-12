const db = require('../../../utils/db_dwh_test');
const { validationResult } = require('express-validator');


exports.getPriorita = async(req, res) => {

    let priorita;

    try {
        [priorita] = await db.execute('SELECT PRIPRA_ID, PRIPRA_DESCRIZIONE FROM pripra_priorita_istruttoria');
    } catch (error) {
        return res.status(422).json({
            status: false,
            customcode: '4220',
            messageError: error
        });
    }

    if (priorita.length) {
        return res.status(200).json({
            status: true,
            customcode: '2000',
            message: 'Success Dato recuperato correttamente',
            priorita
        });
    }

    return res.status(403).json({
        status: false,
        customcode: '4003',
        message: 'Non è stato possibilie recuperare il dato controllare parametri passati'
    });


}


exports.getStati = async(req, res) => {

    let stati;

    try {
        [stati] = await db.execute('select TIPSLO_CODICE,TIPSLO_DESCRIZIONE  from tipslo_stato_attivita where TIPSLO_FLAG_CHIUSURA is not null');

    } catch (error) {
        return res.status(422).json({
            status: false,
            customcode: '4220',
            messageError: error
        });
    }

    if (stati.length) {
        return res.status(200).json({
            status: true,
            customcode: '2000',
            message: 'Success Dato recuperato correttamente',
            stati
        });
    }

    return res.status(403).json({
        status: false,
        customcode: '4003',
        message: 'Non è stato possibilie recuperare il dato contattare Ater'
    });


}



exports.getTipologia = async(req, res) => {

    let tipologie;
    let cod_attivita;
    const codiceEnte = req.jwt.codice_ente;

    try {
        [cod_attivita] = await db.execute('select socapp_tipalo_codice from socapp_societa_appalti where socapp_societa_codice = ?', [codiceEnte]);
        [tipologie] = await db.execute("SELECT TIPISTR_TIPPRA_CODICE, TIPPRA_DESCRIZIONE FROM tipistr_relazione_istruttoria INNER JOIN tippra_tipologia_pratica ON TIPPRA_CODICE=TIPISTR_TIPPRA_CODICE WHERE tipistr_tipalo_codice= '" + cod_attivita[0]['socapp_tipalo_codice'] + "'AND tipistr_data_fine is null");
    } catch (error) {
        return res.status(422).json({
            status: false,
            customcode: '4220',
            messageError: error
        });
    }
    if (tipologie.length) {
        return res.status(200).json({
            status: true,
            customcode: '2000',
            message: 'Success Dato recuperato correttamente',
            tot: tipologie.length,
            tipologie

        });
    }

    return res.status(403).json({
        status: false,
        customcode: '4003',
        message: 'Non è stato possibilie recuperare il dato controllare parametri passati'
    });


}







exports.createSegnalazione = async(req, res) => {

    const codiceEnte = req.jwt.codice_ente;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Errore formato dato',
            customcode: '4222',
            error: errors.array()
        });
    }

    const id_esterno = req.body.id_esterno;
    const PRAUFF_PRIPRA_ID = req.body.PRAUFF_PRIPRA_ID;
    const PRAUFF_DATA_CREAZIONE = req.dataTime;
    let PRAUFF_CONLOC_ID = req.body.PRAUFF_CONLOC_ID;
    const PRAUFF_UNIIMM_CODICE = req.body.PRAUFF_UNIIMM_CODICE;
    const PRAUFF_NOTE = req.body.PRAUFF_NOTE;
    const AREA_COMUNE = req.body.AREA_COMUNE;
    const SOCIETA_CODICE = codiceEnte;
    const PRADET_TIPPRA_CODICE = req.body.PRADET_TIPPRA_CODICE;

    let prauff;
    let pradet;
    let stopra;
    let checkId;
    let datiSocieta;
    let relazioneSocieta;
    let checkIdEsterno;

    let checkPatrimonio;

// controllo congruenza patrimonio
[checkPatrimonio] = await db.execute(`select 1 from tb_patrimonio where matricola_su_contratto='${PRAUFF_UNIIMM_CODICE}' and codice_utente=${PRAUFF_CONLOC_ID}`);

if (!checkPatrimonio.length && PRAUFF_UNIIMM_CODICE!='1' && PRAUFF_CONLOC_ID!=0 &&  PRAUFF_CONLOC_ID!=10 && PRAUFF_CONLOC_ID!=1 ) {
    // && (PRAUFF_UNIIMM_CODICE!=='1' && (PRAUFF_CONLOC_ID!=0 ||  PRAUFF_CONLOC_ID!=10 || PRAUFF_CONLOC_ID!=1))
    return res.status(401).json({
        status: false,
        message: 'Nessun dato presente nella tabella Asset',
        customcode: '4001'
    });
}
    try {
        [checkId] = await db.execute('select pradet_pratiche_dettaglio.id_esterno as idesterno, prauff_pratiche_ufficio.PRAUFF_TIPPRO_CODICE as TIPPRO_CODICE,prauff_pratiche_ufficio.PRAUFF_ID ' +
            'from pradet_pratiche_dettaglio ,prauff_pratiche_ufficio ' +
            'where  prauff_pratiche_ufficio.PRAUFF_ID = pradet_pratiche_dettaglio.PRADET_PRAUFF_ID ' +
            'and prauff_pratiche_ufficio.PRAUFF_TIPPRO_CODICE = ? ' +
            'and pradet_pratiche_dettaglio.id_esterno = ? ', [SOCIETA_CODICE, id_esterno]
        );
    } catch (error) {
        return res.status(422).json({
            status: false,
            messageError: error,
            customcode: '4222'
        });
    }
  
    if (checkId.length) {
        return res.status(409).json({
            status: false,
            message: 'Segnalazione gia presente',
            customcode: '4009',
            id_esterno: id_esterno
        });
    }

    try {

        [datiSocieta] = await db.execute('select socapp_id, socapp_societa_codice, socapp_societa_descrizione, socapp_codice_principale, socapp_tipalo_codice from socapp_societa_appalti where socapp_societa_codice = ?', [SOCIETA_CODICE]);

      
        if (PRAUFF_CONLOC_ID == 0) {
            PRAUFF_CONLOC_ID = 10;
        }
   

        [prauff] = await db.execute('insert into prauff_pratiche_ufficio' +
            '(PRAUFF_PRIPRA_ID,' +
            'PRAUFF_DETISTR_ID,' +
            'PRAUFF_TIPALO_CODICE,' +
            'PRAUFF_TIPSLO_CODICE,' +
            'PRAUFF_TIPPRO_CODICE,' +
            'PRAUFF_UTENT_ID_CREAZIONE,' +
            'PRAUFF_DATA_CREAZIONE,' +
            'PRAUFF_UFFICIO_CODICE_CREAZIONE,' +
            'PRAUFF_DATA_INIZIO,' +
            'PRAUFF_CONLOC_ID,' +
            'PRAUFF_UNIIMM_CODICE,' +
            'PRAUFF_STATO_PRATICA,' +
            'PRAUFF_FLAG_AREA_COMUNE,' +
            'PRAUFF_NOTE)' +
            'values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)', [
                PRAUFF_PRIPRA_ID,
                '2',
                datiSocieta[0]['socapp_tipalo_codice'],
                'OPEN',
                datiSocieta[0]['socapp_societa_codice'],
                '466',
                PRAUFF_DATA_CREAZIONE,
                datiSocieta[0]['socapp_codice_principale'],
                PRAUFF_DATA_CREAZIONE,
                PRAUFF_CONLOC_ID,
                PRAUFF_UNIIMM_CODICE,
                '1',
                AREA_COMUNE,
                PRAUFF_NOTE
            ]
        );

        [pradet] = await db.execute('insert into pradet_pratiche_dettaglio' +
            '(id_esterno,' +
            'PRADET_PRAUFF_ID,' +
            'PRADET_UTENT_ID_ASSEGNA,' +
            'PRADET_UTENT_ID_ASSEGNATARIO,' +
            'PRADET_DATA_ASSEGNAZIONE,' +
            'PRADET_UFFICIO_CODICE_ASSEGNATARIO,' +
            'PRADET_DATA_INIZIO,' +
            'PRADET_TIPPRA_CODICE,' +
            'PRADET_STATO_PRATICA,' +
            'PRADET_TIPSLO_CODICE)' +
            'values (?,?,?,?,?,?,?,?,?,?)', [
                id_esterno,
                prauff.insertId,
                466, // fisso
                0, // fisso
                PRAUFF_DATA_CREAZIONE,
                datiSocieta[0]['socapp_codice_principale'],
                PRAUFF_DATA_CREAZIONE,
                PRADET_TIPPRA_CODICE,
                '1', // fisso
                'OPEN' // fisso
            ]
        );


        [stopra] = await db.execute('insert into stopra_storia_pratica' +
            '(STOPRA_PRAUFF_ID,' +
            'STOPRA_PRADET_ID,' +
            'STOPRA_UTENT_ID_CREAZIONE,' +
            'STOPRA_UTENT_ID_ASSEGNATARIO,' +
            'STOPRA_CODICE_ASSEGNATARIO,' +
            'STOPRA_TIPALO_CODICE,' +
            'STOPRA_TIPPRA_CODICE,' +
            'STOPRA_TIPPRO_CODICE,' +
            'STOPRA_TIPSLO_CODICE,' +
            'STOPRA_DATA_INIZIO)' +
            'values (?,?,?,?,?,?,?,?,?,?)', [
                prauff.insertId,
                pradet.insertId,
                '466',
                0,
                datiSocieta[0]['socapp_codice_principale'],
                datiSocieta[0]['socapp_tipalo_codice'],
                PRADET_TIPPRA_CODICE,
                datiSocieta[0]['socapp_societa_codice'],
                'OPEN', // fisso
                PRAUFF_DATA_CREAZIONE
            ]
        );


        [relazioneSocieta] = await db.execute('insert into relsoc_relazione_societa_pradet' +
            '(relsoc_socapp_id,' +
            'relsoc_pradet_id,' +
            'relsoc_data_inserimento,' +
            'relsoc_socapp_id_esterno)' +
            'values (?,?,?,?)', [
                datiSocieta[0]['socapp_id'],
                pradet.insertId,
                PRAUFF_DATA_CREAZIONE,
                id_esterno
            ]

        );

        [checkIdEsterno] = await db.execute('select id_esterno from pradet_pratiche_dettaglio WHERE id_esterno = ?', [id_esterno]);


    } catch (error) {
        return res.status(422).json({
            status: false,
            messageError: error,
            customcode: '4222'
        });
    }

    if (prauff) {
        return res.status(201).json({
            status: true,
            message: 'created item',
            customcode: '2001',
            idPradett: pradet.insertId,
            idEsterno: checkIdEsterno[0].id_esterno,
            idPrauff: prauff.insertId
        });
    }

    return res.status(422).json({
        status: false,
        message: 'problema sulla query',
        customcode: '4222'
    });


};

exports.detailSegnalazione = async(req, res) => {

    const ID_DWH = req.body.ID_DWH;

    let detail;

    try {

        [detail] = await db.execute('select * from pradet_pratiche_dettaglio WHERE PRADET_ID = ?', [ID_DWH]);

    } catch (error) {
        return res.status(422).json({
            status: false,
            messageError: error,
            customcode: '4222'
        });
    }
    if (detail) {

        let dati = {
            "ID_DWH": detail[0]['PRADET_ID'],
            "PRADET_TIPSLO_CODICE": detail[0]['PRADET_TIPSLO_CODICE'],
            "PRADET_NOTE": detail[0]['PRADET_NOTE'],
            "PRADET_TIPPRA_CODICE": detail[0]['PRADET_TIPPRA_CODICE']
        }

        return res.status(200).json({
            status: true,
            message: 'Dati recuperati',
            customcode: '2000',
            idDwh: detail[0]['PRADET_ID'],
            stato: detail[0]['PRADET_TIPSLO_CODICE'],
            dettaglio: dati

        });
    }
    return res.status(401).json({
        status: false,
        message: 'Non è stato possibilie recuperare il dato ',
        customcode: '4001'
    });
}





exports.updateSegnalazioneStato = async(req, res) => {

    const codiceEnte = req.jwt.codice_ente;
    const SOCIETA_CODICE = codiceEnte;



    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Errore formato dato',
            customcode: '4222',
            error: errors.array()
        });
    }

    const ID_DWH = req.body.ID_DWH;
    const PRADET_TIPSLO_CODICE = req.body.PRADET_TIPSLO_CODICE;
    const PRADET_NOTE = req.body.PRADET_NOTE;

    let checkStato;
    let datiSocieta;
    let pradetData;
    //let dataInizio;
    let dataFine;
    let PradetNote;
    let notLav;
    let UPDATE_PRADET;

    let dataTime = req.dataTime;

    if (ID_DWH || ID_DWH !== "0") {
        try {
            [datiSocieta] = await db.execute('select socapp_id, socapp_societa_codice, socapp_societa_descrizione, socapp_codice_principale, socapp_tipalo_codice from socapp_societa_appalti where socapp_societa_codice = ?', [SOCIETA_CODICE]);

            let sqlPradetData = "select PRADET_ID, PRADET_TIPSLO_CODICE, PRADET_TIPPRA_CODICE, PRADET_PRAUFF_ID, PRADET_NOTE from pradet_pratiche_dettaglio WHERE PRADET_ID = ?";
            [pradetData] = await db.execute(sqlPradetData, [ID_DWH]);

            if (pradetData.length) {
                [checkStato] = await db.execute('select TIPSLO_FLAG_CHIUSURA, TIPSLO_CODICE from tipslo_stato_attivita WHERE TIPSLO_CODICE = ? AND TIPSLO_FLAG_CHIUSURA IS NOT NULL', [PRADET_TIPSLO_CODICE]);

                if (!checkStato.length) {
                    return res.status(400).json({
                        status: 'false',
                        message: 'Codice stato inesistente!',
                        customcode: '4000',
                        debug: checkStato
                    })
                }

                if (checkStato[0]['TIPSLO_FLAG_CHIUSURA'][0] === 1) {
                    //dataInizio = null;
                    dataChiusura = dataTime;
                } else {
                    dataChiusura = null;
                    // dataInizio = dataTime;
                }


                // concateno note YB tolto per mettere la nota lavorazione
              /*if (!pradetData[0]['PRADET_NOTE']) {
                    PradetNote = "Aggiornamento stato @(" + dataTime + ") - " + PRADET_NOTE;
                } else {
                    PradetNote = pradetData[0]['PRADET_NOTE'] + " Aggiornamento stato @(" + dataTime + ") - " + PRADET_NOTE;
                }*/
                
                PradetNote = "Aggiornamento stato @(" + dataTime + ") - " + PRADET_NOTE;
                if(PRADET_NOTE!==""){
                    [notLav] = await db.execute('insert into notlav_note_lavorazione' +
                            '(NOTLAV_PRAUFF_ID,' +
                            'NOTLAV_PRADET_ID,' +
                            'NOTLAV_DATA_CREAZIONE,' +
                            'NOTLAV_UTENT_ID,' +
                            'NOTLAV_ATTIVO,' +
                            'NOTLAV_NOTE)' +
                            'values (?,?,?,?,?,?)', [
                                pradetData[0]['PRADET_PRAUFF_ID'],
                                ID_DWH,
                                dataTime,
                                '466',
                                '1',
                                PradetNote
                            ]
                        );
                    }
                // aggiorno lo stato a PRADETT
                let sqlUpdatePradet = "UPDATE pradet_pratiche_dettaglio" +
                    " SET PRADET_TIPSLO_CODICE = ?," +
                    " PRADET_DATA_FINE = ?" +
                    " WHERE PRADET_ID = ?";

                [UPDATE_PRADET] = await db.execute(sqlUpdatePradet, [ PRADET_TIPSLO_CODICE, dataChiusura, ID_DWH]);


                // aggiorno lo storico precedente
                let sqlUpdateStorico = "UPDATE stopra_storia_pratica SET STOPRA_DATA_FINE = ? WHERE STOPRA_PRADET_ID = ? AND STOPRA_DATA_FINE IS NULL";
                [UPDATE_STORICO] = await db.execute(sqlUpdateStorico, [dataTime, ID_DWH]);


                // recupero le dati di PRADET
                [pradetData] = await db.execute(sqlPradetData, [ID_DWH]);

                [stopra] = await db.execute('insert into stopra_storia_pratica' +
                    '(STOPRA_PRAUFF_ID,' +
                    'STOPRA_PRADET_ID,' +
                    'STOPRA_UTENT_ID_CREAZIONE,' +
                    'STOPRA_UTENT_ID_ASSEGNATARIO,' +
                    'STOPRA_CODICE_ASSEGNATARIO,' +
                    'STOPRA_TIPALO_CODICE,' +
                    'STOPRA_TIPPRA_CODICE,' +
                    'STOPRA_TIPPRO_CODICE,' +
                    'STOPRA_TIPSLO_CODICE,' +
                    'STOPRA_DATA_INIZIO)' +
                    'values (?,?,?,?,?,?,?,?,?,?)', [
                        pradetData[0]['PRADET_PRAUFF_ID'],
                        pradetData[0]['PRADET_ID'],
                        '466',
                        0,
                        datiSocieta[0]['socapp_codice_principale'],
                        datiSocieta[0]['socapp_tipalo_codice'],
                        pradetData[0]['PRADET_TIPPRA_CODICE'],
                        datiSocieta[0]['socapp_societa_codice'],
                        PRADET_TIPSLO_CODICE,
                        dataTime
                    ]
                );


            } else {
                return res.status(401).json({
                    status: 'false',
                    message: 'Non è stato possibilie aggiornare il dato. id-dwh inesistente!',
                    customcode: '4001',
                });
            }

        } catch (error) {
            return res.status(422).json({
                messageError: error
            });
        }

    } // ok id-esterno controllato...  


    if (UPDATE_PRADET.affectedRows) {
        return res.status(200).json({
            status: 'true',
            message: 'Dato aggiornato correttamente',
            customcode: '2000',
            updated: pradetData[0]['PRADET_TIPSLO_CODICE'],
            idDwh: pradetData[0]['PRADET_ID'],
            note: PradetNote//pradetData[0]['PRADET_NOTE']
        })
    }

    return res.status(401).json({
        status: 'false',
        message: 'Non è stato possibilie aggiornare il dato. possibile ID_DWH errato',
        customcode: '4001',
    });
}



exports.updateSegnalazione = async(req, res) => {
    const codiceEnte = req.jwt.codice_ente;
    const SOCIETA_CODICE = codiceEnte;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Errore formato dato',
            customcode: '4222',
            error: errors.array()
        });
    }

    let dataTime = req.dataTime;

    const ID_DWH = req.body.ID_DWH;
    const PRAUFF_PRIPRA_ID = req.body.PRAUFF_PRIPRA_ID;
    const PRAUFF_DATA_AGGIORNAMENTO = dataTime;
    const PRADET_NOTE = req.body.PRADET_NOTE;
    const AREA_COMUNE = req.body.AREA_COMUNE;
    const ATTIVA = req.body.ATTIVA;
    const PRADET_TIPPRA_CODICE = req.body.PRADET_TIPPRA_CODICE; // attualmente non c'è controllo se il codice fa parte della nostra tabella (DA IMPLEMENTARE)

    let PRADET;
    let UPDATE_PRAUFF;
    let UPDATE_PRADETT;
    let PRAUFFID;
    let PRADETNOTE;
    let datiSocieta;
    let notLav;

    if (ID_DWH || ID_DWH !== "0") {
        try {
            [datiSocieta] = await db.execute('select socapp_id, socapp_societa_codice, socapp_societa_descrizione, socapp_codice_principale, socapp_tipalo_codice from socapp_societa_appalti where socapp_societa_codice = ?', [SOCIETA_CODICE]);

            // recupero PRADET
            let selectPraUffId = "select PRADET_ID, PRADET_TIPPRA_CODICE, PRADET_PRAUFF_ID,PRADET_NOTE, PRADET_TIPSLO_CODICE,PRADET_PRAUFF_ID  from pradet_pratiche_dettaglio WHERE PRADET_ID = ?";
            [PRADET] = await db.execute(selectPraUffId, [ID_DWH]);
            if (PRADET.length) {

                PRAUFFID = PRADET[0].PRADET_PRAUFF_ID;
                PRADETNOTE = PRADET[0].PRADET_NOTE;
                TIPSLO_CODICE = PRADET[0].PRADET_TIPSLO_CODICE;

                // concateno note PRADETT
                //PRADETNOTE = PRADETNOTE + " Aggiornamento @(" + dataTime + ") - " + PRADET_NOTE;
                PRADETNOTE = "Aggiornamento @(" + dataTime + ") - " + PRADET_NOTE;

                if(PRADET_NOTE!=""){
                    [notLav] = await db.execute('insert into notlav_note_lavorazione' +
                    '(NOTLAV_PRAUFF_ID,' +
                    'NOTLAV_PRADET_ID,' +
                    'NOTLAV_DATA_CREAZIONE,' +
                    'NOTLAV_UTENT_ID,' +
                    'NOTLAV_ATTIVO,' +
                    'NOTLAV_NOTE)' +
                    'values (?,?,?,?,?,?)', [
                        PRADET[0]['PRADET_PRAUFF_ID'],
                        ID_DWH,
                        dataTime,
                        '466',
                        '1',
                        PRADETNOTE
                    ]
                    );
                }

                // Aggiorno PRADETT
                let sqlPradett = "UPDATE pradet_pratiche_dettaglio set PRADET_TIPPRA_CODICE =?, PRADET_STATO_PRATICA =? WHERE PRADET_ID = ?";
                [UPDATE_PRADETT] = await db.execute(sqlPradett, [PRADET_TIPPRA_CODICE, ATTIVA, ID_DWH]);

                //Recupero PRADET aggiornato
                [PRADET] = await db.execute(selectPraUffId, [ID_DWH]);

                // Aggiorno PRAUFF
                let sqlPrauff = "UPDATE prauff_pratiche_ufficio" +
                    " set PRAUFF_PRIPRA_ID =? ," +
                    " PRAUFF_DATA_AGGIORNAMENTO =?," +
                    " PRAUFF_FLAG_AREA_COMUNE =?" +
                    " WHERE PRAUFF_ID = ?";
                [UPDATE_PRAUFF] = await db.execute(sqlPrauff, [PRAUFF_PRIPRA_ID, PRAUFF_DATA_AGGIORNAMENTO, AREA_COMUNE, PRAUFFID]);

            } else {
                return res.status(401).json({
                    status: 'false',
                    message: 'Non è stato possibilie aggiornare il dato. id-dwh inesistente!',
                    customcode: '4001',
                });
            }


            // aggiorno lo storico precedente
            let sqlUpdateStorico = "UPDATE stopra_storia_pratica SET STOPRA_DATA_FINE = ? WHERE STOPRA_PRADET_ID = ? AND STOPRA_DATA_FINE IS NULL";
            [UPDATE_STORICO] = await db.execute(sqlUpdateStorico, [dataTime, ID_DWH]);

            [stopra] = await db.execute('insert into stopra_storia_pratica' +
                '(STOPRA_PRAUFF_ID,' +
                'STOPRA_PRADET_ID,' +
                'STOPRA_UTENT_ID_CREAZIONE,' +
                'STOPRA_UTENT_ID_ASSEGNATARIO,' +
                'STOPRA_CODICE_ASSEGNATARIO,' +
                'STOPRA_TIPALO_CODICE,' +
                'STOPRA_TIPPRA_CODICE,' +
                'STOPRA_TIPPRO_CODICE,' +
                'STOPRA_TIPSLO_CODICE,' +
                'STOPRA_DATA_INIZIO)' +
                'values (?,?,?,?,?,?,?,?,?,?)', [
                    PRADET[0]['PRADET_PRAUFF_ID'],
                    PRADET[0]['PRADET_ID'],
                    '466',
                    0,
                    datiSocieta[0]['socapp_codice_principale'],
                    datiSocieta[0]['socapp_tipalo_codice'],
                    PRADET[0]['PRADET_TIPPRA_CODICE'],
                    datiSocieta[0]['socapp_societa_codice'],
                    TIPSLO_CODICE,
                    dataTime
                ]
            );


        } catch (error) {
            return res.status(422).json({
                messageError: error
            });
        }

    }

    if (UPDATE_PRADETT.affectedRows && UPDATE_PRAUFF.affectedRows) {
        return res.status(200).json({
            status: 'true',
            message: 'Dato aggiornato correttamente',
            customcode: '2000',
            note: PRADET[0]['PRADET_NOTE']
        })
    }

    return res.status(401).json({
        status: 'false',
        message: 'Non è stato possibilie aggiornare il dato. Possibile parametri non corretti!',
        customcode: '4001',
    });
}




exports.getSegnalazioni = async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Errore formato dato',
            error: errors.array()
        });
    }



    const codiceEnte = req.jwt.codice_ente;

    const FIELD = req.body.FIELD;
    const VALUE = req.body.VALUE;
    let start = req.body.START;


    let max = 100;

    let setPagination;
    let cod_attivita;
    let count;
    let totFilter;
    let filter;




    if (FIELD && VALUE) {
        switch (FIELD) {
            case "PRADET_ID":
            case "PRAUFF_ID":
            case "PRAUFF_CONLOC_ID":
            case "ID_MATRICOLA":
                filter = `AND ${FIELD} = "${VALUE}"`;
                break;
            case "LOCATARIO":
            case "INDIRIZZO":
            case "TIPALO_DESCRIZIONE":
                filter = `AND ${FIELD} LIKE '%${VALUE}%'`;
                break;
        }
    } else {
        filter = " ";
    }


    try {
        [cod_attivita] = await db.execute('select socapp_tipalo_codice from socapp_societa_appalti where socapp_societa_codice = ?', [codiceEnte]);

        let tipalo_codice = [...cod_attivita][0].socapp_tipalo_codice;

/*
         let sqlCount = "select COUNT(*) AS tot from dwh_vi_elenco_segnalazioni" +
            " WHERE EXISTS (SELECT 1 FROM tipistr_relazione_istruttoria WHERE tipistr_tipalo_codice = '" + tipalo_codice +
            "' AND tipistr_tippra_codice=pradet_tippra_codice" +
            " AND TIPISTR_DATA_FINE IS NULL " + filter + ")";


        let sqlFilter = "select * from dwh_vi_elenco_segnalazioni" +
            " WHERE EXISTS (SELECT 1 FROM tipistr_relazione_istruttoria WHERE tipistr_tipalo_codice = '" + tipalo_codice +
            "' AND tipistr_tippra_codice=pradet_tippra_codice" +
            " AND TIPISTR_DATA_FINE IS NULL " + filter + ")"; 
*/


        let sqlCount = "select COUNT(*) AS tot from dwh_vi_elenco_segnalazioni" +
        " WHERE (EXISTS" +
            "(SELECT 1 FROM tipistr_relazione_istruttoria WHERE tipistr_tipalo_codice ='" + tipalo_codice + 
            "' AND tipistr_tippra_codice=pradet_tippra_codice AND TIPISTR_DATA_FINE IS NULL " + filter + ")" +
        " OR EXISTS" +
            "(SELECT 1 FROM istruf_relazione_ufficio_istruttoria WHERE istruff_tipalo_codice=dwh_vi_elenco_segnalazioni.prauff_tipalo_codice" +  
                " AND istruf_relazione_ufficio_istruttoria.istruff_nomuff_tipo_ufficio='" + tipalo_codice +
                "' AND istruff_data_fine IS NULL " + filter + ")" +
        ")";

        let sqlFilter = "select * from dwh_vi_elenco_segnalazioni" +
            " WHERE (EXISTS" +
                "(SELECT 1 FROM tipistr_relazione_istruttoria WHERE tipistr_tipalo_codice ='" + tipalo_codice + 
                "' AND tipistr_tippra_codice=pradet_tippra_codice AND TIPISTR_DATA_FINE IS NULL " + filter + ")" +
            " OR EXISTS" +
                "(SELECT 1 FROM istruf_relazione_ufficio_istruttoria WHERE istruff_tipalo_codice=dwh_vi_elenco_segnalazioni.prauff_tipalo_codice" +  
                    " AND istruf_relazione_ufficio_istruttoria.istruff_nomuff_tipo_ufficio='" + tipalo_codice +
                    "' AND istruff_data_fine IS NULL " + filter + ")" +
            ")";


        [totFilter] = await db.execute(sqlCount);

        [setPagination] = await db.execute(sqlFilter + ' limit ?, ?', [`${start}`, `${max}`]);

        count = setPagination.length;


    } catch (error) {
        return res.status(422).json({
            status: false,
            messageError: error,
            customcode: '4220'
        });
    }


    if (setPagination.length) {
        return res.status(200).json({
            status: true,
            customcode: '2000',
            message: 'Dati recuperati correttamente!',
            totFilter: totFilter[0].tot,
            totPagination: count,
            setPagination
        });
    }
    return res.status(401).json({
        status: false,
        customcode: '4001',
        message: 'Non è stato possibilie recuperare il dato'

    });
}


exports.reset = async(req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            message: 'Errore formato dato',
            customcode: '4222',
            error: errors.array()
        });
    }

    const codiceEnte = req.jwt.codice_ente;
    const SOCIETA_CODICE = codiceEnte;
    let dataTime = req.dataTime;

    const id_dwh = req.body.ID_DWH;


    let controlloTipoReset;
    let datiSocieta;
    let pradetData;
    let stopra;
    let UPDATE_PRADET;
    let PRADETNOTE;
    let NoteLav;
    let tipoReset;
    let notLav;

    if (id_dwh || id_dwh !== "0") {

        try {
            [controlloTipoReset] = await db.execute('SELECT prauff_utent_id_creazione FROM prauff_pratiche_ufficio  INNER JOIN pradet_pratiche_dettaglio ON pradet_prauff_id=prauff_id WHERE prauff_utent_id_creazione=466 AND pradet_id = ?', [id_dwh]);

            if(controlloTipoReset.length)
                {
                    tipoReset= controlloTipoReset[0].prauff_utent_id_creazione;
                }

            [datiSocieta] = await db.execute('select socapp_id, socapp_societa_codice, socapp_societa_descrizione, socapp_codice_principale, socapp_tipalo_codice from socapp_societa_appalti where socapp_societa_codice = ?', [SOCIETA_CODICE]);

            let sqlPradetData = "select PRADET_ID, PRADET_TIPSLO_CODICE, PRADET_TIPPRA_CODICE, PRADET_PRAUFF_ID, PRADET_NOTE from pradet_pratiche_dettaglio INNER JOIN relsoc_relazione_societa_pradet ON RELSOC_PRADET_ID=PRADET_ID WHERE PRADET_ID = ? AND id_esterno IS NOT null";
            
            [pradetData] = await db.execute(sqlPradetData, [id_dwh]);

            if (pradetData.length) {

                PRADETNOTE = pradetData[0].PRADET_NOTE;
                // concateno note PRADETT
                PRADETNOTE = PRADETNOTE + " Reset @(" + dataTime + ") da " + datiSocieta[0]['socapp_societa_descrizione'];
                NoteLav = "Reset da " + datiSocieta[0]['socapp_societa_descrizione'];
                let sqlUpdatePradet
                // aggiorno PRADET RESETTANDO 
                if (tipoReset!==466)
                {
                    sqlUpdatePradet = "UPDATE pradet_pratiche_dettaglio SET id_esterno = ? WHERE PRADET_ID = ? ";
                }
                else{
                    sqlUpdatePradet = "UPDATE pradet_pratiche_dettaglio SET PRADET_STATO_PRATICA=0, id_esterno = ? WHERE PRADET_ID = ? ";
                 }
              
                [UPDATE_PRADET] = await db.execute(sqlUpdatePradet, [null, id_dwh]);

                if (UPDATE_PRADET.affectedRows) {
                    // AGGIORNO DATA FINE STORICO PRECEDENTE
                    let sqlUpdateStorico = "UPDATE stopra_storia_pratica SET STOPRA_DATA_FINE = ? WHERE STOPRA_PRADET_ID = ? AND STOPRA_DATA_FINE IS NULL";
                    [UPDATE_STORICO] = await db.execute(sqlUpdateStorico, [dataTime, id_dwh]);

                    // AGGIUNGO NUOVO STORICO
                    [stopra] = await db.execute('insert into stopra_storia_pratica' +
                        '(STOPRA_PRAUFF_ID,' +
                        'STOPRA_PRADET_ID,' +
                        'STOPRA_UTENT_ID_CREAZIONE,' +
                        'STOPRA_UTENT_ID_ASSEGNATARIO,' +
                        'STOPRA_CODICE_ASSEGNATARIO,' +
                        'STOPRA_TIPALO_CODICE,' +
                        'STOPRA_TIPPRA_CODICE,' +
                        'STOPRA_TIPPRO_CODICE,' +
                        'STOPRA_DATA_INIZIO,' +
                        'STOPRA_TIPSLO_CODICE)' +
                        'values (?,?,?,?,?,?,?,?,?,?)', [
                            pradetData[0]['PRADET_PRAUFF_ID'],
                            pradetData[0]['PRADET_ID'],
                            '466',
                            '',
                            datiSocieta[0]['socapp_codice_principale'],
                            datiSocieta[0]['socapp_tipalo_codice'],
                            pradetData[0]['PRADET_TIPPRA_CODICE'],
                            datiSocieta[0]['socapp_societa_codice'],
                            dataTime,
                            pradetData[0]['PRADET_TIPSLO_CODICE']
                        ]
                    );
                    
                    [notLav] = await db.execute('insert into notlav_note_lavorazione' +
                    '(NOTLAV_PRAUFF_ID,' +
                    'NOTLAV_PRADET_ID,' +
                    'NOTLAV_DATA_CREAZIONE,' +
                    'NOTLAV_UTENT_ID,' +
                    'NOTLAV_ATTIVO,' +
                    'NOTLAV_NOTE)' +
                    'values (?,?,?,?,?,?)', [
                        pradetData[0]['PRADET_PRAUFF_ID'],
                        pradetData[0]['PRADET_ID'],
                        dataTime,
                        '466',
                        '1',
                        NoteLav
                    ]
                );
                }

            } else {
                return res.status(401).json({
                    status: 'false',
                    message: 'Non è stato possibilie aggiornare il dato. id-dwh inesistente O GIà RESETTATO!',
                    customcode: '4001'
                });
            }

            if (UPDATE_PRADET.affectedRows) {
                return res.status(200).json({
                    status: 'true',
                    message: 'Segnalazione resettata!',
                    customcode: '2000'
                })
            }

        } catch (error) {
            return res.status(401).json({
                status: 'false',
                message: 'Non è stato possibilie aggiornare il dato. Possibile errore query',
                error,
                customcode: '4001'

            });
        }
    }
} 