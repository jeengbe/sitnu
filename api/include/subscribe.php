<?php

$data = json_decode(file_get_contents("php://input"));

if (!(property_exists($data, "endpoint") && property_exists($data, "keys") && property_exists($data->keys, "p256dh") && property_exists($data->keys, "auth") && property_exists($data, "courses"))) return ["error" => "Invalid data"];

$subs = json_decode(file_get_contents(__DIR__ . "/../subs"), true);
$subs[] = [
  "endpoint" => $data->endpoint,
  "publicKey" => $data->keys->p256dh,
  "authToken" => $data->keys->auth,
  "courses" => $data->courses
];

file_put_contents(__DIR__ . "/../subs", json_encode($subs));
