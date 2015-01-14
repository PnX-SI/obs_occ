<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    require_once '../../' . CONFIG . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    $critere = pg_escape_string($_REQUEST['critere']);// besoin de "pg_escape_string" car valeur maîtrisée par l'utilisateur
    $cnxPgObsOcc = new CnxPgObsOcc();
    switch ($_REQUEST['mode']) {
        case '7dernieres':
            $req = 'SELECT MAX(id_obs) AS id_obs, nom_complet AS espece FROM SAISIE.SAISIE_OBSERVATION_' .
                decrypteRSA(APPLI, $_SESSION[APPLI]['numerisateur']['code']) . " WHERE regne = '" .
                $_REQUEST['filtre'] . "' GROUP BY nom_complet ORDER BY id_obs DESC LIMIT 7";
            break;
        case 'genre':
            if ($_REQUEST['filtre'] == 'Habitat') {
                $req = "SELECT DISTINCT(split_part(lb_cb97_fr, ' ', 1)) AS espece FROM
                    INPN.TYPO_CORINE_BIOTOPES WHERE UPPER(split_part(lb_cb97_fr, ' ', 1))
                    LIKE UPPER('" . mb_substr($critere, 0, 3, 'UTF-8') . "%') ORDER BY espece";
            }
            else {
                $req = "SELECT DISTINCT(split_part(nom_complet, ' ', 1)) AS espece FROM
                    INPN.TAXREF WHERE regne = '" . $_REQUEST['filtre'] . "' AND
                    UPPER(split_part(nom_complet, ' ', 1)) LIKE UPPER('" .
                    mb_substr($critere, 0, 3, 'UTF-8') . "%') ORDER BY espece";
            }
            break;
        case 'espece':
            if ($_REQUEST['filtre'] == 'Habitat') {
                $req = "SELECT DISTINCT(lb_cb97_fr) AS espece FROM INPN.TYPO_CORINE_BIOTOPES
                    WHERE UPPER(split_part(lb_cb97_fr, ' ', 1)) = UPPER('" . $critere .
                    "') ORDER BY espece";
            }
            else {
                if ($_REQUEST['choixEspeceForcee'] == 'true') {
                    $req = "SELECT DISTINCT(nom_complet) AS espece FROM INPN.TAXREF
                        WHERE regne = '" . $_REQUEST['filtre'] . "' AND UPPER(split_part(nom_complet, ' ', 1))
                        = UPPER('" . $critere . "') AND split_part(nom_complet, ' ', 2)
                        != '' AND split_part(nom_complet, ' ', 2) != 'sp.' ORDER
                        BY espece";
                }
                else {
                    $req = "SELECT DISTINCT(nom_complet) AS espece FROM (SELECT DISTINCT(nom_complet)
                        FROM INPN.TAXREF WHERE regne = '" . $_REQUEST['filtre'] . "'
                        AND UPPER(split_part(nom_complet, ' ', 1)) = UPPER('" . $critere . "')
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
