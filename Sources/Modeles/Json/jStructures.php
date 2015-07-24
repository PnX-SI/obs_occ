<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    require_once '../' . ENV . '/Outils/FiltreGrille.php';
    require_once '../Adaptations/fGrille.php';

    $cnxPgObsOcc = new CnxPgObsOcc();
    $req = "SELECT MD.STRUCTURE.*, (CREATEURS.nom || ' ' || CREATEURS.prenom)
        AS creat FROM MD.STRUCTURE LEFT JOIN (SELECT nom, prenom, id_personne FROM
        MD.PERSONNE) AS CREATEURS ON MD.STRUCTURE.createur = CREATEURS.id_personne
        WHERE " . $where . $orderLimit;
    $rs = $cnxPgObsOcc->executeSql($req);
    $rsTot = $cnxPgObsOcc->executeSql('SELECT COUNT(*) FROM MD.STRUCTURE
        LEFT JOIN (SELECT nom, prenom, id_personne FROM MD.PERSONNE) AS CREATEURS
        ON MD.STRUCTURE.createur = CREATEURS.id_personne WHERE ' . $where);
    $tot = pg_result($rsTot, 0, 0);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo '{"total":"' . $tot . '", "data": ' . json_encode($arr) . '}';
    unset($cnxPgObsOcc);
?>
