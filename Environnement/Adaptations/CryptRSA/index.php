<?php
set_include_path('./PEAR/');

session_start();

require_once 'Crypt/RSA.php';
require_once './class/myKey.php';
require_once './class/myKeyPair.php';
require_once './class/myRSA.php';

if ( ! empty($_POST['codesecret']))
{
    $codesecret = $_POST['codesecret'];
    if ( (isset($_POST['isCrypted'])) && ($_POST['isCrypted'] == 1) )
    {
        $rsa_obj = new Crypt_myRSA(null, 'BCMath');
        $private_key = new Crypt_RSA_myKey($_SESSION['private_module'], $_SESSION['private_exp'], 'private', 'BCMath');
        $codesecret = $rsa_obj->decrypt($codesecret, $private_key);
    }
    
    echo 'Votre code secret : '.$codesecret;
}    

/********************************************************************************************************/ 
// génération des clés RSA
/********************************************************************************************************/
$nbBits = 128; 
$key_pair = new Crypt_RSA_myKeyPair($nbBits, 'BCMath');
$public_key = $key_pair->getPublicKey();
$private_key = $key_pair->getPrivateKey();
    
// on met en session la clé privée
$_SESSION['private_module'] = $private_key->getModulus();
$_SESSION['private_exp'] = $private_key->getExponent();
?>

<script language="JavaScript" src="./js/BigInt.js"></script>
<script language="JavaScript" src="./js/BigIntMath.js"></script>
<script language="JavaScript" src="./js/RSA.js"></script>
<script language="JavaScript">
var key;
var EncryptedText;

// La clé publique passées aux js
var public_exponent = "<?php echo $public_key->getIntExponent(); ?>";
var public_modulus =  "<?php echo $public_key->getIntModulus(); ?>"
var nb_bits = <?php echo $nbBits; ?>;

setMaxDigits(154);
public_key = new RSAPublicKey(public_exponent, public_modulus, nb_bits);

function encrypt()
{
    var code_str = document.register.codesecret.value;
    EncryptedText = encryptedString(public_key, code_str);
    document.register.codesecret.type='text';
    document.register.codesecret.size=EncryptedText.length; 
    document.register.codesecret.value=EncryptedText;
    document.register.isCrypted.value=1;
}

function annule()
{
    document.register.codesecret.type='password';
    document.register.codesecret.size=15; 
    document.register.codesecret.value='';
    document.register.isCrypted.value=0;
}   
</script>
<form id="register" method="post" action="" name="register">
    <fieldset>
        <legend>Saisissez votre code secret</legend>
            <div>
                <label><strong>Code secret : </strong><br /><input type="password" name="codesecret" size="16" autocomplete="off"/><br /></label>
            </div><br />
        <input type="button" value="Chiffrer votre code secret" onclick="encrypt()" class="bouton">
        <input type="button" value="Annuler le chiffrement" onclick="annule()" class="bouton">
        <input type="hidden" name="isCrypted" value="0">
    </fieldset>
    <p align="center"><input type="submit" name="register" value="Valider" class="bouton" /></p>
</form>

<div id="info_public_key"></div>
<script type="text/javascript">
document.getElementById('info_public_key').innerHTML = "votre clé publique de chiffrement :<br /> Modulus : "+public_modulus+"<br /> Exponent : "+public_exponent+"<br /> Nombre de bits : "+nb_bits;
</script>
