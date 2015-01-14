<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    
    $CnxPgObsOcc = new CnxPgObsOcc();
    $req = "SELECT ST_AsText(ST_Expand(geometrie, 0)) AS emprise_com, nom || ' - '
        || substring(code_insee from 1 for 2) AS dep_com FROM ign_bd_topo.commune
        WHERE nom || ' - ' || substring(code_insee from 1 for 2) ILIKE '%" . $_REQUEST['critere'] .
        "%' ORDER BY dep_com";
    $rs = $CnxPgObsOcc->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
    $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($CnxPgObsOcc);
?>
