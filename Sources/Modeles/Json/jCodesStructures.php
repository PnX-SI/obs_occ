<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';

    $cnxPgObsOcc = new CnxPgObsOcc();
    if ($_REQUEST['codes']) {
        $req = 'SELECT id_structure AS code, nom_structure AS libelle FROM MD.STRUCTURE
            WHERE id_structure NOT IN (' . $_REQUEST['codes'] . ') AND (diffusable
            = true OR diffusable IS NULL) ORDER BY libelle';
    }
    else {
        $req = 'SELECT id_structure AS code, nom_structure AS libelle FROM MD.STRUCTURE
            WHERE diffusable = true OR diffusable IS NULL ORDER BY libelle';
    }
    $rs = $cnxPgObsOcc->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgObsOcc);
?>