<?php

include __DIR__ . "/vendor/autoload.php";

use Minishlink\WebPush\WebPush;
use Minishlink\WebPush\Subscription;

global $sessid;
$sessid = file_get_contents(__DIR__ . "/include/sessid");

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

  file_put_contents(__DIR__ . "/include/sessid", $sessid);
}

$today = date("Y-m-d");
$tomorrow = date("Y-m-d", strtotime("+1 days"));

$curl = curl_init();

curl_setopt($curl, CURLOPT_URL, "https://perseus.webuntis.com/WebUntis/api/public/timetable/weekly/data?elementType=1&elementId=791&date=$tomorrow&formatId=5");
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

  curl_setopt($curl, CURLOPT_URL, "https://perseus.webuntis.com/WebUntis/api/public/timetable/weekly/data?elementType=1&elementId=791&date=$tomorrow&formatId=5");
  curl_setopt($curl, CURLOPT_RETURNTRANSFER, TRUE);
  curl_setopt($curl, CURLOPT_HEADER, FALSE);
  curl_setopt($curl, CURLOPT_HTTPHEADER, array(
    "Cookie: " . bakeCookie()
  ));
  $response = curl_exec($curl);
}
curl_close($curl);

$data = json_decode($response)->data->result->data;
$classId = $data->elementIds[0];
$periods = $data->elementPeriods->$classId;
$elements = $data->elements;


$push = new WebPush([
  "VAPID" => [
    "subject" => "sitnu",
    "publicKey" => "BEyJU52Uf-RSQWdDqrAXU02N2yqTugH58czZkgbryymLblJmOquKIxivJLaojLBKxRI9mwxatXyirS8KPHsRpxg",
    "privateKey" => "v5hpY-ITRQe4rAhfIIoCW7NblHAKhLieE9SGBWvtpS4"
  ]
]);

$push->setReuseVAPIDHeaders(true);

$cancelPeriodSubs = json_decode(file_get_contents(__DIR__ . "/cancelPeriodSubs"), true);
$substPeriodSubs = json_decode(file_get_contents(__DIR__ . "/substPeriodSubs"), true);

$todayPeriods = array_filter($periods, fn ($period) => $period->date == date("Ymd"));
$tomorrowPeriods = array_filter($periods, fn ($period) => $period->date == date("Ymd", strtotime("+1 days")));

$cancelToday = array_filter($todayPeriods, fn ($period) => property_exists($period->is, "cancelled") && $period->is->cancelled);
$cancelTomorrow = array_filter($tomorrowPeriods, fn ($period) => property_exists($period->is, "cancelled") && $period->is->cancelled);
$substToday = array_filter($todayPeriods, fn ($period) => (property_exists($period->is, "substitution") && $period->is->substitution) || (property_exists($period->is, "roomSubstitution") && $period->is->roomSubstitution));
$substTomorrow = array_filter($tomorrowPeriods, fn ($period) => (property_exists($period->is, "substitution") && $period->is->substitution) || (property_exists($period->is, "roomSubstitution") && $period->is->roomSubstitution));

$subs = json_decode(file_get_contents(__DIR__ . "/subs"), true);

foreach ($subs as $sub) {
  $cancelPeriods = array_filter(array_merge($cancelToday, $cancelTomorrow), fn ($period) => in_array($period->elements[2]->id, $sub["courses"]));
  $hasCancel = count($cancelPeriods) > 0;

  if ($hasCancel) {
    $newCancelPeriods = array_filter($cancelPeriods, fn ($period) => !in_array($sub["endpoint"], $cancelPeriodSubs[$period->id] ?? []));

    if (count($newCancelPeriods) > 0) {
      $push->queueNotification(Subscription::create([
        "endpoint" => $sub["endpoint"],
        "publicKey" => $sub["publicKey"],
        "authToken" => $sub["authToken"]
      ]), json_encode([
        "state" => "CANCEL",
        "courses" => array_unique(array_map(fn ($period) => $period->elements[2]->id, $newCancelPeriods))
      ]));

      foreach ($newCancelPeriods as $period) {
        $cancelPeriodSubs[$period->id] ??= [];
        $cancelPeriodSubs[$period->id][] = $sub["endpoint"];
      }
    }
  }

  $substPeriods = array_filter(array_merge($substToday, $substTomorrow), fn ($period) => in_array($period->elements[2]->id, $sub["courses"]));
  $hasSubst = count($substPeriods) > 0;

  if ($hasSubst) {
    $newSubstPeriods = array_filter($substPeriods, fn ($period) => !in_array($sub["endpoint"], $substPeriodSubs[$period->id] ?? []));

    if (count($newSubstPeriods) > 0) {
      $push->queueNotification(Subscription::create([
        "endpoint" => $sub["endpoint"],
        "publicKey" => $sub["publicKey"],
        "authToken" => $sub["authToken"]
      ]), json_encode([
        "state" => "SUBST",
        "courses" => array_unique(array_map(fn ($period) => $period->elements[2]->id, $newSubstPeriods))
      ]));

      foreach ($newSubstPeriods as $period) {
        $substPeriodSubs[$period->id] ??= [];
        $substPeriodSubs[$period->id][] = $sub["endpoint"];
      }
    }
  }
}

$expired = [];

foreach ($push->flush() as $status) {
  if ($status->isSubscriptionExpired()) {
    $expired[] = $status->getEndpoint();
  }
}

$subs = array_filter($subs, fn ($sub) => !in_array($sub["endpoint"], $expired));

file_put_contents(__DIR__ . "/subs", json_encode($subs));
file_put_contents(__DIR__ . "/cancelPeriodSubs", json_encode($cancelPeriodSubs));
file_put_contents(__DIR__ . "/substPeriodSubs", json_encode($substPeriodSubs));
