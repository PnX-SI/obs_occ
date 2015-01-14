//Colonne de cases à cocher pour sélectionner/déselectionner tout
var colonneSelectionCarto = new (new Ext.extend(Ext.grid.CheckboxSelectionModel, new GeoExt.grid.FeatureSelectionModelMixin));

var carte = new OpenLayers.Map('carte', {
    maxResolution: 'auto',
    maxExtent: etendueMax,
    projection: projectionCarte,
    displayProjection: new OpenLayers.Projection('EPSG:4326'),
    numZoomLevels: 22,
    controls: [
        new OpenLayers.Control.Navigation({
            zoomBoxEnabled: false,
            // recentrage automatique en mÃªme temps que le (dÃ©)zoom
            wheelChange: function(evt, deltaZ) {
                // vÃ©rification Ã  ne pas dÃ©passer le niveau de zoom maximum
                var numZoomLevelsBaseLayer = 22;
                switch (carte.baseLayer.type) {
                    case google.maps.MapTypeId.SATELLITE:
                        numZoomLevelsBaseLayer = 19;
                        break;
                    case google.maps.MapTypeId.TERRAIN:
                        numZoomLevelsBaseLayer = 15;
                        break;
                    case google.maps.MapTypeId.ROADMAP:
                        numZoomLevelsBaseLayer = 21;
                        break;
                }
                if (carte.getZoom() + deltaZ > numZoomLevelsBaseLayer) {
                    carte.moveTo(carte.getLonLatFromPixel(evt.xy), numZoomLevelsBaseLayer);
                }
                else {
                    carte.moveTo(carte.getLonLatFromPixel(evt.xy), carte.getZoom() + deltaZ);
                }
            }
        }),
        new OpenLayers.Control.Scale(carte),
        new OpenLayers.Control.ScaleLine({
            topOutUnits: 'm',
            topInUnits: 'm',
            bottomOutUnits: 'km',
            bottomInUnits: 'km'
        }),
        new OpenLayers.Control.MousePosition({emptyString: '0, 0'}),
        new OpenLayers.Control.LayerSwitcher()
    ],
     eventListeners: {
         // remise au niveau de zoom maximum de la couche de base si seuil dÃ©passÃ©
         changebaselayer: function(baseLayer) {
             var numZoomLevelsBaseLayer = 22;
             switch (baseLayer.layer.type) {
                case google.maps.MapTypeId.SATELLITE:
                    numZoomLevelsBaseLayer = 19;
                    break;
                case google.maps.MapTypeId.TERRAIN:
                    numZoomLevelsBaseLayer = 15;
                    break;
                case google.maps.MapTypeId.ROADMAP:
                    numZoomLevelsBaseLayer = 21;
                    break;
             }
             if (carte.getZoom() > numZoomLevelsBaseLayer) {
                carte.zoomTo(numZoomLevelsBaseLayer);
             }
         }
     }
});
carte.addLayers(couches);
//Barre d'outils minimale
// outil d'historisation de la navigation
var btnsHistoNavig = new OpenLayers.Control.NavigationHistory();
carte.addControl(btnsHistoNavig);
// outil de rectangle de zoom
var btnZoom = new OpenLayers.Control.ZoomBox({
    title: 'Zoomer',
    displayClass: 'olControlZoomBox'
});
// outil de rectangle de dézoom
var btnDezoom = new OpenLayers.Control.ZoomBox({
    out: true,
    title: 'Dézoomer',
    displayClass: 'olControlUnzoom'
});
// outil de déplacement sur la carte
var btnMvt = new OpenLayers.Control.DragPan({
    title: 'Se déplacer',
    displayClass: 'olControlNavigation'
});
// outils de mesures
var styleMesures = new OpenLayers.Style();
styleMesures.addRules([
    new OpenLayers.Rule({
        symbolizer: {
            'Point': {
                pointRadius: 5,
                graphicName: 'cross',
                strokeColor: 'violet'
            },
            'Line': {
                strokeWidth: 3,
                strokeColor: 'violet',
                strokeLinecap: 'square',
                strokeDashstyle: 'dash'
            },
            'Polygon': {
                strokeWidth: 3,
                strokeColor: 'violet',
                fillColor: 'violet',
                strokeLinecap: 'square',
                strokeDashstyle: 'dash'
            }
        }
    })
]);
var symbologieMesures = new OpenLayers.StyleMap({'default': styleMesures});
var btnMesureLg = new OpenLayers.Control.Measure(
    OpenLayers.Handler.Path, {
        title: 'Mesurer longueur',
        displayClass: 'olControlMeasureLength',
        persist: true,
        measure: function(geometry) {mesurer(geometry, 'mesures');},
        measurepartial: function(point, geometry) {mesurer(geometry, 'mesures');},
        handlerOptions: {
            layerOptions: {styleMap: symbologieMesures}
        }
    }
);
var btnMesureSurf = new OpenLayers.Control.Measure(
    OpenLayers.Handler.Polygon, {
        title: 'Mesurer surface',
        displayClass: 'olControlMeasureArea',
        persist: true,
        measure: function(geometry) {mesurer(geometry, 'mesures');},
        measurepartial: function(point, geometry) {mesurer(geometry, 'mesures');},
        handlerOptions: {
            layerOptions: {styleMap: symbologieMesures}
        }
    }
);
function mesurerSelection(couche, idElt) {
    var surf = 0;
    var lg = 0;
    var selection = couche.selectedFeatures;
    var nbSel = selection.length;
    if (nbSel > 0) {
        for (var i = 0; i < nbSel; i++) {
            var geom = selection[i].geometry;
            if ((geom) && (geom.CLASS_NAME.indexOf('Point') == -1)) {
                geom = geom.clone().transform(carte.getProjectionObject(),
                    new OpenLayers.Projection('EPSG:4326'));
                lg += geom.getGeodesicLength();
                if (geom.CLASS_NAME.indexOf('Line') == -1) {
                    surf += geom.getGeodesicArea();
                }
            }
        }
    }
    afficherMesures(lg, surf, idElt);
    return [lg, surf];
}
function mesurer(geom, idElt) {
    var surf = 0;
    var lg = 0;
    geom = geom.clone().transform(carte.getProjectionObject(),
        new OpenLayers.Projection('EPSG:4326'));
    lg += geom.getGeodesicLength();
    if (geom.CLASS_NAME.indexOf('Line') == -1) {
        surf += geom.getGeodesicArea();
    }
    afficherMesures(lg, surf, idElt);
    return [lg, surf];
}
function afficherMesures(lg, surf, idElt) {
    var ctrlTxt = document.getElementById(idElt);
    if (ctrlTxt) {
        // initialisation de l'affichage
        var txt = '';
        var lgTxt = '';
        var surfTxt = '';
        // préparation des unités d'affichage des valeurs
        if (lg >= 1000) {
            lgTxt = (lg / 1000).toFixed(3) + ' Km';
        }
        else {
            lgTxt = lg.toFixed(3) + ' m';
        }
        if (surf >= 10000) {
            surfTxt = (surf / 10000).toFixed(4) + ' Ha';
        }
        else {
            surfTxt = (surf / 100).toFixed(2) + ' a';
        }
        // affichage ou non des valeurs si 0
        if (lg > 0) {
            txt += 'Lg : ' + lgTxt;
        }
        if ((lg > 0) && (surf > 0)) {
            txt += ' | ';
        }
        if (surf > 0) {
            txt += 'Surf : ' + surfTxt;
        }
        ctrlTxt.innerHTML = txt;
    }
}
//Outil de sauvegarde de l'emprise
var btnSauvEmprise = new OpenLayers.Control.Button({
    title: "Sauvegarder l'emprise",
    trigger: function() {
        var emprise = carte.getExtent().transform(carte.getProjectionObject(),
            new OpenLayers.Projection('EPSG:4326'));
        creeCookie('emprise',emprise, 365);
        Ext.MessageBox.show({
            title: 'Emprise sauvegardée',
            msg: emprise,
            buttons: Ext.MessageBox.OK,
            icon: Ext.MessageBox.INFO
        });
    },
    displayClass: 'olControlSaveExtent'
});
//Outil de zoom sur l'emprise sauvegardée
var btnZoomEmprise = new OpenLayers.Control.Button({
    title: "Zoomer sur l'emprise sauvegardée",
    trigger: function() {
        carte.zoomToExtent(new OpenLayers.Bounds.fromString(recupereCookie('emprise')).transform(new OpenLayers.Projection('EPSG:4326'),
            carte.getProjectionObject()));
    },
    displayClass: 'olControlZoomExtent'
});
// barre d'outils
var barreOutils = new OpenLayers.Control.Panel({
    displayClass: 'olControlToolbar'
});
if (modeSimplifie) {
    barreOutils.addControls([
        btnDezoom,
        btnZoom,
        btnMvt
    ]);
}
else {
    barreOutils.addControls([
        btnsHistoNavig.next,
        btnsHistoNavig.previous,
        btnZoomEmprise,
        btnSauvEmprise,
        btnMesureSurf,
        btnMesureLg,
        btnDezoom,
        btnZoom,
        btnMvt
    ]);
}
carte.addControl(barreOutils);
