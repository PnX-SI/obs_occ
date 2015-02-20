//Variables globales utilisées pour gérer le formulaire
var formulaire, fenetreFormulaire, comboTitre, comboRole, comboCreateur, comboSpecialite;

Ext.onReady(function() {
    //Combo d'auto-complétion "titre"
    comboTitre = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=md.enum_titre',
            fields: ['val']
        }),
        id: 'titre',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Titre'
    });
    //Combo d'auto-complétion "créateur"
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
        fieldLabel: 'Numérisateur de la personne',
        allowBlank: false,
        blankText: "Veuillez sélectionner le numérisateur de la personne !",
        forceSelection: true
    });
    //Combo d'auto-complétion "rôle"
    comboRole = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=md.enum_role',
            fields: ['val']
        }),
        id: 'role',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'rôle'
    });
    //Combo d'auto-complétion "rôle"
    comboSpecialite = new Ext.form.ComboBox({
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jListEnum.php?typeEnum=md.enum_specialite',
            fields: ['val']
        }),
        id: 'specialite',
        emptyText: 'Sélectionnez',
        triggerAction: 'all',
        mode: 'local',
        forceSelection: true,
        displayField: 'val',
        valueField: 'val',
        fieldLabel: 'Specialité'
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
                id: 'id_personne'
           }, {
                xtype: 'hidden',
                id: 'createur'
           }, {
                anchor: '100%',
                html: '<div id="titre_formulaire">Détail des informations</div>'
           }, comboTitre
               ,  {
                xtype: 'textfield',
                fieldLabel: 'Prénom',
                id: 'prenom',
                allowBlank: false,
                maxLength: 20
            }, {
                xtype: 'textfield',
                fieldLabel: 'Nom',
                id: 'nom',
                allowBlank: false,
                maxLength: 50
            }, {
                xtype: 'textfield',
                fieldLabel: 'Email',
                id: 'email',
                maxLength: 100
            }, {
                xtype: 'textarea',
                fieldLabel: 'Adresse',
                id: 'adresse_1',
                maxLength: 60
            }, {
                xtype: 'textfield',
                fieldLabel: 'Code postal',
                id: 'code_postal',
                maxLength: 6
            },{
                xtype: 'textfield',
                fieldLabel: 'Ville',
                id: 'ville',
                maxLength: 40
            },{
                xtype: 'textfield',
                fieldLabel: 'Pays',
                id: 'pays',
                maxLength: 20
            },{
                xtype: 'textfield',
                fieldLabel: 'Tél pro',
                id: 'tel_pro',
                maxLength: 14
            },{
                xtype: 'textfield',
                fieldLabel: 'Portable',
                id: 'portable',
                maxLength: 14
            },{
                xtype: 'textfield',
                fieldLabel: 'Fax',
                id: 'fax',
                maxLength: 14
            },{
                xtype: 'textfield',
                fieldLabel: 'Remarque',
                id: 'remarque',
                maxLength: 255
            }, {
                xtype: 'datefield',
                format: 'd/m/Y',
                fieldLabel: 'Date de mise à jour',
                id: 'date_maj'
            },
                comboRole,
                comboSpecialite,
                comboCreateur
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
        title: 'Saisie des personnes',
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
});

//Affichage en mode ajout
function ajoute() {
    initialiseFormulaire();
    //requête pour récupérer l'id, le nom et le prénom du créateur
    Ext.getCmp('action').setValue('Ajouter');
    Ext.getCmp('createur').setValue(numerisateur);
    Ext.getCmp('role').setValue('observ');
    comboCreateur.setValue(numerisat);
    finaliseFormulaire();
    Ext.getCmp('email').setReadOnly(false);
    Ext.getCmp('prenom').setReadOnly(false);
    Ext.getCmp('nom').setReadOnly(false);
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
    if (comboTitre.getRawValue() == '') {
        comboTitre.setRawValue('');
    }
    if (comboRole.getRawValue() == '') {
        comboRole.setRawValue('');
    }
    if (comboSpecialite.getRawValue() == '') {
        comboSpecialite.setRawValue('');
    }
    var createur = Ext.getCmp('creat').value;
    if (Ext.getCmp('creat').getRawValue() != createur) {
        Ext.getCmp('createur').setValue(createur); // traitement spécifique du contrôle caché
    }
    templateValidation('../Controleurs/Gestion/GestPersonnes.php', Ext.getCmp('statusbar'),
        formulaire, termineAffichage);
}

//Initialisation du formulaire
function initialiseFormulaire() {
    fenetreFormulaire.show();
    formulaire.form.reset();
    Ext.getCmp('statusbar').clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
    formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
    Ext.getCmp('prenom').focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
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
    comboRole.setReadOnly((droit != 'admin'));
    comboSpecialite.setReadOnly((droit != 'admin'));
    Ext.getCmp('email').setReadOnly((droit != 'admin'));
    Ext.getCmp('prenom').setReadOnly((droit != 'admin'));
    Ext.getCmp('nom').setReadOnly((droit != 'admin'));
    // date de mise à jour jamais modifiable (gérée par le système)
    Ext.getCmp('date_maj').setReadOnly(true);
    // masquage des contrôles si pas "admin" ou "expert" sauf "nom et "prenom"
    formulaire.getForm().callFieldMethod('setVisible', [((droit == 'expert') ||
        (droit == 'admin') || (Ext.getCmp('createur').getValue() == numerisateur))]);
    Ext.getCmp('prenom').show();
    Ext.getCmp('nom').show();
    fenetreFormulaire.center() ;
}
