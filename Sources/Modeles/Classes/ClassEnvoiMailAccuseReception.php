<?php
    require_once 'ClassEnvoiMail.php';
    require_once '../../Configuration/ConfigUtilisee.php';    require_once '../../' . $configInstance . '/Serveur.php';

    class EnvoiMailAccuseReception extends EnvoiMail {
        function __construct($titre, $prenom, $nom, $email) {
            $sujet = "Accusé de reception à la demande d'inscription à l'application " . TITRE_APPLI;
            $message = "<p>
                            Bonjour <b>" . $titre . ' ' . $prenom . ' ' . $nom . 
                            "</b>, <br/> <br/>vous avez demandé à pouvoir vous connecter
                            à l'application ". TITRE_APPLI . ". <br/> Votre demande
                            a bien été prise en compte. <br/> Vous recevrez prochainement
                            vos paramètres d'authentification (identifiant et mot
                            de passe personnels) à l'adresse mail que vous avez
                            indiquée. <br/>
                        </p>
                        <p>
                            En vous remerciant. <br/>
                            Les coordinateurs du projet.
                        </p>";
            parent::__construct($email, $sujet, $message);
        }
    }
?>
