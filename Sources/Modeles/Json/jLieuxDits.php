<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    
    $cnxPgObsOcc = new CnxPgObsOcc();
    $req = "SELECT id, lieu_dit || ' - ' || distance || 'm' AS val FROM (SELECT id,
        lieu_dit.nom AS lieu_dit, round(ST_Distance(ST_GeographyFromText('SRID=4326;" .
        $_POST['centroid'] . "'), geography(ST_Transform(lieu_dit.geometrie, 4326))))
        AS distance FROM ign_bd_topo.lieu_dit WHERE ST_Intersects(lieu_dit.geometrie,
        ST_Transform(geometry(ST_Buffer(geography(ST_GeographyFromText('SRID=4326;" .
        $_POST['centroid'] ."')), 2000))," . $_POST['EPSG'] . ')) ORDER BY distance
        ASC) sous_requete';
    $rs = $cnxPgObsOcc->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgObsOcc);
?>
