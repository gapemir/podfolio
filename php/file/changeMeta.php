<?php
    require_once("../inc.php");

    $data = JSON_decode(file_get_contents("php://input"), true);
    if($data["data"][0] != "advertise" && $data["data"][0] != "public") {
        echo JSON_encode(["status" => 1]);
        exit();
    }
    $userid = $data['userid'];

    if(validity($userid, $data['token']) != Ret::Ok->value) {
        echo JSON_encode(["status" => Ret::UserTokenMissmatch->value]);
        exit();
    }
    $sql = "UPDATE file SET " . $data["data"][0] . "=" . ($data["data"][1] ? "true" : "false") . " WHERE storeid = '" . $data["storeid"] . "';";
    $result = mysqli_query($conn, $sql);

    if($result) {
        echo JSON_encode(["status" => Ret::Ok->value]);
    } else {
        echo JSON_encode(["status" => Ret::Other->value]);
    }
