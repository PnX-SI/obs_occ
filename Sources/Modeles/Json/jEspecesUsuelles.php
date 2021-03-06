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
            $req = 'SELECT MAX(id_obs) AS id_obs, nom_vern AS espece FROM SAISIE.SAISIE_OBSERVATION_' .
                decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']) . " WHERE regne = '" .
                $_REQUEST['filtre'] . "' AND nom_vern IS NOT NULL GROUP BY nom_vern ORDER BY id_obs DESC LIMIT 7";
            break;
        case 'genre':
            if ($_REQUEST['filtre'] == 'Habitat') {
                $req = "SELECT cd_cb || ' - ' || lb_cb97_fr AS espece
                    FROM INPN.TYPO_CORINE_BIOTOPES
                    WHERE UNACCENT(cd_cb || ' - ' || lb_cb97_fr) ILIKE '%' || UNACCENT('". $critere . "') || '%'
                    AND lb_cb97_fr IS NOT NULL 
                    ORDER BY espece";
            }
            else {
                $req = "(
                        SELECT DISTINCT(split_part(nom_vern, ' ', 1)) AS espece 
                        FROM INPN.TAXREF 
                        WHERE regne = '" . $_REQUEST['filtre'] . "' 
                        AND UNACCENT(split_part(nom_vern, ' ', 1)) ILIKE '%' || UNACCENT(split_part('" . $critere . "', ' ', 1)) || '%'
                        ORDER BY espece
                    )
                    UNION ALL 
                    (
                        SELECT '-' AS espece
                    ) 
                    UNION ALL 
                    (
                        SELECT DISTINCT(nom_vern) AS espece 
                        FROM INPN.TAXREF 
                        WHERE regne = '" . $_REQUEST['filtre'] . "' 
                        AND UNACCENT(nom_vern) ILIKE '%' || UNACCENT(split_part('" . $critere . "', ' ', 1)) || '%'
                        ORDER BY espece
                    )";
            }
            break;
        case 'espece':
            if ($_REQUEST['filtre'] == 'Habitat') {
                $req = "SELECT cd_cb || ' - ' || lb_cb97_fr AS espece
                    FROM INPN.TYPO_CORINE_BIOTOPES
                    WHERE UNACCENT(cd_cb || ' - ' || lb_cb97_fr) ILIKE '%' || UNACCENT('". $critere . "') || '%'
                    AND lb_cb97_fr IS NOT NULL 
                    ORDER BY espece";
            }
            else {
                $req = "SELECT DISTINCT(nom_vern) AS espece 
                    FROM INPN.TAXREF 
                    WHERE regne = '" . $_REQUEST['filtre'] . "'
                    AND UNACCENT(nom_vern) ILIKE '%' || UNACCENT(split_part('" . $critere . "', ' ', 1)) || '%' 
                    AND UNACCENT(nom_vern) ILIKE '%' || UNACCENT(split_part('" . $critere . "', ' ', 2)) || '%' 
                    ORDER BY espece";
                
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
