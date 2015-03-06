<?php
    // Fichier servant à filtrer spécifiquement la grille des observations en cours
    // par un traitement des cas particuliers de concaténation/déconcaténation de champs
    $where = str_replace(' observat ', ' md.liste_nom_auteur(observateur) ', $where);
    $where = str_replace(' struct ', ' md.liste_nom_structure(structure) ', $where);
    $where = str_replace(' validat ', " (VALIDATEURS.nom || ' ' || VALIDATEURS.prenom) ", $where);
    $where = str_replace(' numerisat ', " (NUMERISATEURS.nom || ' ' || NUMERISATEURS.prenom) ", $where);
    $where = str_replace(' creat ', " (CREATEURS.nom || ' ' || CREATEURS.prenom) ", $where);
    $where = str_replace(' code_insee ', ' IGN_BD_TOPO.COMMUNE.code_insee ', $where);
    $where = str_replace(' nom ', ' MD.PERSONNE.nom ', $where);
    $where = str_replace(' prenom ', ' MD.PERSONNE.prenom ', $where);
    $where = str_replace(' regne ', ' SAISIE_OBSERVATION.regne ', $where);
    $where = str_replace(' nom_vern ', ' SAISIE_OBSERVATION.nom_vern ', $where);
    $where = str_replace(' nom_complet ', ' SAISIE_OBSERVATION.nom_complet ', $where);
    $where = str_replace(' st_geometrytype ', ' ST_GeometryType(SAISIE.SAISIE_OBSERVATION.geometrie) ', $where);
?>
