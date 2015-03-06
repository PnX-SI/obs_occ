<?php
    // test si le module PostgreSQL d'Apache est bien installé
    if (extension_loaded('pgsql')) {
    }
    else {
        $errorMessage = 'ERREUR : module pgsql non installé';
        $data = 'cf php.ini => extension=pgsql.dll';
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
            $data .'"}');
    }

    // Paramétrage dynamique de PHP pour le développement
    
    ini_set('display_errors','On'); // Development Value: On - Production Value: Off
    ini_set('display_startup_errors','On'); // Development Value: On - Production Value: Off
    ini_set('error_reporting','E_ALL & ~E_DEPRECATED'); // Development Value: E_ALL & ~E_DEPRECATED - Production Value: E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED
    ini_set('track_errors','On'); // Development Value: On - Production Value: Off
    
    /*
    // Paramétrage dynamique de PHP pour ma mise en production
    ini_set('display_errors','Off'); // Development Value: On - Production Value: Off
    ini_set('display_startup_errors','Off'); // Development Value: On - Production Value: Off
    ini_set('error_reporting','E_ALL & ~E_DEPRECATED & ~E_STRICT'); // Development Value: E_ALL & ~E_DEPRECATED - Production Value: E_ALL & ~E_DEPRECATED & ~E_STRICT
    ini_set('track_errors','Off'); // Development Value: On - Production Value: Off
    */
    
    // Architecture de l'installation
    define('INSTALL', 'http://localhost:8080/git/obs_occ/Sources'); // pointer ici le dossier "Sources" de l'application
    define('LIB', '../../Librairies');
    define('ENV', '../../Environnement');

    // Configuration des instances d'application
    switch ($_GET['appli']) {
        case 'ObsOccPnX':
            $configInstance = 'Configuration/EnProduction/PnX';
            break;
        case 'ObsOccPnP':
            $configInstance = 'Configuration/EnProduction/PnP';
            break;
        default:
            header('Location: ../index.php'); // retour à la page d'accueil de l'application
            break;
    }
?>
