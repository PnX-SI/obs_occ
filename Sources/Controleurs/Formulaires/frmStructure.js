//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire, comboCreateur, droit, numerisateur, numerisat;

Ext.onReady(function() {
    comboCreateur = new Ext.form.ComboBox({
        id: 'creat',
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: "../Modeles/Json/jListVal.php?table=MD.PERSONNE&chId=id_personne&chVal=(nom || ' ' || prenom)",
            fields: ['id', 'val']
        }),
        emptyText: 'Sélectionnez',
        mode: 'local',
        displayField: 'val',
        valueField: 'id',
        fieldLabel: 'Numérisateur de la structure',
        allowBlank: false,
        blankText: "Veuillez sélectionner le numérisateur de la structure !",
        forceSelection: true
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaire = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER], fn: soumettre}],
        frame: true,
        labelWidth: 200,
        labelAlign: 'right',
        defaults: {width: 200},
        labelSeparator: ' : ',
        items: [{
                xtype: 'hidden',
                id: 'action'
           }, {
                xtype: 'hidden',
                id: 'id_structure'
           }, {
                xtype: 'hidden',
                id: 'createur'
           }, {
                xtype: 'hidden',
                id: 'diffusable'
           }, {
                anchor: '100%',
                html: '<div id="titre_formulaire">Détail des informations</div>'
           }, {
                xtype: 'textfield',
                fieldLabel: 'Nom',
                id: 'nom_structure',
                allowBlank: false,
                blankText: "Veuillez entrer le nom de la structure !",
                maxLength: 100
            },  {
                xtype: 'textfield',
                fieldLabel: 'Détail',
                id: 'detail_nom_structure',
                maxLength: 255
            }, {
                xtype: 'textfield',
                fieldLabel: 'Statut',
                id: 'statut',
                maxLength: 20
            }, {
                xtype: 'textarea',
                fieldLabel: 'Adresse',
                id: 'adresse_1',
                maxLength: 60,
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
                fieldLabel: 'Code postal',
                id: 'code_postal',
                maxLength: 5
            }, {
                xtype: 'textfield',
                fieldLabel: 'Ville',
                id: 'ville',
                maxLength: 40
            }, {
                xtype: 'textfield',
                fieldLabel: 'Pays',
                id: 'pays',
                maxLength: 20
            }, {
                xtype: 'textfield',
                fieldLabel: 'Téléphone',
                id: 'tel',
                maxLength: 14
            }, {
                xtype: 'textfield',
                fieldLabel: 'Fax',
                id: 'fax',
                maxLength: 14
            }, {
                xtype: 'textfield',
                fieldLabel: 'Courriel',
                id: 'courriel_1',
		vtype: 'email',
                maxLength: 60
            }, {
                xtype: 'textfield',
                fieldLabel: 'Courriel bis',
                id: 'courriel_2',
		vtype: 'email',
                maxLength: 60
            }, {
                xtype: 'textfield',
                fieldLabel: 'Site internet',
                id: 'site_web',
                maxLength: 60
            }, {
                xtype: 'textarea',
                fieldLabel: 'Remarque',
                id: 'remarque',
                maxLength: 255
            }, {
                xtype: 'datefield',
                format: 'd/m/Y',
                fieldLabel: 'Date de mise à jour',
                id: 'date_maj'
            },
            comboCreateur,
            {
                xtype: 'checkbox',
                fieldLabel: 'Publiée',
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
    });
    //Panel container rajoutant la barre de status
    var formulaireTotal = new Ext.Panel({
        items: formulaire,
        bbar: new Ext.ux.StatusBar({
            items: [{
                    text: 'Enregistrer',
                    handler: soumettre,
                    iconCls: 'checked'
                }, '-', {
                    id: 'boutonAnnuler',
                    text: 'Annuler',
                    handler: function() {fenetreFormulaire.hide();},
                    iconCls: 'cancel'
                }
            ],
            id: 'statusbar',
            defaultText: 'Prêt'
        })
    });
    //Fenêtre container
    fenetreFormulaire = new Ext.Window({
        modal: true,
        constrain: true,
        resizable: false,
        title: 'Saisie des structures',
        width: 500,
        autoHeight: true,
        items: formulaireTotal,
        close: function () {
            // si le formulaire est en mode édition
            if ((Ext.getCmp('createur').getValue() == numerisateur) || (droit == 'admin')) {
                Ext.MessageBox.alert('Information', 'Veuillez utiliser les boutons Enregistrer/Annuler pour fermer ce formulaire');
            }
            else {
                Ext.getCmp('boutonAnnuler').handler();
            }
        }
    });
    //Initialisation des listes et des variables quasi-stables dans le temps
    comboCreateur.store.load();
    Ext.Ajax.request({
            url: '../Modeles/Json/jVarSession.php',
            params: {
                varSession: 'infosNumerisateur'
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        numerisateur = obj.numerisateur;
                        numerisat = obj.numerisat; // nom et prénom
                        droit = obj.droit;
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
function ajoute() {
    initialiseFormulaire();
    Ext.getCmp('action').setValue('Ajouter');
    Ext.getCmp('createur').setValue(numerisateur);
    comboCreateur.setValue(numerisat);
    Ext.getCmp('diffusable').setValue('t');
    finaliseFormulaire();
}

//Affichage en mode modification
function modifie() {
    initialiseFormulaire();
    var selected = grille.selModel.getSelected();
    for (var donnee in selected.data) {
        if (Ext.getCmp(donnee)) {
            Ext.getCmp(donnee).setValue(selected.data[donnee]);
        }
    }
    Ext.getCmp('action').setValue('Modifier');
    finaliseFormulaire();
}

//Fonction appelée après un enregistrement réussi
function termineAffichage() {
    fenetreFormulaire.hide();
    donneesGrille.reload();
}

//Fonction appelée sur le click du bouton "Enregistrer"
function soumettre() {
    var createur = Ext.getCmp('creat').value;
    if (Ext.getCmp('creat').getRawValue() != createur) {
        Ext.getCmp('createur').setValue(createur); // traitement spécifique du contrôle caché
    }
    templateValidation('../Controleurs/Gestion/GestStructures.php', Ext.getCmp('statusbar'),
        formulaire, termineAffichage);
}

//Initialisation du formulaire
function initialiseFormulaire() {
    fenetreFormulaire.show();
    formulaire.form.reset();
    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
    Ext.getCmp('nom_structure').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
}

//Finalisation du formulaire
function finaliseFormulaire() {
    var formulaireEditable = (Ext.getCmp('createur').getValue() == numerisateur) ||
        (droit == 'admin');
    // mise en lecture seule des contrôles si pas "admin" ou pas propriétaire de la donnée
    formulaire.getForm().callFieldMethod('setReadOnly', [!formulaireEditable]);
    // affichage de la barre de statut si "admin" ou propriétaire de la donnée
    if (formulaireEditable) {
        Ext.getCmp('statusbar').show();
    }
    else {
        Ext.getCmp('statusbar').hide(); // blocage de l'enregistrement du formulaire
    }
    // mise en écriture des contrôles pour l'administrateur uniquement
    comboCreateur.setReadOnly((droit != 'admin'));
    Ext.getCmp('choixDiffusable').setDisabled(((droit != 'admin')));
    // traitement de l'état de diffusion
    Ext.getCmp('choixDiffusable').setValue(Ext.getCmp('diffusable').value != 'f');
    // date de mise à jour jamais modifiable (gérée par le système)
    Ext.getCmp('date_maj').setReadOnly(true);
}
