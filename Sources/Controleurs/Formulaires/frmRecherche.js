//Variables globales utilisées pour gérer le formulaire
var formulaireRecherche, fenetreFormulaireRecherche, comboLdCom, comboDepCom;

Ext.onReady(function() {
    comboLdCom = new Ext.form.ComboBox({
        fieldLabel: 'Zoomez sur le lieu-dit L-R sélectionné',
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jLieuxDitsCommunes.php',
            fields: ['centre_ld', 'ld_com']
        }),
        mode: 'local',
        displayField: 'ld_com',
        valueField: 'centre_ld',
        forceSelection: true,
        listeners: {
            keyup: function(obj, evt) {
                var requete = obj.getRawValue();
                if ((requete.length >= 3) && (evt.keyCode != evt.DOWN) && (evt.keyCode != evt.UP)) { // si au moins 3 lettres
                   obj.store.load({params: {critere: requete}});
                }
            },
            select: function() {
                zoomerLieuDit();
            }
        }
    });
    comboDepCom = new Ext.form.ComboBox({
        fieldLabel: 'Zoomez sur la commune L-R sélectionnée',
        triggerAction: 'all',
        store: new Ext.data.JsonStore({
            url: '../Modeles/Json/jEmprisesCommunes.php',
            fields: ['emprise_com', 'dep_com']
        }),
        mode: 'local',
        displayField: 'dep_com',
        valueField: 'emprise_com',
        forceSelection: true,
        listeners: {
            keyup: function(obj, evt) {
                var requete = obj.getRawValue();
                if ((requete.length >= 3) && (evt.keyCode != evt.DOWN) && (evt.keyCode != evt.UP)) { // si au moins 3 lettres
                   obj.store.load({params: {critere: requete}});
                }
            },
            select: function() {
                zoomerCommune();
            }
        }
    });
    //Panel contenant le formulaire avec titre, contrôles de saisie et boutons action
    formulaireRecherche = new Ext.FormPanel({
        frame: true,
        labelWidth: 240,
        labelAlign: 'right',
        defaults: {width: 280},
        labelSeparator: ' : ',
        items: [comboLdCom, comboDepCom]
    });
    var formulaireTotalRecherche = new Ext.Panel({
        items: formulaireRecherche,
        bbar: new Ext.ux.StatusBar({
            items: [
                {
                    xtype: 'label',
                    text: 'Zoomez aux coordonnées :'
                }, '-', {
                    xtype: 'label',
                    text: 'Longitude'
                }, {
                    emptyText: 'Ex. : 3.594',
                    xtype: 'numberfield',
                    fieldLabel: 'Longitude',
                    id: 'xGPS',
                    decimalSeparator: '.',
                    minValue: -180,
                    maxValue: 180,
                    decimalPrecision: 16,
                    width: 140
                }, '-',  {
                    xtype: 'label',
                    text: 'Latitude'
                }, {
                    emptyText: 'Ex. : 44.323',
                    xtype: 'numberfield',
                    fieldLabel: 'Latitude',
                    id: 'yGPS',
                    decimalSeparator: '.',
                    minValue: -90,
                    maxValue: 90,
                    decimalPrecision: 16,
                    width: 140
                }, {
                    tooltip: 'Zoomez aux coordonnées géographiques saisies',
                    handler: zoomerXY,
                    iconCls: 'zoom_XY'
                }
            ]
        })
    });
    //Fenêtre container
    fenetreFormulaireRecherche = new Ext.Window({
        constrain: true,
        resizable: false,
        title: 'Recherche (saisissez au moins 3 caractères)',
        width: 560,
        autoHeight: true,
        items: formulaireTotalRecherche,
        closeAction: 'hide'
    });
});

//Initialisation du formulaire
function initialiseFormulaireRecherche() {
    fenetreFormulaireRecherche.show();
    formulaireRecherche.form.reset();
    comboLdCom.focus('', 1000); // focus de 1000 ms sinon ça ne marche pas
}

//Zoom sur le lieu-dit sélectionné
function zoomerLieuDit() {
     if (comboLdCom.getValue() != '') {
        var geom = new OpenLayers.Geometry.fromWKT(comboLdCom.getValue()).getCentroid()
        geom.transform(projectionPostGIS, carte.getProjectionObject());
        carte.moveTo(OpenLayers.LonLat.fromString(geom.toShortString()), CST_seuilZoomSelection - 1);
    }
}

//Zoom sur la commune sélectionnée
function zoomerCommune() {
     if (comboDepCom.getValue() != '') {
        var geom = new OpenLayers.Geometry.fromWKT(comboDepCom.getValue()).getBounds();
        geom.transform(projectionPostGIS, carte.getProjectionObject());
        carte.zoomToExtent(geom);
        carte.zoomIn();
    }
}

//Zoom aux coordonnées géographiques saisies
function zoomerXY() {
    if (Ext.getCmp('xGPS').value && Ext.getCmp('yGPS').value && Ext.getCmp('xGPS').isValid()
    && Ext.getCmp('yGPS').isValid()) {
        carte.moveTo(new OpenLayers.LonLat(Ext.getCmp('xGPS').value, Ext.getCmp('yGPS').value).transform(
            new OpenLayers.Projection('EPSG:4326'), carte.getProjectionObject()), CST_seuilZoomSelection + 1);
    }
    else {
       Ext.MessageBox.alert('Attention', 'Veuillez saisir des coordonnées géographiques valides !!!').setIcon(Ext.MessageBox.WARNING);
    }
}
