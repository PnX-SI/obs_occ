<?php
    // Fichier servant spécifiquement à l'affichage des enregistrements de la grille 
    // des observations en cours pour traiter les cas de concaténation des valeurs
    // de champs ou pour lever l'ambiguité sur les noms de champs apparue lors de 
    // la construction automatique des clauses WHERE et ORDER BY de la jointure 
    // générées par les paramètres d'en-tête de grille

    //partie filtre : clause WHERE de la requête
    $where = str_replace(' observat ', ' md.liste_nom_auteur(observateur) ', $where);
    $where = str_replace(' struct ', ' md.liste_nom_structure(structure) ', $where);
    $where = str_replace(' validat ', " (VALIDATEURS.nom || ' ' || VALIDATEURS.prenom) ", $where);
    $where = str_replace(' numerisat ', " (NUMERISATEURS.nom || ' ' || NUMERISATEURS.prenom) ", $where);
    $where = str_replace(' creat ', " (CREATEURS.nom || ' ' || CREATEURS.prenom) ", $where);
    $where = str_replace(' nom ', ' MD.PERSONNE.nom ', $where);
    $where = str_replace(' prenom ', ' MD.PERSONNE.prenom ', $where);
    $where = str_replace(' st_geometrytype ', ' ST_GeometryType(SAISIE.SAISIE_OBSERVATION.geometrie) ', $where);
    $where = str_replace(' commune ', ' IGN_BD_TOPO.COMMUNE.nom ', $where);
    $where = str_replace(' code_insee', "IGN_BD_TOPO.COMMUNE.code_insee", $where);
    $where = str_replace(' lieu_dit ', ' IGN_BD_TOPO.LIEU_DIT.nom ', $where);

    //partie tri : clause ORDER BY de la requête
    $sort = ' '. $sort .' ';
    $sort = str_replace(' observat ', ' md.liste_nom_auteur(observateur) ', $sort);
    $sort = str_replace(' struct ', ' md.liste_nom_structure(structure) ', $sort);
    $sort = str_replace(' validat ', " (VALIDATEURS.nom || ' ' || VALIDATEURS.prenom) ", $sort);
    $sort = str_replace(' numerisat ', " (NUMERISATEURS.nom || ' ' || NUMERISATEURS.prenom) ", $sort);
    $sort = str_replace(' creat ', " (CREATEURS.nom || ' ' || CREATEURS.prenom) ", $sort);
    $sort = str_replace(' nom ', ' MD.PERSONNE.nom ', $sort);
    $sort = str_replace(' prenom ', ' MD.PERSONNE.prenom ', $sort);
    $sort = str_replace(' st_geometrytype ', ' ST_GeometryType(SAISIE.SAISIE_OBSERVATION.geometrie) ', $sort);
    $sort = str_replace(' commune ', ' IGN_BD_TOPO.COMMUNE.nom ', $sort);
    $sort = str_replace(' code_insee ', "IGN_BD_TOPO.COMMUNE.code_insee", $sort);
    $sort = str_replace(' lieu_dit ', ' IGN_BD_TOPO.LIEU_DIT.nom ', $sort);

?>