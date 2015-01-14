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

    // Configuration dynamique de PHP pour le développement
    ///*
    ini_set('display_errors','On'); // Development Value: On - Production Value: Off
    ini_set('display_startup_errors','On'); // Development Value: On - Production Value: Off
    ini_set('error_reporting','E_ALL & ~E_DEPRECATED'); // Development Value: E_ALL & ~E_DEPRECATED - Production Value: E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED
    ini_set('track_errors','On'); // Development Value: On - Production Value: Off
    //*/
    
    // Configuration dynamique de PHP pour ma mise en production
    /*
    ini_set('display_errors','On'); // Development Value: On - Production Value: Off
    ini_set('display_startup_errors','On'); // Development Value: On - Production Value: Off
    ini_set('error_reporting','E_ALL & ~E_NOTICE & ~E_STRICT & ~E_DEPRECATED'); // Development Value: E_ALL & ~E_DEPRECATED - Production Value: E_ALL & ~E_DEPRECATED & ~E_STRICT
    ini_set('track_errors','On'); // Development Value: On - Production Value: Off
    */
    
    define('LIB', '../../Librairies');
    define('ENV', '../../Environnement');
    //define('CONFIG', 'Configuration/EnProduction/PNP');
    define('CONFIG', 'Configuration/EnProduction/PnX');
?>
