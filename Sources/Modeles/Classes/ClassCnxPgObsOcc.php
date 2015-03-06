<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../' . ENV . '/Outils/ClassCnxPg.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    class CnxPgObsOcc extends CnxPg {
        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['USER']),
                decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['PASSWORD']), decrypteRSA($_GET['appli'], 
                $_SESSION[$_GET['appli']]['Connexion']['LOGIN']));
        }
    }
?>
