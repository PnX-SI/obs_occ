//Paramétrage d'installation
// répertoire de stockage des fichiers GPX
var CST_cheminRelatifGPX = '../../GPX/PNX/';
// répertoire de stockage des photos
var CST_cheminRelatifPhoto = '../../Photos/PNX/';
// choix du mode d'affichage
var CST_choixEspeceForcee = false;
// choix du mode d'affichage
var CST_choixModeAffichage = true;
// titre de l'application
var CST_titreAppli = 'Observations occasionnelles naturalistes des Parcs nationaux de France'; // idem que "Serveur.php"
// URL de contact sinon null
var CST_urlContact = 'http://www.parcsnationaux.fr/Acces-direct/Nous-contacter';
// gestion des utilisateurs
var CST_activeGestionUtilisateur= false;
// gestion des utilisateurs
var CST_activeSaisieEtudeProtocole=true;

//Configuration du formulaire de saisie des observations occasionelles
// propres aux métadonnées de la base sinon null
var CST_id_structure = null;
var CST_id_etude = null;
var CST_id_protocole = null;

// Activation du cryptage RSA  (désactivé pour le site de démo)
var CST_Cryptage = true; // idem que "PostGreSQL.php"
