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
                $req = "(
                        SELECT DISTINCT(split_part(lb_cb97_fr, ' ', 1)) AS espece 
                        FROM INPN.TYPO_CORINE_BIOTOPES 
                        WHERE UNACCENT(split_part(lb_cb97_fr, ' ', 1)) ILIKE '%' || UNACCENT(split_part('" . $critere . "', ' ', 1)) || '%'
                        ORDER BY espece
                    )
                    UNION ALL 
                    (
                        SELECT '-' AS espece
                    ) 
                    UNION ALL 
                    (
                        SELECT DISTINCT(lb_cb97_fr) AS espece 
                        FROM INPN.TYPO_CORINE_BIOTOPES  
                        WHERE UNACCENT(lb_cb97_fr) ILIKE '%' || UNACCENT(split_part('" . $critere . "', ' ', 1)) || '%'
                        ORDER BY espece
                    )";
            }
            else {
                if ($_REQUEST['choixEspeceForcee'] == 'true') {
                    $req = "(
                        SELECT DISTINCT(split_part(lb_nom, ' ', 1)) AS espece 
                        FROM INPN.TAXREF 
                        WHERE regne = '" . $_REQUEST['filtre'] . "' 
                        AND split_part(lb_nom, ' ', 1) ILIKE '%' || split_part('" . $critere . "', ' ', 1) || '%'
                        AND split_part(lb_nom, ' ', 2) != ''
                        AND split_part(lb_nom, ' ', 2) != 'sp.'     
                        ORDER BY espece
                    )
                    UNION ALL 
                    (
                        SELECT '-' AS espece
                    ) 
                    UNION ALL 
                    (
                        SELECT DISTINCT(nom_complet) AS espece 
                        FROM INPN.TAXREF 
                        WHERE regne = '" . $_REQUEST['filtre'] . "' 
                        AND lb_nom ILIKE '%' || split_part('" . $critere . "', ' ', 1) || '%'
                        AND split_part(lb_nom, ' ', 2) != ''
                        AND split_part(lb_nom, ' ', 2) != 'sp.' 
                        ORDER BY espece
                    )";
                }
                else {
                    $req = "(
                        SELECT DISTINCT(split_part(lb_nom, ' ', 1)) AS espece 
                        FROM INPN.TAXREF 
                        WHERE regne = '" . $_REQUEST['filtre'] . "' 
                        AND split_part(lb_nom, ' ', 1) ILIKE '%' || split_part('" . $critere . "', ' ', 1) || '%'
                        ORDER BY espece
                    )
                    UNION ALL 
                    (
                        SELECT '-' AS espece
                    ) 
                    UNION ALL 
                    (
                        SELECT DISTINCT(nom_complet) AS espece 
                        FROM INPN.TAXREF 
                        WHERE regne = '" . $_REQUEST['filtre'] . "' 
                        AND lb_nom ILIKE '%' || split_part('" . $critere . "', ' ', 1) || '%'
                        ORDER BY espece
                    )";
                }
            }
            break;
        case 'espece':
            if ($_REQUEST['filtre'] == 'Habitat') {
                $req = "SELECT DISTINCT(lb_cb97_fr) AS espece 
                    FROM INPN.TYPO_CORINE_BIOTOPES
                    WHERE UNACCENT(split_part(lb_cb97_fr, ' ', 1)) ILIKE '%' || UNACCENT(split_part('" . $critere . "', ' ', 1)) || '%' 
                    AND UNACCENT(lb_cb97_fr) ILIKE '%' || UNACCENT(split_part('" . $critere . "', ' ', 2)) || '%' 
                    AND lb_cb97_fr IS NOT NULL 
                    ORDER BY espece";
            }
            else {
                if ($_REQUEST['choixEspeceForcee'] == 'true') {
                    $req = "SELECT DISTINCT(nom_complet) AS espece 
                    FROM INPN.TAXREF 
                    WHERE regne = '" . $_REQUEST['filtre'] . "'
                    AND upper(split_part(lb_nom, ' ', 1)) = upper(split_part('" . $critere . "', ' ', 1))
                    AND split_part(lb_nom, ' ', 2) ILIKE '%' || split_part('" . $critere . "', ' ', 2) || '%' 
                    AND split_part(lb_nom, ' ', 2) != ''
                    AND split_part(lb_nom, ' ', 2) != 'sp.' 
                    ORDER BY espece";
                }
                else {
                    $req = "(
                        SELECT initcap(split_part('" . $critere . "', ' ', 1)) || ' sp.' AS espece
                    )
                    UNION ALL 
                    (
                        SELECT DISTINCT(nom_complet) AS espece 
                        FROM INPN.TAXREF 
                        WHERE regne = '" . $_REQUEST['filtre'] . "'
                        AND upper(split_part(lb_nom, ' ', 1)) = upper(split_part('" . $critere . "', ' ', 1))
                        AND split_part(lb_nom, ' ', 2) ILIKE '%' || split_part('" . $critere . "', ' ', 2) || '%' 
                        ORDER BY espece
                    )";
                }                
            }
            break;
        case 'selectEspeceUsuelle':
            if ($_REQUEST['filtre'] == 'Habitat') {
                $req = "SELECT DISTINCT(lb_cb97_fr) AS espece
                    FROM INPN.TYPO_CORINE_BIOTOPES
                    WHERE cd_cb || ' - ' || lb_cb97_fr = '" . $critere . "' ORDER BY espece";
            }
            else {
                if ($_REQUEST['choixEspeceForcee'] == 'true') {
                    $req = "SELECT DISTINCT(nom_complet) AS espece 
                        FROM INPN.TAXREF
                        WHERE regne = '" . $_REQUEST['filtre'] . "' 
                        AND cd_nom IN
                        (
                            SELECT DISTINCT(cd_ref) FROM INPN.TAXREF WHERE regne ='" . $_REQUEST['filtre'] . "' AND nom_vern = '" . $critere . "'
                        ) 
                        ORDER BY espece";
                }
                else {
                    $req = "WITH TAXONS AS 
                        (
                            SELECT DISTINCT(nom_complet) 
                            FROM INPN.TAXREF
                            WHERE regne = '" . $_REQUEST['filtre'] . "' 
                            AND cd_nom IN 
                            (
                              SELECT DISTINCT(cd_ref) FROM INPN.TAXREF WHERE regne = '" . $_REQUEST['filtre'] . "' AND nom_vern = '" . $critere . "'
                            )
                        )
                        SELECT DISTINCT(nom_complet) AS espece 
                        FROM (
                            SELECT nom_complet FROM TAXONS 
                            UNION 
                            SELECT DISTINCT(split_part(nom_complet, ' ', 1) || ' sp.') AS nom_complet
                            FROM TAXONS
                        ) AS ESPECES 
                        WHERE split_part(nom_complet, ' ', 2) != ''
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
