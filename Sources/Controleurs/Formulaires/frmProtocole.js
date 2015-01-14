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
                id: 'id_protocole'
           }, {
                anchor: '100%',
                html: '<div id="titre_formulaire">Détail des informations</div>'
           }, {
                xtype: 'textfield',
                fieldLabel: 'Nom',
                id: 'libelle',
                allowBlank: false,
                blankText: "Veuillez entrer le nom du protocole !",
                maxLength: 255
            }, {
                xtype: 'textarea',
                fieldLabel: 'Résumé',
                id: 'resume'
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
        title: 'Saisie des protocoles',
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
    templateValidation('../Controleurs/Gestion/GestProtocoles.php', Ext.getCmp('statusbar'),
        formulaire, termineAffichage);
}

//Initialisation du formulaire
function initialiseFormulaire() {
    fenetreFormulaire.show();
    formulaire.form.reset();
    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
    Ext.getCmp('libelle').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
}