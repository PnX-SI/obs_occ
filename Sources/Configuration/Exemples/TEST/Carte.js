//############################################################""
//    Exemple 1 données de la base stockée en EPSG:2153 et projection de la carte également

//Projection RGF93 / Lambert-93
Proj4js.defs['EPSG:2154'] = '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
// projection définie dans PostGIS (la même partout : lieux-dits, communes, observations et historique des observations)
var projectionPostGIS = new OpenLayers.Projection('EPSG:2154');

// projection de la carte (identique pour toutes les couches de base)
var projectionCarte = new OpenLayers.Projection('EPSG:2154');
var etendueMax = new OpenLayers.Bounds(714559, 6314108, 798599, 6388697);
var empriseCadre = new OpenLayers.Bounds(714559, 6314108, 798599, 6388697);

//Configuration par défaut des cartes
// calques de base (couches WMS)
var WMS_IGN = new OpenLayers.Layer.WMS('Scans IGN',
    'http://mondomaine/wms', {layers: ['scan']}
);
var WMS_Ortho = new OpenLayers.Layer.WMS('Orthophotos IGN',
    'http://mondomaine/wms', {layers: ['ortho']}
);
var WMS_PNX = new OpenLayers.Layer.WMS('Limites PNX',
    'http://mondomaine/wms', {
        layers: ['AOA', 'Coeur'],
        isBaseLayer: false,
        transparent: 'true'
    }
);
var couches = [WMS_IGN, WMS_Ortho, WMS_PNX]; // ordre des couches : arrière-plan >>> premier-plan

// paramètrage visuel
var CST_center = [747329, 6358407]; // coordonnées dans la projection de la carte
var CST_zoom = 12;
var CST_seuilZoomSelection = 17;
var CST_region = 'north';

//############################################################""
//    Exemple 2 :
//        - données de la base stockée en EPSG:4326 
//        - fond de carte IGN  EPSG:3857
//        - wms personel en EPSG:2154

Proj4js.defs["EPSG:3857"] = "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +no_defs"
//Projection RGF93 / Lambert-93
Proj4js.defs['EPSG:2154'] = '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

// projection définie dans PostGIS (la même partout : lieux-dits, communes, observations et historique des observations)
var projectionPostGIS = new OpenLayers.Projection('EPSG:4326');

// projection de la carte (identique pour toutes les couches de base)
var projectionCarte = new OpenLayers.Projection("EPSG:3857");

var etendueMax = new OpenLayers.Bounds(-20037508, -20037508, 20037508, 20037508);
var empriseCadre = new OpenLayers.Bounds(330000,5300000, 360000,5700000);

var ign_api_key =  "ma_cle_ign";

var WMTS_IGN_SCANS = new OpenLayers.Layer.WMTS({
  name: "IGN - Scans",
  url: 'https://gpp3-wxs.ign.fr/' + ign_api_key + '/geoportail/wmts',
  layer: "GEOGRAPHICALGRIDSYSTEMS.MAPS", 
  matrixSet: "PM",
  style: "normal",
  numZoomLevels: 19,
  projection : new OpenLayers.Projection("EPSG:3857")
}); 

var WMTS_IGN_ORTHO = new OpenLayers.Layer.WMTS({
  name: "IGN - Orthophotos",
  url: 'https://gpp3-wxs.ign.fr/' + ign_api_key + '/geoportail/wmts',
  layer: 'ORTHOIMAGERY.ORTHOPHOTOS',
  matrixSet: "PM",
  style: "normal",
  numZoomLevels: 19,
  projection : new OpenLayers.Projection("EPSG:3857")
}); 

var WMS_PNX = new OpenLayers.Layer.WMS('Limites PNX',
    'http://mondomaine/wms', {
        layers: ['AOA', 'Coeur'],
        isBaseLayer: false,
        transparent: 'true',
        projection : new OpenLayers.Projection("EPSG:2154")
    }
);
var couches = [WMTS_IGN_SCANS,WMTS_IGN_ORTHO, WMS_PNX ]; // ordre des couches : arrière-plan >>> premier-plan

// paramètrage visuel
var CST_center = [411185.962,5504029.003]; // coordonnées dans la projection de la carte
var CST_zoom = 12;
var CST_seuilZoomSelection = 17;
var CST_region = 'north';

