<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';

    $cnxPgObsOcc = new CnxPgObsOcc();
    if ($_REQUEST['codes']) {
        $req = "SELECT id_personne AS code, (nom || ' ' || prenom) AS libelle FROM MD.PERSONNE
            WHERE id_personne NOT IN (" . $_REQUEST['codes'] . ') AND "role" IN (' .
            "'observ', 'amateur', 'expert', 'admin') ORDER BY libelle";
    }
    else {
        $req = "SELECT id_personne AS code, (nom || ' ' || prenom) AS libelle FROM MD.PERSONNE
            WHERE " . '"role" IN (' . "'observ', 'amateur', 'expert', 'admin') ORDER BY libelle";
        }
    $rs = $cnxPgObsOcc->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgObsOcc);
?>