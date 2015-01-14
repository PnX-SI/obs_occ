//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire, comboStructure;

Ext.onReady(function() {
    //Combo d'auto-complétion "société"
    comboStructure = new Ext.form.ComboBox({
        id: 'nom_structure',
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jCodesStructures.php',
            fields: ['code', 'libelle']
        }),
        emptyText: 'Sélectionnez',
        mode: 'local',
        displayField: 'libelle',
        valueField: 'code',
        fieldLabel: 'Structure par défaut',
        forceSelection : true,
        allowBlank: false,
        blankText: 'Veuillez sélectionner votre structure par défaut !'
    });
    // initialisation de la liste des valeurs de la combo
    comboStructure.store.load({
        callback: function() {
            comboStructure.setValue(recupereCookie('id_structure'));
            afficheFormulaire();
            detecterAdmin();
        }
    })
});

function afficheFormulaire() {    
    //Combo d'auto-complétion des logins
    var comboLogin = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jCodesLogin.php',
            fields: ['email']
        }),
        id: 'email',
        vtype: 'email',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'remote',
        forceSelection: true,
        displayField: 'email',
        valueField: 'email',
        fieldLabel: 'Adresse mail',
        vtypeText: 'Veuillez renseigner votre adresse mail sous la forme "user@domain.com"',
                    allowBlank: false,
        blankText: 'Veuillez saisir votre adresse mail !',
        value: recupereCookie('email'),
        enableKeyEvents: true,
        listeners: {
            change: detecterAdmin
        },
        keyup: function() {
          var requete = this.getRawValue();
          if (requete.length >= 1) { // si au moins 1 lettres
              this.store.load({ });
          }
      },
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaire = new Ext.FormPanel({
        keys: [{key: [Ext.EventObject.ENTER], fn: soumettre}],
        frame: true,
        labelWidth: 170,
        labelAlign: 'right',
        defaults: {width: 350},
        labelSeparator: ' :',
        items: [{
                xtype: 'hidden',
                id: 'id_structure'
            },
            comboLogin,
            {
		xtype: 'textfield',
		fieldLabel: 'Mot de passe',
		id: 'mot_de_passe',
		allowBlank: false,
		inputType: 'password',
		blankText: "Veuillez saisir votre mot de passe !",
                value: Base64.decode(recupereCookie('mot_de_passe')),
                enableKeyEvents: true,
                listeners: {
                    keyup: detecterAdmin
                }
            },
            comboStructure,
            {
		xtype:'checkbox',
		fieldLabel: 'Se souvenir de moi',
		id: 'save',
                checked: recupereCookie('save') == 'true'
            }, {
		xtype:'checkbox',
		fieldLabel: 'Affichage complet',
		id: 'full',
                checked: recupereCookie('full') == 'true',
                hidden: !CST_choixModeAffichage
            }
        ]
    });
    //Panel container rajoutant la barre de status
    var formulaireTotal = new Ext.Panel({
        items: formulaire,
        bbar: new Ext.ux.StatusBar({
            items: [{
                    text: 'Demander compte',
                    handler: function() {window.location = '../Vues/vDemande.php'},
                    iconCls: 'account_add'
                }, '-', {
                    id: 'boutonCreerCompte',
                    text: 'Créer compte',
                    handler: function() {window.location = '../Vues/vInscription.php'},
                    iconCls: 'group_add',
                    hidden: true
                }, '-', {
                    text: 'Renvoyer mot de passe',
                    handler: reinitialiserMdp,
                    iconCls: 'mailing_card'
                }, '-', {
                    text: 'Se connecter',
                    handler: soumettre,
                    iconCls: 'connexion'
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
        title: 'Authentification (l\'application nécessite une version récente de Firefox)',
        width: 630,
        autoHeight: true,
        constrain: true,
        items: formulaireTotal
    });
    fenetreFormulaire.show();
    Ext.getCmp('email').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
}


// vérification de l'accès au bouton de création de compte
function detecterAdmin() {
    var MotDePasse =  Ext.getCmp('mot_de_passe').getValue();
    if (CST_Cryptage) {
        MotDePasse = encryptedString(public_key, Ext.getCmp('mot_de_passe').getValue());
    }
    Ext.Ajax.request({
        url: '../Controleurs/Gestion/GestSession.php',
        params: {
            action: 'DetecterAdmin',
            email: Ext.getCmp('email').getValue(),
            // cryptage RSA du mot de passe saisi par l'utilisateur pour procéder à son authentification
            mot_de_passe: MotDePasse
        },
        callback: function(options, success, response) {
            Ext.getCmp('boutonCreerCompte').hide();
            if (success) {
                var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                if (obj.success) {
                    Ext.MessageBox.show({
                        title: 'Compte administrateur détecté',
                        fn: function() {
                            Ext.getCmp('boutonCreerCompte').show();
                        },
                        msg: obj.data,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.INFO
                    });
                }
            }
        }
    });
}

//Fonction appelée sur le click du bouton "Se connecter"
function soumettre() {
    if (formulaire.form.isValid()) {
        var id_structure = Ext.getCmp('nom_structure').value;
        if (Ext.getCmp('nom_structure').getRawValue() != id_structure) {
            Ext.getCmp('id_structure').setValue(id_structure); // traitement spécifique du contrôle caché
        }
        formulaire.getEl().mask(); // application d'un masque gris sur le formulaire pour bloquer une saisie éventuelle
        Ext.getCmp('statusbar').showBusy('Connexion en cours...'); // affichage du message de chargement
        // vérification des paramètres de connexion dans la base
        var MotDePasse =  Ext.getCmp('mot_de_passe').getValue();
        if (CST_Cryptage) {
            MotDePasse = encryptedString(public_key, Ext.getCmp('mot_de_passe').getValue());
        }
        Ext.Ajax.request({
            url: '../Controleurs/Gestion/GestSession.php',
            params: {
                action: 'Authentifier',
                email: Ext.getCmp('email').getValue(),
                id_structure: Ext.getCmp('id_structure').getValue(),
                nom_structure: Ext.getCmp('nom_structure').getRawValue(),
                // cryptage RSA du mot de passe saisi par l'utilisateur pour procéder à son authentification
                mot_de_passe: MotDePasse
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        if (Ext.getCmp('save').checked) {
                            creeCookie('email', Ext.getCmp('email').getValue(), 365);
                            creeCookie('mot_de_passe', Base64.encode(Ext.getCmp('mot_de_passe').getValue()), 365);
                            creeCookie('save', Ext.getCmp('save').getValue(), 365);
                            creeCookie('full', Ext.getCmp('full').getValue(), 365);
                            creeCookie('id_structure', Ext.getCmp('id_structure').getValue(), 365);
                        }
                        else {
                            supprimeCookie('email');
                            supprimeCookie('mot_de_passe');
                            supprimeCookie('save');
                            supprimeCookie('full');
                            supprimeCookie('id_structure');
                        }
                        Ext.getCmp('statusbar').setStatus({
                            text: 'Opération réussie',
                            iconCls: 'x-status-valid'
                        });
                        Ext.MessageBox.show({
                            title: 'Authentification réussie',
                            fn: function() {                                
                                Ext.getCmp('statusbar').showBusy('Redirection en cours...'); // affichage du message de chargement
                                if (CST_choixModeAffichage) {
                                    document.location.href = 'vSaisieObs.php?modeSimplifie=' + !Ext.getCmp('full').getValue();
                                }
                                else {
                                    document.location.href = 'vSaisieObs.php';
                                }
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
        Ext.getCmp('statusbar').setStatus({
            clear: true, // faible attente pour être à nouveau "Prêt"
            text: 'Formulaire non valide',
            iconCls: 'x-status-error'
        });
    }
}

function reinitialiserMdp() {
    if (Ext.getCmp('email').isValid()) {
        document.location.href = 'vInscription.php?action=reinitialiserMdp&email='+ Ext.getCmp('email').getValue();
    }
    else {
        Ext.MessageBox.alert('Attention', Ext.getCmp('email').vtypeText).setIcon(Ext.MessageBox.WARNING);
    }
}