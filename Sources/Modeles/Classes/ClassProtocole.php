<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../' . ENV . '/Outils/ClassEnreg.php';
    require_once '../../' . CONFIG . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    class Protocole extends Enreg {
        static private $tableProtocole = 'MD.protocole';
        static private $chIdProtocole = 'id_protocole';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['USER']),
                decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['PASSWORD']), self::$tableProtocole,
                self::$chIdProtocole, null, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['LOGIN']));
        }

        static function supprimeId($listId) {
            parent::supprimeId(HOST, PORT, DBNAME, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['USER']),
                decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['PASSWORD']), self::$tableProtocole,
                self::$chIdProtocole, $listId, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['LOGIN']));
        }
    }
?>
