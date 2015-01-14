<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';

    $cnxPgObsOcc = new CnxPgObsOcc();
    // gestion du cas particulier de la concaténation du nom et du prénom
    $chVal = $_GET['chVal'];
    if ($chVal != "(nom || ' ' || prenom)") {
        $chVal = pg_escape_string($_GET['chVal']);
    }
    $req = 'SELECT ' . pg_escape_string($_GET['chId']) . ' AS id, ' . $chVal .  // besoin de "pg_escape_string" car piratage possible par l'utilisateur
        ' AS val FROM ' . pg_escape_string($_GET['table']) . ' ORDER BY val';  // besoin de "pg_escape_string" car piratage possible par l'utilisateur
    $rs = $cnxPgObsOcc->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgObsOcc);
?>
