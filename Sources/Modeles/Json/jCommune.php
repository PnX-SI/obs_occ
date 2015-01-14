<?php
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';

    $cnxPgObsOcc = new CnxPgObsOcc();
    $req = "SELECT code_insee, nom FROM IGN_BD_TOPO.COMMUNE
        WHERE ST_Intersects(IGN_BD_TOPO.COMMUNE.geometrie, ST_Transform(ST_GeometryFromText('" .
        $_POST['centroid'] . "', 4326), " . $_POST['EPSG'] . "))";
    $rs = $cnxPgObsOcc->executeSql($req);
    if (pg_numrows($rs) > 0) {
        $code_insee = pg_result($rs, 0, 0);
        $commune = pg_result($rs, 0, 1);
        die('{success: true, code_insee: "' . $code_insee .'", commune: "' . $commune .'"}');
    }
    else {
        $errorMessage = 'ATTENTION : problème sur le référentiel IGN (BD topo)';
        $data = 'Commune introuvable aux coordonnées : ' . $_POST['centroid'];
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
           $data .'"}');
    }
    unset($cnxPgObsOcc);
?>