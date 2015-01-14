//Fonction pour afficher le formulaire photo
function affichagePhoto() {
    var notifier = new EventNotifier();
    setTimeout(notifier, 1000); // attente de 1000 ms sinon ça ne marche pas
    notifier.wait->();
    if (fctAfficherPhotoBis) {
        afficherPhotoBis();
    }
    else {
        afficherPhoto();
    }
}

//Fonction pour enregistrer puis ajouter sans fermer le formulaire
function EnregistrerPuisAjouterFlo() {
    soumettreFlo();
    var notifier = new EventNotifier();
    setTimeout(notifier, 500); // attente de 500 ms sinon ça ne marche pas
    notifier.wait->();
    if (resultSoumettreFlo) {
        ajouteFlo();
    }
}

//Fonction pour enregistrer puis ajouter sans fermer le formulaire
function EnregistrerPuisAjouterLic() {
    if (soumettreLic()) {
        var notifier = new EventNotifier();
        setTimeout(notifier, 500); // attente de 500 ms sinon ça ne marche pas
        notifier.wait->();
        ajouteLic();
    }
}
