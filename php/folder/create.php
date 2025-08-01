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

    $sql = "INSERT INTO folder (storeid, userid, name, fileKey, parent) VALUES ('$encFolder', '$userid', '$name', '$fileKey', NULLIF('$parent', ''))";
    $result = mysqli_query($conn, $sql);
    if($result) {
        echo json_encode( [ "status" => Ret::Ok->value, "folder" => [
                    "storeid" => $encFolder, 
                    "name"=> $name,
                    "fileKey" => $fileKey,
                    "public" => false,
                    "advertise" => false,
                    "createdAt" => date("Y-m-d H:i:s"),
                    "parent" => $parent=="null" ? null : $parent,
                    ] ] );
    } else {
        echo JSON_encode(["status" => Ret::ERROR->value]);
    }



