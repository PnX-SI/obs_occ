<?php
    /*
     * AGIT SUR LES OBSERVATIONS AFFICHEES SELON LA REQUETE SE TROUVANT DANS Modeles\GeoJson\gjObs.php => PERMET DE PERSONNALISER UN FILTRE SUR LES DONNEES
     */
    
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    // Initialisation de la variable globale pour le filtre sur les données
    // par défaut : tout le monde a accès à tout en lecture
    $filter = '0 = 0'; 
    
    // Liste des variables de session utilisables pour contruire son propre filtre (informations correspondant au compte connecté)
    /*
    $numerisateur = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']);
    $numerisat = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['libelle']);
    $profil = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['profil']);
    $droit = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['droit']);
    $idSociete = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['idSociete']);
    $nomSociete = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['nomSociete']);
    //ATTENTION !!! La struture d'appartenance n'est pas obligatoire, penser donc à tester sa valeur avant de l'utiliser dans une requête
    //si cette dernière est une chaîne de caractères vide alors la remplacer par le mot "NULL" pour être comptabible en SQL
    $idStructAppart = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['idStructAppart']);
    if ($idStructAppart == '') {
        $idStructAppart = 'NULL'; // 
    } 
    */        
    
    // A DECOMMENTER ET A ADAPTER SELON VOTRE PROPRE CAS
    
    // Exemple pour afficher uniquement les observations du compte amateur connecté
    // Remarque : les comptes experts et administrateurs accèdent toujours à l'ensemble des données
    /*
    $droit = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['droit']);    
    $numerisateur = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']);
    if (($droit != 'expert') && ($droit != 'admin')) {
        $filter .= ' AND numerisateur = ' . $numerisateur;
    }
    */
        
    // Exemple pour afficher uniquement les observations récoltées pour la structure d'appartenance du compte amateur connecté
    // Remarque : l'utilisateur connecté continue d'avoir un accès en lecture/écriture à ses donnnées même si il les a récoltées pour une autre structure que la sienne    
    /*
    $droit = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['droit']);
    $numerisateur = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']);
    $idStructAppart = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['idStructAppart']);
    if ($idStructAppart == '') {
        $idStructAppart = 'NULL'; // compatibilité avec la requête SQL
    }            
    if (($droit != 'expert') && ($droit != 'admin')) {
        $filter .= ' AND (numerisateur = ' . $numerisateur;
        $filter .= ' OR ' . $idStructAppart . ' IN (SELECT regexp_split_to_table(structure,' . "'&'" . ')::integer))';
    }
    */
?>
 