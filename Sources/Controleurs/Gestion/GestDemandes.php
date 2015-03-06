<?php
    require_once '../../Modeles/Classes/ClassEnvoiMailAccuseReception.php';
    require_once '../../Modeles/Classes/ClassEnvoiMailDemande.php';
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . $configInstance . '/Serveur.php';
    
    $envoiMailDemande = new EnvoiMailDemande($_POST['titre'], $_POST['prenom'], 
        $_POST['nom'], $_POST['email'], $_POST['structure'], $_POST['programme'],
        $_POST['message']);
    $ok = $envoiMailDemande->envoyerMail();
    if ($ok) {
        $envoiMailAccuseReception = new EnvoiMailAccuseReception($_POST['titre'], $_POST['prenom'],
            $_POST['nom'], $_POST['email']);
        $ok = $envoiMailAccuseReception->envoyerMail($msgErr);
        if ($ok) {
            $data = 'Votre demande a bien été envoyée ; nous avons accusé réception de votre message.';
            die('{success: true, data: "' . $data . '"}');
        }
        else {
            $errorMessage = "Erreur d'envoi de message d'accusé de réception";
            $data = "L'envoi du message à " . '\"' . $_POST['email'] .
                '\"  a rencontré un problème ; veuillez vérifier votre adresse mail ! ERREUR : ' . $msgErr;
            die('{success: false, errorMessage: "' . $errorMessage . '", data: "' . $data . '"}');
        }
    }
    else {
        $errorMessage = "Erreur d'envoi de message de demande d'inscription";
        $data = "L'envoi du message à " . '\"' . MAIL_ADMIN .
            '\"  a rencontré un problème ; veuillez essayer de nous contacter directement !';
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' . $data . '"}');
    }
?>