//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire, listObs, listStruct, comboAjoutObs, comboAjoutStruct,
    comboEspeces, comboEspecesUsuelles, modeRequete = '', nbImport = 0,
    nbDuplicata = 0, modeDuplication = false, toucheENTREE = true, comboPheno,
    comboStatutValidation, numerisat, numerisateur, profil, comboPrecision, comboDetermination,
    comboTypeEffectif, focusEffectifActif = true, comboLieuDit, idSociete, nomSociete,
    largeurFenetreFormulaire = 990, largeurColonneFormulaire = 0;

Ext.onReady(function() {
    new Ext.KeyMap(document, {
        key: '\q',
        ctrl: true,
        fn: dupliquer
    });
    //Combo d'auto-complétion "Lieux-dits"
    comboLieuDit = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jLieuxDits.php?appli=' + GetParam('appli'),
            fields: ['id', 'val']
        }),
        id: 'lieu_dit',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'id',
        fieldLabel: 'Lieu-dit'
    });
    //Combo d'auto-complétion "espèces"
    comboEspeces = new Ext.form.ComboBox({
        vtype: 'verifieEspeceSaisie',
        id: 'nom_complet',
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jEspeces.php?appli=' + GetParam('appli'),
            fields: ['espece']
        }),
        allowBlank: false,
        blankText: "Veuillez sélectionner l'espèce observée !",
        emptyText: 'Saisissez 3 caractères',
        mode: 'local',
        displayField: 'espece',
        valueField: 'espece',
        fieldLabel: 'Espèce (latin)',
        listeners: {
            keyup: function(field, event) {
                if (this.getRawValue().length >= 3) { // si au moins 3 lettres tapées
                    if ([13, 38, 40].indexOf(event.getKey()) == -1) { // si pas les flèches "Haut", "Bas" ni la touche "Enter"
                        Ext.Ajax.abort(); //Annule les requêtes précédentes
                        var tabMots = this.getRawValue().split(' ', 2);
                        if ((typeof(tabMots[1]) == 'undefined')) {  // si l'utilisateur lance la recherche sur un seul mot (le genre en général)keyup: function() {
                            modeRequete = 'genre';
                            this.store.load({params: {
                                    critere: tabMots[0],
                                    mode: modeRequete,
                                    filtre: Ext.getCmp('regne').value
                                }
                            });
                        }
                        else {
                            modeRequete = 'espece';
                            this.store.load({params: {
                                    critere: this.getRawValue(),
                                    mode: modeRequete,
                                    choixEspeceForcee: CST_choixEspeceForcee, // filtre "genre" avec/sans "espèce" obligatoire
                                    filtre: Ext.getCmp('regne').value
                                }
                            });
                        }
                        comboEspecesUsuelles.store.removeAll();
                        comboEspecesUsuelles.reset();
                    }
                }
                else {
                    modeRequete = ''
                    this.store.removeAll();
                }
            }
        }
    });
    //Combo d'auto-complétion "espèces usuelles"
    comboEspecesUsuelles = new Ext.form.ComboBox({
        id: 'nom_vern',
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jEspecesUsuelles.php?appli=' + GetParam('appli'),
            fields: ['espece']
        }),
        emptyText: 'Saisissez 1 caractère',
        mode: 'local',
        displayField: 'espece',
        valueField: 'espece',
        fieldLabel: 'Espèce (usuel)',
        typeAhead: true,
        listeners: {
            keyup: function(field, event) {
                if (this.getRawValue().length >= 1) { // si au moins 1 lettre tapée
                    if ([13, 38, 40].indexOf(event.getKey()) == -1) { // si pas les flèches "Haut", "Bas" ni la touche "Enter"
                        Ext.Ajax.abort(); //Annule les requêtes précédentes
                        var tabMots = this.getRawValue().split(' ', 2);
                        if ((typeof(tabMots[1]) == 'undefined')) {  // si l'utilisateur lance la recherche sur un seul mot (le genre en général)
                            modeRequete = 'genre';
                            this.store.load({params: {
                                    critere: tabMots[0],
                                    mode: modeRequete,
                                    filtre: Ext.getCmp('regne').value
                                }
                            });
                        }
                        else {
                            modeRequete = 'espece'; // si l'utilisateur tape un espace pour la suite de la recherche du taxon après avoir saisi le genre
                            this.store.load({params: {
                                    critere: this.getRawValue(),
                                    mode: modeRequete,
                                    filtre: Ext.getCmp('regne').value
                                }
                            });
                        }
                    }
                }
                else {
                    modeRequete = ''
                    this.store.removeAll();
                }
            },
            select: function() {
                comboEspeces.store.load({
                    params: {
                        critere: this.value,
                        choixEspeceForcee: CST_choixEspeceForcee, // filtre "genre" avec/sans "espèce" obligatoire
                        filtre: Ext.getCmp('regne').value
                    },
                    callback: function() {
                        var nbEspeces = comboEspeces.store.getCount();
                        if (nbEspeces > 0) {
                            switch (nbEspeces) {
                                case 1:
                                    comboEspeces.setValue(comboEspeces.store.getAt(0).data['espece']);
                                    break;
                                case 2:
                                    var premiereEspece = comboEspeces.store.getAt(0).data['espece'];
                                    var derniereEspece = comboEspeces.store.getAt(1).data['espece'];
                                    if (premiereEspece.match('sp.' + '$') != 'sp.') {
                                        if (derniereEspece.match('sp.' + '$') == 'sp.') {
                                            comboEspeces.setValue(premiereEspece);
                                        }
                                        else {
                                            comboEspeces.emptyText = 'Plusieurs espèces trouvées';
                                            comboEspeces.reset();
                                        }
                                    }
                                    else {
                                        if (derniereEspece.match('sp.' + '$') != 'sp.') {
                                            comboEspeces.setValue(derniereEspece);
                                        }
                                        else {
                                            comboEspeces.emptyText = 'Plusieurs espèces trouvées';
                                            comboEspeces.reset();
                                        }
                                    }
                                    break;
                                default:
                                    comboEspeces.emptyText = 'Plusieurs espèces trouvées';
                                    comboEspeces.reset();
                                    break;
                            }
                        }
                        else {
                            comboEspeces.emptyText = 'Saisissez 3 caractères';
                            comboEspeces.reset();
                        }
                    }
                });
            }
        }
    });
    //Combo d'auto-complétion "étude"
    var comboEtude = new Ext.form.ComboBox({
        id: 'id_etude',
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListVal.php?appli=' + GetParam('appli') + '&table=MD.ETUDE&chId=id_etude&chVal=nom_etude',
            fields: ['id', 'val']
        }),
        emptyText: 'Sélectionnez',
        mode: 'local',
        displayField: 'val',
        valueField: 'id',
        fieldLabel: 'Etude',
        allowBlank: false,
        blankText: "Veuillez sélectionner l'étude !",
        forceSelection: true,
        hidden: ((typeof CST_activeSaisieEtudeProtocole === "undefined") ) ? false : !CST_activeSaisieEtudeProtocole
    });
    //Combo d'auto-complétion "protocole"
    var comboProtocole = new Ext.form.ComboBox({
        id: 'id_protocole',
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListVal.php?appli=' + GetParam('appli') + '&table=MD.PROTOCOLE&chId=id_protocole&chVal=libelle',
            fields: ['id', 'val']
        }),
        emptyText: 'Sélectionnez',
        mode: 'local',
        displayField: 'val',
        valueField: 'id',
        fieldLabel: 'Protocole',
        allowBlank: false,
        blankText: 'Veuillez sélectionner le protocole !',
        forceSelection: true,
        hidden:  ((typeof CST_activeSaisieEtudeProtocole === "undefined") ) ? false : !CST_activeSaisieEtudeProtocole 
    });
    //Combo d'auto-complétion "type d'effectif"
    comboTypeEffectif = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_type_effectif',
            fields: ['val']
        }),
        id: 'type_effectif',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: "Type d'effectif"
    });
    //Combo d'auto-complétion "phénologie"
    comboPheno = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_phenologie',
            fields: ['val']
        }),
        id: 'phenologie',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Phénologie'
    });
    //Combo d'auto-complétion "précision"
    comboPrecision = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_precision',
            fields: ['val']
        }),
        id: 'precision',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Précision'
    });
    //Combo d'auto-complétion "détermination"
    comboDetermination = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_determination',
            fields: ['val']
        }),
        id: 'determination',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Détermination',
        hidden: true
    });
    //Combo d'auto-complétion "statut de validation"
    comboStatutValidation = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_statut_validation',
            fields: ['val']
        }),
        id: 'statut_validation',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Statut validation',
        readOnly: true,
        listeners: {
            select: function() {
                // si pas en mode ajout
                if (Ext.getCmp('action').value != 'Ajouter') {
                    if (this == comboValidationEnMasse) { // si clône de "comboStatutValidation"
                        // cas spécial de la validation en masse
                        var nbSel = grille.selModel.getCount();
                        if (nbSel > 0) {
                            Ext.MessageBox.prompt('Décision de validation', 'Saisissez (254 caractères au maximum) :',
                            function(btn, text) {
                                if (btn == 'ok') {
                                    Ext.MessageBox.confirm('Confirmation', 'Etes-vous sûr de vouloir appliquer cette décision à toute la sélection ?',
                                    function(btn) {
                                        if (btn == 'yes') {
                                            var selection = grille.selModel.getSelections();
                                            var listId = selection[0].data['id_obs'];
                                            for (var i = 1; i < nbSel; i++) {
                                                listId += ', ' + selection[i].data['id_obs'];
                                            }
                                            valideListeObservations(listId, comboValidationEnMasse, text);
                                        }
                                    });
                                }
                            }, null, true, 'Décision du ' + new Date().dateFormat('d/m/Y à H:i'));
                        }
                        else {
                            Ext.MessageBox.alert('Attention', 'Vous devez sélectionner au moins une observation').setIcon(Ext.MessageBox.WARNING);
                        }
                    }
                    else {
                        // cas classique de la validation
                        valideListeObservations(Ext.getCmp('id_obs').getValue(), 
                        comboStatutValidation, Ext.getCmp('decision_validation').getValue());
                    }
                }
            }
        }
    });
    //Gestion de la liste des observateurs
    comboAjoutObs = new Ext.form.ComboBox({
        width: 300,
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jCodesPersonnes.php?appli=' + GetParam('appli') + '&role=obs',
            fields: ['code', 'libelle']
        }),
        emptyText: 'Sélectionez pour ajouter',
        mode: 'local',
        displayField: 'libelle',
        valueField: 'code',
        listeners: {
            select: function() {selectionne(this, listObs);}
        }
    });
    listObs = new Ext.ux.form.MultiSelect({
        blankText: 'Veuillez sélectionner au moins un observateur !',
        delimiter: '&',
        width: 500,
        store: new Ext.data.ArrayStore({
            fields: ['code', 'libelle']
        }),
        displayField: 'libelle',
	valueField: 'code',
        tbar: [
            comboAjoutObs, {
                text: 'Suppr. sélection',
                handler: function() {supprimeSelection(comboAjoutObs, listObs);}
            }
        ]
    });
    var listObsPanel = new Ext.Panel({
        fieldLabel: 'Liste des observateurs',
        items: listObs
    });
    //Gestion de la liste des structures
    comboAjoutStruct = new Ext.form.ComboBox({
        width: 160,
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jCodesStructures.php?appli=' + GetParam('appli'),
            fields: ['code', 'libelle']
        }),
        emptyText: 'Sélectionez pour ajouter',
        mode: 'local',
        displayField: 'libelle',
        valueField: 'code',
        listeners: {
            select: function() {selectionne(this, listStruct);}
        }
    });
    listStruct = new Ext.ux.form.MultiSelect({
        delimiter: '&',
        width: 200,
        store: new Ext.data.ArrayStore({
            fields: ['code', 'libelle']
        }),
        displayField: 'libelle',
	valueField: 'code',
        tbar: [
            comboAjoutStruct, {
                text: 'Suppr. sélection',
                handler: function() {supprimeSelection(comboAjoutStruct, listStruct);}
            }
        ]
    });
    var listStructPanel = new Ext.Panel({
        fieldLabel: 'Liste des structures',
        items: listStruct
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    if (modeSimplifie) {
        largeurColonneFormulaire = 0.34;
    }
    formulaire = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER], fn: function() {if (toucheENTREE) {soumettre()}}}],
        frame: true,
        items: [{
                xtype: 'hidden',
                id: 'commentaire_photo'
            }, {
                xtype: 'hidden',
                id: 'url_photo'
            }, {
                xtype: 'hidden',
                id: 'geometrie'
            }, {
                xtype: 'hidden',
                id: 'EPSG',
                value: projectionPostGIS.getCode().replace('EPSG:', '')
            }, {
                xtype: 'hidden',
                id: 'action'
            }, {
                xtype: 'hidden',
                id: 'id_obs'
            }, {
                xtype: 'hidden',
                id: 'cd_nom'
            }, {
                xtype: 'hidden',
                id: 'observateur'
            }, {
                xtype: 'hidden',
                id: 'structure'
            }, {
                xtype: 'hidden',
                id: 'observat'
            }, {
                xtype: 'hidden',
                id: 'struct'
            }, {
                xtype: 'hidden',
                id: 'code_insee'
            }, {
                xtype: 'hidden',
                id: 'regne'
            }, {
                xtype: 'hidden',
                id: 'id_lieu_dit'
            }, {
                xtype: 'hidden',
                id: 'diffusable'
            }, {
                anchor: '100%',
                html: '<div id="titre_formulaire">Détail des informations</div>'
            }, {
                layout: 'column',
                items: [{
                        labelWidth: 100,
                        labelAlign: 'right',
                        defaults: {width: 500},
                        labelSeparator: ' :',
                        columnWidth: 0.66 + largeurColonneFormulaire,
                        layout: 'form',
                        items: [
                                comboEtude,
                                comboProtocole,
                            {
                                xtype: 'tabpanel',
                                id: 'tabMoment',
                                fieldLabel: 'Moment',
                                plain: true,
                                listeners: {
                                    tabchange: function(tabs, tab) {
                                        Ext.getCmp('date_obs').allowBlank = true;
                                        Ext.getCmp('date_debut_obs').allowBlank = true;
                                        Ext.getCmp('date_fin_obs').allowBlank = true;
                                        Ext.getCmp('date_textuelle').allowBlank = true;
                                        Ext.getCmp('date_textuelle').vtype = null;
                                        switch (tab.id) {
                                            case 'tabMoment_0':
                                                Ext.getCmp('date_obs').allowBlank = false;
                                                Ext.getCmp('date_obs').focus();
                                                break;
                                            case 'tabMoment_1':
                                                Ext.getCmp('date_debut_obs').allowBlank = false;
                                                Ext.getCmp('date_fin_obs').allowBlank = false;
                                                Ext.getCmp('date_debut_obs').focus();
                                                break;
                                            case 'tabMoment_2':
                                                Ext.getCmp('date_textuelle').allowBlank = false;
                                                Ext.getCmp('date_textuelle').vtype = 'termineParAnnee';
                                                Ext.getCmp('date_textuelle').focus();
                                                break;
                                        }
                                    }
                                },
                                items: [{
                                        title: 'Jour',
                                        id: 'tabMoment_0',
                                        items: [{
                                                width: 477,
                                                xtype: 'datefield',
                                                format: 'd/m/Y',
                                                id: 'date_obs',
                                                maxValue: new Date(),
                                                blankText: "Veuillez entrer la date d'observation !"
                                            }
                                        ]
                                    }, {
                                        title: 'Début-fin',
                                        id: 'tabMoment_1',
                                        defaults: {width: 477},
                                        items: [{
                                                xtype: 'datefield',
                                                format: 'd/m/Y',
                                                id: 'date_debut_obs',
                                                maxValue: new Date(),
                                                blankText: "Veuillez entrer la date de début d'observation !"

                                            }, {
                                                xtype: 'datefield',
                                                format: 'd/m/Y',
                                                id: 'date_fin_obs',
                                                maxValue: new Date(),
                                                blankText: "Veuillez entrer la date de fin d'observation !"
                                            }
                                        ]
                                    }, {
                                        title: 'Saisie libre',
                                        id: 'tabMoment_2',
                                        items: [{
                                                width: 498,
                                                xtype: 'textfield',
                                                id: 'date_textuelle',
                                                maxLength: 30,
                                                blankText: "Veuillez entrer la période d'observation !"
                                            }
                                        ]
                                    }
                                ]
                            }, {
                                xtype: 'radiogroup',
                                id: 'choixRegne',
                                fieldLabel: 'Règne',
                                allowBlank: false,
                                blankText: 'Veuillez sélectionner le règne !',
                                items: [{
                                        boxLabel: 'Faune', name: 'eltRegne', inputValue: 'Faune'
                                    }, {
                                        boxLabel: 'Flore', name: 'eltRegne', inputValue: 'Flore'
                                    }, {
                                        boxLabel: 'Fonge', name: 'eltRegne', inputValue: 'Fonge'
                                    }, {
                                        boxLabel: 'Habitat', name: 'eltRegne', inputValue: 'Habitat'
                                    }
                                ],
                                listeners: {
                                    change: function(rg, r) {
                                        if (r != null) { // test obligatoire par rapport au "reset"
                                            // activation servant dans le cas particulier où rien de choisi au départ
                                            comboEspeces.enable();
                                            comboEspecesUsuelles.enable();
                                            comboTypeEffectif.enable();
                                            comboPheno.enable();
                                            comboTypeEffectif.setFieldLabel("Type d'effectif");
                                            comboPheno.setFieldLabel('Phénologie');
                                            comboTypeEffectif.store.proxy = new Ext.data.HttpProxy({
                                                url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_type_effectif',
                                                api: comboTypeEffectif.store.api
                                            });
                                            comboPheno.store.proxy = new Ext.data.HttpProxy({
                                                url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_phenologie',
                                                api: comboPheno.store.api
                                            });
                                            comboEspecesUsuelles.setFieldLabel('Espèce (usuel)');
                                            comboEspeces.setFieldLabel('Espèce (latin)');
                                            comboDetermination.hide();
                                            // renseignement du contrôle caché associé et configuration de saisie (suite)
                                            switch (r.inputValue) {
                                                case 'Faune':
                                                    Ext.getCmp('regne').setValue('Animalia');
                                                    comboTypeEffectif.setFieldLabel('Age');
                                                    comboPheno.setFieldLabel('Sexe');
                                                    comboTypeEffectif.store.proxy = new Ext.data.HttpProxy({
                                                        url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_age',
                                                        api: comboTypeEffectif.store.api
                                                    });
                                                    comboPheno.store.proxy = new Ext.data.HttpProxy({
                                                        url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_sexe',
                                                        api: comboPheno.store.api
                                                    });
                                                    comboDetermination.show();
                                                    break;
                                                case 'Flore':
                                                    Ext.getCmp('regne').setValue('Plantae');
                                                    comboTypeEffectif.setFieldLabel("Type d'effectif");
                                                    comboPheno.setFieldLabel('Phénologie');
                                                    comboTypeEffectif.store.proxy = new Ext.data.HttpProxy({
                                                        url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_type_effectif',
                                                        api: comboTypeEffectif.store.api
                                                    });
                                                    comboPheno.store.proxy = new Ext.data.HttpProxy({
                                                        url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_phenologie',
                                                        api: comboPheno.store.api
                                                    });
                                                    comboDetermination.hide();
                                                    break;
                                                case 'Fonge':
                                                    Ext.getCmp('regne').setValue('Fungi');
                                                    comboTypeEffectif.setFieldLabel('Stade reproductif');
                                                    comboPheno.setFieldLabel('Support');
                                                    comboTypeEffectif.store.proxy = new Ext.data.HttpProxy({
                                                        url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_stade_reproductif',
                                                        api: comboTypeEffectif.store.api
                                                    });
                                                    comboPheno.store.proxy = new Ext.data.HttpProxy({
                                                        url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_stade_phenologique',
                                                        api: comboPheno.store.api
                                                    });
                                                    comboDetermination.hide();
                                                    break;
                                                case 'Habitat':
                                                    Ext.getCmp('regne').setValue('Habitat');
                                                    comboTypeEffectif.setFieldLabel('Unité');
                                                    comboPheno.setFieldLabel('Etat conservation');
                                                    comboTypeEffectif.store.proxy = new Ext.data.HttpProxy({
                                                        url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_unite',
                                                        api: comboTypeEffectif.store.api
                                                    });
                                                    comboPheno.store.proxy = new Ext.data.HttpProxy({
                                                        url: '../Modeles/Json/jListEnum.php?appli=' + GetParam('appli') + '&typeEnum=saisie.enum_etat_de_conservation',
                                                        api: comboPheno.store.api
                                                    });
                                                    comboEspecesUsuelles.setFieldLabel('Code - Libellé');
                                                    comboEspeces.setFieldLabel('Libellé seul');
                                                    comboDetermination.hide();
                                                    break;
                                            }
                                            // récupération des 7 dernières valeurs saisies selon le "règne"
                                            comboEspecesUsuelles.store.load({params: {
                                                    mode: '7dernieres',
                                                    filtre: Ext.getCmp('regne').value
                                                }
                                            });
                                            comboEspeces.store.load({params: {
                                                    mode: '7dernieres',
                                                    filtre: Ext.getCmp('regne').value
                                                }
                                            });
                                            // récupération des valeurs à jour pour les listes exhaustives selon le "règne"
                                            comboTypeEffectif.store.load({
                                                callback: function() {
                                                    if (comboTypeEffectif.store.getCount() <= 1) {
                                                        comboTypeEffectif.hide();
                                                    }
                                                    else {
                                                        comboTypeEffectif.show();
                                                    }
                                                }
                                            });
                                            comboPheno.store.load({
                                                callback: function() {
                                                    if (comboPheno.store.getCount() <= 1) {
                                                        comboPheno.hide();
                                                    }
                                                    else {
                                                        comboPheno.show();
                                                    }
                                                }
                                            });
                                            // onglet actif selon l'importance des valeurs saisies (qui prévaut sur le règne)
                                            focusEffectifActif = false; // désactivation du focus sur les onglets "effectif"
                                            if (Ext.getCmp('effectif').value != '') {
                                                Ext.getCmp('tabEffectif').setActiveTab('tabEffectif_0');
                                            }
                                            else {
                                                if ((Ext.getCmp('effectif_min').value != '') || (Ext.getCmp('effectif_max').value != '')) {
                                                    Ext.getCmp('tabEffectif').setActiveTab('tabEffectif_1');
                                                }
                                                else {
                                                    if (Ext.getCmp('effectif_textuel').value != '') {
                                                        Ext.getCmp('tabEffectif').setActiveTab('tabEffectif_2');
                                                    }
                                                    else {
                                                        // onglet actif par défaut selon le règne (si aucune valeur saisie donc)
                                                        if ((r.inputValue == 'Flore') || (r.inputValue == 'Fonge')) {
                                                            Ext.getCmp('tabEffectif').setActiveTab('tabEffectif_2');
                                                        }
                                                        else {
                                                            Ext.getCmp('tabEffectif').setActiveTab('tabEffectif_0');
                                                        }
                                                    }
                                                }
                                            }
                                            focusEffectifActif = true; // réactivation du focus sur les onglets "effectif"
                                        }
                                    }
                                }
                            },
                            comboEspecesUsuelles,
                            comboEspeces,
                            {
                                xtype: 'tabpanel',
                                id: 'tabEffectif',
                                fieldLabel: 'Effectif',
                                plain: true,
                                listeners: {
                                    tabchange: function(tabs, tab) {
                                        if (focusEffectifActif) {
                                            switch (tab.id) {
                                                case 'tabEffectif_0':
                                                    Ext.getCmp('effectif').focus();
                                                    break;
                                                case 'tabEffectif_1':
                                                    Ext.getCmp('effectif_min').focus();
                                                    break;
                                                case 'tabEffectif_2':
                                                    Ext.getCmp('effectif_textuel').focus();
                                                    break;
                                            }
                                        }
                                    }
                                },
                                items: [{
                                        title: 'Précis',
                                        id: 'tabEffectif_0',
                                        items: [{
                                                width: 499,
                                                xtype: 'spinnerfield',
                                                allowDecimals: false,
                                                allowNegative: false,
                                                minValue: 1,
                                                id: 'effectif'
                                            }
                                        ]
                                    }, {
                                        title: 'Mini-maxi',
                                        id: 'tabEffectif_1',
                                        defaults: {width: 499},
                                        items: [{
                                                xtype: 'spinnerfield',
                                                allowDecimals: false,
                                                allowNegative: false,
                                                minValue: 1,
                                                id: 'effectif_min'
                                            },
                                            {
                                                xtype: 'spinnerfield',
                                                allowDecimals: false,
                                                allowNegative: false,
                                                minValue: 1,
                                                id: 'effectif_max'
                                            }
                                        ]
                                    }, {
                                        title: 'Saisie libre',
                                        id: 'tabEffectif_2',
                                        items: [{
                                                width: 498,
                                                xtype: 'textfield',
                                                id: 'effectif_textuel',
                                                maxLength: 10
                                            }
                                        ]
                                    }
                                ]
                            },
                            comboTypeEffectif,
                            comboPheno,
                            comboPrecision,
                            listObsPanel,
                            {
                                xtype: 'textarea',
                                fieldLabel: "Remarques d'observation",
                                id: 'remarque_obs',
                                maxLength: 254,
                                listeners: {
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            },
                            comboStatutValidation,
                            comboDetermination
                        ]
                    }, {
                        labelWidth: 100,
                        labelAlign: 'right',
                        defaults: {width: 200},
                        labelSeparator: ' :',
                        columnWidth: 0.34 - largeurColonneFormulaire,
                        hidden: modeSimplifie,
                        layout: 'form',
                        items: [
                            {
                               xtype: 'panel',
                               height: 23,//78,
                               hidden: false
                            }, {
                                xtype: 'textfield',
                                fieldLabel: "ID observation",
                                id: 'id_obs',
                                readOnly: true,
                                hidden: true
                            }, {
                                xtype: 'timefield',
                                fieldLabel: 'Heure',
                                id: 'heure_obs',
                                increment: 30
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Relevé GPS',
                                id: 'id_waypoint'
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Longitude',
                                id: 'longitude',
                                decimalSeparator: '.',
                                minValue: -180,
                                maxValue: 180,
                                allowBlank: false,
                                blankText: 'Veuillez saisir la longitude !',
                                decimalPrecision: 16
                            }, {
                                xtype: 'numberfield',
                                fieldLabel: 'Latitude',
                                id: 'latitude',
                                decimalSeparator: '.',
                                minValue: -90,
                                maxValue: 90,
                                allowBlank: false,
                                blankText: 'Veuillez saisir la latitude !',
                                decimalPrecision: 16
                            }, {
                                xtype: 'spinnerfield',
                                fieldLabel: 'Altitude',
                                allowDecimals: false,
                                allowNegative: true,
                                id: 'elevation'
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Commune',
                                id: 'nom',
                                readOnly: true
                            },
                            comboLieuDit,
                            {
                                height: 48,
                                xtype: 'textarea',
                                fieldLabel: 'Remarques de localisation',
                                id: 'localisation',
                                maxLength: 254,
                                listeners: {
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Numérisateur',
                                id: 'numerisat',
                                readOnly: true
                            },
                            listStructPanel,
                            {
                                xtype: 'textarea',
                                fieldLabel: 'Décision de validation',
                                id: 'decision_validation',
                                readOnly: true,
                                maxLength: 254,
                                listeners: {
                                    focus: function() {
                                        toucheENTREE = false;
                                    },
                                    blur: function() {
                                        toucheENTREE  = true;
                                    }
                                }
                            }, {
                                xtype: 'textfield',
                                fieldLabel: 'Validateur',
                                id: 'validat',
                                readOnly: true
                            }, {
                                xtype: 'checkbox',
                                fieldLabel: 'Diffusable',
                                id: 'choixDiffusable',
                                checked: true,
                                listeners: {
                                    change: function(chb, val) {
                                        // gestion de la valeur du contrôle caché associé à la case à cocher
                                        if (val) {
                                            Ext.getCmp('diffusable').setValue('t');
                                        }
                                        else {
                                            Ext.getCmp('diffusable').setValue('f');
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    });
    //Panel container rajoutant la barre de status
    var formulaireTotal = new Ext.Panel({
        items: formulaire,
        bbar: new Ext.ux.StatusBar({
            items: [{
                    handler: importerPhoto,
                    iconCls: 'photo',
                    tooltip: 'visualiser/charger/supprimer une photo'
                }, {
                    xtype: 'label',
                    text: 'Photo:'
                }, {
                    xtype: 'textfield',
                    id: 'nom_photo',
                    readOnly: true
                }, {
                    id: 'boutonInfoPhoto',
                    iconCls: 'user_comment',
                    tooltipType : 'title',
                    disabled: true
                } , '-', {
                    id: 'boutonPrecedent',
                    text: 'Précédent',
                    handler: afficherPrecedent,
                    iconCls: 'precedent',
                    tooltip: 'Afficher la donnée précédente'
                }, '-', {
                    id: 'boutonSuivant',
                    text: 'Suivant',
                    handler: afficherSuivant,
                    iconCls: 'suivant',
                    tooltip: 'Afficher la donnée suivante'
                }, '-', {
                    text: 'Dupliquer',
                    handler: dupliquer,
                    iconCls: 'dupliquer',
                    tooltip: 'Enregistrer (si vous êtes le numérisateur la donnée) puis dupliquer le formulaire (raccourci clavier "Ctrl + Q")'
                }, '-', {
                    text: 'Enregistrer',
                    handler: function() {
                        modeDuplication = false;
                        soumettre();
                    },
                    iconCls: 'checked'
                }, '-', {
                    id: 'boutonAnnuler',
                    text: 'Annuler',
                    handler: function() {
                        fenetreFormulaire.hide();
                        if ((Ext.getCmp('action').value == 'Ajouter') && // en ajout, il faut recharger pour enlever la géométrie
                            (typeof(iImport) == 'undefined')) {          // mais pas besoin lors de la procédure d'importation
                            donneesGrille.reload();
                        }
                        modeDuplication = false;
                    },
                    iconCls: 'cancel'
                }
            ],
            id: 'statusbar',
            defaultText: 'Prêt'
        })
    });
    // mode import uniquement
    if (typeof(iImport) != 'undefined') {
        // ajout d'un bouton "stop" pour arrêter la procédure d'importation
        formulaireTotal.getBottomToolbar().add('-');
        formulaireTotal.getBottomToolbar().add({
            text: 'Quitter',
            handler: arreter,
            iconCls: 'stop',
            tooltip: "Arrêter l'importation GPX"
        });
    }
    //Fenêtre container
    if (modeSimplifie) {
        largeurFenetreFormulaire = 660;
    }
    fenetreFormulaire = new Ext.Window({
        closable: false,
        modal: true,
        resizable: false,
        title: 'Saisie des observations',
        width: largeurFenetreFormulaire,
        autoHeight: true,
        constrain: true,
        items: formulaireTotal,
        close: Ext.getCmp('boutonAnnuler').handler,
        listeners: {
            hide: function() {
                Ext.Ajax.request({
                    url: '../Controleurs/Gestion/GestSession.php?appli=' + GetParam('appli'),
                    params: {
                        action: 'AttendreSaisie',
                        saisieEnCours: 'NON'
                    }
                });
            }
        }
    });
    //Initialisation des listes et des variables quasi-stables dans le temps
    comboEtude.store.load();
    comboProtocole.store.load();
    Ext.Ajax.request({
        url: '../Modeles/Json/jVarSession.php?appli=' + GetParam('appli'),
        params: {
            varSession: 'infosNumerisateur'
        },
        callback: function(options, success, response) {
            if (success) {
                var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                if (obj.success) {
                    numerisateur = obj.numerisateur;
                    numerisat = obj.numerisat;
                    profil = obj.profil;
                    droit = obj.droit;
                    idSociete = obj.idSociete;
                    nomSociete = obj.nomSociete;
                    comboStatutValidation.readOnly = ((droit != 'expert') &&
                        (droit != 'admin'));
                    Ext.getCmp('decision_validation').readOnly = comboStatutValidation.readOnly;
                }
                else {
                    Ext.MessageBox.show({
                        title: obj.errorMessage,
                        msg: obj.data,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                }
            }
            else {
                Ext.MessageBox.show({
                    title: 'ERREUR : ' + response.statusText,
                    msg: 'Code erreur ' + response.status,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.ERROR
                });
            }
        }
    });
});

//Affichage en mode ajout
function ajoute(geom, attr) {
    // mode ajout et import 1° passage uniquement ("nbImport" = 0)
    if ((!attr) || (iImport == 0)) {
        initialiseFormulaire(); // "reinitialiseFormulaire" inclus
        // initialisation des valeurs par défaut
        Ext.getCmp('diffusable').setValue('t');
        Ext.getCmp('numerisat').setValue(numerisat); // propre à la personne connectée
        Ext.getCmp('observateur').setValue(numerisateur); // propre à la personne connectée
        Ext.getCmp('observat').setValue(numerisat); // propre à la personne connectée
        Ext.getCmp('structure').setValue(idSociete); // propre à la personne connectée
        Ext.getCmp('struct').setValue(nomSociete); // propre à la personne connectée
        // propre aux valeurs définies en base de données
        Ext.getCmp('id_etude').setValue(CST_id_etude);
        Ext.getCmp('id_protocole').setValue(CST_id_protocole);
        // application des droits et du profil utilisateur
        switch (profil) {
            case 'faune':
                Ext.getCmp('regne').setValue('Animalia');
                break;
            case 'flore':
                Ext.getCmp('regne').setValue('Plantae');
                break;
            case 'fonge':
                Ext.getCmp('regne').setValue('Fungi');
                break;
            case 'habitat':
                Ext.getCmp('regne').setValue('Habitat');
                break;
            default:
                Ext.getCmp('regne').setValue('');
                break;
        }
        switch (droit) {
            case 'amateur':
                comboStatutValidation.setValue('à valider');
                break;
            default:
                comboStatutValidation.setValue('');
                break;
        }
        // déblocage du choix du règne
        Ext.getCmp('choixRegne').enable();
        // affectation du mode en ajout
        Ext.getCmp('action').setValue('Ajouter');
        // blocage des boutons de navigation
        Ext.getCmp('boutonPrecedent').disable();
        Ext.getCmp('boutonSuivant').disable();
    }
    // mode import à partir du 2° passage uniquement ("nbImport" > 0)
    else {
        // reprise d'une partie de "initialiseFormulaire"
        fenetreFormulaire.show();
        Ext.getCmp('tabMoment').setActiveTab('tabMoment_0');
        Ext.getCmp('date_debut_obs').setValue('');
        Ext.getCmp('date_fin_obs').setValue('');
        Ext.getCmp('date_textuelle').setValue('');
        // complément issu d'une partie du mode duplication
        reinitialiseFormulaire();
        Ext.getCmp('id_obs').setValue('');
        // récupération des 7 dernières valeurs saisies selon le "règne"
        comboEspecesUsuelles.store.load({params: {
                mode: '7dernieres',
                filtre: Ext.getCmp('regne').value
            }
        });
        comboEspeces.store.load({params: {
                mode: '7dernieres',
                filtre: Ext.getCmp('regne').value
            }
        });
    }
    // mode import uniquement et pour tous les passages
    if (attr) {
        // récupération des valeurs GPX selon le type de donnée
        if (geom.CLASS_NAME == 'OpenLayers.Geometry.LineString') {
            Ext.getCmp('date_obs').setValue(transformeEnDateHeure(attr['name']));
            Ext.getCmp('heure_obs').setValue(transformeEnHeure(attr['name']));
            Ext.getCmp('id_waypoint').setValue(attr['name']);
        }
        else {
            Ext.getCmp('id_waypoint').setValue(attr['name']);
            Ext.getCmp('elevation').setValue(transformeEnEntier(attr['ele']));
            var dateHeure = transformeEnDateHeure(attr['cmt']);
            if (!dateHeure) {
                dateHeure = transformeEnDateHeure(attr['time']);
            }
            var heure = transformeEnHeure(attr['cmt']);
            if (!heure) {
                heure = transformeEnHeure(attr['time']);
            }
            if (heure) {
                heure.setMinutes(Math.floor((heure.getMinutes()+15)/30)*30);
            }
            Ext.getCmp('date_obs').setValue(dateHeure);
            Ext.getCmp('heure_obs').setValue(heure);
            Ext.getCmp('remarque_obs').setValue(attr['name'] + ' | ' + attr['cmt'] + ' | ' +
            attr['desc'] + ' | ' + attr['ele'] + ' | ' + attr['sym'] + ' | ' + attr['time']);
        }
        // gestion du focus
        Ext.getCmp('tabEffectif').setActiveTab('tabEffectif_0');
        Ext.getCmp('effectif').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
        if ((Ext.getCmp('regne').value == 'Plantae') || (Ext.getCmp('regne').value == 'Fungi')) {
            Ext.getCmp('tabEffectif').setActiveTab('tabEffectif_2');
            Ext.getCmp('effectif_textuel').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
        }
    }
    // mode ajout uniquement
    else {
        // gestion du focus
        Ext.getCmp('date_obs').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
        comboEspeces.emptyText = 'Saisissez 3 caractères';
        comboEspeces.reset();
    }
    // commun au 2 modes et quelque soit le N° d'import de passage
    Ext.getCmp('geometrie').setValue(geom);
    // mode ajout et import 1° passage uniquement ("nbImport" = 0)
    if ((!attr) || (iImport == 0)) {
        finaliseFormulaire(); // "spatialiseFormulaire" inclus
    }
    // mode import à partir du 2° passage uniquement ("nbImport" > 0)
    else {
        spatialiseFormulaire(geom);
    }

}

//Affichage en mode modification
function modifie() {
    initialiseFormulaire(); // "reinitialiseFormulaire" inclus
    // gestion du statut des boutons de navigation
    Ext.getCmp('boutonPrecedent').setDisabled(!grille.selModel.hasPrevious());
    Ext.getCmp('boutonSuivant').setDisabled(!grille.selModel.hasNext());
    // remplissage du formulaire
    var geom = coucheEditable.selectedFeatures[0].geometry.clone(); // clônage car pas de reload ensuite si annuler
    Ext.getCmp('geometrie').setValue(geom.transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326')));
    var selected = grille.selModel.getSelected();
    for (var donnee in selected.data) {
        if (Ext.getCmp(donnee)) {
            if (donnee == 'heure_obs') {
                Ext.getCmp(donnee).setValue(timeRenderer(selected.data[donnee]));
            }
            else {
                Ext.getCmp(donnee).setValue(selected.data[donnee]);
            }
        }
    }
    // affectation du mode en modif
    Ext.getCmp('action').setValue('Modifier');
    // blocage du choix du règne
    Ext.getCmp('choixRegne').disable();
    // focus sur le contrôle date renseigné par ordre d'importance
    if (Ext.getCmp('date_obs').value != '') {
        Ext.getCmp('date_obs').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
    }
    else {
        if (Ext.getCmp('date_debut_obs').value != '') {
            Ext.getCmp('tabMoment').setActiveTab('tabMoment_1');
            Ext.getCmp('date_debut_obs').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
        }
        else {
            if (Ext.getCmp('date_textuelle').value != '') {
                Ext.getCmp('tabMoment').setActiveTab('tabMoment_2');
                Ext.getCmp('date_textuelle').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
            }
        }
    }
    finaliseFormulaire(); // "spatialiseFormulaire" inclus
}

//Fonction appelée après un enregistrement réussi ou si duplicata
function termineAffichage() {
    // mode duplication
    if (modeDuplication) {
        nbDuplicata++; // partie comptage servant au mode import uniquement
        // réinitialisation des contrôles primaires
        reinitialiseFormulaire();
        // passage forcé en mode ajout
        Ext.getCmp('action').setValue('Ajouter');
        Ext.getCmp('id_obs').setValue('');
        // application des droits et du profil utilisateur
        Ext.getCmp('numerisat').setValue(numerisat); // propre à la personne connectée
        switch (droit) {
            case 'amateur':
                comboStatutValidation.setValue('à valider');
                break;
            default:
                comboStatutValidation.setValue('');
                break;
        }
        // réinitialisation des contrôles secondaires
        Ext.getCmp('validat').setValue('');
        comboPrecision.reset();
        comboDetermination.reset();
        comboEspecesUsuelles.reset();
        comboEspeces.reset();
        // gestion du focus
        if ((Ext.getCmp('regne').value == 'Plantae') || (Ext.getCmp('regne').value == 'Fungi')) {
            Ext.getCmp('tabEffectif').setActiveTab('tabEffectif_2');
            comboEspeces.focus('', 100);
        }
        else {
            Ext.getCmp('tabEffectif').setActiveTab('tabEffectif_0');
            comboEspecesUsuelles.focus('', 100);
        }
        // affectation de la variable globale pour comptage en mode import uniquement
        modeDuplication = true;
        // déblocage du choix du règne
        Ext.getCmp('choixRegne').enable();
        // blocage des boutons de navigation
        Ext.getCmp('boutonPrecedent').disable();
        Ext.getCmp('boutonSuivant').disable();
    }
    // autres modes (ajout, modif et import)
    else {
        nbImport++; // partie comptage servant au mode import uniquement
        fenetreFormulaire.hide();
        modeDuplication = false;
        // partie modes ajout et modif uniquement
        if (typeof(iImport) == 'undefined') {
            donneesGrille.reload();
        }
    }
}

//Fonction appelée sur le click du bouton "Enregistrer"
function soumettre() {
    // selection forcée des listes
    listObs.view.selectRange(0, listObs.store.getCount() - 1);
    listStruct.view.selectRange(0, listStruct.store.getCount() - 1);
    if (formulaire.form.isValid()) {
        // invalidation forcée des "emptyText" lors de la soumission
        if (comboPrecision.getRawValue() == '') {
            comboPrecision.setRawValue('');
        }
        if (comboDetermination.getRawValue() == '') {
            comboDetermination.setRawValue('');
        }
        if (comboStatutValidation.getRawValue() == '') {
            comboStatutValidation.setRawValue('');
        }
        if (comboTypeEffectif.getRawValue() == '') {
            comboTypeEffectif.setRawValue('');
        }
        if (comboPheno.getRawValue() == '') {
            comboPheno.setRawValue('');
        }
        if (comboEspecesUsuelles.getRawValue() == '') {
            comboEspecesUsuelles.setRawValue('');
        }
        var id_lieu_dit = Ext.getCmp('lieu_dit').value;
        if (Ext.getCmp('lieu_dit').getRawValue() != id_lieu_dit) {
            Ext.getCmp('id_lieu_dit').setValue(id_lieu_dit); // traitement spécifique du contrôle caché
        }
        // renseignement forcée des "rawValue" lors de la soumission
        Ext.getCmp('id_etude').setRawValue(Ext.getCmp('id_etude').getValue());
        Ext.getCmp('id_protocole').setRawValue(Ext.getCmp('id_protocole').getValue());
        // récupération des codes depuis les listes
        Ext.getCmp('observateur').setValue(listObs.getValue());
        Ext.getCmp('structure').setValue(listStruct.getValue());
        // vérification auprès du référentiel
        Ext.Ajax.request({
            url: '../Modeles/Json/jCdNom.php?appli=' + GetParam('appli'),
            params: {
                valeur: comboEspeces.value,
                filtre: Ext.getCmp('regne').value
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        verifieTaxonOK(obj.data);
                        Ext.getCmp('cd_nom').setValue(obj.data);
                        if (Ext.getCmp('geometrie').value.CLASS_NAME == 'OpenLayers.Geometry.Point') {
                            traiteCodeInsee(new OpenLayers.Geometry.Point(Ext.getCmp('longitude').value,
                                Ext.getCmp('latitude').value), function() {templateValidation('../Controleurs/Gestion/GestObs.php?appli=' + GetParam('appli'),
                                Ext.getCmp('statusbar'), formulaire, termineAffichage)});
                        }
                        else {
                            templateValidation('../Controleurs/Gestion/GestObs.php?appli=' + GetParam('appli'), Ext.getCmp('statusbar'),
                                formulaire, termineAffichage);
                        }
                    }
                    else {
                        Ext.MessageBox.show({
                            title: obj.errorMessage,
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.WARNING
                        });
                    }
                }
                else {
                    Ext.MessageBox.show({
                        title: 'ERREUR : ' + response.statusText,
                        msg: 'Code erreur ' + response.status,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            }
        });
    }
    else {
        Ext.getCmp('statusbar').setStatus({
            clear: true, // faible attente pour être à nouveau "Prêt"
            text: 'Formulaire non valide',
            iconCls: 'x-status-error'
        });
    }
}

//Actualisation de la liste d'éléments de la combo
function actualiseCombo(cb, lb) {
    var nb = lb.store.getCount();
    if (nb > 0) {
        listObs.allowBlank = true;
        var codesSel = lb.store.getAt(0).data['code'];
        for (var i = 1; i < nb; i++) {
            codesSel += ', ' + lb.store.getAt(i).data['code'];
        }
        cb.store.load({params: {codes: codesSel}, callback: function() {cb.collapse();}});
    }
    else {
        listObs.allowBlank = false;
        cb.store.load();
    }
}

//Suppression des éléments sélectionnés de la liste
function supprimeSelection(cb, lb) {
    var listSuppr = lb.view.getSelectedIndexes();
    for (var i = listSuppr.length - 1; i >= 0; i--) {
        lb.store.removeAt(listSuppr[i]);
    }
    actualiseCombo(cb, lb);
}

//Ajout dans la liste de l'élément sélectionné par la combo
function selectionne(cb, lb) {
    lb.store.add(
        new lb.store.recordType({
            code: cb.value,
            libelle: cb.getRawValue()
        })
    );
    actualiseCombo(cb, lb);
    cb.reset();
}

//Remplissage de la liste
function remplitListe(codes, libelles, cb, lb) {
    if ((codes != null) && (codes != '')) {
        var listCodes = codes.split('&');
        var listLibelles = libelles.split(' & ');
        for (var i = 0; i < listCodes.length; i++) {
            lb.store.add(
                new lb.store.recordType({
                     code: listCodes[i],
                     libelle: listLibelles[i]
                })
            )
        }
    }
    actualiseCombo(cb, lb);
}

//Initialisation du formulaire incluant "reinitialiseFormulaire"
function initialiseFormulaire() {
    fenetreFormulaire.show();
    // activation par défaut des 1° onglets
    Ext.getCmp('tabMoment').setActiveTab('tabMoment_0');
    Ext.getCmp('tabEffectif').setActiveTab('tabEffectif_0');
    // mise à zéro des contrôles sur les onglets actifs
    formulaire.form.reset();
    // initialisation des listes
    listObs.store.removeAll();
    listStruct.store.removeAll();
    // mise à zéro forcée des contrôles sur les onglets masqués (non affectés par le "reset" du formulaire)
    Ext.getCmp('date_debut_obs').setValue('');
    Ext.getCmp('date_fin_obs').setValue('');
    Ext.getCmp('date_textuelle').setValue('');
    // complément d'initialisation du formulaire
    reinitialiseFormulaire();
}

//Réinitialisation du formulaire
function reinitialiseFormulaire() {
    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
    // remise à zéro des contrôles à réinitialiser à chaque fois
    Ext.getCmp('effectif').setValue('');
    Ext.getCmp('effectif_min').setValue('');
    Ext.getCmp('effectif_max').setValue('');
    Ext.getCmp('effectif_textuel').setValue('');
    Ext.getCmp('remarque_obs').setValue('');
    comboTypeEffectif.reset();
    comboPheno.reset();
    // réinitialisation des variables globales
    toucheENTREE = true;
    modeRequete = '';
}

//Finalisation du formulaire incluant "spatialiseFormulaire"
function finaliseFormulaire() {
    // traitement de la spatialité des données
    spatialiseFormulaire(Ext.getCmp('geometrie').value);
    // traitement du règne
    switch (Ext.getCmp('regne').value) {
        case 'Animalia':
            Ext.getCmp('choixRegne').setValue('Faune');
            break;
        case 'Plantae':
            Ext.getCmp('choixRegne').setValue('Flore');
            break;
        case 'Fungi':
            Ext.getCmp('choixRegne').setValue('Fonge');
            break;
        case 'Habitat':
            Ext.getCmp('choixRegne').setValue('Habitat');
            break;
        default:
            Ext.getCmp('choixRegne').reset();
            // configuration de saisie par défaut
            comboTypeEffectif.setFieldLabel("Type d'effectif");
            comboPheno.setFieldLabel("Phénologie");
            comboTypeEffectif.disable();
            comboPheno.disable();
            comboEspeces.disable();
            comboEspecesUsuelles.disable();
            comboEspecesUsuelles.setFieldLabel('Espèce (usuel)');
            comboEspeces.setFieldLabel('Espèce (latin)');
            comboDetermination.hide();
            break;
    }
    // traitement de l'état de diffusion
    Ext.getCmp('choixDiffusable').setValue(Ext.getCmp('diffusable').value != 'f');
    // traitement de l'état des listes
    remplitListe(Ext.getCmp('observateur').value, Ext.getCmp('observat').value, comboAjoutObs, listObs);
    remplitListe(Ext.getCmp('structure').value, Ext.getCmp('struct').value, comboAjoutStruct, listStruct);
    // traitement du nom de la photo
    Ext.getCmp('nom_photo').setValue(nomPhoto(Ext.getCmp('url_photo').value));
    Ext.getCmp('boutonInfoPhoto').setTooltip(Ext.getCmp('commentaire_photo').value);
}

//Traitement du "code_insee"
function traiteCodeInsee(geom, traiteCodeInseeFonctionRetour) {
    Ext.Ajax.request({
        url: '../Modeles/Json/jCommune.php?appli=' + GetParam('appli'),
        params: {
            centroid: geom.getCentroid(),
            EPSG: projectionPostGIS.getCode().replace('EPSG:', '')
        },
        callback: function(options, success, response) {
            if (success) {
                var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                if (obj.success) {
                    Ext.getCmp('code_insee').setValue(obj.code_insee);
                    Ext.getCmp('nom').setValue(obj.commune + ' (' + obj.code_insee + ')');
                }
                else {
                    Ext.getCmp('code_insee').setValue('');
                    Ext.getCmp('nom').setValue('Introuvable dans le référentiel IGN');                    
                }
                if (traiteCodeInseeFonctionRetour) {
                   traiteCodeInseeFonctionRetour();
                }
            }
            else {
                Ext.MessageBox.show({
                    title: 'ERREUR : ' + response.statusText,
                    msg: 'Code erreur ' + response.status,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.ERROR
                });
            }
        }
    });
 }

//Spatialisation du formulaire
function spatialiseFormulaire(geom) {
    // traitement du lieu-dit
    comboLieuDit.store.load({
        params: {
            centroid: geom.getCentroid(),
            EPSG: projectionPostGIS.getCode().replace('EPSG:', '')
        },
        callback: function() {
            comboLieuDit.setValue(Ext.getCmp('id_lieu_dit').value);
        }
    });
    // traitement de la commune
    traiteCodeInsee(geom);
    // traitement de la géomérie
    if (geom.CLASS_NAME == 'OpenLayers.Geometry.Point') {
        Ext.getCmp('longitude').setValue(geom.x);
        Ext.getCmp('latitude').setValue(geom.y);
        Ext.getCmp('longitude').showContainer();
        Ext.getCmp('latitude').showContainer();
        Ext.getCmp('elevation').showContainer();
    }
    else {
        Ext.getCmp('longitude').hideContainer();
        Ext.getCmp('latitude').hideContainer();
        Ext.getCmp('elevation').hideContainer();
    }
}

//Fonction appelée sur le click du bouton "Dupliquer"
function dupliquer() {
    modeDuplication = true;
    // si le numérisateur est aussi le connecté
    if (Ext.getCmp('numerisat').value == numerisat) {        
        soumettre(); // alors enregistrement des informations en cours également
    }
    else {
        termineAffichage(); // sinon pas d'enregistrement possible avant
    }
}

//Fonction d'arrêt de l'importation
function arreter() {
    Ext.Ajax.request({
        url: '../Controleurs/Gestion/GestSession.php?appli=' + GetParam('appli'),
        params: {
            action: 'AttendreSaisie',
            saisieEnCours: 'STOP'
        },
        callback: function() {
            fenetreFormulaire.hide();
        }
    });
}

//Fonction d'affichage de l'enregistrement précédent dans la grille
function afficherPrecedent() {
    if (grille.selModel.selectPrevious()) {
        modifie();
    }
}

//Fonction d'affichage de l'enregistrement suivant dans la grille
function afficherSuivant() {
    if (grille.selModel.selectNext()) {
        modifie();
    }
}

//Appel du formulaire d'importation photo
function importerPhoto() {
    importePhoto();
}

//Fonction de validation d'une liste d'observations
function valideListeObservations(listIdObs, cb, decisionValidation) {
    Ext.Ajax.request({
        url: '../Controleurs/Gestion/GestObs.php?appli=' + GetParam('appli'),
        params: {
            action: 'Valider',
            id_obs: listIdObs,
            statut_validation: cb.getValue(),
            decision_validation: decisionValidation
        },
        callback: function(options, success, response) {
            if (success) {
                var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                if (obj.success) {
                    if (cb == comboStatutValidation) {
                        Ext.getCmp('statusbar').setStatus({
                            clear: true, // faible attente pour être à nouveau "Prêt"
                            text: 'Validation réussie',
                            iconCls: 'x-status-valid'
                        });
                        Ext.getCmp('validat').setValue(numerisat);
                    }
                    var idSelection = grille.selModel.getSelected().data['id_obs'];
                    donneesGrille.reload({
                        callback: function(records) {
                            for (var i = 0; i < records.length; i++) {
                                if (records[i].data['id_obs'] == idSelection) {
                                   grille.selModel.selectRow(i);
                                }
                            }
                        }
                    });
                }
                else {
                    if (cb == comboStatutValidation) {
                        Ext.getCmp('statusbar').setStatus({
                            text: 'Validation échouée',
                            iconCls: 'x-status-error'
                        });
                    }
                    Ext.MessageBox.show({
                        title: obj.errorMessage,
                        fn: function() {
                            if (cb == comboStatutValidation) {
                                Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
                            }
                        },
                        msg: obj.data,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                }
            }
        }
    });
}

//Vtype contrôlant que l'espèce est bien saisie
Ext.apply(Ext.form.VTypes, {
    verifieEspeceSaisie: function(val, field) {
        if (!CST_choixEspeceForcee || (comboEspeces.value.split(' ')[1] != undefined
        && comboEspeces.value.split(' ')[1] != 'sp.')) {
            return true;
        }
        else {
            return false;
        }
    },
    verifieEspeceSaisieText: "Veuillez préciser l'espèce"
});

function verifieTaxonOK(cd_nom) {
    Ext.Ajax.request({
        url: '../Modeles/Adaptations/fTaxRef.php?appli=' + GetParam('appli'),
        params: {
            valeur: cd_nom,
            saisie: comboEspeces.value,
            filtre: Ext.getCmp('regne').value
        },
        callback: function(options, success, response) {
            if (success) {
                var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                if (!obj.success) {
                    Ext.MessageBox.show({
                        title: obj.errorMessage,
                        msg: obj.data,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                }
            }
            else {
                Ext.MessageBox.show({
                    title: 'ERREUR : ' + response.statusText,
                    msg: 'Code erreur ' + response.status,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.ERROR
                });
            }
        }
    });
}
