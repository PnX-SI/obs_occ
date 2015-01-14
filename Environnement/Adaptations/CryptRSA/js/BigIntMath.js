/*************************************************************************************************************************/
//  BigIntMath contient un ensemble d'opérations Mathématiques utilisant BigInt et servant à générer 
//  un cryptage RSA compatible avec la classe PEAR de cryptage RSA
//  
//  Wamania, 24/05/2006
//
//  Version 1.00
/*************************************************************************************************************************/
function bin2int(str)
{
    var entier = biFromNumber(0);
    var NextInt = 0;
    n = str.length;
    do 
    {
        n--;
        NextInt = str.charCodeAt(n);
        entier = biAdd(biMultiply(entier, biFromNumber(256)), biFromNumber(NextInt));
    } 
    while (n > 0);
    
    return entier;
}

function int2bin(num)
{
    var chaine = '';
    var charCode = '';
    do 
    {
        charCode = biToString(biModulo(num, biFromNumber(256)), 10);
        chaine += String.fromCharCode(parseInt(charCode));
        num = biDivide(num, biFromNumber(256));
    } 
    while (biCompare(num, biFromNumber(0)));
    
    return chaine;
}

function subint(num, start, length)
{
    var i = 0;
    var start_byte = parseInt(start / 8);
    var start_bit = start % 8;
    var byte_length = parseInt(length / 8);
    var bit_length = length % 8;
    if (bit_length) 
    {
        byte_length++;
    }
    
    num = biDivide(num, biFromNumber(1 << start_bit));
    var tmp = int2bin(num);
    tmp = tmp.substr(start_byte, byte_length);
    for (i=tmp.length; i<byte_length; i++)
    {
        tmp += "\0";
    }
    // un peu chaud ça
    //tmp = substr_replace(tmp, tmp{byte_length - 1} & chr(0xff >> (8 - bit_length)), byte_length - 1, 1);
    return bin2int(tmp);
}

function bitLen(num)
{
    tmp = int2bin(num);
    bit_len = tmp.length * 8;
    tmp = tmp.charCodeAt( (tmp.length - 1) );
    if (!tmp) 
    {
        bit_len -= 8;
    }
    else 
    {
        while (!(tmp & 0x80)) 
        {
            bit_len--;
            tmp <<= 1;
        }
    }
    return bit_len;
}
