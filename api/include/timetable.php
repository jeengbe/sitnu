<?php
global $sessid;
$sessid = file_get_contents(__DIR__ . "/sessid");

function bakeCookie() {
  global $sessid;

  return "schoolname=_YnVyZy1neW0=; JSESSIONID=$sessid";
}

function login() {
  global $sessid;

  $curl = curl_init();
  curl_setopt($curl, CURLOPT_URL, "https://perseus.webuntis.com/WebUntis/j_spring_security_check");
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
  curl_setopt($curl, CURLOPT_HEADER, TRUE);
  curl_setopt($curl, CURLOPT_POST, TRUE);
  curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    "Host: perseus.webuntis.com",
    "Accept: application/json",
    "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36"
  ));
  curl_setopt($curl, CURLOPT_POSTFIELDS, "school=$school&j_username=$user&j_password=$password&token=");
  $response = curl_exec($curl);
  curl_close($curl);

  $sessid = false;

  foreach (explode("\n", $response) as $line) {
    if (preg_match("/Set-Cookie: JSESSIONID=([0-9A-Z]{32}); Path=\\/WebUntis; HttpOnly/", $line, $matches) === 1) {
      $sessid = $matches[1];
    }
  }

  if ($sessid === false) die(500);

  file_put_contents(__DIR__ . "/sessid", $sessid);
}

$date = $URL[1];

$curl = curl_init();

curl_setopt($curl, CURLOPT_URL, "https://perseus.webuntis.com/WebUntis/api/public/timetable/weekly/data?elementType=1&elementId=791&date=$date&formatId=5");
curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
curl_setopt($curl, CURLOPT_HEADER, false);
curl_setopt($curl, CURLOPT_HTTPHEADER, array(
  "Cookie: " . bakeCookie()
));
$response = curl_exec($curl);

if (curl_getinfo($curl, CURLINFO_RESPONSE_CODE) !== 200) {
  curl_close($curl);
  login();

  $curl = curl_init();

  curl_setopt($curl, CURLOPT_URL, "https://perseus.webuntis.com/WebUntis/api/public/timetable/weekly/data?elementType=1&elementId=791&date=$date&formatId=5");
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
  curl_setopt($curl, CURLOPT_HEADER, FALSE);
  curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    "Cookie: " . bakeCookie()
  ));
  $response = curl_exec($curl);
}
curl_close($curl);

return json_decode($response, true);
