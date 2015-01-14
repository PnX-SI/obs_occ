<?php
    require_once '../../Modeles/Classes/ClassStructure.php';

    if ($_POST['action'] == 'SupprimerListeId') {
        Structure::supprimeId($_POST['listId']);
        $data = 'Structures supprimées avec succès';
        die('{success: true, data: "' . $data . '"}');        
    }
    else {
        $structure = new Structure();
        if (isset($_POST['id_structure'])) {
            $structure->id_structure = $_POST['id_structure'];
        }
        if (isset($_POST['nom_structure'])) {
            $structure->nom_structure = $_POST['nom_structure'];
        }
        if (isset($_POST['detail_nom_structure'])) {
            $structure->detail_nom_structure = $_POST['detail_nom_structure'];
        }
        if (isset($_POST['statut'])) {
            $structure->statut = $_POST['statut'];
        }
        if (isset($_POST['adresse_1'])) {
            $structure->adresse_1 = $_POST['adresse_1'];
        }
        if (isset($_POST['code_postal'])) {
            $structure->code_postal = $_POST['code_postal'];
        }
        if (isset($_POST['ville'])) {
            $structure->ville = $_POST['ville'];
        }
        if (isset($_POST['pays'])) {
            $structure->pays = $_POST['pays'];
        }
        if (isset($_POST['tel'])) {
            $structure->tel = $_POST['tel'];
        }
        if (isset($_POST['fax'])) {
            $structure->fax = $_POST['fax'];
        }
        if (isset($_POST['courriel_1'])) {
            $structure->courriel_1 = $_POST['courriel_1'];
        }
        if (isset($_POST['courriel_2'])) {
            $structure->courriel_2 = $_POST['courriel_2'];
        }
        if (isset($_POST['site_web'])) {
            $structure->site_web = $_POST['site_web'];
        }
        if (isset($_POST['remarque'])) {
            $structure->remarque = $_POST['remarque'];
        }
        if (isset($_POST['createur'])) {
            $structure->createur = $_POST['createur'];
        }
        if (isset($_POST['diffusable'])) {
            $structure->diffusable = $_POST['diffusable'];
        }
        date_default_timezone_set('Europe/Paris');
        $structure->date_maj = date('Y-m-d');
        switch ($_POST['action']) {
            case 'Ajouter':
                $structure->ajoute();
                $data = 'Structure ajoutée avec succès';
                die('{success: true, data: "' . $data . '"}');
                break;
            case 'Modifier':
                $structure->modifie();
                $data = 'Structure modifiée avec succès';
                die('{success: true, data: "' . $data . '"}');
                break;
            case 'Supprimer':
                $structure->supprime();
                $data = 'Structure supprimée avec succès';
                $data = 'Suppression des structures impossibles';
                die('{success: true, data: "' . $data . '"}');
                break;
        }
    }
?>
