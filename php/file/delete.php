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
    $target_dir = __DIR__ . "/../../data/" . $userid . "/";
    $sql = "SELECT name FROM file WHERE storeid = '$storeid' AND userid = '$userid'";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);

    $target_file = $target_dir . $storeid;
    $target_file = $target_file . "." . pathinfo($row["name"], PATHINFO_EXTENSION);
    
    if ( !file_exists( $target_file ) ) {
        echo json_encode( [ "status" => Ret::FileNotExists->value ] );
        exit();
    }
    $sql = "DELETE FROM file WHERE storeid = '$storeid' AND userid = '$userid'";
    if( mysqli_execute_query($conn, $sql) ) {
        unlink($target_file);
        echo json_encode( [ "status" => Ret::Ok->value ] );
    } else {
        echo json_encode( [ "status" => Ret::Other->value, "message" => "Failed to delete file record from database" ] );
    }
    
    
