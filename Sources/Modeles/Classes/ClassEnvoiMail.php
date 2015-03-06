<?php
    require_once '../../Configuration/ConfigUtilisee.php';
    set_include_path('../' . LIB . '/PEAR/');
    require_once '../../' . $configInstance . '/Serveur.php';
    require_once '../' . LIB . '/PEAR/Mail/Mail.php';

    class EnvoiMail {
        protected $tabEnTetes = array();
        protected $smtpConf = array();
        protected $message;

        function __construct($destinataires, $sujet, $message) {
            $this->message = htmlspecialchars_decode($message, ENT_QUOTES);

            // paramètres de l'en-tête du message
            $this->tabEnTetes['From'] = MAIL_FROM;
            $this->tabEnTetes['To'] = $destinataires; // destinataires du message à faire connaître à l'administrateur
            $this->tabEnTetes['Subject'] = '=?utf-8?B?'.base64_encode($sujet).'?=';
            $this->tabEnTetes['Return-Path'] = MAIL_ADMIN; // erreurs du serveur mail signalées à l'administrateur
            $this->tabEnTetes['Reply-To'] = MAIL_CONTACT;
            $this->tabEnTetes['Content-Type'] =  'text/html; charset=UTF-8';
            $this->tabEnTetes['MIME-Version'] = '1.0';
            $this->tabEnTetes['Content-Transfer-Encoding'] = '8bit';

            // configuration du serveur SMTP
            $this->smtpConf['host'] = SMTP;
            $this->smtpConf['port'] = SMTP_PORT;
            $this->smtpConf['auth'] = SMTP_AUTH;
            // si SMTP par authentification
            if (SMTP_AUTH) {
                $this->smtpConf['username'] = SMTP_USERNAME;
                $this->smtpConf['password'] = SMTP_PASSWORD;
            }
        }

        private function enTete() {
            $result = '';
            foreach ($this->tabEnTetes as $ch => $val) {
                $result .= $this->tabTyp[$ch] . ': ' . $val . RETOUR_LIGNE;
            }
            return $result;
        }

        function envoyerMail(&$msgErr = "Erreur d'envoi de message") {
            $mail = &Mail::factory('smtp', $this->smtpConf);
            // envoi dissocié pour chaque destinataire (équivalent CCi)
            $envoi = $mail->send($this->tabEnTetes['To'] . ', ' . MAIL_ADMIN, // ajout de l'administrateur en CCi
                $this->tabEnTetes, $this->message);           
            if (PEAR::isError($envoi)) {
                $msgErr = $envoi->getMessage();
                $msgErr = str_replace(CHR(10), ' ', $msgErr); // suppression des retours chariots
                $msgErr = str_replace(CHR(13), ' ', $msgErr); // suppression des sauts de ligne
                $msgErr = utf8_encode($msgErr); // encodage UTF-8 (affichage correct des accents)
                $msgErr = addslashes($msgErr); // ajout des antislashs aux guillemets simples, doubles, antislash et le caractère NULL
            }
            else {
                $msgErr = '';
                return true;
            }
        }
    }
?>
