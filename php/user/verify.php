<?php
    require_once("../inc.php");

    $data = JSON_decode(file_get_contents("php://input"), true);

    echo JSON_encode(["status" => validity($data['userid'], $data['token'])]);
