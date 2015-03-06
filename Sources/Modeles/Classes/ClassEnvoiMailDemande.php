<?php
    require_once 'ClassEnvoiMail.php';
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . $configInstance . '/Serveur.php';
    require_once '../../' . $configInstance . '/Serveur.php';
    
    class EnvoiMailDemande extends EnvoiMail {
        function __construct($titre, $prenom, $nom, $email, $structure, $programme,
        $message) {
            $sujet = "Demande d'inscription à l'application " . TITRE_APPLI;
            $message = "<p>
                            Une nouvelle demande d'accès à l'application " . TITRE_APPLI .
                            " a été enregistrée. Cette demande concerne : <br/>
                            <b>" . $titre . ' ' . $prenom . ' ' . $nom . " <br/> " .
                            $email . "<br/>" . $structure . " </b> <br/> Cette demande
                            est faite dans le cadre du programme <b>" . $programme .
                            "</b>.<br/>Précisions concernant la demande : <b>" . $message .
                            "</b><br/>Merci de créer un compte pour cet utilisateur
                            après avoir vérifié la pertinence de la demande. <br/>
                        </p>";
            parent::__construct(MAIL_ADMIN, $sujet, $message);
        }
    }
?>
