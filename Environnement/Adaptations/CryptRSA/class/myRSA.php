<?php
/**
 * Surcharge de la classe Crypt_RSA de PEAR
 */
 
class Crypt_myRSA extends Crypt_RSA
{
	function Crypt_myRSA($params = null, $wrapper_name = 'default', $error_handler = '')
	{
		parent::Crypt_RSA($params, $wrapper_name, $error_handler);
	}
	
	
    /**
     * Decrypts $enc_data by the key $this->_dec_key or $key.
     *
     * @param string $enc_data  encrypted data as string
     * @param object $key       decryption key (object of RSA_Crypt_Key class)
     * @return mixed
     *         decrypted data as string on success or false on error
     *
     * @access public
     */
    function decrypt($enc_data, $key = null)
    {
        return $this->decryptBinary($this->_math_obj->int2bin($enc_data), $key);
    }
    
    /**
     * Decrypts $enc_data by the key $this->_dec_key or $key.
     *
     * @param string $enc_data  encrypted data as binary string
     * @param object $key       decryption key (object of RSA_Crypt_Key class)
     * @return mixed
     *         decrypted data as string on success or false on error
     *
     * @access public
     */
    function decryptBinary($enc_data, $key = null)
    {
        if (is_null($key)) {
            // use current decryption key
            $key = $this->_dec_key;
        }
        else if (!Crypt_RSA_myKey::isValid($key)) {
            $this->pushError('invalid decryption key. It must be an object of Crypt_RSA_Key class', CRYPT_RSA_ERROR_WRONG_KEY);
            return false;
        }

        $exp = $this->_math_obj->bin2int($key->getExponent());
        $modulus = $this->_math_obj->bin2int($key->getModulus());

        $data_len = strlen($enc_data);
        $chunk_len = $key->getKeyLength() - 1;
        $block_len = (int) ceil($chunk_len / 8);
        $curr_pos = 0;
        $bit_pos = 0;
        $plain_data = $this->_math_obj->bin2int("\0");
        while ($curr_pos < $data_len) {
            $tmp = $this->_math_obj->bin2int(substr($enc_data, $curr_pos, $block_len));
            $tmp = $this->_math_obj->powmod($tmp, $exp, $modulus);
            $plain_data = $this->_math_obj->bitOr($plain_data, $tmp, $bit_pos);
            $bit_pos += $chunk_len;
            $curr_pos += $block_len;
        }
        $result = $this->_math_obj->int2bin($plain_data);

        // delete tail, containing of \x01
        $tail = ord($result{strlen($result) - 1});
        if ($tail != 1) {
            $this->pushError("Error tail of decrypted text = {$tail}. Expected 1", CRYPT_RSA_ERROR_WRONG_TAIL);
            return false;
        }
        return substr($result, 0, -1);
    }
}


