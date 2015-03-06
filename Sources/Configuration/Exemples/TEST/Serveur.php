<?php
    //Paramètres du serveur
    define('MAIL_FROM', 'USER <user@domain.com>');
    define('MAIL_ADMIN', 'user@domain.com'); // adresse unique sans alias pour certains serveurs SMTP

    define('SMTP', 'smtp.FAI.com');

    define('SMTP_PORT', 25);

    define('RETOUR_LIGNE', "\r\n"); // attention il faut des guillemets ici : "\n" ou bien "\r\n" selon serveur SMTP

    define('SMTP_AUTH', false); // renseigner obligatoirement SMTP_USERNAME et SMTP_PASSWORD si true
    //define('SMTP_USERNAME', 'user@domain.com');
    //define('SMTP_PASSWORD', 'psw');

    define('MAIL_CONTACT', 'USER <user@domain.com>');
    define('TITRE_APPLI','Observations occasionnelles naturalistes des Parcs nationaux de France'); // idem que dans "Appli.js"
    
    //define('WMS_USERNAME', 'user');
    //define('WMS_PASSWORD', 'psw');
?>
