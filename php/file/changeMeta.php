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
    $sql = "UPDATE file SET " . $data["data"][0] . "=" . ($data["data"][1] ? "true" : "false") . " WHERE fileid = '" . $data["fileid"] . "';";
    $result = mysqli_query($conn, $sql);

    if(mysqli_affected_rows($conn) == 0){
        $sql = "UPDATE folder SET " . $data["data"][0] . "=" . ($data["data"][1] ? "true" : "false") . " WHERE folderid = '" . $data["fileid"] . "';";
        $result = mysqli_query($conn, $sql);
        //we should apply this to all files in the folder
        //maby we should do this in a different file
    }

    if($result) {
        echo JSON_encode(["status" => Ret::Ok->value]);
    } else {
        echo JSON_encode(["status" => Ret::Other->value]);
    }
