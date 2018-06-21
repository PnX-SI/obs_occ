<?php
    /*
     * PEUT BLOQUER LA SAISIE DE L'OBSERVATION => PERMET D'AFFICHER UN MESSAGE D'AVERTISSEMENT PERSONNALISE A L'ENREGISTREMENT DU FORMULAIRE
     */
    
    require_once '../../Modeles/Classes/ClassCnxPgObsOcc.php';
    
    // variables utilisables pour une requête si on souhaite que l'apllication ne permette pas de saisir certains taxons 
    // dans le cas où on aurait d'autres outils de collecte dédiés (exemple : l'application SaisieFlore spécifique au Parc national des Cévennes)
    $regne = $_POST['filtre']; // règne choisi
    $especeLatinSaisie = pg_escape_string($_POST['saisie']); // espece en latin saisie (besoin de "pg_escape_string" car piratage possible par l'utilisateur)
    $cd_nom = $_POST['valeur']; // unique cd_nom trouvé pour l'espece en latin saisie
    
    $cnxPgObsOcc = new CnxPgObsOcc();
    
    // A DECOMMENTER ET A ADAPTER SELON VOTRE CAS
    // Exemple bidon pour afficher un message d'avertissement lorque l'utilisateur n'a pas choisi un taxon de référence mais un synonyme
    
    /*
    if ($regne != 'Habitat') {
        $req = "SELECT nom_valide FROM inpn.taxref WHERE cd_nom = '" . $cd_nom . "'";
        $rs = $cnxPgObsOcc->executeSql($req);
        $ref = 'TAXON DE REFERENCE NON TROUVE';
        if (pg_numrows($rs) == 1) {
            $ref = pg_fetch_result($rs, 0, 'nom_valide');
        }
        $req = "SELECT cd_nom FROM inpn.taxref WHERE cd_ref = '" . $cd_nom . "'";
        $rs = $cnxPgObsOcc->executeSql($req);
        if (pg_numrows($rs) == 0) {
            $errorMessage = 'AVERTISSEMENT !!! taxon synonyme';
            $data = 'Le taxon<i>' . $especeLatinSaisie . '</i> n\'est pas un taxon de référence.<br/>'.
                'Il est préféreable d\'utiliser le taxon de référence qui est :<br/>' .
                '<b><i>' . $ref . '</i></b><br/><br/>'.
                '<b>[OK]</b> pour enregistrer quand même la saisie<br/>' .
                '<b>[ANNULER]</b> pour revevenir au formulaire en cours';
        }
    }
    */
    
    unset($cnxPgObsOcc);
    
    if (!isset($errorMessage)) {
        $data = 'Taxon OK';
        die('{success: true, data: "' . $data .'"}');
    }
    else {
        die('{success: false, typeMessage: "' . $typeMessage . '", errorMessage: "' . $errorMessage . '", data: "' . $data .'"}');
    }
?>
