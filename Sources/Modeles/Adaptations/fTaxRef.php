<?php

  require_once '../../Configuration/ConfigUtilisee.php';
  if(!@include('../../' . $configInstance . '/Filtres/fTaxRef.php')) {
    die('{success: true, data: "Taxon OK"}');
  }

?>
