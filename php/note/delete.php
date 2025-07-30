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

    $sql = "DELETE FROM note WHERE storeid = '$storeid' AND userid = '$userid'";
    if( mysqli_execute_query($conn, $sql) ) {
        echo json_encode( [ "status" => Ret::Ok->value ] );
    } else {
        echo json_encode( [ "status" => Ret::Other->value, "message" => "Failed to delete note record from database" ] );
    }
    
    
