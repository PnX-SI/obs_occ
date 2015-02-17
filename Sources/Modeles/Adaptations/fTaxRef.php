<?php

  require_once '../../Configuration/ConfigUtilisee.php';
  if(!@include('../../' . CONFIG . '/Filtres/fTaxRef.php')) {
    die('{success: true, data: "Taxon OK"}');
  }

?>
