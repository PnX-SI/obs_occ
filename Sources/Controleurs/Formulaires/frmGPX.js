//Variables globales utilisées pour gérer le formulaireGPX
var formulaireGPX, fenetreformulaireGPX;

Ext.onReady(function() {
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaireGPX = new Ext.FormPanel({
        fileUpload: true,
        frame: true,
        labelWidth: 130,
        labelAlign: 'right',
        defaults: {width: 230},
        labelSeparator: ' :',
        items: [{
                xtype: 'hidden',
                id: 'CST_cheminRelatifGPX',
                value: CST_cheminRelatifGPX
           },
                new Ext.ux.form.FileUploadField({
                    id: 'fichierLocalGPX',
                    buttonText: 'Parcourir...',
                    fieldLabel: 'GPX à importer',
                    emptyText: 'Sélectionner un fichier GPX',
                    allowBlank: false,
                    blankText: 'Veuillez sélectionner un fichier GPX !',
                    regex: /\.GPX$/i,
                    regexText: "Veuillez sélectionner un fichier avec l'extension GPX"
                })           
        ]
    });
    //Panel container rajoutant la barre de status
    var formulaireTotalGPX = new Ext.Panel({
        items: formulaireGPX,
        bbar: new Ext.ux.StatusBar({
            items: [{
                    text: 'Charger',
                    handler: soumettreGPX,
                    iconCls: 'checked'
                }, '-', {
                    id: 'boutonAnnulerGPX',
                    text: 'Annuler',
                    handler: function() {fenetreformulaireGPX.hide();},
                    iconCls: 'cancel'
                }
            ],
            id: 'statusbarGPX',
            defaultText: 'Prêt'
        })
    });
    //Fenêtre container
    fenetreformulaireGPX = new Ext.Window({
        closable: false,
        modal: true,
        resizable: false,
        title: 'Chargement - fichier GPX',
        width: 440,
        autoHeight: true,
        constrain: true,
        items: formulaireTotalGPX,
        close: Ext.getCmp('boutonAnnulerGPX').handler
    });
});

//Fonction appelée après un chargement réussi
function termineAffichageGPX(data) {
    document.location.href = 'vSelectGPX.php?appli=' + GetParam('appli') + '&GPX=' + data + '&modeSimplifie=' + modeSimplifie;
}

//Fonction appelée sur le click du bouton "Charger"
function soumettreGPX() {
    templateValidation('../Modeles/Json/jFichierGPX.php?appli=' + GetParam('appli'), Ext.getCmp('statusbarGPX'),
        formulaireGPX, termineAffichageGPX);
}

//Initialisation du formulaire
function initialiseformulaireGPX() {
    fenetreformulaireGPX.show();
    formulaireGPX.form.reset();
    Ext.getCmp('statusbarGPX').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaireGPX.getEl().unmask();  // déblocage de la saisie sur le formulaire
}

//Importation GPX
function importeGPX() {
    initialiseformulaireGPX();
}
