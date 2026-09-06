<?php
header('Content-Type: application/json; charset=utf-8');

// Empêcher l'affichage d'erreurs brutes HTML dans la réponse JSON
ini_set('display_errors', 0);
error_reporting(E_ALL);

$response = [
    'success' => false,
    'message' => ''
];

// Destinataire officiel des messages
$to_email = 'contact@sinaetprestige.fr';

// Vérification de la méthode HTTP
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    $response['message'] = 'Méthode non autorisée.';
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// Vérification anti-spam Honeypot (le champ "website" doit rester vide)
if (!empty($_POST['website'])) {
    $response['success'] = true;
    $response['message'] = 'Votre demande a bien été prise en compte.';
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

// Fonction de nettoyage
function clean_field($data) {
    if (is_array($data)) {
        return array_map('clean_field', $data);
    }
    return htmlspecialchars(trim((string)$data), ENT_QUOTES, 'UTF-8');
}

// Récupération des données POST
$form_type          = clean_field($_POST['form_type'] ?? $_POST['type_demande'] ?? $_POST['kind'] ?? 'CONTACT');
$nom                = clean_field($_POST['nom'] ?? '');
$prenom             = clean_field($_POST['prenom'] ?? '');
$email              = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$telephone          = clean_field($_POST['telephone'] ?? '');
$profil             = clean_field($_POST['profil'] ?? '');
$organisation       = clean_field($_POST['organisation'] ?? $_POST['entreprise'] ?? '');
$formation          = clean_field($_POST['formation'] ?? '');
$session_date       = clean_field($_POST['session_date'] ?? '');
$modalite           = clean_field($_POST['modalite'] ?? '');
$financement        = clean_field($_POST['financement'] ?? '');
$type_candidature   = clean_field($_POST['type_candidature'] ?? '');
$offre              = clean_field($_POST['offre'] ?? '');
$ville              = clean_field($_POST['ville'] ?? '');
$disponibilite      = clean_field($_POST['disponibilite'] ?? '');
$linkedin_portfolio = clean_field($_POST['linkedin_portfolio'] ?? '');
$objectif           = clean_field($_POST['objectif'] ?? $_POST['message'] ?? $_POST['motivation'] ?? '');

// Validation obligatoire de l'email
if (!$email) {
    $response['message'] = 'Veuillez fournir une adresse email valide.';
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit;
}

$full_name = trim("$prenom $nom");
if (empty($full_name)) {
    $full_name = $email;
}

// Construction du sujet de l'email
if (stripos($form_type, 'PREINSCRIPTION') !== false || !empty($formation)) {
    $subject = "PREINSCRIPTION FORMATION | " . ($formation ? $formation : 'Formation') . " | " . $full_name;
} elseif (stripos($form_type, 'CANDIDATURE') !== false || !empty($_FILES['cv']['name'])) {
    $subject = "CANDIDATURE | " . ($type_candidature ? $type_candidature : 'Emploi') . " | " . $full_name;
} elseif (stripos($form_type, 'RECRUTEMENT') !== false || stripos($form_type, 'ENTREPRISE') !== false) {
    $subject = "DEMANDE ENTREPRISE / RECRUTEMENT | " . ($organisation ? $organisation : $full_name);
} else {
    $subject = "CONTACT | " . $full_name;
}

// Construction du corps du mail au format HTML
$body_html = '<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<style>
  body { font-family: Arial, sans-serif; color: #07183d; background-color: #f4f7fc; margin: 0; padding: 20px; }
  .container { max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #dce5f3; border-top: 4px solid #f5b51b; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
  .header { background-color: #031333; color: #ffffff; padding: 20px; text-align: center; }
  .header h1 { margin: 0; font-size: 20px; font-family: Georgia, serif; color: #ffffff; letter-spacing: 1.5px; }
  .header small { color: #f5b51b; font-size: 9px; display: block; margin-top: 4px; letter-spacing: 1.5px; text-transform: uppercase; }
  .content { padding: 25px; font-size: 14px; line-height: 1.6; }
  .field-row { margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px dashed #e2e8f0; }
  .field-label { font-weight: bold; color: #031333; display: inline-block; min-width: 170px; }
  .field-value { color: #334155; }
  .message-box { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; padding: 15px; margin-top: 15px; white-space: pre-wrap; font-size: 13.5px; color: #1e293b; }
  .footer { background: #f1f5f9; text-align: center; padding: 12px; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <h1>SINA &amp; PRESTIGE</h1>
    <small>ALFRED HR CONSULTING — NOUVEAU FORMULAIRE DU SITE WEB</small>
  </div>
  <div class="content">
    <h2 style="color:#031333; font-size: 16px; margin-top: 0; margin-bottom: 18px; border-bottom: 2px solid #f5b51b; padding-bottom: 8px;">' . htmlspecialchars($subject) . '</h2>';

$fields_to_show = [
    'Type de demande' => $form_type,
    'Nom' => $nom,
    'Prénom' => $prenom,
    'Email' => $email,
    'Téléphone' => $telephone,
    'Profil / Statut' => $profil,
    'Entreprise / Structure' => $organisation,
    'Formation demandée' => $formation,
    'Date de session' => $session_date,
    'Modalité' => $modalite,
    'Financement envisagé' => $financement,
    'Type de candidature' => $type_candidature,
    'Offre d\'emploi' => $offre,
    'Localisation / Ville' => $ville,
    'Disponibilité' => $disponibilite,
    'LinkedIn / Portfolio' => $linkedin_portfolio,
];

foreach ($fields_to_show as $label => $val) {
    if (!empty($val)) {
        $body_html .= '<div class="field-row"><span class="field-label">' . htmlspecialchars($label) . ' :</span> <span class="field-value">' . htmlspecialchars($val) . '</span></div>';
    }
}

if (!empty($objectif)) {
    $body_html .= '<div style="margin-top: 15px; font-weight: bold; color: #031333;">Message / Description du besoin :</div>';
    $body_html .= '<div class="message-box">' . nl2br(htmlspecialchars($objectif)) . '</div>';
}

$body_html .= '</div>
  <div class="footer">
    Demande transmise depuis le site officiel <a href="https://www.sinaetprestige.fr" style="color:#031333; text-decoration:none; font-weight:bold;">sinaetprestige.fr</a>
  </div>
</div>
</body>
</html>';

// Gestion des pièces jointes (CV, Lettre de motivation, autre document)
$attachments = [];
$allowed_exts = ['pdf', 'doc', 'docx', 'png', 'jpg', 'jpeg'];
$file_fields = ['cv', 'lettre_motivation', 'autre_document', 'file', 'piece_jointe'];

foreach ($file_fields as $field_key) {
    if (isset($_FILES[$field_key]) && $_FILES[$field_key]['error'] === UPLOAD_ERR_OK) {
        $file_name = $_FILES[$field_key]['name'];
        $file_tmp  = $_FILES[$field_key]['tmp_name'];
        $file_ext  = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));

        if (in_array($file_ext, $allowed_exts) && is_uploaded_file($file_tmp)) {
            $file_content = file_get_contents($file_tmp);
            if ($file_content !== false) {
                $attachments[] = [
                    'name' => $file_name,
                    'content' => $file_content,
                    'type' => $_FILES[$field_key]['type'] ?: 'application/octet-stream'
                ];
            }
        }
    }
}

// Entêtes HTTP du courrier électronique
$boundary = md5(time() . rand());

$headers = [];
$headers[] = "From: Sina & Prestige <contact@sinaetprestige.fr>";
$headers[] = "Reply-To: " . ($full_name ? "$full_name <$email>" : $email);
$headers[] = "MIME-Version: 1.0";

if (empty($attachments)) {
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $mail_body = $body_html;
} else {
    $headers[] = "Content-Type: multipart/mixed; boundary=\"{$boundary}\"";

    $mail_body  = "--{$boundary}\r\n";
    $mail_body .= "Content-Type: text/html; charset=UTF-8\r\n";
    $mail_body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
    $mail_body .= $body_html . "\r\n\r\n";

    foreach ($attachments as $att) {
        $content_encoded = chunk_split(base64_encode($att['content']));
        $mail_body .= "--{$boundary}\r\n";
        $mail_body .= "Content-Type: {$att['type']}; name=\"{$att['name']}\"\r\n";
        $mail_body .= "Content-Disposition: attachment; filename=\"{$att['name']}\"\r\n";
        $mail_body .= "Content-Transfer-Encoding: base64\r\n\r\n";
        $mail_body .= $content_encoded . "\r\n\r\n";
    }
    $mail_body .= "--{$boundary}--";
}

// Envoi de l'email via la fonction système mail() de votre serveur web
$success = @mail($to_email, "=?UTF-8?B?" . base64_encode($subject) . "?=", $mail_body, implode("\r\n", $headers));

if ($success) {
    $response['success'] = true;
    $response['message'] = 'Votre demande a bien été transmise. Notre équipe vous recontactera rapidement.';
} else {
    http_response_code(500);
    $response['message'] = 'Une erreur est survenue lors de l\'envoi. Veuillez nous recontacter directement par email à contact@sinaetprestige.fr ou par téléphone.';
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
