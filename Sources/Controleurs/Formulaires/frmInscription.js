//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire, comboTitre;

Ext.onReady(function() {
    if (GetParam('action') == 'activer') {
        activerCompte()
    }   
    else {
        if (GetParam('action') == 'reinitialiserMdp') {
            reinitialiserMdp()
        }
        else {
            //Combo d'auto-complétion "Titre"
            comboTitre = new Ext.form.ComboBox({
                store: new Ext.data.JsonStore({
                    url: '../Modeles/Json/jListEnum.php?typeEnum=md.enum_titre',
                    fields: ['val']
                }),
                id: 'titre',
                emptyText: 'Sélectionnez',
                triggerAction: 'all',
                mode: 'local',
                forceSelection : true,
                displayField: 'val',
                valueField: 'val',
                fieldLabel: 'Titre de civilité',
                allowBlank: false,
                blankText: 'Veuillez sélectionner le titre de civilité !'
            });
            // initialisation de la liste des valeurs de la combo
            comboTitre.store.load({callback: afficheFormulaire});
        }
    }
});

function afficheFormulaire() {
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaire = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER], fn: soumettre}],
        frame: true,
        labelWidth: 170,
        labelAlign: 'right',
        defaults: {width: 270},
        labelSeparator: ' :',
        items: [comboTitre,
            {
  		xtype: 'textfield',
		fieldLabel: 'Prénom',
                id: 'prenom',
		vtypeText: 'Veuillez renseigner votre Prénom',
                allowBlank: false,
		blankText: 'Veuillez saisir votre Prénom !'
            }, {
                xtype: 'textfield',
		fieldLabel: 'Nom',
		id: 'nom',
		vtypeText: 'Veuillez renseigner votre Nom',
                allowBlank: false,
		blankText: 'Veuillez saisir votre Nom !'
            }, {
                xtype: 'textfield',
		fieldLabel: 'Email',
		id: 'email',
		vtype: 'email',
		vtypeText: 'Veuillez renseigner votre adresse email sous la forme "user@domain.com"',
                allowBlank: false,
		blankText: 'Veuillez saisir votre adresse email !'
            },{
		xtype: 'textfield',
		fieldLabel: 'Confirmation email',
		id: 'confirmationEmail',
		vtype: 'email',
		vtypeText: 'Veuillez confirmer votre adresse email sous la forme "user@domain.com"',
		allowBlank: false,
		blankText: 'Veuillez confirmer votre adresse email !'
            }
        ]
    });
    //Panel container rajoutant la barre de status
    var formulaireTotal = new Ext.Panel({
        items: formulaire,
        bbar: new Ext.ux.StatusBar({
            items: [{
                    text: "Nous contacter",
                    handler: function() {window.location = CST_urlContact},
                    iconCls: 'icon_contact',
                    hidden: !CST_urlContact
                }, '-', {
                text: 'Retourner auth.',
                tooltip: "Retourner à l'authentification",
                handler: function() {document.location.href = 'vAuthent.php';},
                iconCls: 'return'
            }, '-', {
                    text: "S'inscrire",
                    handler: soumettre,
                    iconCls: 'inscription'
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
        resizable: false,
        title: "Inscription à l'application " + CST_titreAppli,
        width: 560,
        autoHeight: true,
        constrain: true,
        items: formulaireTotal
    });
    fenetreFormulaire.show();
    Ext.getCmp('prenom').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
}

//Fonction appelée après un enregistrement réussi
function termineAffichage() {
    fenetreFormulaire.hide();
    donneesGrille.reload();
}

//Fonction appelée sur le click du bouton "Se connecter"
function soumettre() {
    if (formulaire.form.isValid()) {
        if (Ext.getCmp('confirmationEmail').getValue() == Ext.getCmp('email').getValue()) {
                // invalidation forcée des "emptyText" lors de la soumission
            if (comboTitre.getRawValue() == '') {
                comboTitre.setRawValue('');
            }
            formulaire.getEl().mask(); // application d'un masque gris sur le formulaire pour bloquer une saisie éventuelle
            Ext.getCmp('statusbar').showBusy('Connexion en cours...'); // affichage du message de chargement
            // vérification des paramètres de connexion dans la base
            Ext.Ajax.request({
                url: '../Controleurs/Gestion/GestInscriptions.php',
                params: {
                    action: 'inscrire',
                    titre: Ext.getCmp('titre').getValue(),
                    nom: Ext.getCmp('nom').getValue(),
                    prenom: Ext.getCmp('prenom').getValue(),
                    email: Ext.getCmp('email').getValue()
                },
                callback: function(options, success, response) {
                    if (success) {
                        var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                        if (obj.success) {
                            Ext.getCmp('statusbar').setStatus({
                                text: 'Opération réussie',
                                iconCls: 'x-status-valid'
                            });
                            Ext.MessageBox.show({
                                title: 'Inscription réussie',
                                fn: function() {
                                    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
                                    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
                                },
                                msg: obj.data,
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.INFO
                            });
                        }
                        else {
                            Ext.getCmp('statusbar').setStatus({
                                text: 'Opération échouée',
                                iconCls: 'x-status-error'
                            });
                            Ext.MessageBox.show({
                                title: obj.errorMessage,
                                fn: function() {
                                    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
                                    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
                                },
                                msg: obj.data,
                                buttons: Ext.MessageBox.OK,
                                icon: Ext.MessageBox.WARNING
                            });
                        }
                    }
                    else {
                        Ext.getCmp('statusbar').setStatus({
                            text: 'Erreur serveur',
                            iconCls: 'x-status-error'
                        });
                        Ext.MessageBox.show({
                            title: 'ERREUR : ' + response.statusText,
                            fn: function() {
                                Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
                                formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
                            },
                            msg: 'Code erreur ' + response.status,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.ERROR
                        });
                    }
                }
            });
        }
        else {
            Ext.MessageBox.show({
                title: "ERREUR : Confirmation d'email requise",
                fn: function() {
                    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
                    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
                },
                msg: "Veuillez-vous assurer d'avoir bien confirmé votre email !",
                buttons: Ext.MessageBox.OK,
                icon: Ext.MessageBox.ERROR
            });
        }
    }
    else {
        Ext.getCmp('statusbar').setStatus({
            clear: true, // faible attente pour être à nouveau "Prêt"
            text: 'Formulaire non valide',
            iconCls: 'x-status-error'
        });
    }
}

function reinitialiserMdp() {
    Ext.Ajax.request({
            url: '../Controleurs/Gestion/GestInscriptions.php',
            params: {
                action: 'reinitialiserMdp',
                email: GetParam('email')
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        Ext.MessageBox.show({
                            title: 'Réinitialisation de mot de passe réussie',
                            fn: function() {document.location.href = 'vAuthent.php'},
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.INFO
                        });
                    }
                    else {
                        Ext.MessageBox.show({
                            title: obj.errorMessage,
                            fn: function() {document.location.href = 'vAuthent.php'},
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.WARNING
                        });
                    }
                }
                else {
                    Ext.MessageBox.show({
                        title: 'ERREUR : ' + response.statusText,
                        fn: function() {document.location.href = 'vAuthent.php'},
                        msg: 'Code erreur ' + response.status,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            }
        });
}

function activerCompte() {
    Ext.Ajax.request({
            url: '../Controleurs/Gestion/GestInscriptions.php',
            params: {
                action: 'activer',
                titre: GetParam('titre'),
                nom: GetParam('nom'),
                prenom: GetParam('prenom'),
                email: GetParam('email')
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        Ext.MessageBox.show({
                            title: 'Activation réussie',
                            fn: function() {document.location.href = 'vAuthent.php'},
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.INFO
                        });
                    }
                    else {
                        Ext.MessageBox.show({
                            title: obj.errorMessage,
                            fn: function() {document.location.href = 'vInscription.php'},
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.WARNING
                        });
                    }
                }
                else {
                    Ext.MessageBox.show({
                        title: 'ERREUR : ' + response.statusText,
                        fn: function() {document.location.href = 'vInscription.php'},
                        msg: 'Code erreur ' + response.status,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            }
        });
}