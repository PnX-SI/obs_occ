<?php
    $dir = dirname(__FILE__);
    require_once $dir . '../../Configuration/ConfigUtilisee.php';
    set_include_path($dir . '../' . LIB . '/PEAR/');
    require_once $dir . '../' . LIB . '/PEAR/Crypt/RSA.php';
    
    //Décryptage RSA classique (pour les variables de session)
    function decrypteRSA($appli, $val) {
        if (CRYPTAGE) {
            $rsa_obj = new Crypt_RSA(null, 'BCMath');
            $private_key = new Crypt_RSA_Key($_SESSION[$appli]['Securite']['private_module'],
                $_SESSION[$appli]['Securite']['private_exp'], 'private', 'BCMath');
            return $rsa_obj->decrypt($val, $private_key);
        }
        else {
            return $val;
        }
    }
?>
