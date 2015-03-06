<?php
   if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../Modeles/Classes/ClassObs.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    require_once '../../Securite/Decrypt.php';
                        
    //Traitement spécifique pour la saisie d'un taxon
    function traiteTaxonomie(&$obj, $regne, $cd_nom) { // passage par référence de l'objet
        if ((isset($cd_nom)) && (isset($regne)) && ($regne != 'Habitat')) {
            $cnxPgObsOcc = new CnxPgObsOcc();
            $req = "SELECT phylum, classe, ordre, famille, nom_valide FROM INPN.TAXREF
                WHERE cd_nom = '" . $_POST['cd_nom'] . "'";
            $rs = $cnxPgObsOcc->executeSql($req);
            if (pg_numrows($rs) == 1) {
                $obj->phylum = pg_fetch_result($rs, 0, 'phylum');
                $obj->classe = pg_fetch_result($rs, 0, 'classe');
                $obj->ordre = pg_fetch_result($rs, 0, 'ordre');
                $obj->famille = pg_fetch_result($rs, 0, 'famille');
                $obj->nom_valide = pg_fetch_result($rs, 0, 'nom_valide');
            }
            unset($cnxPgObsOcc);
        }
    }

    //Traitement spécifique pour la saisie d'un point (x=longitude, y=latitude)
    function traiteCoord(&$obj, $long, $lat) { // passage par référence de l'objet
        // ATTENTION : les coordonnées sont modifiables aussi depuis le formulaire
       if ((isset($long) && (isset($lat)))) {
            if (($obj->longitude != '') && ($obj->latitude != '') &&
            ($obj->longitude >= -180) && ($obj->longitude <= 180) &&
            ($obj->latitude >= - 90) && ($obj->latitude <= 90)) {
                 // besoin de "pg_escape_string" car seul cas de type "geometry" (non controlé par "valeurControlee") maîtrisé par l'utilisateur
                 $obj->geometrie = "st_transform(ST_GeometryFromText('POINT(" . pg_escape_string($obj->longitude) .
                    ' ' . pg_escape_string($obj->latitude) . ")', 4326), " . $_POST['EPSG'] . ')';
            }
        }
    }
    switch ($_POST['action']) {
        case 'SupprimerListeId':
            $nbSuppr = Obs::supprimeId($_POST['listId']);
            $nbListId = count(explode(', ', $_POST['listId']));
            switch ($nbSuppr) {
                case $nbListId:
                    $data = 'Observations supprimées avec succès';
                    die('{success: true, data: "' . $data . '"}');
                    break;
                case 0:
                    $errorMessage = 'Opérations de suppression impossibles';
                    $data = "Aucune de ces données ne vous appartient ou vous n'avez " .
                        'pas les droits suffisants de suppression';
                    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                        $data .'"}');
                    break;
                default:
                    $errorMessage = 'Opérations de suppression partielles';
                    $data = 'Certaines de ces données ne vous appartiennent pas ' .
                        "ou vous n'avez pas les droits suffisants de suppression";
                    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                        $data .'"}');
                    break;
            }
            break;
        case 'Valider':
            if (Obs::valide($_POST['id_obs'], $_POST['statut_validation'], decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']),
            $_POST['decision_validation']) == 0) {
                $errorMessage = 'Opération de validation impossible';
                $data = "Vous n'avez pas les droits suffisants de validation";
                die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                    $data .'"}');
            }
            else {
                $data = 'Observation validée avec succès';
                die('{success: true, data: "' . $data . '"}');
            }
            break;
        default:
            $obs = new Obs();
            if (isset($_POST['id_obs'])) {
                $obs->id_obs = $_POST['id_obs'];
            }
            if (isset($_POST['heure_obs'])) {
                $obs->heure_obs = $_POST['heure_obs'];
            }
            if (isset($_POST['date_obs'])) {
                $obs->date_obs = $_POST['date_obs'];
            }
            if (isset($_POST['date_debut_obs'])) {
                $obs->date_debut_obs = $_POST['date_debut_obs'];
            }
            if (isset($_POST['date_fin_obs'])) {
                $obs->date_fin_obs = $_POST['date_fin_obs'];
            }
            if (isset($_POST['date_textuelle'])) {
                $obs->date_textuelle = $_POST['date_textuelle'];
            }
            if (isset($_POST['nom_vern'])) {
                $obs->nom_vern = $_POST['nom_vern'];
            }
            if (isset($_POST['nom_complet'])) {
                $obs->nom_complet = $_POST['nom_complet'];
            }
            if (isset($_POST['cd_nom'])) {
                $obs->cd_nom = $_POST['cd_nom'];
            }
            if (isset($_POST['regne'])) {
                $obs->regne = $_POST['regne'];
            }
            if (isset($_POST['effectif'])) {
                $obs->effectif = $_POST['effectif'];
            }
            if (isset($_POST['effectif_min'])) {
                $obs->effectif_min = $_POST['effectif_min'];
            }
            if (isset($_POST['effectif_max'])) {
                $obs->effectif_max = $_POST['effectif_max'];
            }
            if (isset($_POST['effectif_textuel'])) {
                $obs->effectif_textuel = $_POST['effectif_textuel'];
            }
            if (isset($_POST['type_effectif'])) {
                $obs->type_effectif = $_POST['type_effectif'];
            }
            if (isset($_POST['phenologie'])) {
                $obs->phenologie = $_POST['phenologie'];
            }
            if (isset($_POST['precision'])) {
                $obs->precision = $_POST['precision'];
            }
            if (isset($_POST['determination'])) {
                $obs->determination = $_POST['determination'];
            }
            if (isset($_POST['statut_validation'])) {
                $obs->statut_validation = $_POST['statut_validation'];
            }
            if (isset($_POST['decision_validation'])) {
                $obs->decision_validation = $_POST['decision_validation'];
            }
            if (isset($_POST['id_waypoint'])) {
                $obs->id_waypoint = $_POST['id_waypoint'];
            }
            if (isset($_POST['longitude'])) {
                $obs->longitude = $_POST['longitude'];
            }
            if (isset($_POST['latitude'])) {
                $obs->latitude = $_POST['latitude'];
            }
            if (isset($_POST['elevation'])) {
                $obs->elevation = $_POST['elevation'];
            }
            if (isset($_POST['localisation'])) {
                $obs->localisation = $_POST['localisation'];
            }
            if (isset($_POST['code_insee'])) {
                $obs->code_insee = $_POST['code_insee'];
            }
            if (isset($_POST['id_lieu_dit'])) {
                $obs->id_lieu_dit = $_POST['id_lieu_dit'];
            }
            if (isset($_POST['observateur'])) {
                $obs->observateur = $_POST['observateur'];
            }
            if (isset($_POST['structure'])) {
                $obs->structure = $_POST['structure'];
            }
            if (isset($_POST['remarque_obs'])) {
                $obs->remarque_obs = $_POST['remarque_obs'];
            }
            if (isset($_POST['id_etude'])) {
                $obs->id_etude = $_POST['id_etude'];
            }
            if (isset($_POST['id_protocole'])) {
                $obs->id_protocole = $_POST['id_protocole'];
            }
            if (isset($_POST['diffusable'])) {
                $obs->diffusable = $_POST['diffusable'];
            }
            if (isset($_POST['geometrie'])) {
                $obs->geometrie = "st_transform(ST_GeometryFromText('" . $_POST['geometrie'] .
                    "', 4326), " . $_POST['EPSG'] . ')';
            }
            if (isset($_POST['url_photo'])) {
                $obs->url_photo = $_POST['url_photo'];
            }
            if (isset($_POST['commentaire_photo'])) {
                $obs->commentaire_photo = $_POST['commentaire_photo'];
            }
            switch ($_POST['action']) {
                case 'Ajouter':
                    $obs->numerisateur = decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']);
                    traiteCoord($obs, $_POST['longitude'], $_POST['latitude']);
                    traiteTaxonomie($obs, $_POST['regne'], $_POST['cd_nom']);
                    $obs->ajoute(false);
                    $data = 'Observation ajoutée avec succès';
                    die('{success: true, data: "' . $data . '"}');
                    break;
                case 'Modifier':
                    unset($obs->geometrie);
                    traiteCoord($obs, $_POST['longitude'], $_POST['latitude']);
                    traiteTaxonomie($obs, $_POST['regne'], $_POST['cd_nom']);
                    if ($obs->modifie() == 0) {
                        $errorMessage = 'Opération de modification impossible';
                        $data = "Vous n'êtes pas le propriétaire de la donnée ou " .
                            "vous n'avez pas les droits suffisants pour la modifier";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Observation modifiée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Supprimer':
                    if ($obs->supprime() == 0) {
                        $errorMessage = 'Opération de suppression impossible';
                        $data = "Vous n'êtes pas le propriétaire de la donnée ou " .
                            "vous n'avez pas les droits suffisants pour la supprimer";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Observation supprimée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
                case 'Redessiner':
                    if ($obs->modifie() == 0) {
                        $errorMessage = 'Opération de redessin impossible';
                        $data = "Vous n'êtes pas le propriétaire de la donnée ou " .
                            "vous n'avez pas les droits suffisants pour la redessiner";
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    else {
                        $data = 'Observation redessinée avec succès';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    break;
            }
            break;
    }
?>