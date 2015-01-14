<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . CONFIG . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';

    switch ($_POST['varSession']) {
        case 'infosNumerisateur':
            $numerisateur = decrypteRSA(APPLI, $_SESSION[APPLI]['numerisateur']['code']);
            $numerisat = decrypteRSA(APPLI, $_SESSION[APPLI]['numerisateur']['libelle']);
            $profil = decrypteRSA(APPLI, $_SESSION[APPLI]['numerisateur']['profil']);
            $droit = decrypteRSA(APPLI, $_SESSION[APPLI]['numerisateur']['droit']);
            $idSociete = decrypteRSA(APPLI, $_SESSION[APPLI]['numerisateur']['idSociete']);
            $nomSociete = decrypteRSA(APPLI, $_SESSION[APPLI]['numerisateur']['nomSociete']);
            die('{success: true, numerisateur: "' . $numerisateur . '", numerisat: "' .
                $numerisat . '", profil: "' . $profil . '", droit: "' . $droit . 
                '", idSociete: "' . $idSociete . '", nomSociete: "' . $nomSociete . '"}');
        break;
        case 'saisieEnCours':
            $data = $_SESSION[APPLI]['saisieEnCours'];
            die('{success: true, data: "' . $data . '"}');
        break;
    }
    $errorMessage = 'ERREUR : variable de session inexistante';
    $data = $_POST['varSession'];
    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
       $data .'"}');
?>