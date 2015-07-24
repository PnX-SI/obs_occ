<?php
    // Fichier qui vérifie la présence d'un filtre éventuel sur les taxons lors de la saisie (propre à chaque instance d'application)
    require_once '../../Configuration/ConfigUtilisee.php';
    if(!@include('../../' . $configInstance . '/Filtres/fAppli.php')) {
        $filter = '0 = 0'; // variable globale pour le filtre
    }
?>
