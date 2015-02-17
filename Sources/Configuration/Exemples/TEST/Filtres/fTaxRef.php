<?php
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';

    $valeur = pg_escape_string($_POST['valeur']); // besoin de "pg_escape_string" car piratage possible par l'utilisateur
    $cnxPgObsOcc = new CnxPgObsOcc();
    $cpt = 0;
    
    #$req = "MA REQUETE QUI PERMET DE FILTRER/VERIFIER LES DONNEES';
    #$rs = $cnxPgObsOcc->executeSql($req);
    #$cpt = pg_numrows($rs);
    
    if ($cpt == 0) {
        $data = 'Taxon OK';
        die('{success: true, data: "' . $data .'"}');
    }
    else {
        $errorMessage = 'AVERTISSEMENT : taxon XYZ';
        $data = 'Le taxon ' . $_POST['saisie'] . ' fait partie de XXX et ne devrait pas apparaitre ici !!!!! ';
    }
    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' . $data .'"}');
    unset($cnxPgObsOcc);
?>
