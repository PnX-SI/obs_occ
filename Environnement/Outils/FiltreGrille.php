<?php
    //Fichier servant Ã  filtrer la grille en cours
    $start = (pg_escape_string($_REQUEST['start']) == null)? 0 : pg_escape_string($_REQUEST['start']);// besoin de "pg_escape_string" car valeur maîtrisée par l'utilisateur
    $limit = (pg_escape_string($_REQUEST['limit']) == null)? 20 : pg_escape_string($_REQUEST['limit']);// besoin de "pg_escape_string" car valeur maîtrisée par l'utilisateur
    $sort = ($_REQUEST['sort'] == null)? '' : $_REQUEST['sort'];
    $dir = ($_REQUEST['dir'] == 'DESC')? 'DESC' : '';
    $filter = ($_REQUEST['filter'] == null)? '' : $_REQUEST['filter'];
    $groupBy = ($_REQUEST['groupBy'] == null)? '' : $_REQUEST['groupBy'];
    $filtreSel = ($_REQUEST['filtreSel'] == null)? '' : $_REQUEST['filtreSel'];
    
    $where = '0 = 0'; // variable globale pour la clause "WHERE"
    $orderLimit = ''; // variable globale pour les clauses "ORDER BY et LIMIT-OFFSET

    // construction de la clause "WHERE"
    if ($filtreSel != '') {
        $where .= $filtreSel;
    }
    if (is_array($filter)) {
        for ($i = 0; $i < count($filter); $i++) {
            // besoin de "pg_escape_string" car valeur maîtrisée par l'utilisateur
            $data_value = pg_escape_string($filter[$i]['data']['value']);
            switch ($filter[$i]['data']['type']) {
                case 'string' :
                    if (strstr($data_value,'||')) {
                        $fi = explode('||' ,$data_value);
                        $qs .= ' AND ' . $filter[$i]['field'] . " ILIKE '%" . $fi[0] . "%'";
                        for ($q = 1; $q < count($fi); $q++) {
                            $qs .= ' OR ' . $filter[$i]['field'] . " ILIKE '%" . $fi[$q] . "%'";
                        }
                        $qs .= ' )';
                    }
                    else {
                        $qs .= ' AND ' . $filter[$i]['field'] . " ILIKE '%" . $data_value . "%'";
                    }
                    break;
                case 'list' :
                    if (strstr($data_value, ',')) {
                        $fi = explode(',', $data_value);
                        for ($q = 0; $q < count($fi); $q++) {
                                $fi[$q] = "'" . $fi[$q] . "'";
                        }
                        $data_value = implode(',', $fi);
                        $qs .= ' AND ' . $filter[$i]['field'] . ' IN (' . $data_value . ')';
                    }
                    else {
                        $qs .= ' AND ' . $filter[$i]['field'] . " = '" . $data_value . "'";
                    }
                    break;
				/* à comparer et intégrer
				case 'list' :
                    if ($filter[$i]['data']['value'] == 'IS NULL') {
                        $qs .= ' AND ' . $filter[$i]['field'] . ' IS NULL';
                    }
                    else {
                        $orIsNull = false;
                        if (strstr($filter[$i]['data']['value'], ',')) {
                            $fi = explode(',', $filter[$i]['data']['value']);
                            $key = array_search('IS NULL', $fi);
                            if ($key) {
                                unset($fi[$key]);
                                $filter[$i]['data']['value'] = implode(',', $fi);
                                $orIsNull = true;
                            }
                        }
                        if (strstr($filter[$i]['data']['value'], ',')) {
                            $fi = explode(',', $filter[$i]['data']['value']);
                            for ($q = 0; $q < count($fi); $q++) {
                                    $fi[$q] = "'" . $fi[$q] . "'";
                            }
                            $filter[$i]['data']['value'] = implode(',', $fi);
                            if ($orIsNull) {
                                $qs .= ' AND (' . $filter[$i]['field'] . ' IN (' .
                                $filter[$i]['data']['value'] . ') OR ' . $filter[$i]['field'] .
                                ' IS NULL)';
                            }
                            else {
                                $qs .= ' AND ' . $filter[$i]['field'] . ' IN (' .
                                $filter[$i]['data']['value'] . ')';
                            }
                        }
                        else {
                            if ($orIsNull) {
                                $qs .= ' AND (' . $filter[$i]['field'] . " = '" .
                                $filter[$i]['data']['value'] . "' OR " . $filter[$i]['field'] .
                                ' IS NULL)';
                            }
                            else {
                                $qs .= ' AND ' . $filter[$i]['field'] . " = '" .
                                $filter[$i]['data']['value'] . "'";
                            }
                        }
                    }
                    break;*/	
                case 'boolean' :
                    $qs .= ' AND ' . $filter[$i]['field'] . ' = ' . ($data_value);
                    break;
                case 'numeric' :
                    switch ($filter[$i]['data']['comparison']) {
                        case 'eq' :
                            $qs .= ' AND ' . $filter[$i]['field'] . ' = ' . $data_value;
                            break;
                        case 'lt' :
                            $qs .= ' AND ' . $filter[$i]['field'] . ' < ' . $data_value;
                            break;
                        case 'gt' :
                            $qs .= ' AND ' . $filter[$i]['field'] . ' > ' . $data_value;
                            break;
                    }
                    break;
                case 'date' :
                    switch ($filter[$i]['data']['comparison']) {
                        case 'eq' :
                            $qs .= ' AND ' . $filter[$i]['field'] . " = '" . date('Y-m-d',strtotime($data_value)) . "'";
                            break;
                        case 'lt' :
                            $qs .= ' AND ' . $filter[$i]['field'] . " < '" . date('Y-m-d',strtotime($data_value)) . "'";
                            break;
                        case 'gt' :
                            $qs .= ' AND ' . $filter[$i]['field'] . " > '" . date('Y-m-d',strtotime($data_value)) . "'";
                            break;
                    }
                break;
            }
        }
        // traitement des cas particuliers de concatÃ©nation/dÃ©concatÃ©nation de champs
        // aucun ici
        $where .= $qs;
    }

    // construction des clauses "ORDER BY et LIMIT-OFFSET
    if ($groupBy != '') {
        $orderLimit .= ' ORDER BY ' . $groupBy;
    }
    if ($sort != '') {
        if ($groupBy != '') {
            $orderLimit .= ', ' . $sort . ' ' . $dir;
        }
        else {
            $orderLimit .= ' ORDER BY ' . $sort . ' ' . $dir;
        }
    }
    if ($limit != 'AUCUNE') {
        $orderLimit .= ' LIMIT ' . $limit . ' OFFSET ' . $start;
    }
?>
