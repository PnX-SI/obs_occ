//Variables globales utilisées pour gérer la cartogrille
var grille, fenetreCartoGrille, coucheConsultable, iImport = 0, region = CST_region,
    separateurBarreMenu = '-';

Ext.onReady(function() {
    // initialisation des listes déroulantes exhaustives
    comboPrecision.store.load();
    comboDetermination.store.load();
    comboStatutValidation.store.load();
    // écran scindé horizontalement ou verticalement selon le paramétrage par défaut
    region = GetParam('region');
    if (['north', 'west'].indexOf(region) == -1) {
        region = CST_region;
    }
    basculeEcran(region);
});

function basculeEcran(sens) {
    //Couche d'édition
    coucheConsultable = new OpenLayers.Layer.Vector('GPX', {
        styleMap: new OpenLayers.StyleMap({
            'default': {
                label: 'N°\n\n${name}',
                fontColor: 'black',
                fontSize: '14px',
                fontWeight: 'bold',
                labelAlign: 'cm',
                pointRadius: 7,
                fillOpacity: 0.4,
                strokeWidth: 3,
                strokeColor: 'black',
                fillColor: 'black'
            },
            select: {
                strokeColor: 'yellow',
                fillColor: 'yellow'
            }
        })
    });
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheConsultable]);
    //Outil de sélection des géométries
    var btnSelGeom = new OpenLayers.Control.SelectFeature(coucheConsultable, {
        title: 'Sélectionner',
        displayClass: 'olControlMultiSelectFeature',
        toggleKey: 'ctrlKey',
        multipleKey: 'ctrlKey',
        box: true
    });
    //Outil de zoom sur la sélection
    var btnZoomSel = new OpenLayers.Control.Button({
        title: 'Cadrer sur la sélection',
        trigger: zoomerSelection,
        displayClass: 'olControlZoomSelection'
    });
    //Outil de zoom sur l'étendue de la carte
    var btnZoomEmpriseCadre = new OpenLayers.Control.Button({
        title: "Recadrer sur l'étendue de la carte",
        trigger: zoomerEmpriseCadre,
        displayClass: 'olControlZoomCenter'
    });
    //Complément de la barre d'outils
    barreOutils.addControls([
        btnZoomEmpriseCadre,
        btnZoomSel,
        btnSelGeom
    ]);
    //Entrepôt des données (géométries également)
    var lecteurDonnees = new GeoExt.data.FeatureReader({
        fields: [
            {name: 'name'},
            {name: 'ele', convert: transformeEnEntier, mapping: 'ele'},
            {name: 'time'},
            {name: 'date_obs_point', convert: transformeEnDateHeure, mapping: 'time'},
            {name: 'heure_obs_point', convert: transformeEnHeure, mapping: 'time'},
            {name: 'date_obs_ligne', convert: transformeEnDateHeure, mapping: 'name'},
            {name: 'heure_obs_ligne', convert: transformeEnHeure, mapping: 'name'},
            {name: 'cmt'},
            {name: 'date_obs_point_bis', convert: transformeEnDateHeure, mapping: 'cmt'},
            {name: 'heure_obs_point_bis', convert: transformeEnHeure, mapping: 'cmt'},
            {name: 'desc'},
            {name: 'sym'}
        ]
    });
    var donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheConsultable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: CST_cheminRelatifGPX + GetParam('GPX'),
                format: new OpenLayers.Format.GPX({
                    extractRoutes: false,
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        }),
        reader: lecteurDonnees,
        sortInfo: {field: 'name'} // tri par ordre croissant des numéros de relevé GPS
    });
    //Filtres pour les recherches sur chaque colonne
    var filtres = new Ext.ux.grid.GridFilters({
        menuFilterText: 'Filtres',
        local: true,
        filters: [
            {type: 'string', dataIndex: 'name', emptyText: 'Val1||Val2||IS NULL'},
            {type: 'numeric', dataIndex: 'ele', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'time', emptyText: 'Val1||Val2||IS NULL'},
            {type: 'date', dataIndex: 'date_obs_point', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'string', dataIndex: 'heure_obs_point', emptyText: 'Val1||Val2||IS NULL'},
            {type: 'date', dataIndex: 'date_obs_ligne', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'string', dataIndex: 'heure_obs_ligne', emptyText: 'Val1||Val2||IS NULL'},
            {type: 'string', dataIndex: 'cmt', emptyText: 'Val1||Val2||IS NULL'},
            {type: 'date', dataIndex: 'date_obs_point_bis', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'string', dataIndex: 'heure_obs_point_bis', emptyText: 'Val1||Val2||IS NULL'},
            {type: 'string', dataIndex: 'desc', emptyText: 'Val1||Val2||IS NULL'},
            {type: 'string', dataIndex: 'sym', emptyText: 'Val1||Val2||IS NULL'}
        ]
    });
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'name', header: 'ID (name)'},
            {dataIndex: 'ele', header: 'Altitude (ele)'},
            {dataIndex: 'time', header: 'time'},
            {dataIndex: 'date_obs_point', header: 'Date (point)', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'heure_obs_point', header: 'Heure (point)', renderer: Ext.util.Format.dateRenderer('H:i:s')},
            {dataIndex: 'date_obs_ligne', header: 'Date (ligne)', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'heure_obs_ligne', header: 'Heure (ligne)', renderer: Ext.util.Format.dateRenderer('H:i:s')},
            {dataIndex: 'cmt', header: 'cmt'},
            {dataIndex: 'date_obs_point_bis', header: 'Date bis (point)', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'heure_obs_point_bis', header: 'Heure bis (point)', renderer: Ext.util.Format.dateRenderer('H:i:s')},
            {dataIndex: 'desc', header: 'desc'},
            {dataIndex: 'sym', header: 'sym'}
        ]
    });
    //Barre de menu
    if (modeSimplifie) {
        separateurBarreMenu = '';
    }
    var barreMenu = new Ext.Toolbar({
        region: 'north',
        autoHeight: true,
        items: [{
                text: 'Mesurer sélection',
                tooltip: 'Mesurer la sélection en cours',
                handler: function() {mesurerSelection(coucheEditable, 'mesures');},
                hidden: modeSimplifie,
                iconCls: 'measure'
            }, {
                xtype: 'label',
                id: 'mesures'
            }, 
                separateurBarreMenu,
            {
                text: 'Basculer écran',
                tooltip: "Basculer l'écran",
                handler: basculerEcran,
                hidden: modeSimplifie,
                iconCls: 'switch'
            },
                separateurBarreMenu,
            {
                text: 'Exporter grille',
                tooltip: 'Exporter la grille au format Excel',
                handler: exporterExcel,
                iconCls: 'icon_excel' 
            }, '-', {
                text: 'Importer sélection',
                tooltip: 'Importer les relevés GPS sélectionnés',
                handler: importerSelection,
                iconCls: 'propertiesImport'
            }, '-', {
                text: 'Retourner obs.',
                tooltip: 'Retourner aux observations occasionnelles',
                handler: function() {document.location.href = 'vSaisieObs.php?appli=' + GetParam('appli') + '&modeSimplifie=' + modeSimplifie;},
                iconCls: 'return'
            }, '-', {
                text: 'Se déconnecter',
                handler: deconnecter,
                iconCls: 'deconnection',
                tooltip: "Se déconnecter de l'application"
            },
        ]
    });
    //Grille des données
    grille = new Ext.grid.GridPanel({
        sm: colonneSelectionCarto,
        view: new Ext.grid.GroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "lignes" : "ligne"]})'
        }),
        id: GetParam('appli') + '_grilleGPX', // unique pour conserver la configuration de la grille
        header: false,
        ds: donneesGrille,
        cm: configCols,     
        autoScroll: true,
        region: 'center',
        plugins: [filtres, 'autosizecolumns'],
        stripeRows: true,
        trackMouseOver: false
    });    
    //Panel de la carte
    var cartePanel = new GeoExt.MapPanel({
        id: GetParam('appli') + '_cartePanelGPX', // unique pour conserver la configuration de la carte
        map: carte,
        region: sens,
        split: true,
        height: 500, // affichage en mode horizontal
        width: 600, // affichage en mode vertical
        items: [{
            xtype: 'gx_zoomslider', // barre de niveaux de zoom
            vertical: true,
            height: 100,
            y: 10
        }],
        // activation de l'outil par défaut
        listeners: {afterlayout : function() {
            barreOutils.activateControl(btnZoomSel);
        }},
        center: CST_center,
        zoom: CST_zoom
    });
    //Panel de la grille
    var grillePanel = new Ext.Panel({
        layout: 'border',
        autoheight: true,
        region: 'center',
        items: [barreMenu, grille]
    });
    //Fenêtre d'affichage
    fenetreCartoGrille = new Ext.Viewport({
        layout: 'border',
        items: [cartePanel, grillePanel]
    });
    //Chargement des données à chaque fois car fichier GPX "uploadé"
    donneesGrille.load();    
}

//Typage des données affichées pour l'export Excel
function exporterExcel() {
    var types = new Array();
    types['ele'] = Ext.data.Types.INT;
    types['date_obs_point'] = Ext.data.Types.DATE;
    types['heure_obs_point'] = Ext.data.Types.TIME;
    types['date_obs_ligne'] = Ext.data.Types.DATE;
    types['heure_obs_ligne'] = Ext.data.Types.TIME;
    types['date_obs_point_bis'] = Ext.data.Types.DATE;
    types['heure_obs_point_bis'] = Ext.data.Types.TIME;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
}

//Zoom sur les éléments sélectionnés
function zoomerSelection() {
    var selection = coucheConsultable.selectedFeatures;
    var nbSel = selection.length;
    if (nbSel > 0) {
        var fenetreZoom = new OpenLayers.Bounds();
        for (var i = 0; i < nbSel; i++) {
            if (selection[i].geometry) {
                fenetreZoom.extend(selection[i].geometry.getBounds());
            }
        }
        // si une fenêtre de zoom existe
        if (fenetreZoom.getHeight() != 0 && fenetreZoom.getWidth != 0) {
            carte.zoomToExtent(fenetreZoom); // alors zoom sur l'emprise de la sélection
        }
        else {
            var centreXY = fenetreZoom.getCenterLonLat();
            if (centreXY.lon != 0 && centreXY.lat != 0) {
                carte.moveTo(centreXY); // sinon simple recentrage de la carte
                // si seuil de zoom non atteint
                if (carte.zoom < CST_seuilZoomSelection) {
                    carte.zoomTo(CST_seuilZoomSelection); // alors zoom en complément du recentrage
                }
            }
        }
    }
}

//Bascule de l'écran
function basculerEcran() {
    if (region == 'north') {
        region = 'west'; // écran divisé verticalement
    }
    else {
        region = 'north'; // écran divisé horizontalement
    }
    document.location.href = SetParam('region', region);
}

//Procédure d'attente de la saisie formulaire
function afficherBilan(totalSelection) {
    var texteDebut = ' relevé GPS importé sur ';
    var texteMilieu = " duplication d'observation soit ";
    var texteFin = ' enregistrement au total'
    if (nbImport > 1) {
        texteDebut = ' relevés GPS importés sur ';
    }
    if (nbDuplicata > 1) {
        texteMilieu = " duplications d'observation soit ";
    }
    var nbEnreg = nbImport + nbDuplicata;
    if (nbEnreg > 1) {
        texteFin = ' enregistrements au total'
    }
    Ext.MessageBox.show({
        title: 'Importation réussie',
        msg: nbImport + texteDebut + totalSelection +
            ' et ' + nbDuplicata + texteMilieu +
            nbEnreg + texteFin,
        buttons: Ext.MessageBox.OK,
        icon: Ext.MessageBox.INFO
    });
}
function attendreSaisie() {
    Ext.Ajax.request({
        url: '../Modeles/Json/jVarSession.php?appli=' + GetParam('appli'),
        params: {
            varSession: 'saisieEnCours'
        },
        callback: function(options, success, response) {
            if (success) {
                var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                if (obj.success) {
                    switch (obj.data) {
                        case 'NON':
                            Ext.Ajax.request({
                                url: '../Controleurs/Gestion/GestSession.php?appli=' + GetParam('appli'),
                                params: {
                                    action: 'AttendreSaisie',
                                    saisieEnCours: 'OUI'
                                },
                                callback: function() {
                                    var selection = coucheConsultable.selectedFeatures;
                                    if (iImport < selection.length) {
                                        var feature = selection[iImport];
                                        // ajout en mode importation
                                        ajoute(feature.geometry.clone().transform(carte.getProjectionObject(), // clônage car pas de rechargement ensuite
                                            new OpenLayers.Projection('EPSG:4326')), feature.attributes);
                                        // incrémentation de l'indice déclaré nécessairement en variable globale
                                        iImport++;
                                        // boucle de saisie par requêtage permanent AJAX
                                        attendreSaisie();
                                    }
                                    else {
                                        afficherBilan(selection.length);
                                    }
                                }
                            });
                            break;
                        case 'OUI':
                            attendreSaisie();
                            break;
                        case 'STOP':
                            afficherBilan(coucheConsultable.selectedFeatures.length);
                            break;
                    }
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

//Importation des relevés GPS sélectionnés
function importerSelection() {
    var selection = coucheConsultable.selectedFeatures;
    if (selection.length > 0) {
        Ext.Ajax.request({
            url: '../Controleurs/Gestion/GestSession.php?appli=' + GetParam('appli'),
            params: {
                action: 'AttendreSaisie',
                saisieEnCours: 'OUI'
            },
            callback: function() {
                // initialisation des compteurs
                nbImport = 0;
                nbDuplicata = 0;
                iImport = 0;
                var feature = selection[iImport];
                // 1° "ajoute" en mode importation obligatoirement en dehors de "attendreSaisie"
                ajoute(feature.geometry.clone().transform(carte.getProjectionObject(), // clônage car pas de rechargement ensuite
                    new OpenLayers.Projection('EPSG:4326')), feature.attributes);
                // incrémentation de l'indice pour le 2° "ajoute" dans "attendreSaisie"
                iImport++;
                // boucle de saisie par requêtage permanent AJAX
                attendreSaisie();
            }
        });
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner au moins un relevé GPS').setIcon(Ext.MessageBox.WARNING);
    }
}

//Zoom sur l'emprise de la carte
function zoomerEmpriseCadre() {
    // cadrage sur l'emprise paramétrée par défaut puis zoom d'un niveau
    carte.zoomToExtent(empriseCadre);
    carte.zoomIn();
}