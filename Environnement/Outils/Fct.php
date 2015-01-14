<?php
    session_start();
    
    // Génération aléatoire d'une chaîne de caractères de longueur définie
    function genere_passwd($taille) {
        $passwd="";
        $tpass=array();
        // récupération des chiffres et des lettres
        for($i=48;$i<58;$i++) $tpass[$id++]=chr($i);
        for($i=65;$i<91;$i++) $tpass[$id++]=chr($i);
        for($i=97;$i<123;$i++) $tpass[$id++]=chr($i);
        for($i=0;$i<$taille;$i++) {
            $passwd.=$tpass[rand(0,$id-1)];
        }        
        return $passwd;
    }
	
    // Vérification de la valeur à insérer dans la clause SQL
    function valeurControlee($typeCh, $val) {
        if ($val == '') {
            return 'NULL';
        }
        else {
            switch ($typeCh) {
                case 'saisie.enum_germination':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_germination':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_landuse':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_landuse':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_expo':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_expo':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_stade_reproductif':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_stade_reproductif':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_stade_phenologique':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_stade_phenologique':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_specialite':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_specialite':
                    return "'" . pg_escape_string($val) . "'";
                case 'md.enum_titre':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_titre':
                    return "'" . pg_escape_string($val) . "'";
                case 'md.enum_role':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_role':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_statut_validation':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_statut_validation':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_precision':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_precision':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_determination':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_determination':
                    return "'" . pg_escape_string($val) . "'";
                case 'varchar':
                    return "'" . pg_escape_string($val) . "'";
                case 'text':
                    return "'" . pg_escape_string($val) . "'";
                case 'date':
                    return "'" . pg_escape_string($val) . "'";
                case 'time':
                    return "'" . pg_escape_string($val) . "'";
                case 'bool':
                    return "'" . pg_escape_string($val) . "'";
                case 'geometry':
                    return $val; // pas besoin de "pg_escape_string" car valeur non maîtrisée par l'utilisateur
                case 'saisie.enum_age':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_age':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_etat_de_conservation':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_etat_de_conservation':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_phenologie':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_phenologie':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_sexe':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_sexe':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_type_effectif':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_type_effectif':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_unite':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_unite':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_mode_mesure_debit':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_mode_mesure_debit':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_type_milieu':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_type_milieu':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_pheno':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_pheno':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_type_contact':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_type_contact':
                    return "'" . pg_escape_string($val) . "'";
                case 'saisie.enum_meteo_3j':
                    return "'" . pg_escape_string($val) . "'";
                case 'enum_meteo_3j':
                    return "'" . pg_escape_string($val) . "'";                
                default:
                    return pg_escape_string($val);
            }
        }
    }

    //Déconnection de l'application
    function deconnecteAppli($appli) {
        $_SESSION[$appli] = array();
    }
    
    /*function detruieSessionEnCours() {
        $_SESSION = array();
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            if (version_compare(PHP_VERSION, '5.2.0') >= 0) {
                setcookie(session_name(), '', time() - 42000, $params["path"],
                    $params["domain"], $params["secure"], $params["httponly"]);
            }
            else {
                setcookie(session_name(), '', time() - 42000, $params["path"],
                    $params["domain"], $params["secure"]);
            }
        }
        session_destroy();
    }
    */
?>