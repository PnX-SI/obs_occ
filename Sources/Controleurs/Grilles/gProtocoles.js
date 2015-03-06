//Variables globales utilisées pour gérer la grille
var donneesGrille, grille, fenetreGrille, barrePaginat;

Ext.onReady(function() {
    //Entrepôt des données
    var lecteurDonnees = new Ext.data.JsonReader({
        idProperty: 'id_protocole', // identifiant pour conserver la sélection
        totalProperty: 'total',
        root: 'data',
        fields: [{name: 'id_protocole'},
            {name: 'libelle'},
            {name: 'resume'}        
        ]
    });
    donneesGrille = new Ext.data.GroupingStore({
        proxy: new Ext.data.HttpProxy({url: '../Modeles/Json/jProtocoles.php?appli=' + GetParam('appli')}),
        reader: lecteurDonnees,
        remoteSort: true,
        remoteGroup: true,
        sortInfo: {field: 'id_protocole', direction: 'DESC'} // tri par ordre décroissant de création
    });
    //Filtres pour les recherches sur chaque colonne
    var filtres = new Ext.ux.grid.GridFilters({
        menuFilterText: 'Filtres',
        filters: [{type: 'numeric', dataIndex: 'id_protocole', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'libelle', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'resume', emptyText: 'Ex. : Val1||Val2||Val3'}
        ]
    });
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelection, // en premier obligatoirement
            {dataIndex: 'id_protocole', header: 'id_protocole', hidden: true},
            {dataIndex: 'libelle', header: 'Nom'},
            {dataIndex: 'resume', header: 'Résumé'}            
        ]
    });
    //Barre de menu
    var barreMenu = new Ext.Toolbar({
        region: 'north',
        autoHeight: true,
        items: [{
                text: 'Ajouter',
                tooltip: 'Ajouter un nouveau protocole',
                handler: ajouter,
                iconCls: 'add'
            }, '-', {
                text: 'Modifier',
                tooltip: 'Modifier le protocole',
                handler: modifier,
                iconCls: 'cog_edit'
            }, '-', {
                text: 'Supprimer',
                tooltip: 'Supprimer le protocole',
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
        id: GetParam('appli') + '_grilleProtocoles', // unique pour conserver la configuration de la grille
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
                handler: function() {document.location.href = 'vSaisiePersonnes.php?appli=' + GetParam('appli');},
                text: 'Observateurs',
                iconCls: 'portrait',
                tooltip: 'Gérer les observateurs'
            }, {
                handler: function() {document.location.href = 'vSaisieStructures.php?appli=' + GetParam('appli');},
                text: 'Structures',
                iconCls: 'maison',
                tooltip: 'Gérer les structures'
            }, '-', {
                handler: function() {document.location.href = 'vSaisieEtudes.php?appli=' + GetParam('appli');},
                text: 'Etudes',
                iconCls: 'study',
                tooltip: 'Gérer les études'
            }, '-', {
                text: 'Retour obs.',
                tooltip: 'Retourner aux observations occasionnelles',
                handler: function() {document.location.href = 'vSaisieObs.php?appli=' + GetParam('appli');},
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
        title: 'Gestion des protocoles',
        close: function() {document.location.href = 'vSaisieObs.php?appli=' + GetParam('appli');},
        items: grillePanel
        });
    //Chargement des données selon cookies
    if (Ext.util.Cookies.get('ys-0-' + GetParam('appli') + '_grilleProtocoles') == null) {
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
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner un protocole et un seul').setIcon(Ext.MessageBox.WARNING);
    }
}

//Suppression
function supprimer() {
    var nbSuppr = grille.selModel.getCount();
    if (nbSuppr > 0) {
        if (nbSuppr == 1) {
            Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir supprimer le protocole sélectionné ?", supprime);
        }
        else {
            Ext.MessageBox.confirm('Confirmation', 'Etes-vous sûr de vouloir supprimer les ' + nbSuppr + ' protocoles sélectionnés ?', supprime);
        }
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner au moins un protocole').setIcon(Ext.MessageBox.WARNING);
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
                url: '../Controleurs/Gestion/GestProtocoles.php?appli=' + GetParam('appli'),
                params: {
                    action: 'Supprimer',
                    id_protocole: grille.selModel.getSelected().data['id_protocole']
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
            var listId = selection[0].data['id_protocole'];
            for (var i = 1; i < nbSuppr; i++) {
                listId += ', ' + selection[i].data['id_protocole'];
            }
            Ext.Ajax.request({
                url: '../Controleurs/Gestion/GestProtocoles.php?appli=' + GetParam('appli'),
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
    types['id_protocole'] = Ext.data.Types.INT;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
}

//Filtrage sur les éléments sélectionnés
function filtrerSelection() {
    var nbSel = grille.selModel.getCount();
    if (nbSel > 0) {
        var filtreSel = ' AND id_protocole';
        if (nbSel == 1) {
            filtreSel += ' = ' + grille.selModel.getSelected().data['id_protocole'];
        }
        else {
            var selection = grille.selModel.getSelections();
            filtreSel += ' IN (' + selection[0].data['id_protocole'];
            for (var i = 1; i < nbSel; i++) {
                filtreSel += ', ' + selection[i].data['id_protocole'];
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
        idSelection[i] = selection[i].data['id_protocole'];
    }
}

//Restauration des éléments sauvegardés en mémoire
function restaurerSelection() {
    grille.selModel.selectAll();
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        if (idSelection.indexOf(selection[i].data['id_protocole']) == -1) {
           grille.selModel.deselectRow(i);
        }
    }
}
