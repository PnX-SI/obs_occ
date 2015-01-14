<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../' . ENV . '/Outils/ClassEnreg.php';
    require_once '../../' . CONFIG . '/PostGreSQL.php';
    require_once '../../Securite/Decrypt.php';
    
    class Structure extends Enreg {
        static private $tableStructure = 'MD.STRUCTURE';
        static private $chIdStructure = 'id_structure';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['USER']),
                decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['PASSWORD']), self::$tableStructure,
                self::$chIdStructure, null, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['LOGIN']));
        }

        static function supprimeId($listId) {
            parent::supprimeId(HOST, PORT, DBNAME, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['USER']),
                decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['PASSWORD']), self::$tableStructure,
                self::$chIdStructure, $listId, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['LOGIN']));
        }
    }
?>
