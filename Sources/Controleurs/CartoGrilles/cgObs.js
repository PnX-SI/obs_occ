//Variables globales utilisées pour gérer la cartogrille
var donneesGrille, grille, fenetreCartoGrille, barrePaginat, coucheEditable, idSelection = new Array(),
    region = CST_region, comboValidationEnMasse, filtreEmpriseActif = false, filtreSelActif = false,
    separateurBarreMenu = '-', separateurBarrePaginat = '-';

Ext.onReady(function() {
    // raccourci vers le formulaire de recherche
    new Ext.KeyMap(document, {
        key: '\ ',
        ctrl: true,
        fn: initialiseFormulaireRecherche
    });
    // initialisation des valeurs pour les listes exhaustives (combos et filtres de type liste)
    comboPrecision.store.load({
        callback: function() {
            comboDetermination.store.load({
                callback: function() {
                    comboStatutValidation.store.load({
                        callback: function() {
                            comboValidationEnMasse = comboStatutValidation.cloneConfig({
                                emptyText: 'Valider en masse',
                                width: 110,
                                readOnly: comboStatutValidation.readOnly,
                                hidden: comboStatutValidation.readOnly
                            });
                            // écran scindé horizontalement ou verticalement selon le paramétrage par défaut
                            region = GetParam('region');
                            if (['north', 'west'].indexOf(region) == -1) {
                                region = CST_region;
                            }
                            basculeEcran(region);
                        }
                    });
                }
            });
        }
    });
});

function basculeEcran(sens) {
    //Légende
    var regles = [
        new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'regne',
                value: 'Animalia'
            }),
            symbolizer: {
                fillColor: 'red',
                strokeColor: 'red'
            }
        }),
        new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'regne',
                value: 'Plantae'
            }),
            symbolizer: {
                fillColor: 'blue',
                strokeColor: 'blue'
            }
        }),
        new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'regne',
                value: 'Fungi'
            }),
            symbolizer: {
                fillColor: 'cyan',
                strokeColor: 'cyan'
            }
        }),
        new OpenLayers.Rule({
            filter: new OpenLayers.Filter.Comparison({
                type: OpenLayers.Filter.Comparison.EQUAL_TO,
                property: 'regne',
                value: 'Habitat'
            }),
            symbolizer: {
                fillColor: 'green',
                strokeColor: 'green'
            }
        }),
        // nécessaire pour afficher les vertices notamment
        new OpenLayers.Rule({
            symbolizer: {
                strokeWidth: 3
            }
        })
    ];
    //Couche d'édition
    coucheEditable = new OpenLayers.Layer.Vector('Observation', {
        styleMap: new OpenLayers.StyleMap({
            'default': new OpenLayers.Style(null, {rules: regles}),
            select: {
                fillColor: 'yellow',
                strokeColor: 'yellow'
            }
        })
    });
    //Calques complémentaires pour la carte de base
    carte.addLayers([coucheEditable]);
    //Gestion du filtre permanent sur l'emprise
    carte.events.register('moveend', carte, function() {
        if (filtreEmpriseActif) {
            filtrerSurEmprise();
        }
    });
    //Outils de dessin des géométries
    var btnDessinPoint = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Point, {
        title: 'Dessiner un point',
        displayClass: 'olControlDrawPt',
        featureAdded: ajouter
    });
    var btnDessinPolyligne = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Path, {
        title: 'Dessiner une ligne',
        displayClass: 'olControlDrawLine',
        featureAdded: ajouter
    });
    var	btnDessinPolygone = new OpenLayers.Control.DrawFeature(coucheEditable, OpenLayers.Handler.Polygon, {
        title: 'Dessiner un polygone (touche "Alt" pour dessiner un trou)',
        displayClass: 'olControlDrawPolygon',
        featureAdded: ajouter,
        handlerOptions: {
            holeModifier: 'altKey'
        }
    });
    //Outil de modification des sommets des géométries
    var	btnModifGeom = new OpenLayers.Control.ModifyFeature(coucheEditable, {
        title: 'Modifier',
        displayClass: 'olControlModifyVertexes',
        onModificationEnd: function(feature) {
            if (btnModifGeom.modified) {
                redessiner(feature);
            }
        }
    });
    //Outil de translation des géométries
    var	btnGlissGeom = new OpenLayers.Control.DragFeature(coucheEditable, {
        title: 'Translater',
        displayClass: 'olControlDrag',
        onComplete: redessiner
    });
    //Outil de sélection des géométries
    var btnSelGeom = new OpenLayers.Control.SelectFeature(coucheEditable, {
        title: 'Sélectionner',
        displayClass: 'olControlMultiSelectFeature',
        toggleKey: 'ctrlKey',
        multipleKey: 'ctrlKey',
        box: true,
        onSelect: function() {afficherMesures(0, 0, 'mesures');},
        onUnselect: function() {afficherMesures(0, 0, 'mesures');}
    });
    btnSelGeom.handler = new OpenLayers.Handler.Click(btnSelGeom, { // événement sur le double-click de la géométrie
            dblclick: modifier                                      // sélectionné pour ouvrir directement le formulaire
        }, {
            'double': true
        }
    );
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
        btnSelGeom,
        btnGlissGeom,
        btnModifGeom,
        btnDessinPolygone,
        btnDessinPolyligne,
        btnDessinPoint
    ]);
    //Entrepôt des données (géométries également)
    var lecteurDonnees = new GeoExt.data.FeatureReader({
        fields: [{name: 'st_asgeojson'},
            {name: 'id_obs'},
            {name: 'heure_obs'},
            {name: 'date_obs'},
            {name: 'date_debut_obs'},
            {name: 'date_fin_obs'},
            {name: 'date_textuelle'},
            {name: 'nom_vern'},
            {name: 'nom_complet'},
            {name: 'cd_nom'},
            {name: 'phylum'},
            {name: 'classe'},
            {name: 'ordre'},
            {name: 'famille'},
            {name: 'nom_valide'},
            {name: 'st_geometrytype'},
            {name: 'regne'},
            {name: 'effectif'},
            {name: 'effectif_min'},
            {name: 'effectif_max'},
            {name: 'effectif_textuel'},
            {name: 'type_effectif'},
            {name: 'phenologie'},
            {name: 'precision'},
            {name: 'determination'},
            {name: 'statut_validation'},
            {name: 'decision_validation'},
            {name: 'id_waypoint'},
            {name: 'longitude'},
            {name: 'latitude'},
            {name: 'elevation'},
            {name: 'localisation'},
            {name: 'code_insee'},
            {name: 'id_lieu_dit'},
            {name: 'lieu_dit'},
            {name: 'commune'},
            {name: 'dep'},
            {name: 'depart'},
            {name: 'observateur'},
            {name: 'validateur'},
            {name: 'structure'},
            {name: 'id_etude'},
            {name: 'id_protocole'},
            {name: 'remarque_obs'},
            {name: 'nom_etude'},
            {name: 'libelle'},
            {name: 'numerisat'},
            {name: 'diffusable'},
            {name: 'validat'},
            {name: 'observat'},
            {name: 'struct'},
            {name: 'commentaire_photo'},
            {name: 'url_photo'}
        ]
    });
    donneesGrille = new (Ext.extend(Ext.data.GroupingStore, new GeoExt.data.FeatureStoreMixin))({
        layer: coucheEditable,
        proxy: new GeoExt.data.ProtocolProxy({
            protocol: new OpenLayers.Protocol.HTTP({
                url: '../Modeles/GeoJson/gjObs.php?appli=' + GetParam('appli'),
                format: new OpenLayers.Format.GeoJSON({
                    internalProjection: carte.getProjectionObject(),
                    externalProjection: new OpenLayers.Projection('EPSG:4326')
                }),
                readWithPOST: true
            })
        }),
        reader: lecteurDonnees,
        remoteSort: true,
        remoteGroup: true,
        sortInfo: {field: 'id_obs', direction: 'DESC'} // tri par ordre décroissant de création
    });
    // Gestion de l'apparence du bouton filtrant sur l'emprise
    donneesGrille.on('load', function(store, records, options) {
        if ((options.params) && (options.params.filtreEmprise)) {
            Ext.getCmp('boutonFiltrerEmprise').setIconClass('extent_orange'); // état actif
        }
        else {
            filtreEmpriseActif = false;
            Ext.getCmp('boutonFiltrerEmprise').setIconClass('extent'); // état normal
        }
        if ((options.params) && (options.params.filtreSel)) {
            Ext.getCmp('boutonFiltrerSelection').setIconClass('filter_selected_orange'); // état actif
        }
        else {
            Ext.getCmp('boutonFiltrerSelection').setIconClass('filter_selected'); // état normal
        }
    });
    //Filtres pour les recherches sur chaque colonne
    var filtres = new Ext.ux.grid.GridFilters({
        menuFilterText: 'Filtres',
        filters: [{type: 'numeric', dataIndex: 'id_obs', menuItemCfgs : {emptyText: ''}},
            {type: 'list', dataIndex: 'heure_obs', options: listeValeurs(Ext.getCmp('heure_obs'))},
            {type: 'date', dataIndex: 'date_obs', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'date', dataIndex: 'date_debut_obs', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'date', dataIndex: 'date_fin_obs', beforeText: 'Avant le', afterText: 'Après le', onText: 'Le'},
            {type: 'string', dataIndex: 'date_textuelle', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'nom_vern', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'nom_complet', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'cd_nom', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'phylum', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'classe', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'ordre', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'famille', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'nom_valide', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'list', dataIndex: 'st_geometrytype', options: ['ST_Point', 'ST_LineString',
                'ST_Polygon']},
            {type: 'list', dataIndex: 'regne', options: ['Animalia', 'Plantae',
                'Fungi', 'Habitat']},
            {type: 'numeric', dataIndex: 'effectif', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'effectif_min', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'effectif_max', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'effectif_textuel', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'type_effectif', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'phenologie', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'list', dataIndex: 'precision', options: tableauValeurs(comboPrecision.store)},
            {type: 'list', dataIndex: 'determination', options: tableauValeurs(comboDetermination.store)},
            {type: 'list', dataIndex: 'statut_validation', options: tableauValeurs(comboStatutValidation.store)},
            {type: 'string', dataIndex: 'decision_validation', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'id_waypoint', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'longitude', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'latitude', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'elevation', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'localisation', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'code_insee', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'id_lieu_dit', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'lieu_dit', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'commune', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'dep', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'depart', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'observateur', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'validateur', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'structure', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'numeric', dataIndex: 'id_etude', menuItemCfgs : {emptyText: ''}},
            {type: 'numeric', dataIndex: 'id_protocole', menuItemCfgs : {emptyText: ''}},
            {type: 'string', dataIndex: 'remarque_obs', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'nom_etude', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'libelle', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'numerisat', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'boolean', dataIndex: 'diffusable', defaultValue: null, yesText: 'Oui', noText: 'Non'},
            {type: 'string', dataIndex: 'validat', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'observat', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'struct', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'commentaire_photo', emptyText: 'Ex. : Val1||Val2||Val3'},
            {type: 'string', dataIndex: 'url_photo', emptyText: 'Ex. : Val1||Val2||Val3'}
        ]
    });
    //Fonction de traitement de l'affichage du type image dans les grilles
    function renderImagette(val) {
        var result = '';
        if ((val) && !(nomPhoto(val) == '')) {
            result = '<img src="' + CST_cheminRelatifPhoto + val.substring(0, val.lastIndexOf('.')) +
                '_MINI.jpeg' + '" width=30 height=15 qtip="' + nomPhoto(val) + '">';
        }
        return result;
    }
    //Configuration type de chaque colonne
    var configCols = new Ext.MyColumnModel({
        defaults: {sortable: true},
        columns: [
            colonneSelectionCarto, // en premier obligatoirement
            {dataIndex: 'id_obs', header: 'N° obs.', hidden: true},
            {dataIndex: 'heure_obs', header: 'Heure obs.', renderer: timeRenderer, hidden: true},
            {dataIndex: 'date_obs', header: 'Date obs.', renderer: Ext.util.Format.dateRenderer('d/m/Y')},
            {dataIndex: 'date_debut_obs', header: 'Début obs.', renderer: Ext.util.Format.dateRenderer('d/m/Y'), hidden: true},
            {dataIndex: 'date_fin_obs', header: 'Fin obs.', renderer: Ext.util.Format.dateRenderer('d/m/Y'), hidden: true},
            {dataIndex: 'date_textuelle', header: 'Moment obs.', hidden: true},
            {dataIndex: 'regne', header: 'Règne'},
            {dataIndex: 'famille', header: 'famille'},
            {dataIndex: 'nom_complet', header: 'Nom latin/complet'},
            {dataIndex: 'nom_vern', header: 'Nom usuel/simplifié'},
            {dataIndex: 'observat', header: 'Observateurs'},
            {dataIndex: 'lieu_dit', header: 'Lieu-dit'},
            {dataIndex: 'commune', header: 'Commune'},
            {dataIndex: 'effectif', header: 'Eff. précis'},
            {dataIndex: 'effectif_min', header: 'Eff. min', hidden: true},
            {dataIndex: 'effectif_max', header: 'Eff. max', hidden: true},
            {dataIndex: 'effectif_textuel', header: 'Eff. textuel', hidden: true},
            {dataIndex: 'type_effectif', header: 'Age/Type eff./Stade repro/Unité'},
            {dataIndex: 'phenologie', header: 'Sexe/Phéno/Support/Etat conserv.'},
            {dataIndex: 'determination', header: 'Détermination'},
            {dataIndex: 'precision', header: 'Précision', hidden: true},
            {dataIndex: 'id_waypoint', header: 'Relevé GPS', hidden: true},
            {dataIndex: 'longitude', header: 'Longitude', hidden: true},
            {dataIndex: 'latitude', header: 'Latitude', hidden: true},
            {dataIndex: 'elevation', header: 'Altitude', hidden: true},
            {dataIndex: 'localisation', header: 'Rq localisat.', hidden: true},
            {dataIndex: 'code_insee', header: 'INSEE', hidden: true},
            {dataIndex: 'dep', header: 'N° dép.', hidden: true},
            {dataIndex: 'depart', header: 'Dép.', hidden: true},
            {dataIndex: 'remarque_obs', header: 'Rq obs.', hidden: true},
            {dataIndex: 'numerisat', header: 'Numérisateur'},
            {dataIndex: 'statut_validation', header: 'Stat. valid.', hidden: true},
            {dataIndex: 'decision_validation', header: 'Décis. valid.', hidden: true},
            {dataIndex: 'validat', header: 'Validateur', hidden: true},
            {dataIndex: 'struct', header: 'Structures', hidden: true},
            {dataIndex: 'cd_nom', header: 'cd_nom', hidden: true},
            {dataIndex: 'phylum', header: 'phylum', hidden: true},
            {dataIndex: 'classe', header: 'classe', hidden: true},
            {dataIndex: 'ordre', header: 'ordre', hidden: true},
            {dataIndex: 'nom_valide', header: 'nom_valide', hidden: true},
            {dataIndex: 'st_geometrytype', header: 'st_geometrytype', hidden: true},
            {dataIndex: 'nom_etude', header: 'Etude', hidden: true},
            {dataIndex: 'libelle', header: 'Protocole', hidden: true},
            {dataIndex: 'diffusable', header: 'Diffusable', renderer: traiteAffichageBoolean, hidden: true},
            {dataIndex: 'commentaire_photo', header: 'Cmt photo', hidden: true},
            {dataIndex: 'url_photo', header: 'Photo', renderer: renderImagette, hidden: true}            
        ]
    });
    //Barre de menu
    if (modeSimplifie) {
        separateurBarreMenu = '';
    }
    var barreMenu = new Ext.Toolbar({
        region: 'north',
        autoHeight: true,
        items: [
            {
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
                text: 'Modifier',
                tooltip: "Modifier l'observation sélectionnée",
                handler: modifier,
                iconCls: 'cog_edit'
            }, '-', {
                text: 'Supprimer',
                tooltip: "Supprimer l'observation sélectionnée",
                handler: supprimer,
                iconCls: 'delete'
            }, '-', {
                text: 'Exporter grille',
                tooltip: 'Exporter la grille au format Excel',
                handler: exporterExcel,
                iconCls: 'icon_excel'
            }, '-', {
                id: 'boutonFiltrerEmprise',
                text: 'Filtrer emprise',
                tooltip: 'Filtrer sur les limites de la carte ("Actualiser la page" pour annuler)',
                handler: filtreSurEmprise,
                iconCls: 'extent'
            }, '-', {
                id: 'boutonFiltrerSelection',
                text: 'Filtrer sélection',
                tooltip: 'Filtrer sur la sélection ("Actualiser la page" pour annuler)',
                handler: filtrerSelection,
                iconCls: 'filter_selected'
            }, separateurBarreMenu, {
                text: 'Mémoriser sélection',
                tooltip: 'Mémoriser la sélection en cours',
                handler: sauverSelection,
                hidden: modeSimplifie,
                iconCls: 'save_selected'
            }, separateurBarreMenu, {
                text: 'Appliquer sélection',
                tooltip: 'Appliquer la sélection en mémoire',
                handler: restaurerSelection,
                hidden: modeSimplifie,
                iconCls: 'apply_selected'
            }, '-', {
                text: 'Importer GPX',
                tooltip: 'Importer un fichier GPX',
                handler: importerGPX,
                iconCls: 'import_GPX'
            }, '-', {
                text: 'Voir photo',
                handler: afficherPhoto,
                iconCls: 'photo',
                tooltip: 'Visualiser la photo'
            }
    //Ajouter la fonction de recherche et zoom sur une commune - lieu-dit ou coordonnées			
			, '-', {
                text: 'Zoom sur commune',
                handler: zoomsurcommune,
                iconCls: 'zoomcommune',
                tooltip: 'Rechercher et zoomer sur la commune de votre choix'
            }
        ]
    });
    //Grille des données
    grille = new Ext.grid.GridPanel({
        sm: colonneSelectionCarto,
        view: new Ext.ux.BufferedGroupingView({
            groupTextTpl: '{text} ({[values.rs.length]} {[values.rs.length > 1 ? "lignes" : "ligne"]})'
        }),
        id: GetParam('appli') + '_grilleObs', // unique pour conserver la configuration de la grille
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
    if (droit != 'admin') {
        separateurBarrePaginat = '';
    }
    barrePaginat = new Ext.PagingToolbar({
        region: 'south',
        autoHeight: true,
        store: donneesGrille,
        displayInfo: true,
        plugins: [filtres, new Ext.ux.grid.PageSizer()],
        items: ['-', {
                text: 'Défiltrer',
                handler: function() {filtres.clearFilters();},
                iconCls: 'cancel_find',
                tooltip: 'Désactiver tous les filtres de la grille de données'
            }, '-', {
                text: 'Se déconnecter',
                handler: deconnecter,
                iconCls: 'deconnection',
                tooltip: "Se déconnecter de l'application"
            }, '-', {
                handler: function() {document.location.href = 'vSaisiePersonnes.php?appli=' + GetParam('appli');},
                text: 'Observateurs',
                iconCls: 'portrait',
                tooltip: 'Gérer les observateurs'
            }, '-', {
                handler: function() {document.location.href = 'vSaisieStructures.php?appli=' + GetParam('appli');},
                text: 'Structures',
                iconCls: 'maison',
                tooltip: 'Gérer les structures'
            }, separateurBarrePaginat, {
                handler: function() {document.location.href = 'vSaisieEtudes.php?appli=' + GetParam('appli');},
                text: 'Etudes',
                iconCls: 'study',
                tooltip: 'Gérer les études',
                hidden: (droit != 'admin')
            }, separateurBarrePaginat, {
                handler: function() {document.location.href = 'vSaisieProtocoles.php?appli=' + GetParam('appli');},
                text: 'Protocoles',
                iconCls: 'workflow',
                tooltip: 'Gérer les protocoles',
                hidden: (droit != 'admin')
            },
            comboValidationEnMasse,
            {
                text: 'Télécharger',
                iconCls: 'downloadData',
                tooltip: 'Télécharger les données',
                hidden: (droit != 'admin'),
                handler: function() {
                    window.open('data:text/GeoJSON;charset=UTF-8,' + JSON.stringify(Ext.util.JSON.decode(donneesGrille.proxy.response.priv.responseText)));
                }
            }
        ]
    });
    // Panel de la carte
    var cartePanel = new GeoExt.MapPanel({
        id: GetParam('appli') + '_cartePanelObs', // unique pour conserver la configuration de la carte
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
            barreOutils.activateControl(btnDessinPoint);
        }},
        center: CST_center,
        zoom: CST_zoom
    });
    //Panel de la grille
    var grillePanel = new Ext.Panel({
        layout: 'border',
        autoheight: true,
        region: 'center',
        items: [barreMenu, grille, barrePaginat]
    });
    //Fenêtre d'affichage
    fenetreCartoGrille = new Ext.Viewport({
        layout: 'border',
        items: [cartePanel, grillePanel]
    });
    //Chargement des données selon cookies
   if (Ext.util.Cookies.get('ys-0-' + GetParam('appli') + '_grilleObs') == null) {
        donneesGrille.load();
    }
}

//Ajout
function ajouter(feature) {
    ajoute(feature.geometry.transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326')));
}

//Modification
function modifier() {
    if (grille.selModel.getCount() == 1) {
        modifie();
        return true;
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner une observation et une seule').setIcon(Ext.MessageBox.WARNING);
    }
}
function redessiner(feature) {
    var geom = feature.geometry.clone().transform(carte.getProjectionObject(), // clônage car pas de rechargement ensuite
        new OpenLayers.Projection('EPSG:4326'));
    // récupération de la commune auprès du référentiel
    Ext.Ajax.request({
        url: '../Modeles/Json/jCommune.php?appli=' + GetParam('appli'),
        params: {
            centroid: geom.getCentroid(),
            EPSG: projectionPostGIS.getCode().replace('EPSG:', '')
        },
        callback: function(options, success, response) {
            // initialisation des variables pour gérer le "code_insee"
            var INSEE = null;
            var memeINSEE = false;
            if (success) {
                var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                if (obj.success) {
                    // récupération du N° INSEE trouvé
                    INSEE = obj.code_insee;
                }
                // vérification si nouveau N° INSEE trouvé différent de l'ancien
                if (INSEE == feature.attributes['code_insee']) {
                    memeINSEE = true;
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
            if (geom.CLASS_NAME == 'OpenLayers.Geometry.Point') {
                Ext.Ajax.request({
                    url: '../Controleurs/Gestion/GestObs.php?appli=' + GetParam('appli'),
                    params: {
                        action: 'Redessiner',
                        id_obs: feature.attributes['id_obs'],
                        geometrie: geom,
                        longitude: geom.x,
                        latitude: geom.y,
                        code_insee: INSEE,
                        EPSG: projectionPostGIS.getCode().replace('EPSG:', '')
                    },
                    callback: function(options, success, response) {
                        if (success) {
                            var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                            // rafraîchissement de la grille pour les coordonnées x et y dans tous les cas
                            if (obj.success) {
                                donneesGrille.reload();
                            }
                            else {
                                Ext.MessageBox.show({
                                    fn: function() {donneesGrille.reload();}, // rechargement de la carte pour annuler le dessin en cours
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
                Ext.Ajax.request({
                    url: '../Controleurs/Gestion/GestObs.php?appli=' + GetParam('appli'),
                    params: {
                        action: 'Redessiner',
                        id_obs: feature.attributes['id_obs'],
                        geometrie: geom,
                        code_insee: INSEE,
                        EPSG: projectionPostGIS.getCode().replace('EPSG:', '')
                    },
                    callback: function(options, success, response) {
                        if (success) {
                            var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                            if (obj.success) {
                                // rafraîchissement de la grille dans le cas d'un nouveau N° INSEE uniquement
                                if (!memeINSEE) {
                                    donneesGrille.reload();
                                }
                            }
                            else {
                                Ext.MessageBox.show({
                                    fn: function() {donneesGrille.reload();}, // rechargement de la carte pour annuler le dessin en cours
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
    });
}

//Suppression
function supprimer() {
    var nbSuppr = grille.selModel.getCount();
    if (nbSuppr > 0) {
        if (nbSuppr == 1) {
            Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir supprimer l'observation sélectionnée ?", supprime);
        }
        else {
            Ext.MessageBox.confirm('Confirmation', 'Etes-vous sûr de vouloir supprimer les ' + nbSuppr + ' observations sélectionnées ?', supprime);
        }
    }
    else {
        Ext.MessageBox.alert('Attention', 'Vous devez sélectionner au moins une observation').setIcon(Ext.MessageBox.WARNING);
    }
}
function rafraichieAffichage() {
    donneesGrille.reload({
        callback: function(rs) {
            // gestion du cas particulier de la suppression de tous les éléments de la dernière page
            if ((rs.length == 0) && (barrePaginat.cursor > 0)) {
                barrePaginat.movePrevious(); // correction du bug d'affichage de la barre de pagination
            }
        }
    })
}
function supprime(btn) {
    if (btn == 'yes') {
        var nbSuppr = grille.selModel.getCount();
        if (nbSuppr == 1) {
            Ext.Ajax.request({
                url: '../Controleurs/Gestion/GestObs.php?appli=' + GetParam('appli'),
                params: {
                    action: 'Supprimer',
                    id_obs: grille.selModel.getSelected().data['id_obs']
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
            var listId = selection[0].data['id_obs'];
            for (var i = 1; i < nbSuppr; i++) {
                listId += ', ' + selection[i].data['id_obs'];
            }
            Ext.Ajax.request({
                url: '../Controleurs/Gestion/GestObs.php?appli=' + GetParam('appli'),
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
                                fn: function() {
                                    if (obj.errorMessage == 'Opérations de suppression partielles') {
                                        rafraichieAffichage();
                                    }
                                },
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
    types['id_obs'] = Ext.data.Types.INT;
    types['date_obs'] = Ext.data.Types.DATE;
    types['date_debut_obs'] = Ext.data.Types.DATE;
    types['date_fin_obs'] = Ext.data.Types.DATE;
    types['effectif'] = Ext.data.Types.INT;
    types['effectif_min'] = Ext.data.Types.INT;
    types['effectif_max'] = Ext.data.Types.INT;
    types['longitude'] = Ext.data.Types.FLOAT;
    types['latitude'] = Ext.data.Types.FLOAT;
    types['elevation'] = Ext.data.Types.INT;
    document.location.href = 'data:application/vnd.ms-excel;base64,' + Base64.encode(getExcelXml(grille, types));
}

//Filtrage sur les éléments sélectionnés
function filtrerSelection() {
    var nbSel = grille.selModel.getCount();
    if (nbSel > 0) {
        var filtreSel = ' AND id_obs';
        if (nbSel == 1) {
            filtreSel += ' = ' + grille.selModel.getSelected().data['id_obs'];
        }
        else {
            var selection = grille.selModel.getSelections();
            filtreSel += ' IN (' + selection[0].data['id_obs'];
            for (var i = 1; i < nbSel; i++) {
                filtreSel += ', ' + selection[i].data['id_obs'];
            }
            filtreSel += ')';
        }
        donneesGrille.reload({
            params: {
                filtreSel: filtreSel,
                start: 0,
                limit: nbSel
            },
            callback: function() {grille.selModel.selectAll();}
        });
    }
}

//Zoom sur les éléments sélectionnés
function zoomerSelection() {
    var selection = coucheEditable.selectedFeatures;
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

//Sauvegarde des éléments sélectionnés en mémoire
function sauverSelection() {
    idSelection = [];
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        idSelection[i] = selection[i].data['id_obs'];
    }
}

//Restauration des éléments sauvegardés en mémoire
function restaurerSelection() {
    grille.selModel.selectAll();
    var selection = grille.selModel.getSelections();
    for (var i = 0; i < selection.length; i++) {
        if (idSelection.indexOf(selection[i].data['id_obs']) == -1) {
           grille.selModel.deselectRow(i);
        }
    }
}

//Filtrage sur l'emprise
function filtreSurEmprise() {
    filtreEmpriseActif = true;
    if (filtreEmpriseActif) {
        filtrerSurEmprise();
    }
}

//Filtrage sur l'emprise
function filtrerSurEmprise() {
    var emprise = carte.getExtent().toGeometry().transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326'));
    donneesGrille.reload({
        params: {
            filtreEmprise: emprise,
            chGeom: 'SAISIE.SAISIE_OBSERVATION.geometrie',
            limit: 'AUCUNE' // affichage de tous les enregistrements
        },
        callback: function(rs) {
            barrePaginat.setPageSize(rs.length, false);
            // correction du bug d'affichage de la barre de pagination
            barrePaginat.afterTextItem.setText('sur 1');
            barrePaginat.next.setDisabled(true);
            barrePaginat.last.setDisabled(true);
        }
    });
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

//Appel du formulaire d'importation GPX
function importerGPX() {
    importeGPX();
}

//Appel du formulaire d'affichage photo
function afficherPhoto() {
    if (modifier()) {
        affichePhoto();
    }
}

//Zoom sur l'emprise de la carte
function zoomerEmpriseCadre() {
    // cadrage sur l'emprise paramétrée par défaut puis zoom d'un niveau
    carte.zoomToExtent(empriseCadre);
    carte.zoomIn();
}
//Zoom sur la commune - lieu-dit ou coordonnées sélectionné
function zoomsurcommune() {
fenetreFormulaireRecherche.show();
}
