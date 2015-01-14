<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../' . ENV . '/Outils/ClassEnreg.php';
    require_once '../../' . CONFIG . '/PostGreSQL.php';
    require_once 'ClassCnxPgObsOcc.php';
    require_once '../../Securite/Decrypt.php';
    
    class Personne extends Enreg {
        static private $tablePersonne = 'MD.PERSONNE';
        static private $chIdPersonne = 'id_personne';
        static private $nom = 'nom';
        static private $prenom = 'prenom';
        static private $email = 'email';
        static private $mot_de_passe = 'mot_de_passe';

        function __construct() {
            parent::__construct(HOST, PORT, DBNAME, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['USER']),
                decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['PASSWORD']), self::$tablePersonne,
                self::$chIdPersonne, null, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['LOGIN']));
        }

        static function authentifie($email, $mot_de_passe) {
            $result = false;
            $req = 'SELECT ' . self::$chIdPersonne . ' FROM ' . self::$tablePersonne . ' WHERE ' . self::$email .
                " = '" . $email . "' AND " . self::$mot_de_passe . " = '" . $mot_de_passe . 
                "' AND " . '"role" IN (' . "'observ', 'amateur', 'expert', 'admin')";
            $cnxPgObsOcc = new CnxPgObsOcc();
            $rs = $cnxPgObsOcc->executeSql($req);
            if (pg_numrows($rs) > 0) {
                $result = pg_result($rs, 0, 0);
            }
            unset($cnxPgObsOcc);
            return $result;
        }

        static function supprimeId($listId) {
            parent::supprimeId(HOST, PORT, DBNAME, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['USER']),
                decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['PASSWORD']), self::$tablePersonne,
                self::$chIdPersonne, $listId, decrypteRSA(APPLI, $_SESSION[APPLI]['Connexion']['LOGIN']));
        }

        // retourne -1 si compte inexistant, 0 si email existant et 1 si detection d'homonymie
        static function compteDejaExistant($prenom, $nom, $email) {           
            $result = -1;
            $cnxPgObsOcc = new CnxPgObsOcc();
            $req = 'SELECT ' . self::$chIdPersonne . ' FROM ' . self::$tablePersonne .
                ' WHERE lower(' . self::$email . ") = lower('" . $email . "')";
            $rs = $cnxPgObsOcc->executeSql($req);
            if (pg_numrows($rs) > 0) {
                $result = 0;
            }
            else {
                $req = 'SELECT ' . self::$chIdPersonne . ' FROM ' . self::$tablePersonne .
                    ' WHERE initcap(' . self::$nom .") = initcap('" . $nom . "') AND initcap(" . self::$prenom .
                    ") = initcap('" . $prenom . "')";
                $rs = $cnxPgObsOcc->executeSql($req);
                if (pg_numrows($rs) > 0) {
                    $result = 1;
                }
            }
            unset($cnxPgObsOcc);
            return $result;
        }

        // retourne l'identifiant de la personne si elle existe
        static function personneDejaExistante($email) {
            $result = false;
            $cnxPgObsOcc = new CnxPgObsOcc();
            $req = 'SELECT ' . self::$chIdPersonne . ' FROM ' . self::$tablePersonne .
                ' WHERE lower(' . self::$email . ") = lower('" . $email . "')";
            $rs = $cnxPgObsOcc->executeSql($req);
            if (pg_numrows($rs) > 0) {
                $result = pg_result($rs, 0, 0);
            }
            unset($cnxPgObsOcc);
            return $result;
        }
    }
?>
