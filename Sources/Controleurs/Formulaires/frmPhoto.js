//Variables globales utilisées pour gérer le formulairePhoto
var formulairePhoto, fenetreformulairePhoto;

Ext.onReady(function() {
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulairePhoto = new Ext.FormPanel({
        fileUpload: true,
        frame: true,
        labelWidth: 130,
        labelAlign: 'right',
        defaults: {width: 230},
        labelSeparator: ' :',
        items: [{
                xtype: 'hidden',
                id: 'CST_cheminRelatifPhoto',
                value: CST_cheminRelatifPhoto
           }, {
                xtype: 'hidden',
                id: 'tampon_url_photo'
           }, {
                xtype: 'textfield',
                id: 'tampon_nom_photo',
                fieldLabel: 'Nom de la photo',
                readOnly: true
            }, {
                xtype: 'image',
                id: 'img_photo',
                width: 400,
                height: 300
            }, {
                xtype: 'textarea',
                id: 'tampon_commentaire_photo',
                height: 95,
                fieldLabel: 'Commentaires',
                maxLength: 254
            },
                new Ext.ux.form.FileUploadField({
                    id: 'fichierLocalPhoto',
                    buttonText: 'Parcourir...',
                    fieldLabel: 'Photo à importer',
                    emptyText: 'Sélectionner un fichier image',
                    allowBlank: false,
                    blankText: 'Veuillez sélectionner un fichier image !',
                    regex: /\.jpg|png|jpeg|gif|bmp/i,
                    regexText: "Veuillez sélectionner un fichier avec l'extension JPG, JPEG, PNG, GIF ou BMP"
                })
        ]
    });
    //Panel container rajoutant la barre de status
    var formulaireTotalPhoto = new Ext.Panel({
        items: formulairePhoto,
        bbar: new Ext.ux.StatusBar({
            items: [{
                    id: 'boutonPhotoPrecedente',
                    text: 'Précédent',
                    handler: afficherPhotoPrecedente,
                    iconCls: 'precedent',
                    tooltip: 'Afficher la photo précédente'
                }, {
                    id: 'boutonEffacerPhoto',
                    text: 'Effacer',
                    handler: function() {
                        formulairePhoto.form.reset();
                        Ext.getCmp('img_photo').setSrc('');
                    },
                    iconCls: 'erase'
                }, '-', {
                    id: 'boutonImporterPhoto',
                    text: 'Importer',
                    handler: soumettrePhoto,
                    iconCls: 'import_IMG'
                }, '-', {
                    id: 'boutonEnregistrerPhoto',
                    text: 'Enregistrer',
                    handler: function() {
                        Ext.getCmp('url_photo').setValue(Ext.getCmp('tampon_url_photo').value);
                        Ext.getCmp('nom_photo').setValue(Ext.getCmp('tampon_nom_photo').value);
                        Ext.getCmp('commentaire_photo').setValue(Ext.getCmp('tampon_commentaire_photo').getValue());
                        Ext.getCmp('boutonInfoPhoto').setTooltip(Ext.getCmp('tampon_commentaire_photo').getValue());
                        fenetreformulairePhoto.hide();
                    },
                    iconCls: 'checked'
                }, '-', {
                    id: 'boutonAnnulerPhoto',
                    text: 'Annuler',
                    handler: function() {fenetreformulairePhoto.hide();},
                    iconCls: 'cancel'
                }, {
                    id: 'boutonPhotoSuivante',
                    text: 'Suivant',
                    handler: afficherPhotoSuivante,
                    iconCls: 'suivant',
                    tooltip: 'Afficher la photo suivante'
                }
            ],
            id: 'statusbarPhoto',
            defaultText: 'Prêt'
        })
    });
    //Fenêtre container
    fenetreformulairePhoto = new Ext.Window({
        modal: true,
        resizable: false,
        width: 430,
        autoHeight: true,
        constrain: true,
        items: formulaireTotalPhoto,
        close: function () {
            // si le formulaire est en mode consultation
            if (Ext.getCmp('boutonImporterPhoto').hidden) {
                Ext.getCmp('boutonAnnulerPhoto').handler();
            }
            else {
                Ext.MessageBox.alert('Information', 'Veuillez utiliser les boutons Enregistrer/Annuler pour fermer ce formulaire');
            }
        }
    });
});

//Fonction appelée après un chargement réussi
function termineAffichagePhoto(data) {
    Ext.getCmp('tampon_url_photo').setValue(data);
    Ext.getCmp('tampon_nom_photo').setValue(nomPhoto(data));
    Ext.getCmp('img_photo').setSrc(CST_cheminRelatifPhoto + data);
    Ext.getCmp('statusbarPhoto').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulairePhoto.getEl().unmask();
}

//Fonction appelée sur le click du bouton "Charger"
function soumettrePhoto() {
    templateValidation('../Modeles/Json/jFichierPhoto.php?appli=' + GetParam('appli'), Ext.getCmp('statusbarPhoto'),
        formulairePhoto, termineAffichagePhoto);
}

//Initialisation du formulaire
function initialiseformulairePhoto() {
    fenetreformulairePhoto.show();
    formulairePhoto.form.reset();
    Ext.getCmp('statusbarPhoto').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulairePhoto.getEl().unmask();  // déblocage de la saisie sur le formulaire
    Ext.getCmp('tampon_url_photo').setValue(Ext.getCmp('url_photo').value);
    Ext.getCmp('tampon_nom_photo').setValue(Ext.getCmp('nom_photo').value);
    Ext.getCmp('tampon_commentaire_photo').setValue(Ext.getCmp('commentaire_photo').value);
    if (Ext.getCmp('url_photo').value) {
        Ext.getCmp('img_photo').setSrc(CST_cheminRelatifPhoto + Ext.getCmp('url_photo').value);
    }
    else {
        Ext.getCmp('img_photo').setSrc('')
    }
    Ext.getCmp('tampon_commentaire_photo').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
}

//Importation photo
function importePhoto() {
    initialiseformulairePhoto();
    Ext.getCmp('boutonImporterPhoto').show();
    Ext.getCmp('boutonEffacerPhoto').show();
    Ext.getCmp('boutonEnregistrerPhoto').show();
    Ext.getCmp('boutonAnnulerPhoto').show();
    Ext.getCmp('fichierLocalPhoto').show();
    Ext.getCmp('boutonPhotoPrecedente').hide();
    Ext.getCmp('boutonPhotoSuivante').hide();
    Ext.getCmp('tampon_commentaire_photo').setReadOnly(false);
    fenetreformulairePhoto.setTitle('Chargement - fichier photo');
}

//Affichage photo
function affichePhoto() {
    fenetreFormulaire.hide(); // masquage du formulaire de saisie suite à l'appel de la méthode "modifier"
    initialiseformulairePhoto(); // affichage du formulaire photo
    // gestion du statut des boutons de navigation
    Ext.getCmp('boutonPhotoPrecedente').setDisabled(!grille.selModel.hasPrevious());
    Ext.getCmp('boutonPhotoSuivante').setDisabled(!grille.selModel.hasNext());
    Ext.getCmp('boutonImporterPhoto').hide();
    Ext.getCmp('boutonEffacerPhoto').hide();
    Ext.getCmp('boutonEnregistrerPhoto').hide();
    Ext.getCmp('boutonAnnulerPhoto').hide();
    Ext.getCmp('fichierLocalPhoto').hide();
    Ext.getCmp('boutonPhotoPrecedente').show();
    Ext.getCmp('boutonPhotoSuivante').show();
    Ext.getCmp('tampon_commentaire_photo').setReadOnly(true);
    fenetreformulairePhoto.setTitle('Visualisation - fichier photo');
}

//Fonction d'affichage de la photo précédente dans la grille
function afficherPhotoPrecedente() {
    if (grille.selModel.selectPrevious()) {
        afficherPhoto();
    }
}

//Fonction d'affichage de la photo suivante dans la grille
function afficherPhotoSuivante() {
    if (grille.selModel.selectNext()) {
        afficherPhoto();
    }
}