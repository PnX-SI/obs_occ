<?php
    require_once 'ClassEnvoiMail.php';
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . $configInstance . '/Serveur.php';
    
    class EnvoiMailReinitMdp extends EnvoiMail {
        function __construct($titre, $prenom, $nom, $email, $mdp) {
            $sujet = "Accès à l'application " . TITRE_APPLI;
            $message = '<p>
                            Bonjour <b>' . $titre . ' ' . $nom . "</b>, <br/> <br/>
                            suite à votre demande, nous avons procédé à la réinitialisation
                            de votre mot de passe. <br/>
                            Afin d'accéder à l'application " . TITRE_APPLI . " à
                            tout moment, nous vous recommandons de conserver ce
                            message contenant vos coordonnées : <br/>
                            <span style='margin-left:30px;'>Adresse e-mail : </span>
                                <b>" . $email . "</b><br/>
                            <span style='margin-left:30px;'>Mot de passe : </span> 
                                <b>" . $mdp . "</b>
                        </p>
                        <p>
                            Nous vous souhaitons bonne navigation sur <u><a href='" . 
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
