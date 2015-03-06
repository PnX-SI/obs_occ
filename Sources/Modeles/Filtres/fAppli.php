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

    // construction du filtre
    $droit = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['droit']);
    if (($droit != 'expert') && ($droit != 'admin')) {
        //$filter .= ' AND numerisateur = ' . decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']);
    }
?>