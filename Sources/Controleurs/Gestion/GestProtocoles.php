<?php
    require_once '../../Modeles/Classes/ClassProtocole.php';
    
    if ($_POST['action'] == 'SupprimerListeId') {
        Protocole::supprimeId($_POST['listId']);
        /*
          if ($_POST['listId'] == 1) {
               $data = 'Protocole supprimé avec succès';
               die('{success: true, data: "' . $data . '"}');
          }
          else {
               $data = 'Protocoles supprimés avec succès';
               die('{success: true, data: "' . $data . '"}');
          }
         *  */
        $data = 'Protocoles supprimés avec succès';
        die('{success: true, data: "' . $data . '"}');        
    }
    else {
        $protocole = new Protocole();
        if (isset($_POST['id_protocole'])) {
            $protocole->id_protocole = $_POST['id_protocole'];
        }
        if (isset($_POST['libelle'])) {
            $protocole->libelle = $_POST['libelle'];
        }
        if (isset($_POST['resume'])) {
            $protocole->resume = $_POST['resume'];
        }
        switch ($_POST['action']) {
            case 'Ajouter':
                $protocole->ajoute();
                $data = 'Protocole ajouté avec succès';
                die('{success: true, data: "' . $data . '"}');
                break;
            case 'Modifier':
                $protocole->modifie();
                $data = 'Protocole modifié avec succès';
                die('{success: true, data: "' . $data . '"}');
                break;
            case 'Supprimer':
                $protocole->supprime();
                $data = 'Protocole supprimé avec succès';
                die('{success: true, data: "' . $data . '"}');
                break;
        }
    }
?>
