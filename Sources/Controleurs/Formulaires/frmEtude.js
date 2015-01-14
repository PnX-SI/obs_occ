//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire;

Ext.onReady(function() {
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
                id: 'id_etude'
           }, {
                anchor: '100%',
                html: '<div id="titre_formulaire">Détail des informations</div>'
           }, {
                xtype: 'textfield',
                fieldLabel: 'Nom',
                id: 'nom_etude',
                allowBlank: false,
                blankText: "Veuillez entrer le nom de l'étude !",
                maxLength: 254
            }, {
                xtype: 'datefield',
                format: 'd/m/Y',
                fieldLabel: 'Date de début',
                id: 'date_debut',
                allowBlank: false,
                blankText: "Veuillez entrer la date de début de l'étude !"
            }, {
                xtype: 'datefield',
                format: 'd/m/Y',
                fieldLabel: 'Date de fin',
                id: 'date_fin'
            }, {
                xtype: 'textfield',
                fieldLabel: 'Cahier des charges',
                id: 'cahier_des_charges',
                maxLength: 254
            }, {
                xtype: 'textarea',
                fieldLabel: 'Description',
                id: 'description',
                maxLength: 254
            }, {
                xtype: 'textfield',
                fieldLabel: 'Lien vers le rapport final',
                id: 'lien_rapport_final',
                maxLength: 254
            },
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
        closable: false,
        modal: true,
        constrain: true,
        resizable: false,
        title: 'Saisie des études',
        width: 500,
        autoHeight: true,
        items: formulaireTotal,
        close: Ext.getCmp('boutonAnnuler').handler
    });
});

//Affichage en mode ajout
function ajoute() {
    initialiseFormulaire();
    Ext.getCmp('action').setValue('Ajouter');
    Ext.getCmp('date_debut').setValue(new Date());    
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
}

//Fonction appelée après un enregistrement réussi
function termineAffichage() {
    fenetreFormulaire.hide();
    donneesGrille.reload();
}

//Fonction appelée sur le click du bouton "Enregistrer"
function soumettre() {
    templateValidation('../Controleurs/Gestion/GestEtudes.php', Ext.getCmp('statusbar'),
        formulaire, termineAffichage);
}

//Initialisation du formulaire
function initialiseFormulaire() {
    fenetreFormulaire.show();
    formulaire.form.reset();
    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
    Ext.getCmp('nom_etude').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
}