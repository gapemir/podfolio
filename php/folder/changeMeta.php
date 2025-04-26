<?php
    require_once("../inc.php");

    $data = JSON_decode(file_get_contents("php://input"), true);
    if($data["data"][0] != "advertize" && $data["data"][0] != "public") {
        echo JSON_encode(["status" => 1]);
        exit();
    }
    $userid = $data['userid'];

    if(validity($userid, $data['token']) != Ret::Ok->value) {
        echo JSON_encode(["status" => Ret::UserTokenMissmatch->value]);
        exit();
    }

    //update all files in folder
    $children = getAllChildFiles($conn, $data["folderid"]);

    $children = arrayToDbValueIN($conn, $children);
    $sql = "UPDATE file SET " . $data["data"][0] . "=" . ($data["data"][1] ? "true" : "false") . " WHERE fileid IN ('$children');";
    $result = mysqli_query($conn, $sql);
    if(!$result) {
        echo JSON_encode(["status" => Ret::Other->value]);
        exit();
    }

    //update all folders in the folder
    $children = getAllChildFolders($conn, $data["folderid"]);
    $children = arrayToDbValueIN($conn, $children);
    $sql = "UPDATE folder SET " . $data["data"][0] . "=" . ($data["data"][1] ? "true" : "false") . " WHERE folderid IN ('$children');";
    $result = mysqli_query($conn, $sql);
    if(!$result) {
        echo JSON_encode(["status" => Ret::Other->value]);
        exit();
    }
    echo JSON_encode(["status" => Ret::Ok->value]);
