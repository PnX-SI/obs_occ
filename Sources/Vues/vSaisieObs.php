<?php
    require_once '../Securite/VerifCnx.php';
    require_once '../Configuration/ConfigUtilisee.php';
    require_once '../' . $configInstance . '/Serveur.php';
?>
<html>
    <head>
        <title>Observations</title>
        <!-- Définition du jeu de caractères -->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <!-- Support de cartes Google (sensor=false <=> périphérique GPS non connecté) -->
        <script type='text/javascript' src='http://maps.google.com/maps/api/js?sensor=false'></script>
        <!-- Bibliothèque Ext en français (version de production) -->
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/adapter/ext/ext-base.js"></script>
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/ext-all.js"></script>
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/src/locale/ext-lang-fr.js"></script>
        <!-- Complément de Ext -->
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/examples/ux/ux-all.js"></script>
        <!-- Bibliothèque Proj4JS (nécessaire pour la transformation de coordonnées selon l'EPSG en 4326) -->
        <script type="text/javascript" src="<?php echo LIB; ?>/Proj4JS/lib/proj4js.js"></script>
        <!-- Bibliothèque OpenLayers en français (version de production) -->
        <script type="text/javascript" src="<?php echo LIB; ?>/OpenLayers/OpenLayers.js"></script>
        <script type="text/javascript" src="<?php echo LIB; ?>/OpenLayers/lib/OpenLayers/Lang/fr.js"></script>
        <!-- Bibliothèque GeoExt (version de production compatible avec les versions de Firefox > 3.6) -->
        <script type="text/javascript" src="<?php echo LIB; ?>/GeoExt/script/GeoExt.js"></script>
        <!-- Feuilles de style (bibliothèques) -->
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/resources/css/ext-all.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/examples/ux/css/ux-all.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/examples/ux/gridfilters/css/GridFilters.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/examples/ux/gridfilters/css/RangeMenu.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/examples/ux/statusbar/css/statusbar.css" />
        <!-- Feuilles de style (application) -->
        <link type="text/css" rel="stylesheet" href="<?php echo ENV; ?>/Ergonomie/Grilles/gFds.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo ENV; ?>/Ergonomie/Cartes/cFds.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo ENV; ?>/Ergonomie/Formulaires/frmFds.css" />
        <!-- Compléments (remarque : PageSizer.js modifié et en français) -->
        <script type="text/javascript" src="<?php echo ENV; ?>/Complements/Ext/PageSizer.js"></script>
        <script type="text/javascript" src="<?php echo ENV; ?>/Complements/Ext/ColumnAutoResizer.js"></script>
        <script type="text/javascript" src="<?php echo ENV; ?>/Complements/Ext/Ext.ux.Image.js"></script>
        <script type="text/javascript" src="<?php echo ENV; ?>/Complements/Ext/BufferedGroupingView.js"></script>
        <!-- Adaptations (code ajouté pour compatibilité avec PageSizer.js) -->
        <script type="text/javascript" src="<?php echo ENV; ?>/Adaptations/GeoExt/FeatureReader.js"></script>
        <!-- Outils -->
        <script type="text/javascript" src="<?php echo ENV; ?>/Outils/Global.js"></script>
        <!-- Personnalisation de l'application -->
        <script type="text/javascript" src="../<?php echo $configInstance; ?>/Appli.js"></script>
        <script type='text/javascript'>
            var authWMS = '<?php echo WMS_USERNAME; ?>';
            var mdpWMS = '<?php echo WMS_PASSWORD; ?>'
        </script>
        <script type="text/javascript" src="../<?php echo $configInstance; ?>/Carte.js"></script>
        <!-- Configuration de base -->
        <script type="text/javascript" src="../Controleurs/Defaut/General.js"></script>
        <script type="text/javascript" src="../Controleurs/Defaut/Carto.js"></script>
        <!--Formulaires -->
        <script type="text/javascript" src="../Controleurs/Formulaires/frmObs.js"></script>
        <script type="text/javascript" src="../Controleurs/Formulaires/frmGPX.js"></script>
        <script type="text/javascript" src="../Controleurs/Formulaires/frmPhoto.js"></script>
        <script type="text/javascript" src="../Controleurs/Formulaires/frmRecherche.js"></script>
        <!-- CartoGrille (obligatoirement après "Formulaires")-->
        <script type="text/javascript" src="../Controleurs/CartoGrilles/cgObs.js"></script>
    </head>
    <body>
    </body>
</html>
