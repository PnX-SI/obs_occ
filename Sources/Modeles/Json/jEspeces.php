<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    $critere = mb_substr(pg_escape_string($_REQUEST['critere']), 0, NULL, 'UTF-8');// besoin de "pg_escape_string" car valeur maîtrisée par l'utilisateur
    $cnxPgObsOcc = new CnxPgObsOcc();
    switch ($_REQUEST['mode']) {
        case '7dernieres':
            $req = 'SELECT MAX(id_obs) AS id_obs, nom_complet AS espece FROM SAISIE.SAISIE_OBSERVATION_' .
                decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']) . " WHERE regne = '" .
                $_REQUEST['filtre'] . "' GROUP BY nom_complet ORDER BY id_obs DESC LIMIT 7";
            break;
        case 'genre':
            if ($_REQUEST['filtre'] == 'Habitat') {
                $req = "SELECT lb_cb97_fr AS espece FROM INPN.TYPO_CORINE_BIOTOPES
                    WHERE lb_cb97_fr IS NOT NULL AND lb_cb97_fr ILIKE '%" . $critere . "%' ORDER BY espece";
            }
            else {
                $req = "(SELECT DISTINCT(split_part(nom_complet, ' ', 1)) AS espece FROM
                    INPN.TAXREF WHERE regne = '" . $_REQUEST['filtre'] . "' AND
                    split_part(nom_complet, ' ', 1) ILIKE '%" . $critere . "%' ORDER BY espece)
                    UNION ALL (SELECT '-') UNION ALL (SELECT DISTINCT(nom_complet) AS espece FROM        
                    INPN.TAXREF WHERE regne = '" . $_REQUEST['filtre'] . "' AND             
                    nom_complet ILIKE '%" . $critere . "%' ORDER BY espece)";
            }
            break;
        case 'espece':
            if ($_REQUEST['filtre'] == 'Habitat') {
                $req = "SELECT lb_cb97_fr AS espece FROM INPN.TYPO_CORINE_BIOTOPES
                    WHERE split_part(lb_cb97_fr, ' ', 1) ILIKE '" . $critere .
                    "' ORDER BY espece";
            }
            else {
                if ($_REQUEST['choixEspeceForcee'] == 'true') {
                    $req = "SELECT DISTINCT(nom_complet) AS espece FROM INPN.TAXREF
                        WHERE regne = '" . $_REQUEST['filtre'] . "' AND split_part(nom_complet, ' ', 1)
                        ILIKE '" . $critere . "' AND split_part(nom_complet, ' ', 2)
                        != '' AND split_part(nom_complet, ' ', 2) != 'sp.' ORDER
                        BY espece";
                }
                else {
                    $req = "SELECT DISTINCT(nom_complet) AS espece FROM (SELECT DISTINCT(nom_complet)
                        FROM INPN.TAXREF WHERE regne = '" . $_REQUEST['filtre'] . "'
                        AND split_part(nom_complet, ' ', 1) ILIKE '" . $critere . "'
                        AND split_part(nom_complet, ' ', 2) != '' UNION SELECT '" . $critere .
                        " sp.'  AS nom_complet) AS ESPECES ORDER BY espece";
                }
                
            }
            break;
        default:
            if ($_REQUEST['filtre'] == 'Habitat') {
                $req = "SELECT DISTINCT(lb_cb97_fr) AS espece FROM INPN.TYPO_CORINE_BIOTOPES
                    WHERE cd_cb || ' - ' || lb_cb97_fr = '" . $critere . "' ORDER BY espece";
            }
            else {
                if ($_REQUEST['choixEspeceForcee'] == 'true') {
                    $req = "SELECT DISTINCT(nom_complet) AS espece FROM INPN.TAXREF
                        WHERE regne = '" . $_REQUEST['filtre'] . "' AND cd_nom IN
                        (SELECT DISTINCT(cd_ref) FROM INPN.TAXREF WHERE regne =
                        '" . $_REQUEST['filtre'] . "' AND nom_vern = '" . $critere .
                        "') ORDER BY espece";
                }
                else {
                    $req = "WITH TAXONS AS (SELECT DISTINCT(nom_complet) FROM INPN.TAXREF
                        WHERE regne = '" . $_REQUEST['filtre'] . "' AND cd_nom IN (SELECT
                        DISTINCT(cd_ref) FROM INPN.TAXREF WHERE regne = '" . $_REQUEST['filtre'] .
                        "' AND nom_vern = '" . $critere . "')) SELECT DISTINCT(nom_complet)
                        AS espece FROM (SELECT nom_complet FROM TAXONS UNION SELECT
                        DISTINCT(split_part(nom_complet, ' ', 1) || ' sp.') AS nom_complet
                        FROM TAXONS) AS ESPECES WHERE split_part(nom_complet, ' ', 2) != ''
                        ORDER BY espece";
                }
            }
            break;
    }
    $rs = $cnxPgObsOcc->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgObsOcc);
?>
