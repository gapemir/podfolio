<?php
    require_once("../inc.php");
    $data = JSON_decode(file_get_contents("php://input"), true);

    $userid = $data['userid'];
    $storeid = $data['storeid'];
    $newName = $data['newname'];

    if(validity($userid, $data['token']) != Ret::Ok->value) {
        echo JSON_encode(["status" => Ret::UserTokenMissmatch->value]);
        exit();
    }

    $newExt = "";
    if(str_contains($newName, ".")){
        $newExt = pathinfo($newName, PATHINFO_EXTENSION);
    }

    $sql = "SELECT name FROM file WHERE storeid='$storeid'";
    $result = mysqli_query($conn, $sql);
    $ext = "";
    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        if(str_contains($row['name'], ".")){
            $ext = pathinfo($row['name'], PATHINFO_EXTENSION);
        }
    }

    if($newExt != $ext){
        $newName = $newName.".".$ext;
    }

    $sql = "UPDATE file SET name='$newName' WHERE storeid='$storeid'";
    $result = mysqli_query($conn, $sql);
    if(!$result) {
        echo JSON_encode(["status" => Ret::Other->value]);
        exit();
    }
    echo JSON_encode(["status" => Ret::Ok->value]);
