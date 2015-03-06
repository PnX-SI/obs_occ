<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../' . ENV . '/Outils/ClassEnreg.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    class Protocole extends Enreg {
        static private $tableProtocole = 'MD.protocole';
        static private $chIdProtocole = 'id_protocole';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['USER']),
                decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['PASSWORD']), self::$tableProtocole,
                self::$chIdProtocole, null, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['LOGIN']));
        }

        static function supprimeId($listId) {
            parent::supprimeId(HOST, PORT, DBNAME, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['USER']),
                decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['PASSWORD']), self::$tableProtocole,
                self::$chIdProtocole, $listId, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['LOGIN']));
        }
    }
?>
