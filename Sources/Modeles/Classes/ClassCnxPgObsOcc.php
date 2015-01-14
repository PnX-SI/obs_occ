<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../' . ENV . '/Outils/ClassCnxPg.php';
    require_once '../../' . CONFIG . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    class CnxPgObsOcc extends CnxPg {
        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['USER']),
                decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['PASSWORD']), decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['LOGIN']));
        }
    }
?>
