<?php
    /*
     * N'EMPECHE PAS LA SAISIE DE L'OBSERVATION => PERMET JUSTE D'AFFICHER UN MESSAGE D'AVERTISSEMENT PERSONNALISE A LA FERMETURE DU FORMULAIRE
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
        $req = "SELECT nom_valide, cd_ref FROM inpn.taxref WHERE cd_nom = '" . $cd_nom . "'";
        $rs = $cnxPgObsOcc->executeSql($req);
        $nom_valide = pg_fetch_result($rs, 0, 'nom_valide');
        $cd_ref = pg_fetch_result($rs, 0, 'cd_ref');
        if ($cd_ref != $cd_nom) {
            $errorMessage = 'AVERTISSEMENT : taxon synonyme';
            $data = 'Le taxon ' . $especeLatinSaisie . ' que vous venez de saisir n\'est pas un taxon de référence !!! Nom valide  = ' . $nom_valide;
        }
    }
    */
    unset($cnxPgObsOcc);
    
    if (!isset($errorMessage)) {
        $data = 'Taxon OK';
        die('{success: true, data: "' . $data .'"}');
    }
    else {
        die('{success: false, errorMessage: "' . $errorMessage . '", data: "' . $data .'"}');
    }
?>
