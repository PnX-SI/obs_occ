//Variables globales utilisées pour gérer la grille
var donneesGrille, grille, fenetreGrille, barrePaginat;

Ext.onReady(function() {
    //Entrepôt des données
    var lecteurDonnees = new Ext.data.JsonReader({
        idProperty: 'id_etude', // identifiant pour conserver la sélection
        totalProperty: 'total',
        root: 'data',
        fields: [{name: 'id_etude'},
            {name: 'nom_etude'},
            {name: 'date_debut'},
            {name: 'date_fin'},
            {name: 'cahier_des_charges'},
            {name: 'description'},
            {name: 'lien_rapport_final'}
        ]
    });
    donneesGrille = new Ext.data.GroupingStore({
        proxy: new Ext.data.HttpProxy({url: '../Modeles/Json/jEtudes.php'}),
        reader: lecteurDonnees,
        remoteSort: true,
        remoteGroup: true,
        sortInfo: {field: 'id_etude', direction: 'DESC'} // tri par ordre décroissant de création
    });
    //Filtres pour les recherches sur chaque colonne
    var filtres = new Ext.ux.grid.GridFilters({
        menuFilterText: 'Filtres',
        filters: [{type: 'numeric', dataIndex: 'id_etude', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'nom_etude', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'date', dataIndex: 'date_debut', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'date', dataIndex: 'date_fin', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'string', dataIndex: 'cahier_des_charges', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'description', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'lien_rapport_final', emptyText: 'Ex. : Val1||Val2||Val3'}
        ]
    });
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelection, // en premier obligatoirement
            {dataIndex: 'id_etude', header: 'id_etude', hidden: true},
            {dataIndex: 'nom_etude', header: 'Nom'},
            {dataIndex: 'date_debut', header: 'Début', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'date_fin', header: 'Fin', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'cahier_des_charges', header: 'CDC'},
            {dataIndex: 'description', header: 'Description'},
            {dataIndex: 'lien_rapport_final', header: 'Lien'}
        ]
    });
    //Barre de menu
    var barreMenu = new Ext.Toolbar({
        region: 'north',
        autoHeight: true,
        items: [{
                text: 'Ajouter',
                tooltip: 'Ajouter une nouvelle étude',
                handler: ajouter,
                iconCls: 'add'
            }, '-', {
                text: 'Modifier',
                tooltip: "Modifier l'étude sélectionnée",
                handler: modifier,
                iconCls: 'cog_edit'
            }, '-', {
                text: 'Supprimer',
                tooltip: "Supprimer l'étude sélectionnée",
                handler: supprimer,
                iconCls: 'delete'
            }, '-', {
                text: 'Exporter grille',
                tooltip: 'Exporter la grille au format Excel',
                handler: exporterExcel,
                iconCls: 'icon_excel'
            }, '-', {
                text: 'Filtrer sélection',
                tooltip: 'Filtrer sur la sélection ("Actualiser la page" pour annuler)',
                handler: filtrerSelection,
                iconCls: 'filter_selected'
            }, '-', {
                text: 'Mémoriser sélection',
                tooltip: 'Mémoriser la sélection en cours',
                handler: sauverSelection,
                iconCls: 'save_selected'
            }, '-', {
                text: 'Appliquer sélection',
                tooltip: 'Appliquer la sélection en mémoire',
                handler: restaurerSelection,
                iconCls: 'apply_selected'
            }
        ]
    });
    //Grille des données
    grille = new Ext.grid.GridPanel({
        sm: colonneSelection,
        view: new Ext.grid.GroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "lignes" : "ligne"]})'
        }),
        id: CST_appli + '_grilleEtudes', // unique pour conserver la configuration de la grille
        header: false,
        ds: donneesGrille,
        cm: configCols,
        autoScroll: true,
        region: 'center',
        plugins: [filtres, 'autosizecolumns'],
        stripeRows: true,
        trackMouseOver: false,
        listeners: {rowdblclick: modifier}
    });
    //Barre de pagination
    barrePaginat = new Ext.PagingToolbar({
        region: 'south',
        autoHeight: true,
        store: donneesGrille,
        displayInfo: true,
        plugins: [filtres, new Ext.ux.grid.PageSizer()],
        items: ['-', {
                text: 'Se déconnecter',
                handler: deconnecter,
                iconCls: 'deconnection',
                tooltip: "Se déconnecter de l'application"
            }, '-', {
                handler: function() {document.location.href = 'vSaisiePersonnes.php';},
                text: 'Observateurs',
                iconCls: 'portrait',
                tooltip: 'Gérer les observateurs'
            }, {
                handler: function() {document.location.href = 'vSaisieStructures.php';},
                text: 'Structures',
                iconCls: 'maison',
                tooltip: 'Gérer les structures'
            }, '-', {
                handler: function() {document.location.href = 'vSaisieProtocoles.php';},
                text: 'Protocoles',
                iconCls: 'workflow',
                tooltip: 'Gérer les protocoles'
            }, '-', {
                text: 'Retour obs.',
                tooltip: 'Retourner aux observations occasionnelles',
                handler: function() {document.location.href = 'vSaisieObs.php';},
                iconCls: 'return'
            }
        ]
    });
    //Panel de la grille
    var grillePanel = new Ext.Panel({
        layout: 'border',
        autoheight: true,
        region: 'center',
        items: [barreMenu, grille, barrePaginat]
    });
    //Fenêtre conteneur
    fenetreGrille = new Ext.Window({
        maximized: true,
        layout: 'border',
        title: 'Gestion des études',
        close: function() {document.location.href = 'vSaisieObs.php';},
        items: grillePanel
        });
    //Chargement des données selon cookies
    if (Ext.util.Cookies.get('ys-grilleEtudes') == null) {
        donneesGrille.load();
    }
    //Affichage de la fenêtre au chargement de la page
    fenetreGrille.show();
});

//Ajout
function ajouter() {
    ajoute();
}

//Modification
function modifier() {
    if (grille.selModel.getCount() == 1) {
        modifie();
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner une étude et une seule').setIcon(Ext.MessageBox.WARNING);
    }
}

//Suppression
function supprimer() {
    var nbSuppr = grille.selModel.getCount();
    if (nbSuppr > 0) {
        if (nbSuppr == 1) {
            Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir supprimer l'étude sélectionnée ?", supprime);
        }
        else {
            Ext.MessageBox.confirm('Confirmation', 'Etes-vous sûr de vouloir supprimer les ' + nbSuppr + ' études sélectionnées ?', supprime);
        }
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner au moins une étude').setIcon(Ext.MessageBox.WARNING);
    }
}
function verifiePageCourante() {
    var cptTotal  = donneesGrille.getTotalCount();
    var pageActive = Math.ceil((barrePaginat.cursor + barrePaginat.pageSize) / barrePaginat.pageSize);
    var nbPages =  cptTotal < barrePaginat.pageSize ? 1 : Math.ceil(cptTotal / barrePaginat.pageSize)
    if (pageActive > nbPages) { // gestion du cas particulier de la suppression de tous les éléments de la dernière page
        barrePaginat.moveLast();
    }
}
function rafraichieAffichage() {
    donneesGrille.reload({callback: verifiePageCourante}); // correction du bug d'affichage de la barre de pagination
}
function supprime(btn) {
    if (btn == 'yes') {
        var nbSuppr = grille.selModel.getCount();
        if (nbSuppr == 1) {
            Ext.Ajax.request({
                url: '../Controleurs/Gestion/GestEtudes.php',
                params: {
                    action: 'Supprimer',
                    id_etude: grille.selModel.getSelected().data['id_etude']
                },
                callback: function(options, success, response) {
                    if (success) {
                        var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                        if (obj.success) {
                            rafraichieAffichage();
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
            var selection = grille.selModel.getSelections();
            var listId = selection[0].data['id_etude'];
            for (var i = 1; i < nbSuppr; i++) {
                listId += ', ' + selection[i].data['id_etude'];
            }
            Ext.Ajax.request({
                url: '../Controleurs/Gestion/GestEtudes.php',
                params: {
                    action: 'SupprimerListeId',
                    listId: listId
                },
                callback: function(options, success, response) {
                    if (success) {
                        var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                        if (obj.success) {
                            rafraichieAffichage();
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
    }
}

//Typage des données affichées pour l'export Excel
function exporterExcel() {
    var types = new Array();
    types['id_etude'] = Ext.data.Types.INT;
    types['date_debut'] = Ext.data.Types.DATE;
    types['date_fin'] = Ext.data.Types.DATE;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
}

//Filtrage sur les éléments sélectionnés
function filtrerSelection() {
    var nbSel = grille.selModel.getCount();
    if (nbSel > 0) {
        var filtreSel = ' AND id_etude';
        if (nbSel == 1) {
            filtreSel += ' = ' + grille.selModel.getSelected().data['id_etude'];
        }
        else {
            var selection = grille.selModel.getSelections();
            filtreSel += ' IN (' + selection[0].data['id_etude'];
            for (var i = 1; i < nbSel; i++) {
                filtreSel += ', ' + selection[i].data['id_etude'];
            }
            filtreSel += ')';
        }
        donneesGrille.reload({
            params: {
                filtreSel: filtreSel,
                start: 0,
                limit: nbSel
            }
        });
    }
}

//Sauvegarde des éléments sélectionnés en mémoire
function sauverSelection() {
    idSelection = [];
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        idSelection[i] = selection[i].data['id_etude'];
    }
}

//Restauration des éléments sauvegardés en mémoire
function restaurerSelection() {
    grille.selModel.selectAll();
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        if (idSelection.indexOf(selection[i].data['id_etude']) == -1) {
           grille.selModel.deselectRow(i);
        }
    }
}
