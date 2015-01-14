<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    require_once '../' . ENV . '/Outils/FiltreGrille.php';

    $cnxPgObsOcc = new CnxPgObsOcc();
    $req = 'SELECT * FROM MD.ETUDE WHERE ' . $where . $orderLimit;
    $rs = $cnxPgObsOcc->executeSql($req);
    $rsTot = $cnxPgObsOcc->executeSql('SELECT COUNT(*) FROM MD.ETUDE WHERE ' . $where);
    $tot = pg_result($rsTot, 0, 0);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo '{"total":"' . $tot . '", "data": ' . json_encode($arr) . '}';
    unset($cnxPgObsOcc);
?>
