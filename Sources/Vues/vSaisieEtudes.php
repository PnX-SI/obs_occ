<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../Securite/VerifCnx.php';
    require_once '../Configuration/ConfigUtilisee.php';
    require_once '../' . CONFIG . '/PostGreSQL.php';
    require_once '../Securite/Decrypt.php';
    
    if (decrypteRSA(APPLI, $_SESSION[APPLI]['numerisateur']['droit']) != 'admin') {
         header('Location: vSaisieObs.php');
    }
?>
<html>
    <head>
        <title>Etudes</title>
        <!-- Définition du jeu de caractères -->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <!-- Bibliothèque Ext en français (version de production) -->
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/adapter/ext/ext-base.js"></script>
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/ext-all.js"></script>
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/src/locale/ext-lang-fr.js"></script>
        <!-- Complément de Ext -->
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/examples/ux/ux-all.js"></script>
        <!-- Feuilles de style (bibliothèques) -->
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/resources/css/ext-all.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/examples/ux/css/ux-all.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/examples/ux/gridfilters/css/GridFilters.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/examples/ux/gridfilters/css/RangeMenu.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/examples/ux/statusbar/css/statusbar.css" />
        <!-- Feuilles de style (application) -->
        <link type="text/css" rel="stylesheet" href="<?php echo ENV; ?>/Ergonomie/Grilles/gFds.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo ENV; ?>/Ergonomie/Formulaires/frmFds.css" />
        <!-- Compléments (remarque : PageSizer.js modifié et en français) -->
        <script type="text/javascript" src="<?php echo ENV; ?>/Complements/Ext/PageSizer.js"></script>
        <script type="text/javascript" src="<?php echo ENV; ?>/Complements/Ext/ColumnAutoResizer.js"></script>
        <!-- Outils -->
        <script type="text/javascript" src="<?php echo ENV; ?>/Outils/Global.js"></script>
        <!-- Personnalisation de l'application -->
        <script type="text/javascript" src="../<?php echo CONFIG; ?>/Appli.js"></script>
        <!-- Configuration de base -->
        <script type="text/javascript" src="../Controleurs/Defaut/General.js"></script>
        <!--Formulaires -->
        <script type="text/javascript" src="../Controleurs/Formulaires/frmEtude.js"></script>
        <!-- CartoGrille (obligatoirement après "Formulaires")-->
        <script type="text/javascript" src="../Controleurs/Grilles/gEtudes.js"></script>
    </head>
    <body>        
    </body>
</html>
