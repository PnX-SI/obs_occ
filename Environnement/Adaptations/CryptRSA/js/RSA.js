/*************************************************************************************************************************/
//  RSA 
//  Contient 4 fonctions principales de l'agorithme RSA
//      - RSAPublicKey pour le support de la cl� publique et ses propri�t�s
//      - RSAPrivateKey pour le support de la cl� priv�e et ses propri�t�s
//      - encryptedString pour encrypter un texte � l'aide de la cl� public
//      - decryptedString pour d�crypter un texte � l'aide de la cl� priv�e
//
//  Utilise BigInt.js et BigIntMath.js    
//  
//  Wamania, 24/05/2006
//
//  Version 1.00
/*************************************************************************************************************************/ 
function RSAPublicKey(encryptionExponent, modulus, nbBits)
{
	this.e = biFromString(encryptionExponent,10);
	this.m = biFromString(modulus,10);
    
	this.chunk_len = (nbBits - 1);
    this.block_len = Math.ceil(this.chunk_len / 8);
}


function encryptedString(key, s)
{ 
    var block;
    s += String.fromCharCode(01);
    block = bin2int(s);
    
    var data_len = bitLen(block);
    
    var curr_pos = 0;
    var encryptedData = '';
    var i = 0;
    while (curr_pos < data_len) 
    {
        var tmp = subint(block, curr_pos, key.chunk_len);
        var encryptedBlock = int2bin(biPowMod(tmp, key.e, key.m));
        for (i=encryptedBlock.length; i<key.block_len; i++)
        {   
            encryptedBlock += "\0";
        }
        encryptedData += encryptedBlock;
        curr_pos += key.chunk_len;
    }
    return biToString(bin2int(encryptedData), 10);
}
