<?php
    require_once 'ClassEnvoiMail.php';
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . $configInstance . '/Serveur.php';

    class EnvoiMailInscription extends EnvoiMail {
        function __construct($titre, $prenom, $nom, $email) {
            $sujet = "Inscription à l'application " . TITRE_APPLI;
            $message = "<p>
                            Bonjour <b>" . $titre . ' ' . $nom . "</b>, <br/> <br/>
                            vous avez procédé récemment à une inscription à l'application " .
                            TITRE_APPLI . " et nous vous en remercions. <br/>
                            Afin d'activer votre compte et recevoir vos paramètres
                            de connexion dans un second mail, nous vous invitons
                            à cliquer sur ce lien : <br/>
                            <u><a href='" . INSTALL . '/Controleurs/Gestion/GestInscriptions.php?appli=' . $_GET['appli'] . '&url=' .
                            base64_encode('titre=' . $titre . '&prenom=' . $prenom .
                            '&nom=' .$nom . '&email=' . $email) . "'>activation de votre
                            compte " . TITRE_APPLI . "</a></u> . <br/>
                        </p>
                        <p>
                            En vous remerciant de votre contribution, <br/>
                            Bien cordialement, <br/>
                            Les coordinateurs du projet.
                        </p>";
            parent::__construct($email, $sujet, $message);
        }
    }
?>
