<?php
    require_once '../../Modeles/Classes/ClassEtude.php';
    
    if ($_POST['action'] == 'SupprimerListeId') {
        Etude::supprimeId($_POST['listId']);
        $data = 'Etudes supprimées avec succès';
        die('{success: true, data: "' . $data . '"}');        
    }
    else {
        $etude = new Etude();
        if (isset($_POST['id_etude'])) {
            $etude->id_etude = $_POST['id_etude'];
        }
        if (isset($_POST['nom_etude'])) {
            $etude->nom_etude = $_POST['nom_etude'];
        }
        if (isset($_POST['date_debut'])) {
            $etude->date_debut = $_POST['date_debut'];
        }
        if (isset($_POST['date_fin'])) {
            $etude->date_fin = $_POST['date_fin'];
        }
        if (isset($_POST['cahier_des_charges'])) {
            $etude->cahier_des_charges = $_POST['cahier_des_charges'];
        }
        if (isset($_POST['description'])) {
            $etude->description = $_POST['description'];
        }
        if (isset($_POST['lien_rapport_final'])) {
            $etude->lien_rapport_final = $_POST['lien_rapport_final'];
        }
        switch ($_POST['action']) {
            case 'Ajouter':
                $etude->ajoute();
                $data = 'Etude ajoutée avec succès';
                die('{success: true, data: "' . $data . '"}');
                break;
            case 'Modifier':
                $etude->modifie();
                $data = 'Etude modifiée avec succès';
                die('{success: true, data: "' . $data . '"}');
                break;
            case 'Supprimer':
                $etude->supprime();
                $data = 'Etude supprimée avec succès';
                die('{success: true, data: "' . $data . '"}');
                break;
        }
    }
?>
