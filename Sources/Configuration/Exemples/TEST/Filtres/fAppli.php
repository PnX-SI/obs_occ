<?php
    // Fichier servant à filtrer spécifiquement les données de l'application
    // selon les critères définis par le client
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    $filter = '0 = 0'; // variable globale pour le filtre
    
    //POSSIBILITE D'Ajouter d'autre filtre ICI
    //$filter .= ' AND .....' 
    
?>
