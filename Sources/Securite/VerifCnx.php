<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../Configuration/ConfigUtilisee.php';
    require_once '../' . $configInstance . '/PostGreSQL.php';
    
    if (!(isset($_SESSION[$_GET['appli']]['numerisateur']['code']) && isset($_SESSION[$_GET['appli']]['numerisateur']['libelle']) &&
    isset($_SESSION[$_GET['appli']]['numerisateur']['droit']) && isset($_SESSION[$_GET['appli']]['numerisateur']['profil']) &&
    isset($_SESSION[$_GET['appli']]['numerisateur']['idStructAppart']) && isset($_SESSION[$_GET['appli']]['Connexion']['LOGIN']) &&
    isset($_SESSION[$_GET['appli']]['Connexion']['USER']) && isset($_SESSION[$_GET['appli']]['Connexion']['PASSWORD']))) {
        header('Location: vAuthent.php?appli=' . $_GET['appli']);
    }
?>
