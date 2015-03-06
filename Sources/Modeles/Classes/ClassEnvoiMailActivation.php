<?php
    require_once 'ClassEnvoiMail.php';
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . $configInstance . '/Serveur.php';

    class EnvoiMailActivation extends EnvoiMail {
        function __construct($titre, $prenom, $nom, $email, $mdp) {
            $sujet = "Bienvenue sur l'application " . TITRE_APPLI;
            $message = '<p>
                            Bienvenue <b>' . $titre . ' ' . $nom . "</b> ! <br/> <br/>
                            Suite à votre demande, nous avons procédé à l'activation
                            de votre compte. <br/>
                            Afin d'accéder à l'application " . TITRE_APPLI . " à 
                            tout moment, nous vous recommandons de conserver ce
                            message contenant vos coordonnées : <br/>
                            <span style='margin-left:30px;'>Adresse e-mail : </span>
                                <b>" . $email . "</b><br/>
                            <span style='margin-left:30px;'>Mot de passe : </span>
                                <b>" . $mdp . "</b>
                        </p>
                        <p>
                            Nous vous remercions pour votre inscription et vous
                            souhaitons bonne navigation sur <u><a href='" . 
                            INSTALL . '/Vues/vAuthent.php?appli=' . $_GET['appli'] .
                            "'> l'application " . TITRE_APPLI . "</a></u> .
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
