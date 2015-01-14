<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../Configuration/ConfigUtilisee.php';
    set_include_path(LIB . '/PEAR/');
    require_once LIB . '/PEAR/Crypt/RSA.php';
    require_once ENV . '/Adaptations/CryptRSA/class/myKey.php';
    require_once ENV . '/Adaptations/CryptRSA/class/myKeyPair.php';
    require_once ENV . '/Adaptations/CryptRSA/class/myRSA.php';
    require_once '../' . CONFIG . '/PostGreSQL.php';

    // Génération des clés RSA personnalisées
    $nbBits = 128;
    if (CRYPTAGE) {
        $key_pair_perso = new Crypt_RSA_myKeyPair($nbBits, 'BCMath');
        $public_key_perso = $key_pair_perso->getPublicKey();
        $getIntExponent = $public_key_perso->getIntExponent();
        $getIntModulus = $public_key_perso->getIntModulus();
        $private_key_perso = $key_pair_perso->getPrivateKey();
        unset($key_pair_perso);
        // Mise en session de la clé privée personnalisée
        $_SESSION[APPLI]['Securite']['private_module_perso'] = $private_key_perso->getModulus();
        $_SESSION[APPLI]['Securite']['private_exp_perso'] = $private_key_perso->getExponent();

        // Regénération de nouvelles clés RSA classiques
        $key_pair = new Crypt_RSA_KeyPair($nbBits, 'BCMath');
        $public_key = $key_pair->getPublicKey();
        $private_key = $key_pair->getPrivateKey();
        unset($key_pair);
        // Remplacement en session par la clé privée classique
        $_SESSION[APPLI]['Securite']['private_module'] = $private_key->getModulus();
        $_SESSION[APPLI]['Securite']['private_exp'] = $private_key->getExponent();
        // Cryptage RSA classique des variables de session pour initialiser comboStructure
        $rsa_obj = new Crypt_RSA(null, 'BCMath');
        $_SESSION[APPLI]['Connexion']['USER'] = $rsa_obj->encrypt(USER, $public_key);
        $_SESSION[APPLI]['Connexion']['PASSWORD'] = $rsa_obj->encrypt(PASSWORD, $public_key);
        unset($rsa_obj);
    }
    else {
        $_SESSION[APPLI]['Connexion']['USER'] = USER;
        $_SESSION[APPLI]['Connexion']['PASSWORD'] = PASSWORD;
        $getIntExponent = 0;
        $getIntModulus = 0;
    }
?>
<html>
    <head>
        <style type="text/css">
            body {
                background-image: <?php echo FOND; ?>;
                background-repeat: no-repeat;
                background-attachment: fixed;
                background-position:center center;
            }
        </style>
        <script type='text/javascript' src="<?php echo ENV; ?>/Adaptations/CryptRSA/js/BigInt.js"></script>
        <script type='text/javascript' src="<?php echo ENV; ?>/Adaptations/CryptRSA/js/BigIntMath.js"></script>
        <script type='text/javascript' src="<?php echo ENV; ?>/Adaptations/CryptRSA/js/RSA.js"></script>
        <script type='text/javascript'>
            // Passage de la clé publique personnalisée au js
            var public_exponent = '<?php echo $getIntExponent; ?>';
            var public_modulus = '<?php echo $getIntModulus; ?>'
            var nb_bits = <?php echo $nbBits; ?>;
            setMaxDigits(154);
            var public_key = new RSAPublicKey(public_exponent, public_modulus, nb_bits);
        </script>
        <title>Authentification</title>
        <!-- Définition du jeu de caractères -->
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <!-- Bibliothèque Ext en français (version de production) -->
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/adapter/ext/ext-base.js"></script>
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/ext-all.js"></script>
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/src/locale/ext-lang-fr.js"></script>
        <!-- Complément de Ext -->
        <script type="text/javascript" src="<?php echo LIB; ?>/Ext/examples/ux/ux-all.js"></script>
        <!-- Feuilles de style -->
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/resources/css/ext-all.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/examples/ux/css/ux-all.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo LIB; ?>/Ext/examples/ux/statusbar/css/statusbar.css" />
        <link type="text/css" rel="stylesheet" href="<?php echo ENV; ?>/Ergonomie/Formulaires/frmFds.css" />
        <!-- Outils -->
        <script type="text/javascript" src="<?php echo ENV; ?>/Outils/Global.js"></script>
        <!-- Personnalisation de l'application -->
        <script type="text/javascript" src="../<?php echo CONFIG; ?>/Appli.js"></script>
        <!-- Formulaire -->
        <script type="text/javascript" src="../Controleurs/Formulaires/frmAuthent.js"></script>
    </head>
    <body>
    </body>
</html>
