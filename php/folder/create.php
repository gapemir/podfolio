<?php
    require_once("../inc.php");
    $data = JSON_decode(file_get_contents("php://input"), true);

    $userid = $data['userid'];
    $name = $data['name'];
    $parent = $data['parent'];


    if(validity($userid, $data['token']) != Ret::Ok->value) {
        echo JSON_encode(["status" => Ret::UserTokenMissmatch->value]);
        exit();
    }
    $fileKey = bin2hex(random_bytes(32));
    $encFolder = hash("sha256", $name . time());
    $encFolder = substr($encFolder, 0, 16);
    $encFolder = strtoupper($encFolder);

    $sql = "INSERT INTO folder (folderid, userid, name, fileKey, parent) VALUES ('$encFolder', '$userid', '$name', '$fileKey', NULLIF('$parent', ''))";
    $result = mysqli_query($conn, $sql);
    if($result) {
        echo JSON_encode(["status" => Ret::Ok->value]);
    } else {
        echo JSON_encode(["status" => Ret::ERROR->value]);
    }



