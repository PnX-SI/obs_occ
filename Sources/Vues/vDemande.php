<?php
    if (!isset($_SESSION)) {
        session_start();
    }
    require_once '../Configuration/ConfigUtilisee.php';
    set_include_path(LIB . '/PEAR/');
    require_once LIB . '/PEAR/Crypt/RSA.php';
    require_once '../' . $configInstance . '/PostGreSQL.php';
    
    // Génération de nouvelles clés RSA classiques
    $nbBits = 128;
    if (CRYPTAGE) {
        $key_pair = new Crypt_RSA_KeyPair($nbBits, 'BCMath');
        $public_key = $key_pair->getPublicKey();
        $private_key = $key_pair->getPrivateKey();
        // Remplacement en session par la clé privée classique
        $_SESSION[$_GET['appli']]['Securite']['private_module'] = $private_key->getModulus();
        $_SESSION[$_GET['appli']]['Securite']['private_exp'] = $private_key->getExponent();
        // Cryptage RSA classique des variables de session utilisées dans le constructeur de "CnxPgObsOcc" appelé par "Personne::authentifie"
        $rsa_obj = new Crypt_RSA(null, 'BCMath');
        $_SESSION[$_GET['appli']]['Connexion']['USER'] = $rsa_obj->encrypt(USER, $public_key);
        $_SESSION[$_GET['appli']]['Connexion']['PASSWORD'] = $rsa_obj->encrypt(PASSWORD, $public_key);
    }
    else {
        $_SESSION[$_GET['appli']]['Connexion']['USER'] = USER;
        $_SESSION[$_GET['appli']]['Connexion']['PASSWORD'] = PASSWORD;
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
        <title>Demande</title>
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
        <link type="text/css" rel="stylesheet" href="<?php echo ENV; ?>/Ergonomie/Grilles/gFds.css" />
        <!-- Personnalisation de l'application -->
        <script type="text/javascript" src="../<?php echo $configInstance; ?>/Appli.js"></script>
        <!-- Outils -->
        <script type="text/javascript" src="<?php echo ENV; ?>/Outils/Global.js"></script>
        <!-- Formulaire -->
        <script type="text/javascript" src="../Controleurs/Formulaires/frmDemande.js"></script>
    </head>
    <body>
    </body>
</html>
