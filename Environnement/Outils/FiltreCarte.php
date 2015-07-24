<?php
    //Fichier servant à gérer l'activation/déactivation du filtre sur l'emprise de la carte (bouton Filtrer emprise)
    $chGeom = ($_REQUEST['chGeom'] == null)? '' : $_REQUEST['chGeom'];
    $filtreEmprise = ($_REQUEST['filtreEmprise'] == null)? '' : $_REQUEST['filtreEmprise'];

    $and = '0 = 0'; // variable globale pour la clause "AND"
    
    // construction de la clause "AND"
    if (($chGeom != '') && ($filtreEmprise != '')) {
        $and .= ' AND ST_Intersects(ST_Transform('. $chGeom . ", 4326),  ST_GeometryFromText('" .
            $filtreEmprise . "', 4326))";
    }    
?>
