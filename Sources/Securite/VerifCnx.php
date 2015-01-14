<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../Configuration/ConfigUtilisee.php';
    require_once '../' . CONFIG . '/PostGreSQL.php';
    
    if (!(isset($_SESSION[APPLI]['numerisateur']['code']) && isset($_SESSION[APPLI]['numerisateur']['libelle']) &&
    isset($_SESSION[APPLI]['numerisateur']['droit']) && isset($_SESSION[APPLI]['numerisateur']['profil']) &&
    isset($_SESSION[APPLI]['Connexion']['LOGIN']) && isset($_SESSION[APPLI]['Connexion']['USER']) &&
    isset($_SESSION[APPLI]['Connexion']['PASSWORD']))) {
        header('Location: vAuthent.php');
    }
?>
