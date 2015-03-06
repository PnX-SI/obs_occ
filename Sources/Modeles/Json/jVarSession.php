<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';

    switch ($_POST['varSession']) {
        case 'infosNumerisateur':
            $numerisateur = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']);
            $numerisat = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['libelle']);
            $profil = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['profil']);
            $droit = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['droit']);
            $idSociete = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['idSociete']);
            $nomSociete = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['nomSociete']);
            die('{success: true, numerisateur: "' . $numerisateur . '", numerisat: "' .
                $numerisat . '", profil: "' . $profil . '", droit: "' . $droit . 
                '", idSociete: "' . $idSociete . '", nomSociete: "' . $nomSociete . '"}');
        break;
        case 'saisieEnCours':
            $data = $_SESSION[$_GET['appli']]['saisieEnCours'];
            die('{success: true, data: "' . $data . '"}');
        break;
    }
    $errorMessage = 'ERREUR : variable de session inexistante';
    $data = $_POST['varSession'];
    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
       $data .'"}');
?>