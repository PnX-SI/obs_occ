<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    require_once '../' . ENV . '/Outils/FiltreGrille.php';
    require_once '../../Modeles/Filtres/fGrille.php';

    $cnxPgObsOcc = new CnxPgObsOcc();
    $req = "SELECT MD.STRUCTURE.id_structure, MD.STRUCTURE.nom_structure,
        (CREATEURS.nom || ' ' || CREATEURS.prenom) AS creat, MD.PERSONNE.id_personne,
        MD.PERSONNE.date_maj, MD.PERSONNE.remarque, MD.PERSONNE.fax, MD.PERSONNE.portable,
        MD.PERSONNE.tel_pro, MD.PERSONNE.tel_perso, MD.PERSONNE.pays, MD.PERSONNE.ville,
        MD.PERSONNE.code_postal, MD.PERSONNE.adresse_1, MD.PERSONNE.prenom, 
        MD.PERSONNE.nom, MD.PERSONNE.email, MD.PERSONNE." . '"role"' . ", 
        MD.PERSONNE.specialite, MD.PERSONNE.createur, MD.PERSONNE.titre FROM
        MD.PERSONNE LEFT JOIN (SELECT nom, prenom, id_personne FROM MD.PERSONNE)
        AS CREATEURS ON MD.PERSONNE.createur = CREATEURS.id_personne LEFT JOIN
        MD.STRUCTURE USING(id_structure) WHERE " . $where .
        $orderLimit;
    $rs = $cnxPgObsOcc->executeSql($req);
    $rsTot = $cnxPgObsOcc->executeSql('SELECT COUNT(*) FROM
        MD.PERSONNE LEFT JOIN (SELECT nom, prenom, id_personne FROM MD.PERSONNE)
        AS CREATEURS ON MD.PERSONNE.createur = CREATEURS.id_personne LEFT JOIN
        MD.STRUCTURE USING(id_structure) WHERE ' . $where);
    $tot = pg_result($rsTot, 0, 0);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo '{"total":"' . $tot . '", "data": ' . json_encode($arr) . '}';
    unset($cnxPgObsOcc);
?>
