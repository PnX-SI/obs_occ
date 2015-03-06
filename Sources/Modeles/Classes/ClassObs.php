<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../' . ENV . '/Outils/ClassEnreg.php';
    require_once '../../' . $configInstance . '/PostGreSQL.php';
    require_once 'ClassCnxPgObsOcc.php';
    require_once '../' . ENV . '/Outils/Fct.php';
    require_once '../../Securite/Decrypt.php';
    
    class Obs extends Enreg {
        static private $chIdObs = 'id_obs';

        function __construct() {
            if (decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['droit']) == 'admin') {
                parent::__construct(HOST, PORT, DBNAME, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['USER']),
                    decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['PASSWORD']), 'SAISIE.SAISIE_OBSERVATION',
                    self::$chIdObs, 'SAISIE.SAISIE_OBSERVATION_id_obs_seq', decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['LOGIN']));
            }
            else {
                parent::__construct(HOST, PORT, DBNAME, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['USER']),
                    decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['PASSWORD']), 'SAISIE.SAISIE_OBSERVATION_' .
                    decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']), self::$chIdObs,
                    'SAISIE.SAISIE_OBSERVATION_id_obs_seq', decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['LOGIN']));
            }
        }

        static function supprimeId($listId)
        {
            if (decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['droit']) == 'admin') {
                return parent::supprimeId(HOST, PORT, DBNAME, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['USER']),
                    decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['PASSWORD']), 'SAISIE.SAISIE_OBSERVATION',
                    self::$chIdObs, $listId, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['LOGIN']));
            }
            else {
                return parent::supprimeId(HOST, PORT, DBNAME, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['USER']),
                    decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['PASSWORD']), 'SAISIE.SAISIE_OBSERVATION_' .
                    decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['numerisateur']['code']), self::$chIdObs,
                    $listId, decrypteRSA($_GET['appli'], $_SESSION[$_GET['appli']]['Connexion']['LOGIN']));
            }
        }

        static function valide($listId, $statut_validation, $validateur, $decision_validation)
        {
            $req = 'UPDATE SAISIE.SAISIE_OBSERVATION SET validateur = ' . valeurControlee('varchar', $validateur) .
                ', statut_validation = ' . valeurControlee('saisie.enum_statut_validation', $statut_validation) .
                ', decision_validation = ' . valeurControlee('varchar', $decision_validation) .
                ' WHERE ' . self::$chIdObs . ' IN (' . $listId . ')';
            $cnxPgObsOcc = new CnxPgObsOcc();;
            $res = pg_affected_rows($cnxPgObsOcc->executeSql($req));
            unset($cnxPgObsOcc);
            return $res;
        }
    }
?>
