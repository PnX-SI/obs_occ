//Variable globale du mode d'affichage
var modeSimplifie = (GetParam('modeSimplifie') == 'true');

//Colonne de cases à cocher pour sélectionner/déselectionner tout
var colonneSelection = new Ext.grid.CheckboxSelectionModel();

//Gestion de la déconnection
function deconnecter() {
    Ext.MessageBox.confirm('Confirmation', "Etes-vous sûr de vouloir vous déconnecter ?", deconnecte);
}
function deconnecte(btn) {
    if (btn == 'yes') {
        Ext.Ajax.request({
            url: '../Controleurs/Gestion/GestSession.php?appli=' + GetParam('appli'),
            params: {
                action: 'Deconnecter'
            },
            callback: function(options, success, response) {
                if (success) {
                    var obj = Ext.util.JSON.decode(response.responseText); // décodage JSON du résultat du POST
                    if (obj.success) {
                        Ext.MessageBox.show({
                            title: 'Déconnection réussie',
                            fn: function() {document.location.href = 'vAuthent.php?appli=' + GetParam('appli');},
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.INFO
                        });
                    }
                    else {
                        Ext.MessageBox.show({
                            title: obj.errorMessage,
                            fn: function() {document.location.href = 'vAuthent.php?appli=' + GetParam('appli');},
                            msg: obj.data,
                            buttons: Ext.MessageBox.OK,
                            icon: Ext.MessageBox.WARNING
                        });
                    }
                }
                else {
                    Ext.MessageBox.show({
                        title: 'ERREUR : ' + response.statusText,
                        fn: function() {document.location.href = 'vAuthent.php?appli=' + GetParam('appli');},
                        msg: 'Code erreur ' + response.status,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.ERROR
                    });
                }
            }
        });
    }
}
