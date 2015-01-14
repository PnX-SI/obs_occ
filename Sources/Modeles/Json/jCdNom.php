<?php
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    
    $valeur = pg_escape_string($_POST['valeur']); // besoin de "pg_escape_string" car piratage possible par l'utilisateur
    $cnxPgObsOcc = new CnxPgObsOcc();
    $cpt = 0;
    if ($_POST['filtre'] == 'Habitat') {
        $req = "SELECT cd_cb FROM INPN.TYPO_CORINE_BIOTOPES WHERE lb_cb97_fr = '" .
            $valeur . "'";
        $rs = $cnxPgObsOcc->executeSql($req);
        $cpt = pg_numrows($rs);
    }
    // ordre des tests important ici
    else {
        // tests avec prise en compte de l'auteur (requête sur le nom_complet)
        $valeur = $valeur . ' sp.';
        $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
            "' AND nom_complet = '" . $valeur . "'";
        $rs = $cnxPgObsOcc->executeSql($req);
        $cpt = pg_numrows($rs);
        if ($cpt == 0) {
            $valeur = mb_substr($valeur, 0, strlen($valeur) - strlen(' sp.'), 'UTF-8');
            $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                "' AND nom_complet = '" . $valeur . "'";
            $rs = $cnxPgObsOcc->executeSql($req);
            $cpt = pg_numrows($rs);
            if ($cpt == 0) {
                $valeur = mb_substr($valeur, 0, strlen($valeur) - strlen(' sp.'), 'UTF-8');
                $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                    "' AND nom_complet = '" . $valeur . "'";
                $rs = $cnxPgObsOcc->executeSql($req);
                $cpt = pg_numrows($rs);
                if ($cpt == 0) {
                    // mêmes tests avec un "espace" supplémentaire en fin du mot saisi et prise en compte de l'auteur (requête sur le nom_complet)
                    $valeur = pg_escape_string($_POST['valeur'] . ' ') . ' sp.'; // besoin de "pg_escape_string" car piratage possible par l'utilisateur
                    $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                        "' AND nom_complet = '" . $valeur . "'";
                    $rs = $cnxPgObsOcc->executeSql($req);
                    $cpt = pg_numrows($rs);
                    if ($cpt == 0) {
                        $valeur = mb_substr($valeur, 0, strlen($valeur) - strlen(' sp.'), 'UTF-8');
                        $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                            "' AND nom_complet = '" . $valeur . "'";
                        $rs = $cnxPgObsOcc->executeSql($req);
                        $cpt = pg_numrows($rs);
                        if ($cpt == 0) {
                            $valeur = mb_substr($valeur, 0, strlen($valeur) - strlen(' sp.'), 'UTF-8');
                            $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                                "' AND nom_complet = '" . $valeur . "'";
                            $rs = $cnxPgObsOcc->executeSql($req);
                            $cpt = pg_numrows($rs);
                            if ($cpt == 0) {
                                // mêmes tests mais sans prise en compte de l'auteur (requête sur le lb_nom)
                                $valeur = pg_escape_string($_POST['valeur']) . ' sp.'; // besoin de "pg_escape_string" car piratage possible par l'utilisateur
                                $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                                    "' AND lb_nom = '" . $valeur . "'";
                                $rs = $cnxPgObsOcc->executeSql($req);
                                $cpt = pg_numrows($rs);
                                if ($cpt == 0) {
                                    $valeur = mb_substr($valeur, 0, strlen($valeur) - strlen(' sp.'), 'UTF-8');
                                    $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                                        "' AND lb_nom = '" . $valeur . "'";
                                    $rs = $cnxPgObsOcc->executeSql($req);
                                    $cpt = pg_numrows($rs);
                                    if ($cpt == 0) {
                                        $valeur = mb_substr($valeur, 0, strlen($valeur) - strlen(' sp.'), 'UTF-8');
                                        $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                                            "' AND lb_nom = '" . $valeur . "'";
                                        $rs = $cnxPgObsOcc->executeSql($req);
                                        $cpt = pg_numrows($rs);
                                        if ($cpt == 0) {
                                            // même tests avec un "espace" supplémentaire en fin du mot saisi mais sans prise en compte de l'auteur (requête sur le lb_nom)
                                            $valeur = pg_escape_string($_POST['valeur'] . ' ') . ' sp.'; // besoin de "pg_escape_string" car piratage possible par l'utilisateur
                                            $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                                                "' AND lb_nom = '" . $valeur . "'";
                                            $rs = $cnxPgObsOcc->executeSql($req);
                                            $cpt = pg_numrows($rs);
                                            if ($cpt == 0) {
                                                $valeur = mb_substr($valeur, 0, strlen($valeur) - strlen(' sp.'), 'UTF-8');
                                                $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                                                    "' AND lb_nom = '" . $valeur . "'";
                                                $rs = $cnxPgObsOcc->executeSql($req);
                                                $cpt = pg_numrows($rs);
                                                if ($cpt == 0) {
                                                    $valeur = mb_substr($valeur, 0, strlen($valeur) - strlen(' sp.'), 'UTF-8');
                                                    $req = "SELECT cd_nom FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                                                        "' AND lb_nom = '" . $valeur . "'";
                                                    $rs = $cnxPgObsOcc->executeSql($req);
                                                    $cpt = pg_numrows($rs);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    if ($cpt == 1) {
        $data = pg_result($rs, 0, 0);
        die('{success: true, data: "' . $data .'"}');
    }
    else {
        if ($_POST['filtre'] == 'Habitat') {
            $errorMessage = 'ATTENTION : problème de référentiel des habitats';
            $data = 'Habitat introuvable ' . $_POST['valeur'];
        }
        else {
            if ($cpt == 0) {
                $errorMessage = 'ATTENTION : problème de référentiel taxonomique';
                $data = 'Taxon introuvable (nom latin) ' . $_POST['filtre'] . ' | '.
                    $_POST['valeur'];
            }
            else {
                $req = "SELECT cd_nom, cd_ref  FROM INPN.TAXREF WHERE regne = '" . $_POST['filtre'] .
                    "' AND nom_complet = '" . $valeur . "'";
                $rs = $cnxPgObsOcc->executeSql($req);
                $cpt = pg_numrows($rs);
                if ($cpt > 1) {
                    while ($obj = pg_fetch_object($rs)) {
                        if ($obj->cd_nom == $obj->cd_ref) {
                            $data = $obj->cd_nom;
                            die('{success: true, data: "' . $data .'"}');
                        }
                    }
                }
                $errorMessage = 'ATTENTION : problème de synonymie sur le référentiel taxonomique';
                $data = 'Plusieurs taxons trouvés (nom latin) ' . $_POST['filtre'] .
                    ' | '. $_POST['valeur'] . " ; veuillez préciser l'espèce ou saisir le taxon de référence";
            }
        }
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
           $data .'"}');
    }
    unset($cnxPgObsOcc);
?>
