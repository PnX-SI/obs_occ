<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    
    $CnxPgObsOcc = new CnxPgObsOcc();
    $req = "SELECT ST_AsText(lieu_dit.geometrie) as centre_ld, lieu_dit.nom || ' - '
        || commune.nom AS ld_com FROM ign_bd_topo.lieu_dit, ign_bd_topo.commune
        WHERE ST_Intersects(lieu_dit.geometrie, commune.geometrie) AND lieu_dit.nom
        || ' - ' || commune.nom ILIKE '%" . $_REQUEST['critere'] . "%' ORDER BY ld_com";
    $rs = $CnxPgObsOcc->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
    $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($CnxPgObsOcc);
?>
