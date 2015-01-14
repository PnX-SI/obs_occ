<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . CONFIG . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    // ATTENTION : un niveau d'arborescence de + ici par rapport à la constante JS
    $cheminRelatifGPX = '../' . $_POST['CST_cheminRelatifGPX'];
    // si le répertoireGPX n'existe pas, on tente de le créer
    if (!is_dir($cheminRelatifGPX)) {
        mkdir($cheminRelatifGPX, 0777, true);
    }
    if (!is_dir($cheminRelatifGPX)) {
        $errorMessage = 'ERREUR : impossible de créer le répertoire de stockage des fichiers GPX';
        $data = addslashes(dirname(__FILE__) . ' | ' . $cheminRelatifGPX);
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
           $data .'"}');
    }
    if (isset($_FILES['fichierLocalGPX']['name']) && isset($_FILES['fichierLocalGPX']['error']) &&
        isset($_FILES['fichierLocalGPX']['tmp_name'])) {
        switch ($_FILES['fichierLocalGPX']['error']){
            case UPLOAD_ERR_OK :
                date_default_timezone_set('Europe/Paris'); // fuseau horaire français
                $data = date('YmdHis') . '_' . decrypteRSA(APPLI, $_SESSION[APPLI]['numerisateur']['code']) .
                    '_' . $_FILES['fichierLocalGPX']['name'];
                if (move_uploaded_file($_FILES['fichierLocalGPX']['tmp_name'],
                $cheminRelatifGPX . iconv("UTF-8", "ISO-8859-1//TRANSLIT", $data))) { // "iconv" pour la gestion des accents dans le nom de fichier lors de son déplacement sur le serveur
                    die('{success: true, data: "' . $data .'"}');
                }
                else {
                    $data = 'Le fichier que vous avez envoyé est impossible à copier sur le serveur !';
                }
            case UPLOAD_ERR_INI_SIZE :
                $data = 'Le fichier dépasse la limite autorisée par le serveur (fichier php.ini) ou répertoire GPX!';
                break;
            case UPLOAD_ERR_FORM_SIZE :
                $data = 'Le fichier dépasse la limite autorisée dans le formulaire HTML !';
                break;
            case UPLOAD_ERR_PARTIAL :
                $data = "L'envoi du fichier a été interrompu pendant le transfert !";
                break;
            case UPLOAD_ERR_NO_FILE :
                $data = 'Le fichier que vous avez envoyé a une taille nulle !';
                break;
            default :
                $data = "Une erreur inconnue est survenue lors de l'envoi du fichier !";
                break;
        }
        $errorMessage = 'ERREUR : chargement du fichier GPX impossible';
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
            $data .'"}');
    }
    else {
        $errorMessage = 'ERREUR : variable de fichier inexistante';
        $data = 'fichierLocalGPX | name ou fichierLocalGPX | error ou fichierLocalGPX | tmp_name';
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
           $data .'"}');
    }
?>
