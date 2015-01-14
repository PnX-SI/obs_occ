<?php
/**
 * Surcharge de la classe Crypt_RSA_KeyPair de PEAR
 */
 
class Crypt_RSA_myKeyPair extends Crypt_RSA_KeyPair
{
	
	function Crypt_RSA_myKeyPair($key_len, $wrapper_name = 'default', $error_handler = '', $random_generator = null)
	{
		parent::Crypt_RSA_KeyPair($key_len, $wrapper_name, $error_handler, $random_generator);
	}
	
	/**
     * Generates new Crypt_RSA key pair with length $key_len.
     * If $key_len is missed, use an old key length from $this->_key_len
     *
     * @param int $key_len  bit length of key pair, which will be generated
     * @return bool         true on success or false on error
     * @access public
     */
    function generate($key_len = null)
    {
        if (is_null($key_len)) {
            // use an old key length
            $key_len = $this->_key_len;
            if (is_null($key_len)) {
                $this->pushError('missing key_len parameter', CRYPT_RSA_ERROR_MISSING_KEY_LEN);
                return false;
            }
        }

        // minimal key length is 8 bit ;)
        if ($key_len < 8) {
            $key_len = 8;
        }
        // store key length in the _key_len property
        $this->_key_len = $key_len;

        // set [e] to 0x10001 (65537)
        $e = $this->_math_obj->bin2int("\x01\x00\x01");

        // generate [p], [q] and [n]
        $p_len = intval(($key_len + 1) / 2);
        $q_len = $key_len - $p_len;
        $p1 = $q1 = 0;
        do {
            // generate prime number [$p] with length [$p_len] with the following condition:
            // GCD($e, $p - 1) = 1
            do {
                $p = $this->_math_obj->getPrime($p_len, $this->_random_generator);
                $p1 = $this->_math_obj->dec($p);
                $tmp = $this->_math_obj->GCD($e, $p1);
            } while (!$this->_math_obj->isOne($tmp));
            // generate prime number [$q] with length [$q_len] with the following conditions:
            // GCD($e, $q - 1) = 1
            // $q != $p
            do {
                $q = $this->_math_obj->getPrime($q_len, $this->_random_generator);
                $q1 = $this->_math_obj->dec($q);
                $tmp = $this->_math_obj->GCD($e, $q1);
            } while (!$this->_math_obj->isOne($tmp) && !$this->_math_obj->cmpAbs($q, $p));
            // if (p < q), then exchange them
            if ($this->_math_obj->cmpAbs($p, $q) < 0) {
                $tmp = $p;
                $p = $q;
                $q = $tmp;
                $tmp = $p1;
                $p1 = $q1;
                $q1 = $tmp;
            }
            // calculate n = p * q
            $n = $this->_math_obj->mul($p, $q);
        } while ($this->_math_obj->bitLen($n) != $key_len);

        // calculate d = 1/e mod (p - 1) * (q - 1)
        $pq = $this->_math_obj->mul($p1, $q1);
        $d = $this->_math_obj->invmod($e, $pq);

        // calculate dmp1 = d mod (p - 1)
        $dmp1 = $this->_math_obj->mod($d, $p1);

        // calculate dmq1 = d mod (q - 1)
        $dmq1 = $this->_math_obj->mod($d, $q1);

        // calculate iqmp = 1/q mod p
        $iqmp = $this->_math_obj->invmod($q, $p);

        // store RSA keypair attributes
        $this->_attrs = array(
            'version' => "\x00",
            'n' => $this->_math_obj->int2bin($n),
            'e' => $this->_math_obj->int2bin($e),
            'd' => $this->_math_obj->int2bin($d),
            'p' => $this->_math_obj->int2bin($p),
            'q' => $this->_math_obj->int2bin($q),
            'dmp1' => $this->_math_obj->int2bin($dmp1),
            'dmq1' => $this->_math_obj->int2bin($dmq1),
            'iqmp' => $this->_math_obj->int2bin($iqmp),
        );

        $n = $this->_attrs['n'];
        $e = $this->_attrs['e'];
        $d = $this->_attrs['d'];

        // try to create public key object
        $obj = &new Crypt_RSA_myKey($n, $e, 'public', $this->_math_obj->getWrapperName(), $this->_error_handler);
        if ($obj->isError()) {
            // error during creating public object
            $this->pushError($obj->getLastError());
            return false;
        }
        $this->_public_key = &$obj;

        // try to create private key object
        $obj = &new Crypt_RSA_myKey($n, $d, 'private', $this->_math_obj->getWrapperName(), $this->_error_handler);
        if ($obj->isError()) {
            // error during creating private key object
            $this->pushError($obj->getLastError());
            return false;
        }
        $this->_private_key = &$obj;

        return true; // key pair successfully generated
    }
}
?>
