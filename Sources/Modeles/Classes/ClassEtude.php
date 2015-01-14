<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../' . ENV . '/Outils/ClassEnreg.php';
    require_once '../../' . CONFIG . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    class Etude extends Enreg {
        static private $tableEtude = 'MD.ETUDE';
        static private $chIdEtude = 'id_etude';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['USER']),
                decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['PASSWORD']), self::$tableEtude,
                self::$chIdEtude, null, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['LOGIN']));
        }

        static function supprimeId($listId) {
            parent::supprimeId(HOST, PORT, DBNAME, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['USER']),
                decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['PASSWORD']), self::$tableEtude,
                self::$chIdEtude, $listId, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['LOGIN']));
        }
    }
?>
