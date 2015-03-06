<?php
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';

    $valeur = pg_escape_string($_POST['valeur']); // besoin de "pg_escape_string" car piratage possible par l'utilisateur
    $cnxPgObsOcc = new CnxPgObsOcc();
    $cpt = 0;
    // propre au PnC pour diriger les utilisateurs vers l'application "SaisieFlore"
    /*if (($_POST['filtre'] == 'Plantae') || ($_POST['filtre'] == 'Fungi')) {
        $req = "SELECT nom_valide FROM (SELECT cd_nom FROM inpn.cd_ref_protocole_enjeux
            UNION SELECT cd_nom FROM inpn.cd_ref_protocole_lichens) protocoles
            JOIN (SELECT cd_nom, nom_valide FROM inpn.taxref WHERE regne = '" . $_POST['filtre'] .
            "' AND cd_ref IN (SELECT cd_ref FROM inpn.taxref WHERE regne = '" .
            $_POST['filtre'] . "' AND cd_nom = '" . $valeur . "'" . ')) taxons USING(cd_nom)';
        $rs = $cnxPgObsOcc->executeSql($req);
        $cpt = pg_numrows($rs);
    }*/
    if ($cpt == 0) {
        $data = 'Taxon OK';
        die('{success: true, data: "' . $data .'"}');
    }
    else {
        $errorMessage = 'AVERTISSEMENT : taxon du protocole Flore/Lichen';
        $data = 'Le taxon ' . $_POST['saisie'] . ' (alias ' . pg_result($rs, 0, 0) .
            ') fait partie du protocole Flore/Lichen ; veuillez renseigner plutôt' .
            " cette donnée dans ce cadre avec l'outil de collecte correspondant";
    }
    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
       $data .'"}');
    unset($cnxPgObsOcc);
?>
