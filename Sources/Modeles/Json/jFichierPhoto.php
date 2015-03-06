<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    // ATTENTION : un niveau d'arborescence de + ici par rapport à la constante JS
    $cheminRelatifPhoto = '../' . $_POST['CST_cheminRelatifPhoto'] . decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['droit'])
        . '/' . decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']) . '/';
    // si le répertoirePhoto n'existe pas, on tente de le créer
    if (!is_dir($cheminRelatifPhoto)) {
        mkdir($cheminRelatifPhoto, 0777, true);
    }    
    if (!is_dir($cheminRelatifPhoto)) {
        $errorMessage = 'ERREUR : impossible de créer le répertoire de stockage des photos';
        $data = addslashes(dirname(__FILE__) . ' | ' . $cheminRelatifPhoto);
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
           $data .'"}');
    }
    if (isset($_FILES['fichierLocalPhoto']['name']) && isset($_FILES['fichierLocalPhoto']['error']) &&
        isset($_FILES['fichierLocalPhoto']['tmp_name'])) {
        switch ($_FILES['fichierLocalPhoto']['error']){
            case UPLOAD_ERR_OK :
                date_default_timezone_set('Europe/Paris'); // fuseau horaire français
                $data = date('YmdHis') . '_' . iconv("UTF-8", "ISO-8859-1//TRANSLIT", $_FILES['fichierLocalPhoto']['name']);
                if (move_uploaded_file($_FILES['fichierLocalPhoto']['tmp_name'],
                    $cheminRelatifPhoto . $data)) {
                    if (extension_loaded('gd')) {
                        $img_dst = imagecreatetruecolor(30, 15);
                    }
                    else {
                        $errorMessage = 'ERREUR : module GD non installé';
                        $data = 'cf php.ini => extension=php_gd2.dll';
                        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                            $data .'"}');
                    }
                    $ext = strtolower(substr(strrchr($data, '.'), 1));
                    switch ($ext) {
                        case 'jpg':
                            $img_src = imagecreatefromjpeg($cheminRelatifPhoto . $data);
                            break;
                        case 'jpeg':
                            $img_src = imagecreatefromjpeg($cheminRelatifPhoto . $data);
                            break;
                        case 'gif':
                            $img_src = imagecreatefromgif($cheminRelatifPhoto . $data);
                            break;
                        case 'png':
                            $img_src = imagecreatefrompng($cheminRelatifPhoto . $data);
                            break;
                        case 'bmp':
                            $img_src = imagecreatefromwbmp($cheminRelatifPhoto . $data);
                            break;
                    }
                    imagecopyresampled($img_dst, $img_src, 0, 0, 0, 0, 30, 15, imagesx($img_src),
                        imagesy($img_src));
                    imagejpeg($img_dst, $cheminRelatifPhoto . substr($data, 0, strlen($data) - (strlen($ext) + 1)) .
                        '_MINI.jpeg');
                    die('{success: true, data: "' . decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['droit']) .
                        '/' . decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']) . '/' . iconv("ISO-8859-1", "UTF-8//TRANSLIT", $data) .'"}');
                }
                else {
                    $data = 'Le fichier que vous avez envoyé est impossible à copier sur le serveur !';
                }
            case UPLOAD_ERR_INI_SIZE :
                $data = 'Le fichier dépasse la limite autorisée par le serveur (fichier php.ini) ou répertoire Photo!';
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
        $errorMessage = 'ERREUR : chargement de la photo impossible';
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
            $data .'"}');
    }
    else {
        $errorMessage = 'ERREUR : variable de fichier inexistante';
        $data = 'fichierLocalPhoto | name ou fichierLocalPhoto | error ou fichierLocalPhoto | tmp_name';
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
           $data .'"}');
    }
?>
