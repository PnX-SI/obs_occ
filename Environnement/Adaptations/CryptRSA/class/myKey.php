<?php
/**
 * Surcharge de la classe Crypt_RSA_Key de PEAR
 */
 
class Crypt_RSA_myKey extends Crypt_RSA_Key
{
	function Crypt_RSA_myKey($modulus, $exp, $key_type, $wrapper_name = 'default', $error_handler = '')
	{
		parent::Crypt_RSA_Key($modulus, $exp, $key_type, $wrapper_name, $error_handler);
	}
	
	function getIntModulus()
    {
        return $this->_math_obj->bin2int($this->_modulus);
    }
    
    function getIntExponent()
    {
        return $this->_math_obj->bin2int($this->_exp);
    }
    
    function isValid($key)
    {
        return (is_object($key) && strtolower(get_class($key)) === strtolower(__CLASS__));
    }
}
