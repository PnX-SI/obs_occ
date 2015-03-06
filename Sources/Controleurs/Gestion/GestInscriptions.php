<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    set_include_path('../' . LIB . '/PEAR/');
    require_once '../' . LIB . '/PEAR/Crypt/RSA.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once '../../Modeles/Classes/ClassEnvoiMailInscription.php';
    require_once '../../Modeles/Classes/ClassEnvoiMailActivation.php';
    require_once '../../Modeles/Classes/ClassEnvoiMailReinitMdp.php';
    require_once '../../Modeles/Classes/ClassPersonne.php';
    require_once '../../' . $configInstance . '/Serveur.php';
    require_once '../' . ENV . '/Outils/Fct.php';
    
    // Génération des clés RSA classiques
    $nbBits = 128;
    if (CRYPTAGE) {
        $key_pair = new Crypt_RSA_KeyPair($nbBits, 'BCMath');
        $public_key = $key_pair->getPublicKey();
        $private_key = $key_pair->getPrivateKey();
        // Remplacement en session par la clé privée classique
        $_SESSION[$_GET['appli']]['Securite']['private_module'] = $private_key->getModulus();
        $_SESSION[$_GET['appli']]['Securite']['private_exp'] = $private_key->getExponent();
        // Cryptage RSA classique des variables de session utilisées dans le constructeur de "CnxPgObsOcc" appelé par "Personne::compteDejaExistant"
        $rsa_obj = new Crypt_RSA(null, 'BCMath');
    }
    switch ($_POST['action']) {
        case 'inscrire':
            if (CRYPTAGE) {
                $_SESSION[$_GET['appli']]['Connexion']['USER'] = $rsa_obj->encrypt(USER, $public_key);
                $_SESSION[$_GET['appli']]['Connexion']['PASSWORD'] = $rsa_obj->encrypt(PASSWORD, $public_key);
            }
            else {
                $_SESSION[$_GET['appli']]['Connexion']['USER'] = USER;
                $_SESSION[$_GET['appli']]['Connexion']['PASSWORD'] = PASSWORD;
            }           
            $codeErreur = Personne::compteDejaExistant($_POST['prenom'], $_POST['nom'], $_POST['email']);
            switch ($codeErreur) {
                case 0:
                    $errorMessage = 'Problème de doublon de compte détecté';
                    $data = 'Le compte \"' . $_POST['email'] . '\" existe déjà !';
                    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                        $data . '"}');
                    break;
                case 1:
                    $errorMessage = "Problème d'homonymie détecté";
                    $data = 'L\'observateur \"' . $_POST['prenom'] . ' ' . $_POST['nom'] .
                        '\" existe déjà ; merci de nous contacter à l\'adresse suivante : \"' .
                        MAIL_CONTACT . '\" afin que nous vous proposions une solution !';
                    die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                        $data . '"}');
                    break;
                case -1:
                    $envoiMailInscription = new EnvoiMailInscription($_POST['titre'],
                        $_POST['prenom'], $_POST['nom'], $_POST['email']);
                    $ok = $envoiMailInscription->envoyerMail($msgErr);
                    if ($ok) {
                        $data = 'Votre demande a bien été prise en compte ; afin de ' .
                            'finaliser votre inscription, nous vous invitons à consulter ' .
                            'votre messagerie.';
                        die('{success: true, data: "' . $data . '"}');
                    }
                    else {
                        $errorMessage = "Erreur d'envoi de message d'inscription";
                        $data = "L'envoi du message à " . '\"' . $_POST['email'] .
                            '\"  a rencontré un problème ; veuillez vérifier votre adresse ' .
                            'mail ! ERREUR : ' . $msgErr;
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' . $data . '"}');
                    }
                    break;
            }
            break;
        case 'activer' :
            if (CRYPTAGE) {
                $_SESSION[$_GET['appli']]['Connexion']['USER'] = $rsa_obj->encrypt(DBNAME . '_amateur', $public_key);
                $_SESSION[$_GET['appli']]['Connexion']['PASSWORD'] = $rsa_obj->encrypt(DBNAME . '_amateur', $public_key);
            }
            else {
                $_SESSION[$_GET['appli']]['Connexion']['USER'] = DBNAME . '_amateur';
                $_SESSION[$_GET['appli']]['Connexion']['PASSWORD'] = DBNAME . '_amateur';
            }
            if (!Personne::personneDejaExistante($_POST['email'])) {
                $personne = new Personne();
                $personne->titre = $_POST['titre'];
                $personne->prenom = $_POST['prenom'];
                $personne->nom = $_POST['nom'];
                $personne->email = $_POST['email'];
                $personne->specialite = 'faune';
                $personne->role = 'amateur';
                $pass = genere_passwd(8);
                $personne->mot_de_passe = md5($pass);
                date_default_timezone_set('Europe/Paris');
                $personne->date_maj = date('Y-m-d');
                $personne->id_personne = $personne->ajoute();
                if ($personne->id_personne > 0) {
                    $personne->createur = $personne->id_personne;
                    if ($personne->modifie() != 0) {
                        $envoiMailActivation = new EnvoiMailActivation($personne->titre,
                        $personne->prenom, $personne->nom, $personne->email, $pass);
                        $ok = $envoiMailActivation->envoyerMail($msgErr);
                        if ($ok) {
                            $data = 'Félicitation votre compte est à présent actif ! ' .
                                'Vos paramètres de connexion vous ' .
                                'ont été envoyés par mail ; cliquez sur OK pour être ' .
                                "redirigé vers la page d'authentification...";
                             die('{success: true, data: "' . $data . '"}');
                        }
                        else {
                            $errorMessage = "Erreur d'envoi de message d'activation";
                            $data = "L'envoi du message contenant les paramètres de " .
                               'connexion de \"' . $personne->titre . ' ' . $personne->prenom .
                                ' ' . $personne->nom . '\"' . " n'a pu être envoyé à " .
                                "l'adresse mail " . '\"' . $personne->email . '\"' .
                                " ; veuillez contacter votre administrateur ! ERREUR : " . $msgErr;
                            die('{success: false, errorMessage: "' . $errorMessage . '",
                               data: "' . $data . '"}');
                        }
                    }
                }
            }
            else {
                $errorMessage = "Problème d'activation de compte détecté";
                $data = 'Le compte \"' . $_POST['email'] . '\" a déjà été activé ! ';
                die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                    $data . '"}');
            }
            break;
        case 'reinitialiserMdp':
            if (CRYPTAGE) {
                $_SESSION[$_GET['appli']]['Connexion']['USER'] = $rsa_obj->encrypt(DBNAME . '_amateur', $public_key);
                $_SESSION[$_GET['appli']]['Connexion']['PASSWORD'] = $rsa_obj->encrypt(DBNAME . '_amateur', $public_key);
            }
            else {
                $_SESSION[$_GET['appli']]['Connexion']['USER'] = DBNAME . '_amateur';
                $_SESSION[$_GET['appli']]['Connexion']['PASSWORD'] = DBNAME . '_amateur';
            }
            $idPersonne = Personne::personneDejaExistante($_POST['email']);
            if ($idPersonne) {
                $personne = new Personne();
                $personne->charge($idPersonne);
                //sauvegarde de l'ancien mot de passe en cours
                $SaveMdp = $personne->mot_de_passe;
                $pass = genere_passwd(8);
                $personne->mot_de_passe = md5($pass);
                if ($personne->modifie() != 0) {
                    $envoiMailReinitMdp = new EnvoiMailReinitMdp($personne->titre,
                        $personne->prenom, $personne->nom, $personne->email, $pass);
                    $ok = $envoiMailReinitMdp->envoyerMail($msgErr);
                    if ($ok) {
                        $data = "L'envoi du message contenant les paramètres de " .
                            'connexion de \"' . $personne->titre . ' ' . $personne->prenom .
                             ' ' . $personne->nom . '\"' . " a été envoyé avec succès à " .
                             "l'adresse mail " . '\"' . $personne->email . '\"';
                         die('{success: true, data: "' . $data . '"}');
                     }
                     else {
                        //restitution de l'ancien mot de passe sauvegardé
                        $personne->mot_de_passe = $SaveMdp;
                        $personne->modifie();
                        $errorMessage = "Impossible de renvoyer le mot de passe";
                        $data = "Le mot de passe est resté inchangé " .
                            "car l'envoi du message contenant les paramètres de " .
                            'connexion de \"' . $personne->titre . ' ' . $personne->prenom .
                             ' ' . $personne->nom . '\"' . " n'a pu être envoyé à " .
                             "l'adresse mail " . '\"' . $personne->email . '\"' .
                             " ; veuillez contacter votre administrateur ! ERREUR : " . $msgErr;
                        die('{success: false, errorMessage: "' . $errorMessage . '",
                            data: "' . $data . '"}');
                     }
                }
                else {
                    $errorMessage = 'Erreur au changement du mot de passe';
                    $data = "Impossible de réinitialiser le mot de passe en base" .
                        " ; veuillez contacter votre administrateur !";
                    die('{success: false, errorMessage: "' . $errorMessage . '",
                        data: "' . $data . '"}');
                     }
            }
            else {
                $errorMessage = "Problème d'existence de compte détecté";
                $data = 'Le compte \"' . $_POST['email'] . '\" est inexistant ! ' .
                    'Veuillez vérifier la saisie de votre email';
                die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                    $data . '"}');                    
            }
            break;
        default:
            header('Location: ' . INSTALL . '/Vues/vInscription.php?appli=' . 
                $_GET['appli'] . '&action=activer&' . base64_decode($_GET['url']));
            break;
    }
?>