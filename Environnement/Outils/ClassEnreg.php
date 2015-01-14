<?php
    require_once 'ClassCnxPg.php';
    require_once 'Fct.php';

    abstract class Enreg {
        protected $table;
        private $seqSerial;
        protected $chId;
        private $tabTyp = array();
        private $tabProp = array();
        protected $cnxPg;

        function __construct($host, $port, $dbname, $user, $password, $table, $chId,
        $seqSerial = null, $login = null) {
            $this->cnxPg = new CnxPg($host, $port, $dbname, $user, $password, $login);
            $this->table = $table;
            $this->chId = $chId;
            if (isset($seqSerial)) {
                $this->seqSerial = $seqSerial;
            }
            else {
                $this->seqSerial = $this->table . '_' . $this->chId . '_seq';
            }
            $req = 'SELECT * FROM ' . $this->table;
            $rs = $this->cnxPg->executeSql($req);
            $nbCols = pg_num_fields($rs);
            for ($i = 0; $i < $nbCols; $i++) {
                $ch = pg_field_name($rs, $i);
                $this->tabTyp[$ch] = pg_field_type($rs, $i);            
            }            
        }

        function __destruct() {
            unset($this->cnxPg);
        }

        function charge($id) {
            $result = false;
            if ((isset($id)) && ($id != '')) {
                $req = 'SELECT * FROM ' . $this->table . ' WHERE ' . $this->chId .
                    ' = ' . $id;
                $rs = $this->cnxPg->executeSql($req);
                if (pg_num_rows($rs) == 1) {
                    $lig = pg_fetch_assoc($rs);
                    foreach ($lig as $ch=>$val) {
                        $this->tabProp[$ch] = $val;
                    }
                    $result = true;
                }
            }
            return $result;
        }

        function __get($prop) {
            return $this->tabProp[$prop];
        }
        
        function __set($prop, $val) {
            $this->tabProp[$prop] = $val;
        }

        // méthode magique très importante pour simplifier le code ensuite par des "unset"
        function __unset($prop) {
            unset($this->tabProp[$prop]);
        }

        function __toString() {
            return utf8_encode(implode(' | ', array_values($this->tabProp)));
        }

        function ajoute($returningValId = true) {
            $req = 'INSERT INTO ' . $this->table . ' (' . implode(', ', array_keys($this->tabProp)) .
                ') VALUES (';
            $premiereFois = true;
            foreach ($this->tabProp as $ch => $val) {
                if ($premiereFois) {
                    if ($ch != $this->chId) {
                        $req .= valeurControlee($this->tabTyp[$ch], $val);
                    }
                    else {
                        $req .= "nextval('" . $this->seqSerial. "'::regclass)";
                    }
                    $premiereFois = false;
                }
                else {
                    if ($ch != $this->chId) {
                        $req .= ', ' . valeurControlee($this->tabTyp[$ch], $val);
                    }
                    else {
                        $req .= ", nextval('" . $this->seqSerial. "'::regclass)";
                    }
                }
            }
            $req .= ')';
            if ($returningValId) {
                $req .= ' RETURNING ' . $this->chId;
                return pg_result($this->cnxPg->executeSql($req), 0, 0);
            }
            else {
                return pg_affected_rows($this->cnxPg->executeSql($req));
            }
        }

        function modifie() {
            $req = 'UPDATE ' . $this->table . ' SET ';
            $premiereFois = true;
            foreach ($this->tabProp as $ch => $val) {
                if ($ch != $this->chId) {
                    if ($premiereFois) {
                        $req .= $ch . ' = ' . valeurControlee($this->tabTyp[$ch], $val);
                        $premiereFois = false;
                    }
                    else {
                        $req .= ', ' . $ch . ' = ' . valeurControlee($this->tabTyp[$ch], $val);
                    }
                }
            }
            $req .= ' WHERE ' . $this->chId . ' = ' . $this->tabProp[$this->chId];
            return pg_affected_rows($this->cnxPg->executeSql($req));
        }

        function supprime() {
            $req = 'DELETE FROM ' . $this->table . ' WHERE ' . $this->chId . ' = ' .
                $this->tabProp[$this->chId];
            return pg_affected_rows($this->cnxPg->executeSql($req));
        }

        static function supprimeId($host, $port, $dbname, $user, $password, $table,
        $chId, $listId, $login = null) {
            $req = 'DELETE FROM ' . $table . ' WHERE ' . $chId . ' IN (' . $listId . ')';
            $cnxPg = new CnxPg($host, $port, $dbname, $user, $password, $login);
            $res = pg_affected_rows($cnxPg->executeSql($req));
            unset($cnxPg);
            return $res;
        }
    }
?>
