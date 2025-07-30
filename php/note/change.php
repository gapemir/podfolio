<?php
    require_once("../inc.php");
    $data = JSON_decode(file_get_contents("php://input"), true);

    $userid = $data['userid'];
    $storeid = $data['storeid'];
    $content = $data['content'];

    if(validity($userid, $data['token']) != Ret::Ok->value) {
        echo JSON_encode(["status" => Ret::UserTokenMissmatch->value]);
        exit();
    }

    $sql = "UPDATE note SET content='$content' WHERE userid='$userid' AND storeid='$storeid'";
    $result = mysqli_query($conn, $sql);
    if(!$result) {
        echo JSON_encode(["status" => Ret::Other->value]);
        exit();
    }
    echo JSON_encode(["status" => Ret::Ok->value]);
