<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';

    $clauseWHERE = $_POST['clauseWHERE'];
    // besoin de "pg_escape_string" car piratage possible par l'utilisateur pour les paramètres passés en "GET"
    $champ = pg_escape_string($_GET['champ']);
    $table = pg_escape_string($_GET['table']);
    $cnxPgObsOcc = new CnxPgObsOcc();
    if (isset($clauseWHERE)) {
        $req = 'SELECT DISTINCT(' . $champ . ') AS val FROM ' . $table .
        ' WHERE ' . $champ . ' IS NOT NULL AND ' . $clauseWHERE .
            ' ORDER BY val';
    }
    else {
        $req = 'SELECT DISTINCT(' . $champ . ') AS val FROM ' . $table .
        ' WHERE ' . $champ . ' IS NOT NULL ORDER BY val';
    }
    $rs = $cnxPgObsOcc->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgObsOcc);
?>
