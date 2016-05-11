//Fonction de traitement de l'affichage du type combiné entier positif/booléen dans les grilles
function traiteAffichageEntierPositifBooleen(val) {
    switch (val) {
        case '-1':
            return 'Oui';
        default:
            return val;
    }
}

Ext.override(Ext.Window, {
    onEsc: Ext.emptyFn
});

//Patch pour passer outre la limite de taille des cookies dans Firefox
Ext.override(Ext.state.CookieProvider, {
    readCookies : function(){
        var cookies = {},
            c = document.cookie + ";",
            re = /\s?(.*?)=(.*?);/g,
            matches,
            name,
            value;
        var listCookies = [];
        while((matches = re.exec(c)) != null){
            name = matches[1];
            value = matches[2];
            if(name && name.substring(0,3) == "ys-"){
                if (listCookies[name.substr(5)]) {
                    listCookies[name.substr(5)] = listCookies[name.substr(5)] + value;
                }
                else {
                    listCookies[name.substr(5)] = value;
                }
            }
        }
        for (var cookie in listCookies) {
            cookies[cookie] = this.decodeValue(listCookies[cookie]);
        }
        delete cookies['remove'];
        return cookies;
    },
    setCookie : function(name, value){
        var listVal = this.encodeValue(value).match(/.{1,4000}/g);
        for (var val in listVal) {
            if (val != 'remove') {
            document.cookie = "ys-" + val + "-" + name + "=" + listVal[val] +
               ((this.expires == null) ? "" : ("; expires=" + this.expires.toGMTString())) +
               ((this.path == null) ? "" : ("; path=" + this.path)) +
               ((this.domain == null) ? "" : ("; domain=" + this.domain)) +
               ((this.secure == true) ? "; secure" : "");
            }
        }
    },
    clearCookie : function(name){
        document.cookie = "ys-" + name + "=null; expires=Thu, 01-Jan-70 00:00:01 GMT" +
           ((this.path == null) ? "" : ("; path=" + this.path)) +
           ((this.domain == null) ? "" : ("; domain=" + this.domain)) +
           ((this.secure == true) ? "; secure" : "");
    }
});

//Initialisation des caches via le statemanager
Ext.state.Manager.setProvider(new Ext.state.CookieProvider({
       path: document.location.pathname, // réduction de la taille des cookies à la page web
       expires: new Date(new Date().getTime()+(1000*60*60*24*365)) // expiration dans 365 jours
   }
)); // rechargement de la dernière configuration au niveau de l'affichage

//Fonction de récupération du champ "field" sous forme de tableau
function listeValeurs(cmp) {
    var lstVal = [];
    var nb = cmp.store.getCount();
    if (nb > 0) {
        lstVal = new Array(nb);
        for (var i = 0; i < nb; i++) {
            lstVal[i] = cmp.store.getAt(i).data[cmp.valueField];
        }
    }
    return lstVal;
}

//Fonction de modification d'un paramètre GET
function RemoveParam(name) {
    /**
     * function {public string} ? Returns a parameter from the given URL according its name.
     * If no path is provided, the current page URL is used and the arguments are all shifted one the left.
     */
    var path = window.location.href;
    var result = path;

    if(GetParam(name)) {
        var index = path.indexOf("?");
        result = path.substring(0, index);
        if(index > -1) {
            var parameters = path.substring(index + 1).split("&");
            var parameter;
            var first = true;
            for(index = 0; index < parameters.length; index++) {
                parameter = parameters[index];
                if(parameter.split("=")[0] != name) {
                    if(first) {
                        result += "?";
                        first = false;
                    }
                    else {
                        result += "&";
                    }
                    result += parameter;
                }
            }
        }
    }

    return result;
}

//Fonction de modification d'un paramètre GET
function SetParam(name, value) {
    /**
     * function {public string} ? Sets a parameter in the given URL and returns a new string.
     * If no path is provided, the current page URL is used and the arguments are all shifted one the left.
     */
    var path = window.location.href;
    var result = path;

    // Remove the parameter if it already exists.
    if(GetParam(name)) {
        result = RemoveParam(name);
    }

    // If the URL contains parameters, add the parameter after '&'
    if(result.indexOf("?") > -1) {
        result += "&";
    }
    else {
        // If the URL does not contain any parameter, add the parameter after '?'
        result += "?";
    }

    result += name + "=" + value;

    return result;
}

// LZW-compress a string
function lzw_encode(s) {
    var d = new Date();

    var dict = {};
    var data = (s + "").split("");
    var out = [];
    var currChar;
    var phrase = data[0];
    var code = 256;
    for (var i=1; i<data.length; i++) {
        currChar=data[i];
        if (dict[phrase + currChar] != null) {
            phrase += currChar;
        }
        else {
            out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
            dict[phrase + currChar] = code;
            code++;
            phrase=currChar;
        }
    }
    out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0));
    for (var i=0; i<out.length; i++) {
        out[i] = String.fromCharCode(out[i]);
    }

    var retrunedresult = out.join("");
    console.log("Input: " + s.length/1024 + "kb Output:"+ retrunedresult.length/1024 + "kb Rate: " +(s.length/retrunedresult.length) );
    console.log((new Date()).getTime() - d.getTime() + ' ms.');
    return retrunedresult;
}

function lzw_decode(s) {
	var dict = {};
	var data = (s + "").split("");
	var currChar = data[0];
	var oldPhrase = currChar;
	var out = [currChar];
	var code = 256;
	var phrase;
	for (var i=1; i<data.length; i++) {
	var currCode = data[i].charCodeAt(0);
	if (currCode < 256) {
	phrase = data[i];
	}
	else {
	phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar);
	}
	out.push(phrase);
	currChar = phrase.charAt(0);
	dict[code] = oldPhrase + currChar;
	code++;
	oldPhrase = phrase;
	}
	return out.join("");
}

//Fonction de récupération du champ "val" sous forme de tableau
function tableauValeurs(store) {
    var tabVal = [];
    var nb = store.getCount();
    if (nb > 0) {
        tabVal = new Array(nb);
        for (var i = 0; i < nb; i++) {
            tabVal[i] = store.getAt(i).data['val'];
        }
    }
    return tabVal;
}

//Actualisation de la liste d'éléments de la combo
function actualiseCombo(cb, lb) {
    var nb = lb.store.getCount();
    if (nb > 0) {
        lb.allowBlank = true;
        var codesSel = lb.store.getAt(0).data['code'];
        for (var i = 1; i < nb; i++) {
            codesSel += ', ' + lb.store.getAt(i).data['code'];
        }
        cb.store.load({params: {codes: codesSel}, callback: function() {cb.collapse();}});
    }
    else {
        lb.allowBlank = false;
        cb.store.load();
    }
}

//Suppression des éléments sélectionnés de la liste
function supprimeSelection(cb, lb) {
    var listSuppr = lb.view.getSelectedIndexes();
    for (var i = listSuppr.length - 1; i >= 0; i--) {
        lb.store.removeAt(listSuppr[i]);
    }
    actualiseCombo(cb, lb);
}

//Ajout dans la liste de l'élément sélectionné par la combo
function selectionne(cb, lb) {
    lb.store.add(
        new lb.store.recordType({
            code: cb.value,
            libelle: cb.getRawValue()
        })
    );
    actualiseCombo(cb, lb);
    cb.reset();
}

//Remplissage de la liste
function remplitListe(codes, libelles, cb, lb) {
    if ((codes != null) && (codes != '')) {
        var listCodes = codes.split('&');
        var listLibelles = libelles.split(' & ');
        for (var i = 0; i < listCodes.length; i++) {
            lb.store.add(
                new lb.store.recordType({
                     code: listCodes[i],
                     libelle: listLibelles[i]
                })
            )
        }
    }
    actualiseCombo(cb, lb);
}

//Procédures de conversion des valeurs GPX
function transformeEnEntier(val) {
    if (val) {
        // suppression des z?ros non-significatifs
        while ((val.length > 1) && (val.substr(0, 1) == '0')) {
            val = val.substr(1, 254);
        }
        // conversion en nombre entier sans aucune ?valuation
        if (!isNaN(val)) {
            var entier = Math.round(val);
            return entier;
        }
    }
    return null;
}
function transformeEnDateHeure(val) {
    var result = null;
    // conversion spécifique aux appareils GPS de dernière génération
    if (val) {
        var dateHeure = Date.parseDate(val, 'Y-m-d\\TH:i:s\\Z');
        if (dateHeure) {
            result = dateHeure;
        }
        else {
            // conversion spécifique aux appareils GPS de 1ère génération avec un traitement
            // quasi-identique des tracés de dernière génération (au libellé du mois près)
            var moisGPX = val.split('-')[1];
            var mois = 0;
            switch (moisGPX) {
                case 'JAN':
                    mois = 1;
                    break;
                case 'FEV':
                    mois = 2;
                    break;
                case 'MAR':
                    mois = 3;
                    break;
                case 'AVR':
                    mois = 4;
                    break;
                case 'MAI':
                    mois = 5;
                    break;
                case 'JUN':
                    mois = 6;
                    break;
                case 'JUL':
                    mois = 7;
                    break;
                case 'JUIL':
                    mois = 7;
                    break;
                case 'AOU':
                    mois = 8;
                    break;
                case 'SEP':
                    mois = 9;
                    break;
                case 'OCT':
                    mois = 10;
                    break;
                case 'NOV':
                    mois = 11;
                    break;
                case 'DEC':
                    mois = 12;
                    break;
            }
            val = val.replace(moisGPX, mois);
            dateHeure = Date.parseDate(val, 'd-n-y\\ G:i:s');
            if (dateHeure) {
                result = dateHeure;
            }
            else {
                dateHeure = Date.parseDate(val.split(' ')[0], 'd-n-y');
                if (dateHeure) {
                    result = dateHeure;
                }
                else {
                    result = null;
                }
            }
        }
    }
    else {
        result = null;
    }
    return result;
}

// Retourne "null" quand aucune heure
function transformeEnHeure(val) {
    var result = transformeEnDateHeure(val);
    if (result) {
        var heure = result.format('H:i:s');
        if (((val.indexOf('0:00:00') == -1) || (val.indexOf('00:00:00') == -1)) && (heure.indexOf('00:00:00') != -1)) {
            result = null;
        }
    }
    return result;
}

var Utf8 = {
    // public method for url encoding
    encode : function (string) {
        string = string.replace(/\r\n/g,"\n");
        var utftext = "";
       for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                    utftext += String.fromCharCode(c);
            }
            else if((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
            }
            else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
            }
        }
        return utftext;
    },
    // public method for url decoding
    decode : function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while ( i < utftext.length ) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                    string += String.fromCharCode(c);
                    i++;
            }
            else if((c > 191) && (c < 224)) {
                    c2 = utftext.charCodeAt(i+1);
                    string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                    i += 2;
            }
            else {
                    c2 = utftext.charCodeAt(i+1);
                    c3 = utftext.charCodeAt(i+2);
                    string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                    i += 3;
            }
        }
        return string;
    }
}

//Fonction de récupération du nom de la photo d'après celui du fichier
function nomPhoto(fichierPhoto) {
    fichierPhoto = file_name_only(fichierPhoto);
    return fichierPhoto.substring(15, fichierPhoto.length);
}

//Fonction de traitement de l'affichage du type image dans les grilles
function renderIcon(val) {
    var result = '';
    if ((val) && !(nomPhoto(val) == '')) {
        result = Utf8.encode('<img src="' + CST_cheminRelatifPhoto + val.substring(0, val.lastIndexOf('.')) +
        '_MINI.jpeg' + '" width=30 height=15 qtip="' + nomPhoto(val) + '">');
    }
    return result;
}

//Get filename from string
function file_name_only(str) {
    var result = '';
    if (str) {
        var slash = '/'
        if (str.match(/\\/)) {
            slash = '\\'
        }
        result = str.substring(str.lastIndexOf(slash) + 1, str.lastIndexOf('.'))
    }
    return result;
}

//Extension de classe pour masquer/afficher le contôle de saisie dynamiquement
Ext.override(Ext.form.Field, {
    /**
     * Show the container including the label
     */
    showContainer: function() {
        this.enable();
        this.show();
        if (!Ext.isEmpty(this.getEl())) {
            this.getEl().up('.x-form-item').setDisplayed(true); // show entire container and children (including label if applicable)
        }
    },
    /**
     * Hide the container including the label
     */
    hideContainer: function() {
        this.disable(); // for validation
        this.hide();
        if (!Ext.isEmpty(this.getEl())) {
            this.getEl().up('.x-form-item').setDisplayed(false); // hide container and children (including label if applicable)
        }
    },
    /**
     * Hide / Show the container including the label
     * @param visible
     */
    setContainerVisible: function(visible) {
        if (this.rendered) {
            if (visible) {
                this.showContainer();
            } else {
                this.hideContainer();
            }
        }
        return this;
    }
});

//Extension de classe pour changer le libellé du contôle de saisie dynamiquement
Ext.override(Ext.form.Field, {
  setFieldLabel : function(text) {
    if (this.rendered) {
      this.el.up('.x-form-item', 10, true).child('.x-form-item-label').update(text);
    }
    this.fieldLabel = text;
  }
});

Ext.data.Types.TIME = {
    convert: function(v){
        //var df = this.dateFormat;
        var df = 'time';

        if(!v){
            return null;
        }
        if(Ext.isDate(v)){
            return v;
        }
        if(df){
            if(df == 'timestamp'){
                return new Date(v*1000);
            }
            if(df == 'time'){
                return new Date(parseInt(v, 10));
            }
            return Date.parseDate(v, df);
        }
        var parsed = Date.parse(v);
        return parsed ? new Date(parsed) : null;
    },

    //sortType: st.asDate,
    sortType: Ext.data.SortTypes.asDate,

    type: 'date'
}

//Fonction de traitement de l'affichage du type time dans les grilles
function timeRenderer(value) {
    var result = '';
    if (value) {
        var d = new Date('14/03/1977 ' + value);
        result = d.format('H:i');
    }
    return result;
}

//Fonction de traitement de l'affichage du type date dans les grilles
function dateRenderer(value) {
    var result = '';
    if (value) {
        var d = new Date(value + 'T12:00:00Z'); // astuce : heure de midi pour que ça marche quelque soit le fuseau horaire (à +/- 12 heures donc)
        result = d.format('d/m/Y');
    }
    return result;
}

//Fonction de traitement de l'affichage du type booléen dans les grilles
function traiteAffichageBoolean(val) {
    switch (val) {
        case 't':
            return 'Oui'
        case 'f':
            return 'Non'
        default:
            return '';
    }
}

//Fonction de récupération d'un paramètre GET
function GetParam(name) {
    var start = location.search.indexOf('?' + name + '=');
    if (start < 0) start = location.search.indexOf('&' + name + '=');
    if (start < 0) return '';
    start += name.length + 2;
    var end = location.search.indexOf('&', start) - 1;
    if (end < 0) end = location.search.length;
    var result = '';
    for (var i = start; i <= end; i++) {
        var c = location.search.charAt(i);
        result = result + (c == '+' ? ' ' : c);
    }
    return Utf8.decode(unescape(result));
}

//Vtype contrôlant que le texte se termine par une année
Ext.apply(Ext.form.VTypes, {
    termineParAnnee: function(val, field) {
        var annee = val.substr(val.length - 4, 4);
        if ((annee >= 1900) && (annee <= 2100)) {
            return true;
        }
        else {
            return false;
        }
    },
    termineParAnneeText: 'Veuillez terminer votre saisie par une annÃ©e (ex. : "Ã©tÃ© 2010")'
});

//Extension de classe pour fixer la colonne de sélection à gauche de la grille
Ext.MyColumnModel = Ext.extend(Ext.grid.ColumnModel, {
    moveColumn: function (oldIndex, newIndex) {
        if (oldIndex != 0 && newIndex != 0) {
          var c = this.config[oldIndex];
          this.config.splice(oldIndex, 1);
          this.config.splice(newIndex, 0, c);
          this.dataMap = null;
          this.fireEvent("columnmoved", this, oldIndex, newIndex);
        }
    }
});

//Initialisation des messages d'erreur et des info-bulles
Ext.QuickTips.init();
Ext.form.Field.prototype.msgTarget = 'side';

//Lecture de cookies
function recupereCookie(nom) {
    nom = document.location.pathname + '/' + nom;
    var deb, fin;
    deb = document.cookie.indexOf(nom + '=');
    if (deb >= 0) {
        deb += nom.length + 1;
        fin = document.cookie.indexOf(';', deb);
        if (fin < 0) {
            fin = document.cookie.length;
        }
        return unescape(document.cookie.substring(deb, fin));        
     }
     return ''
}

function creeCookie(nom, contenu, jours) {
    nom = document.location.pathname + '/' + nom;
    var expireDate = new Date();
    expireDate.setTime(expireDate.getTime() + jours * 24 * 3600 * 1000);
    document.cookie = nom + '=' + escape(contenu) + ';expires=' + expireDate.toGMTString() +
        ';path=' + document.location.pathname;
}

function supprimeCookie(nom) {
    creeCookie(nom, '', -1);
}

//Template de validation des formulaires
function templateValidation(url, barreStatus, formulaire, fonctionRetour) {
    if (formulaire.form.isValid()) {
        formulaire.getEl().mask(); // application d'un masque gris sur le formulaire pour bloquer une saisie éventuelle
        barreStatus.showBusy('Traitement en cours...'); // affichage du message de chargement
        formulaire.form.submit({
            url: url,
            method: 'POST',
            reset: false, // conservation de l'état du formulaire en cas d'echec
            failure: function(form, action) {
                barreStatus.setStatus({
                    text: 'Erreur : "' + action.failureType + '"',
                    iconCls: 'x-status-error'
                });
                if (action.failureType == Ext.form.Action.SERVER_INVALID) {
                    Ext.MessageBox.show({
                        fn: function() {
                            barreStatus.clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
                            formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
                        },
                        title: action.result.errorMessage,
                        msg: action.result.data,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                }
                else {
                    Ext.MessageBox.show({
                        fn: function() {
                            barreStatus.clearStatus({useDefaults: true}); // remise des valeurs par défaut de la barre de status
                            formulaire.getEl().unmask();  // déblocage de la saisie sur le formulaire
                        },
                        title: 'ERREUR : ' + action.response.statusText,
                        msg: 'Code erreur ' + action.response.status,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            },
            success: function(form, action) {
                barreStatus.setStatus({
                    text: 'OpÃ©ration rÃ©ussie',
                    iconCls: 'x-status-valid'
                });
                if (action.result) {
                fonctionRetour(action.result.data);
            }
                else {
                    fonctionRetour();
                }
            }
        });
    }
    else {
        barreStatus.setStatus({
            clear: true, // faible attente pour être à nouveau "Prêt"
            text: 'Formulaire non valide',
            iconCls: 'x-status-error'
        });
    }
}

//Exportation des grilles au format Excel
function getExcelXml(grid, types) {
    var worksheet = createWorksheet(grid, types);
    return '<?xml version="1.0" encoding="utf-8"?>' +
        '<ss:Workbook xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:o="urn:schemas-microsoft-com:office:office">' +
        '<o:DocumentProperties><o:Title>' + grid.title + '</o:Title></o:DocumentProperties>' +
        '<ss:ExcelWorkbook>' +
            '<ss:WindowHeight>' + worksheet.height + '</ss:WindowHeight>' +
            '<ss:WindowWidth>' + worksheet.width + '</ss:WindowWidth>' +
            '<ss:ProtectStructure>False</ss:ProtectStructure>' +
            '<ss:ProtectWindows>False</ss:ProtectWindows>' +
        '</ss:ExcelWorkbook>' +
        '<ss:Styles>' +
            '<ss:Style ss:ID="Default">' +
                '<ss:Alignment ss:Vertical="Top" ss:WrapText="1" />' +
                '<ss:Font ss:FontName="arial" ss:Size="10" />' +
                '<ss:Borders>' +
                    '<ss:Border ss:Color="#e4e4e4" ss:Weight="1" ss:LineStyle="Continuous" ss:Position="Top" />' +
                    '<ss:Border ss:Color="#e4e4e4" ss:Weight="1" ss:LineStyle="Continuous" ss:Position="Bottom" />' +
                    '<ss:Border ss:Color="#e4e4e4" ss:Weight="1" ss:LineStyle="Continuous" ss:Position="Left" />' +
                    '<ss:Border ss:Color="#e4e4e4" ss:Weight="1" ss:LineStyle="Continuous" ss:Position="Right" />' +
                '</ss:Borders>' +
                '<ss:Interior />' +
                '<ss:NumberFormat />' +
                '<ss:Protection />' +
            '</ss:Style>' +
            '<ss:Style ss:ID="title">' +
                '<ss:Borders />' +
                '<ss:Font />' +
                '<ss:Alignment ss:WrapText="1" ss:Vertical="Center" ss:Horizontal="Center" />' +
                '<ss:NumberFormat ss:Format="@" />' +
            '</ss:Style>' +
            '<ss:Style ss:ID="headercell">' +
                '<ss:Font ss:Bold="1" ss:Size="10" />' +
                '<ss:Alignment ss:WrapText="1" ss:Horizontal="Center" />' +
                '<ss:Interior ss:Pattern="Solid" ss:Color="#A3C9F1" />' +
            '</ss:Style>' +
            '<ss:Style ss:ID="even">' +
                '<ss:Interior ss:Pattern="Solid" ss:Color="#CCFFFF" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="even" ss:ID="evendate">' +
                '<ss:NumberFormat ss:Format="[ENG][$-409]dd\/mm\/yyyy;@" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="even" ss:ID="eventime">' +
                '<ss:NumberFormat ss:Format="[ENG][$-F400]h:mm:ss\ AM/PM" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="even" ss:ID="evenint">' +
                '<ss:NumberFormat ss:Format="0" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="even" ss:ID="evenfloat">' +
                '<ss:NumberFormat ss:Format="0.0###################" />' +
            '</ss:Style>' +
            '<ss:Style ss:ID="odd">' +
                '<ss:Interior ss:Pattern="Solid" ss:Color="#CCCCFF" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="odd" ss:ID="odddate">' +
                '<ss:NumberFormat ss:Format="[ENG][$-409]dd\/mm\/yyyy;@" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="odd" ss:ID="oddtime">' +
                '<ss:NumberFormat ss:Format="[ENG][$-F400]h:mm:ss\ AM/PM" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="odd" ss:ID="oddint">' +
                '<ss:NumberFormat ss:Format="0" />' +
            '</ss:Style>' +
            '<ss:Style ss:Parent="odd" ss:ID="oddfloat">' +
                '<ss:NumberFormat ss:Format="0.0###################" />' +
            '</ss:Style>' +
        '</ss:Styles>' +
        worksheet.xml +
        '</ss:Workbook>';
}
function createWorksheet(grid, types) {
    var cellType = [];
    var cellTypeClass = [];
    var cm = grid.getColumnModel();
    var totalWidthInPixels = 0;
    var colXml = '';
    var headerXml = '';
    for (var i = 0; i < cm.getColumnCount(); i++) {
        if (!cm.isHidden(i) && cm.getColumnId(i) != 'checker') {
            var w = cm.getColumnWidth(i);
            totalWidthInPixels += w;
            colXml += '<ss:Column ss:AutoFitWidth="1" ss:Width="' + w + '" />';
            headerXml += '<ss:Cell ss:StyleID="headercell">' +
                '<ss:Data ss:Type="String">' + cm.getColumnHeader(i) + '</ss:Data>' +
                '<ss:NamedCell ss:Name="Print_Titles" /></ss:Cell>';
            var fld = grid.store.recordType.prototype.fields.get(cm.getDataIndex(i));
            if (fld.type == Ext.data.Types.AUTO) // forçage des types passés en paramètre pour les champs "AUTO""
            {
                fld.type = types[fld.name];
            }
            switch (fld.type) {
                case Ext.data.Types.TIME:
                    cellType.push("DateTime");
                    cellTypeClass.push("time");
                    break;
                case Ext.data.Types.DATE:
                    cellType.push("DateTime");
                    cellTypeClass.push("date");
                    break;
                case Ext.data.Types.FLOAT:
                    cellType.push("Number");
                    cellTypeClass.push("float");
                    break;
                case Ext.data.Types.INT:
                    cellType.push("Number");
                    cellTypeClass.push("int");
                    break;
                default:
                    cellType.push("String");
                    cellTypeClass.push("");
                    break;
            }
        }
    }
    var visibleColumnCount = cellType.length;
    var result = {
        height: 9000,
        width: Math.floor(totalWidthInPixels * 30) + 50
    };
    var t = '<ss:Worksheet ss:Name="' + grid.title + '">' +
        '<ss:Names>' +
            '<ss:NamedRange ss:Name="Print_Titles" ss:RefersTo="=\'' + grid.title + '\'!R1:R2" />' +
        '</ss:Names>' +
        '<ss:Table x:FullRows="1" x:FullColumns="1"' +
            ' ss:ExpandedColumnCount="' + visibleColumnCount +
            '" ss:ExpandedRowCount="' + (grid.store.getCount() + 2) + '">' +
            colXml +
            '<ss:Row ss:AutoFitHeight="1">' +
            headerXml +
            '</ss:Row>';
    for (var i = 0, it = grid.store.data.items, l = it.length; i < l; i++) {
        t += '<ss:Row>';
        var cellClass = (i & 1) ? 'odd' : 'even';
        r = it[i].data;
        var k = 0;
        for (var j = 0; j < cm.getColumnCount(); j++) {
            if (!cm.isHidden(j) && cm.getColumnId(j) != 'checker') {
                var v = r[cm.getDataIndex(j)];
                if (v) {
                    t += '<ss:Cell ss:StyleID="' + cellClass + cellTypeClass[k] + '"><ss:Data ss:Type="' + cellType[k] + '">';
                    if ((cellType[k] == 'DateTime')) {
                        if (cellTypeClass[k] == 'time') {
							v = new Date(v);
                            t += v.format('Y-m-d\\TH:i:s');
                        }
                        else {
                            v = new Date(v);
							t += v.format('Y-m-d');
                        }
                    }
                    else {
                        t += v;
                    }
                    t +='</ss:Data></ss:Cell>';
                } else {
                    t += '<ss:Cell ss:StyleID="' + cellClass + cellTypeClass[k] + '" />';
                }
                k++;
            }
        }
        t += '</ss:Row>';
    }
    result.xml = t + '</ss:Table>' +
        '<x:WorksheetOptions>' +
            '<x:PageSetup>' +
                '<x:Layout x:CenterHorizontal="1" x:Orientation="Landscape" />' +
                '<x:Footer x:Data="Page &amp;P of &amp;N" x:Margin="0.5" />' +
                '<x:PageMargins x:Top="0.5" x:Right="0.5" x:Left="0.5" x:Bottom="0.8" />' +
            '</x:PageSetup>' +
            '<x:FitToPage />' +
            '<x:Print>' +
                '<x:PrintErrors>Blank</x:PrintErrors>' +
                '<x:FitWidth>1</x:FitWidth>' +
                '<x:FitHeight>32767</x:FitHeight>' +
                '<x:ValidPrinterInfo />' +
                '<x:VerticalResolution>600</x:VerticalResolution>' +
            '</x:Print>' +
            '<x:Selected />' +
            '<x:DoNotDisplayGridlines />' +
            '<x:ProtectObjects>False</x:ProtectObjects>' +
            '<x:ProtectScenarios>False</x:ProtectScenarios>' +
        '</x:WorksheetOptions>' +
    '</ss:Worksheet>';
    return result;
}

var Base64 = {
     // private property
    _keyStr : "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    // public method for encoding
    encode : function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = Utf8.encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
            this._keyStr.charAt(enc1) + this._keyStr.charAt(enc2) +
            this._keyStr.charAt(enc3) + this._keyStr.charAt(enc4);
        }
        return output;
    },
    // public method for decoding
    decode : function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = this._keyStr.indexOf(input.charAt(i++));
            enc2 = this._keyStr.indexOf(input.charAt(i++));
            enc3 = this._keyStr.indexOf(input.charAt(i++));
            enc4 = this._keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = Utf8.decode(output);
        return output;
    }
};

//Lecture de fichier en chaîne de caractères
function file_get_contents (url, flags, context, offset, maxLen) {
    // Read the entire file into a string
    //
    // version: 906.111
    // discuss at: http://phpjs.org/functions/file_get_contents
    // +   original by: Legaev Andrey
    // +      input by: Jani Hartikainen
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +   improved by: Brett Zamir (http://brett-zamir.me)
    // +   input by: Raphael (Ao) RUDLER
    // +   bugfixed by: Brett Zamir (http://brett-zamir.me)
    // %        note 1: This function uses XmlHttpRequest and cannot retrieve resource from different domain without modifications.
    // %        note 2: Synchronous by default (as in PHP) so may lock up browser. Can
    // %        note 2: get async by setting a custom "phpjs.async" property to true and "notification" for an
    // %        note 2: optional callback (both as context params, with responseText, and other JS-specific
    // %        note 2: request properties available via 'this'). Note that file_get_contents() will not return the text
    // %        note 2: in such a case (use this.responseText within the callback). Or, consider using
    // %        note 2: jQuery's: $('#divId').load('http://url') instead.
    // %        note 3: The context argument is only implemented for http, and only partially (see below for
    // %        note 3: "Presently unimplemented HTTP context options"); also the arguments passed to
    // %        note 3: notification are incomplete
    // *     example 1: file_get_contents('http://kevin.vanzonneveld.net/pj_test_supportfile_1.htm');
    // *     returns 1: '123'
    // Note: could also be made to optionally add to global $http_response_header as per http://php.net/manual/en/reserved.variables.httpresponseheader.php

    var tmp, headers = [], newTmp = [], k=0, i=0, href = '', pathPos = -1, flagNames = 0, content = null, http_stream = false;
    var func = function (value) {return value.substring(1) !== '';};

    // BEGIN REDUNDANT
    this.php_js = this.php_js || {};
    this.php_js.ini = this.php_js.ini || {};
    // END REDUNDANT

    var ini = this.php_js.ini;
    context = context || this.php_js.default_streams_context || null;

    if (!flags) {flags = 0;}
    var OPTS = {
        FILE_USE_INCLUDE_PATH : 1,
        FILE_TEXT : 32,
        FILE_BINARY : 64
    };
    if (typeof flags === 'number') { // Allow for a single string or an array of string flags
        flagNames = flags;
    }
    else {
        flags = [].concat(flags);
        for (i=0; i < flags.length; i++) {
            if (OPTS[flags[i]]) {
                flagNames = flagNames | OPTS[flags[i]];
            }
        }
    }

    if (flagNames & OPTS.FILE_BINARY && (flagNames & OPTS.FILE_TEXT)) { // These flags shouldn't be together
        throw 'You cannot pass both FILE_BINARY and FILE_TEXT to file_get_contents()';
    }

    if ((flagNames & OPTS.FILE_USE_INCLUDE_PATH) && ini.include_path &&
            ini.include_path.local_value) {
        var slash = ini.include_path.local_value.indexOf('/') !== -1 ? '/' : '\\';
        url = ini.include_path.local_value+slash+url;
    }
    else if (!/^(https?|file):/.test(url)) { // Allow references within or below the same directory (should fix to allow other relative references or root reference; could make dependent on parse_url())
        href = this.window.location.href;
        pathPos = url.indexOf('/') === 0 ? href.indexOf('/', 8)-1 : href.lastIndexOf('/');
        url = href.slice(0, pathPos+1)+url;
    }

    if (context) {
        var http_options = context.stream_options && context.stream_options.http;
        http_stream = !!http_options;
    }

    if (!context || http_stream) {
        var req = this.window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();
        if (!req) {throw new Error('XMLHttpRequest not supported');}

        var method = http_stream ? http_options.method : 'GET';
        var async = !!(context && context.stream_params && context.stream_params['phpjs.async']);

        if (ini['phpjs.ajaxBypassCache'] && ini['phpjs.ajaxBypassCache'].local_value) {
            url += (url.match(/\?/) == null ? "?" : "&") + (new Date()).getTime(); // Give optional means of forcing bypass of cache
        }

        req.open(method, url, async);
        if (async) {
            var notification = context.stream_params.notification;
            if (typeof notification === 'function') {
                // Fix: make work with req.addEventListener if available: https://developer.mozilla.org/En/Using_XMLHttpRequest
                if (0 && req.addEventListener) { // Unimplemented so don't allow to get here
                    /*
                    req.addEventListener('progress', updateProgress, false);
                    req.addEventListener('load', transferComplete, false);
                    req.addEventListener('error', transferFailed, false);
                    req.addEventListener('abort', transferCanceled, false);
                    */
                }
                else {
                    req.onreadystatechange = function (aEvt) { // aEvt has stopPropagation(), preventDefault(); see https://developer.mozilla.org/en/NsIDOMEvent

    // Other XMLHttpRequest properties: multipart, responseXML, status, statusText, upload, withCredentials
    /*
    PHP Constants:
    STREAM_NOTIFY_RESOLVE   1       A remote address required for this stream has been resolved, or the resolution failed. See severity  for an indication of which happened.
    STREAM_NOTIFY_CONNECT   2     A connection with an external resource has been established.
    STREAM_NOTIFY_AUTH_REQUIRED 3     Additional authorization is required to access the specified resource. Typical issued with severity level of STREAM_NOTIFY_SEVERITY_ERR.
    STREAM_NOTIFY_MIME_TYPE_IS  4     The mime-type of resource has been identified, refer to message for a description of the discovered type.
    STREAM_NOTIFY_FILE_SIZE_IS  5     The size of the resource has been discovered.
    STREAM_NOTIFY_REDIRECTED    6     The external resource has redirected the stream to an alternate location. Refer to message .
    STREAM_NOTIFY_PROGRESS  7     Indicates current progress of the stream transfer in bytes_transferred and possibly bytes_max as well.
    STREAM_NOTIFY_COMPLETED 8     There is no more data available on the stream.
    STREAM_NOTIFY_FAILURE   9     A generic error occurred on the stream, consult message and message_code for details.
    STREAM_NOTIFY_AUTH_RESULT   10     Authorization has been completed (with or without success).

    STREAM_NOTIFY_SEVERITY_INFO 0     Normal, non-error related, notification.
    STREAM_NOTIFY_SEVERITY_WARN 1     Non critical error condition. Processing may continue.
    STREAM_NOTIFY_SEVERITY_ERR  2     A critical error occurred. Processing cannot continue.
    */
                        var objContext = {
                            responseText : req.responseText,
                            responseXML : req.responseXML,
                            status : req.status,
                            statusText : req.statusText,
                            readyState : req.readyState,
                            evt : aEvt
                        }; // properties are not available in PHP, but offered on notification via 'this' for convenience

                        // notification args: notification_code, severity, message, message_code, bytes_transferred, bytes_max (all int's except string 'message')
                        // Need to add message, etc.
                        var bytes_transferred;
                        switch (req.readyState) {
                            case 0: //     UNINITIALIZED     open() has not been called yet.
                                notification.call(objContext, 0, 0, '', 0, 0, 0);
                                break;
                            case 1: //     LOADING     send() has not been called yet.
                                notification.call(objContext, 0, 0, '', 0, 0, 0);
                                break;
                            case 2: //     LOADED     send() has been called, and headers and status are available.
                                notification.call(objContext, 0, 0, '', 0, 0, 0);
                                break;
                            case 3: //     INTERACTIVE     Downloading; responseText holds partial data.
                                bytes_transferred = req.responseText.length*2; // One character is two bytes
                                notification.call(objContext, 7, 0, '', 0, bytes_transferred, 0);
                                break;
                            case 4: //     COMPLETED     The operation is complete.
                                if (req.status >= 200 && req.status < 400) {
                                    bytes_transferred = req.responseText.length*2; // One character is two bytes
                                    notification.call(objContext, 8, 0, '', req.status, bytes_transferred, 0);
                                }
                                else if (req.status === 403) { // Fix: These two are finished except for message
                                    notification.call(objContext, 10, 2, '', req.status, 0, 0);
                                }
                                else { // Errors
                                    notification.call(objContext, 9, 2, '', req.status, 0, 0);
                                }
                                break;
                            default:
                                throw 'Unrecognized ready state for file_get_contents()';
                        }
                    }
                }
            }
        }

        if (http_stream) {
            var sendHeaders = http_options.header && http_options.header.split(/\r?\n/);
            var userAgentSent = false;
            for (i=0; i < sendHeaders.length; i++) {
                var sendHeader = sendHeaders[i];
                var breakPos = sendHeader.search(/:\s*/);
                var sendHeaderName = sendHeader.substring(0, breakPos);
                req.setRequestHeader(sendHeaderName, sendHeader.substring(breakPos+1));
                if (sendHeaderName === 'User-Agent') {
                    userAgentSent = true;
                }
            }
            if (!userAgentSent) {
                var user_agent = http_options.user_agent ||
                                                                    (ini.user_agent && ini.user_agent.local_value);
                if (user_agent) {
                    req.setRequestHeader('User-Agent', user_agent);
                }
            }
            content = http_options.content || null;
            /*
            // Presently unimplemented HTTP context options
            var request_fulluri = http_options.request_fulluri || false; // When set to TRUE, the entire URI will be used when constructing the request. (i.e. GET http://www.example.com/path/to/file.html HTTP/1.0). While this is a non-standard request format, some proxy servers require it.
            var max_redirects = http_options.max_redirects || 20; // The max number of redirects to follow. Value 1 or less means that no redirects are followed.
            var protocol_version = http_options.protocol_version || 1.0; // HTTP protocol version
            var timeout = http_options.timeout || (ini.default_socket_timeout && ini.default_socket_timeout.local_value); // Read timeout in seconds, specified by a float
            var ignore_errors = http_options.ignore_errors || false; // Fetch the content even on failure status codes.
            */
        }

        if (flagNames & OPTS.FILE_TEXT) { // Overrides how encoding is treated (regardless of what is returned from the server)
            var content_type = 'text/html';
            if (http_options && http_options['phpjs.override']) { // Fix: Could allow for non-HTTP as well
                content_type = http_options['phpjs.override']; // We use this, e.g., in gettext-related functions if character set
                                                                                                        //   overridden earlier by bind_textdomain_codeset()
            }
            else {
                var encoding = (ini['unicode.stream_encoding'] && ini['unicode.stream_encoding'].local_value) || 'UTF-8';
                if (http_options && http_options.header && (/^content-type:/im).test(http_options.header)) { // We'll assume a content-type expects its own specified encoding if present
                    content_type = http_options.header.match(/^content-type:\s*(.*)$/im)[1]; // We let any header encoding stand
                }
                if (!(/;\s*charset=/).test(content_type)) { // If no encoding
                    content_type += '; charset='+encoding;
                }
            }
            req.overrideMimeType(content_type);
        }
        // Default is FILE_BINARY, but for binary, we apparently deviate from PHP in requiring the flag, since many if not
        //     most people will also want a way to have it be auto-converted into native JavaScript text instead
        else if (flagNames & OPTS.FILE_BINARY) { // Trick at https://developer.mozilla.org/En/Using_XMLHttpRequest to get binary
            req.overrideMimeType('text/plain; charset=x-user-defined');
            // Getting an individual byte then requires:
            // responseText.charCodeAt(x) & 0xFF; // throw away high-order byte (f7) where x is 0 to responseText.length-1 (see notes in our substr())
        }

        if (http_options && http_options['phpjs.sendAsBinary']) { // For content sent in a POST or PUT request (use with file_put_contents()?)
            req.sendAsBinary(content); // In Firefox, only available FF3+
        }
        else {
            req.send(content);
        }

        tmp = req.getAllResponseHeaders();
        if (tmp) {
            tmp = tmp.split('\n');
            for (k=0; k < tmp.length; k++) {
                if (func(tmp[k])) {
                    newTmp.push(tmp[k]);
                }
            }
            tmp = newTmp;
            for (i=0; i < tmp.length; i++) {
                headers[i] = tmp[i];
            }
            this.$http_response_header = headers; // see http://php.net/manual/en/reserved.variables.httpresponseheader.php
        }

        if (offset || maxLen) {
            if (maxLen) {
                return req.responseText.substr(offset || 0, maxLen);
            }
            return req.responseText.substr(offset);
        }
        return req.responseText;
    }
    return false;
}
