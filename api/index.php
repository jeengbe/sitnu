<?php
header("Content-Type: application/json");

if (($_COOKIE["token"] ?? "") !== "j82R8Gez") {
  http_response_code(403);
  die();
}

$URL = explode("/", $_GET["api"] ?? "");

$inc = null;

$incs = [
  "timetable/_" => "timetable.php",
  "subscribe" => "subscribe.php",
];

foreach ($incs as $incp => $incf) {
  $incpa = explode("/", $incp);
  foreach ($incpa as $i => $incpas) {
    if (!isset($URL[$i]) || ($incpas !== "_" && $URL[$i] !== $incpas)) {
      continue 2;
    }
  }
  $inc = $incf;
  break;
}

if ($inc !== null) {
  (function ($inc) use (&$URL) {
    /** @var string $inc */
    $data = [];
    $data = include __DIR__ . "/include/$inc";
    if (!is_array($data)) {
      $data = [];
    }
    echo json_encode($data);
  })($inc);
} else {
  echo json_encode(["error" => "Unknown route"]);
}
