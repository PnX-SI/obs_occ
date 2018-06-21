<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';

    $cnxPgObsOcc = new CnxPgObsOcc();
    $clauseWHERE = $_POST['clauseWHERE'];
    $table = pg_escape_string($_GET['table']); // besoin de "pg_escape_string" car piratage possible par l'utilisateur
    $chId = pg_escape_string($_GET['chId']); // besoin de "pg_escape_string" car piratage possible par l'utilisateur
    // gestion du cas particulier de la concaténation du nom et du prénom
    $chVal = $_GET['chVal'];
    if ($chVal != "(nom || ' ' || prenom)") {
        $chVal = pg_escape_string($_GET['chVal']); // besoin de "pg_escape_string" car piratage possible par l'utilisateur
    }
    if (isset($clauseWHERE)) {
        $req = 'SELECT ' . $chId . ' AS id, ' . $chVal . ' AS val FROM ' . $table .
        ' WHERE ' . $clauseWHERE . ' ORDER BY val';  
    }
    else {
         $req = 'SELECT ' . $chId . ' AS id, ' . $chVal . ' AS val FROM ' . $table . ' ORDER BY val';  
    }
    $rs = $cnxPgObsOcc->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgObsOcc);
?>