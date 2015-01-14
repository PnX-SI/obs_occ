<?php
    class CnxPg {
        private $host;
        private $port;
        private $dbname;
        private $user;
        private $password;
        private $login;
        private $cnx;

        function __construct($host, $port, $dbname, $user, $password, $login = null) {
            $this->host = $host;
            $this->port = $port;
            $this->dbname = $dbname;
            $this->user = $user;
            $this->password = $password;
            $this->login = $login;
            $this->cnx = pg_connect($this->paramCnx(), PGSQL_CONNECT_FORCE_NEW);
            if (!$this->cnx) {
                $errorMessage = 'ATTENTION : connexion impossible !!!';
                $data = 'ParamÃ¨tres : ' . $this->paramCnx();
                unset($this);
                die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                    $data .'"}');
            }
        }

        function  __destruct() {
        //    pg_close($this->cnx); ne pas activer car bug PHP
        }

        function paramCnx() {
            return 'host=' . $this->host . ' port=' . $this->port . ' dbname=' .
                $this->dbname . ' user=' . $this->user . ' password=' . $this->password;
        }

        function executeSql($req) {
            // exécution de la requête avec passage du login de connexion à la session PostGres
            if (isset($this->login)) {
                $rs = @pg_query($this->cnx, "SET DateStyle TO European;SELECT outils.set_user('" . $this->login .
                    "');" . $req); // pg_query <=> pg_prepare/pg_execute
            }
            else {
                $rs = @pg_query($this->cnx, $req);
            }
            if ($rs) {
                return $rs;
            }
            else {
                $errorMessage = str_replace(CHR(10), ' ', pg_errormessage($this->cnx)); // suppression des retours chariots
                $errorMessage = addslashes($errorMessage); // ajout des antislashs aux guillemets simples, doubles, antislash et le caractère NULL
                $data = 'SQL : ' . $req;
                $data = str_replace(CHR(10), ' ', $data); // suppression des retours chariots
                die('{success: false, errorMessage: "' . $errorMessage . '", data: "' .
                    $data .'"}');
            }
        }
    }
?>
