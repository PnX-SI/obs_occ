<?php
    require_once 'ClassEnreg.php';

    class EnregGeom extends Enreg {
        private $chGeom;
        private $epsg;

        function __construct($host, $port, $dbname, $user, $password, $table, $chId,
        $seqSerial, $chGeom, $epsg, $login = null) {
            $this->chGeom = $chGeom;
            $this->epsg = $epsg;
            parent::__construct($host, $port, $dbname, $user, $password, $table,
                $chId, $seqSerial, $login);
        }

        function dessine($id, $geom) {
            $req = 'UPDATE ' . $this->table . ' SET ' . $this->chGeom . ' = ' .
            "st_transform(ST_GeometryFromText('" . $geom . "', 4326), " . $this->epsg . ')' .
            ' WHERE ' . $this->chId . ' = ' . $id;
            return pg_affected_rows($this->cnxPg->executeSql($req));
        }

        function efface($id) {
            $req = 'UPDATE ' . $this->table . ' SET ' . $this->chGeom . ' = NULL ' .
            ' WHERE ' . $this->chId . ' = ' . $id;
            return pg_affected_rows($this->cnxPg->executeSql($req));
            $this->dessine($id, '');
        }
    }
?>
