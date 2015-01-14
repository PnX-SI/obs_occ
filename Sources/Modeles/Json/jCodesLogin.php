<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../../Configuration/ConfigUtilisee.php';
    require_once '../../' . CONFIG . '/PostGreSQL.php';
    set_include_path('../' . LIB . '/PEAR/');
    require_once '../' . LIB . '/PEAR/Crypt/RSA.php';
    include_once '../' . LIB . '/jsonwrapper/jsonwrapper.php';
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    
    // Génération des clés RSA classiques
    $nbBits = 128;
    if (CRYPTAGE) {
        $key_pair = new Crypt_RSA_KeyPair($nbBits, 'BCMath');
        $public_key = $key_pair->getPublicKey();
        $private_key = $key_pair->getPrivateKey();
        // Remplacement en session par la clé privée classique
        $_SESSION[APPLI]['Securite']['private_module'] = $private_key->getModulus();
        $_SESSION[APPLI]['Securite']['private_exp'] = $private_key->getExponent();
        // Cryptage RSA classique des variables de session utilisées dans le constructeur de "CnxPgObsOcc" appelé par "Personne::compteDejaExistant"
        $rsa_obj = new Crypt_RSA(null, 'BCMath');
    }
    if (CRYPTAGE) {
                $_SESSION[APPLI]['Connexion']['USER'] = $rsa_obj->encrypt(USER, $public_key);
                $_SESSION[APPLI]['Connexion']['PASSWORD'] = $rsa_obj->encrypt(PASSWORD, $public_key);
    }
    else {
        $_SESSION[APPLI]['Connexion']['USER'] = USER;
        $_SESSION[APPLI]['Connexion']['PASSWORD'] = PASSWORD;
    }    
            
    $cnxPgObsOcc = new CnxPgObsOcc();
    if ($_REQUEST['query']) {
      $where = " AND email ilike '".$_REQUEST['query']."%' ";
    }
    
    $req = "SELECT email AS email FROM MD.PERSONNE WHERE NOT email IS NULL ".$where." ORDER BY email LIMIT 20;" ;
    $rs = $cnxPgObsOcc->executeSql($req);
    $arr = array();
    while ($obj = pg_fetch_object($rs)) {
        $arr[] = $obj;
    }
    echo json_encode($arr);
    unset($cnxPgObsOcc);
?>
          