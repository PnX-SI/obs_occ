<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../' . ENV . '/Outils/ClassEnreg.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    class Etude extends Enreg {
        static private $tableEtude = 'MD.ETUDE';
        static private $chIdEtude = 'id_etude';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['USER']),
                decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['PASSWORD']), self::$tableEtude,
                self::$chIdEtude, null, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['LOGIN']));
        }

        static function supprimeId($listId) {
            parent::supprimeId(HOST, PORT, DBNAME, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['USER']),
                decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['PASSWORD']), self::$tableEtude,
                self::$chIdEtude, $listId, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['LOGIN']));
        }
    }
?>
