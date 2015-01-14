<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    
    $cnxPgObsOcc = new CnxPgObsOcc();
    $req = 'SELECT enum_range(null::' . pg_escape_string($_GET['typeEnum']) . ')'; // besoin de "pg_escape_string" car piratage possible par l'utilisateur
    $rs = $cnxPgObsOcc->executeSql($req);
    $arr = array();
    if (pg_numrows($rs) > 0) {
        // suppression des caractères spéciaux
        $enum = str_replace('{', '', pg_result($rs, 0, 0));
        $enum = str_replace('}', '', $enum);
        $enum = str_replace('"', '', $enum);
        $listEnum = explode(',', $enum);
        $obj = array();
        for ($i = 0; $i < count($listEnum); $i++) {
            $obj['val'] = $listEnum[$i];
            $arr[] = $obj;
        }
    }
    echo json_encode($arr);
    unset($cnxPgObsOcc);
?>
