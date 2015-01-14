<?php
    require_once '../../Modeles/Classes/ClassPersonne.php';
    
    if ($_POST['action'] == 'SupprimerListeId') {
        Personne::supprimeId($_POST['listId']);
        $data = 'Personnes supprimées avec succès';
        die('{success: true, data: "' . $data . '"}');        
    }
    else {
        $personne = new Personne();
        if (isset($_POST['id_personne'])) {
            $personne->id_personne = $_POST['id_personne'];
        }
        if (isset($_POST['prenom'])) {
            $personne->prenom = $_POST['prenom'];
        }
        if (isset($_POST['nom'])) {
            $personne->nom = $_POST['nom'];
        }
        if (isset($_POST['titre'])) {
            $personne->titre = $_POST['titre'];
        }
        if (isset($_POST['role'])) {
            $personne->role = $_POST['role'];
        }
        if (isset($_POST['specialite'])) {
            $personne->specialite = $_POST['specialite'];
        }
        if (isset($_POST['email'])) {
            $personne->email = $_POST['email'];
        }
        if (isset($_POST['adresse_1'])) {
            $personne->adresse_1 = $_POST['adresse_1'];
        }
        if (isset($_POST['code_postal'])) {
            $personne->code_postal = $_POST['code_postal'];
        }
        if (isset($_POST['ville'])) {
            $personne->ville = $_POST['ville'];
        }
        if (isset($_POST['pays'])) {
            $personne->pays = $_POST['pays'];
        }
        if (isset($_POST['tel_pro'])) {
            $personne->tel_pro = $_POST['tel_pro'];
        }
        if (isset($_POST['portable'])) {
            $personne->portable = $_POST['portable'];
        }
        if (isset($_POST['fax'])) {
            $personne->fax = $_POST['fax'];
        }
        if (isset($_POST['remarque'])) {
            $personne->remarque = $_POST['remarque'];
        }
        if (isset($_POST['createur'])) {
            $personne->createur = $_POST['createur'];
        }
        date_default_timezone_set('Europe/Paris');
        $personne->date_maj = date('Y-m-d');

        switch ($_POST['action']) {
            case 'Ajouter':
                if($personne->ajoute()){
                    $data = 'Personne ajoutée avec succès';
                    die('{success: true, data: "' . $data . '"}');
                }
                else{
                    $errorMessage = "Opération d'ajout impossible";
                    $data = 'Veuillez vérifier que vous avez bien les droits suffisants ' .
                        "pour l'ajout ou rééssayer ultérieurement !";
                    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' . $data .'"}');
                }
                break;
            case 'Modifier':
                if ($personne->modifie() != 0){
                    $data = 'Personne modifiée avec succès';
                    die('{success: true, data: "' . $data . '"}');
                }
                else{
                    $errorMessage = 'Opération de modification impossible';
                    $data = 'Veuillez vérifier que vous avez bien les droits suffisants ' .
                        'pour la modification ou rééssayer ultérieurement !';
                    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' . $data .'"}');

                }
                break;
            case 'Supprimer':
                if($personne->supprime()){
                    $data = 'Personne supprimée avec succès';
                    die('{success: true, data: "' . $data . '"}');
                 }
                else{
                    $errorMessage = 'Opération de suppression impossible';
                    $data = 'Certaines de ces données ne vous appartiennent pas ' .
                        "ou vous n'avez pas les droits suffisants de suppression";
                    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                        $data .'"}');
                }
                break;
        }
    }
?>
