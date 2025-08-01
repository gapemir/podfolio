<?php
    require_once("../inc.php");
    $data = JSON_decode(file_get_contents("php://input"), true);

    $userid = $data['userid'];
    $storeid = $data['storeid'];
    $token = $data['token'];

    if(validity($userid, $token) != Ret::Ok->value) {
        echo JSON_encode(["status" => Ret::UserTokenMissmatch->value]);
        exit();
    }

    $children = getAllChildFiles($conn, $storeid);
    $children = arrayToDbValueIN($conn, $children);
    $sql = "DELETE FROM file WHERE storeid IN ('$children') AND userid = '$userid';";
    $result = mysqli_query($conn, $sql);
    if(!$result) {
        echo JSON_encode(["status" => Ret::Other->value]);
        exit();
    }

    $children = getAllChildFolders($conn, $storeid);
    $children[] = $storeid;
    foreach ($children as $key => $value) {
        $sql = "DELETE FROM folder WHERE storeid = '$value' AND userid = '$userid';";
        $result = mysqli_query($conn, $sql);
        if(!$result) {
            echo JSON_encode(["status" => Ret::Other->value]);
            exit();
        }
    }
    
    echo json_encode( [ "status" => Ret::Ok->value ] );
