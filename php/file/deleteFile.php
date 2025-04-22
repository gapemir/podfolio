<?php
    require_once("../inc.php");
    $data = JSON_decode(file_get_contents("php://input"), true);

    $userid = $data['userid'];
    $fileid = $data['fileid'];
    $token = $data['token'];

    if(validity($userid, $token) != Ret::Ok->value) {
        echo JSON_encode(["status" => Ret::UserTokenMissmatch->value]);
        exit();
    }
    $wasFile = true;
    $target_dir = __DIR__ . "/../../data/" . $userid . "/";
    $sql = "SELECT name FROM file WHERE fileid = '$fileid' AND userid = '$userid'";
    $result = mysqli_query($conn, $sql);
    if (mysqli_num_rows($result) == 0) {
        $sql = "SELECT name FROM folder WHERE folderid = '$fileid'";
        $result = mysqli_query($conn, $sql);
        if (mysqli_num_rows($result) == 0){
            echo JSON_encode(["status" => Ret::FileNotExists->value]);
            exit();
        }
        $wasFile = false;
    }else{
        $row = mysqli_fetch_assoc($result);
        $fileName = $row['name'];

        $target_file = $target_dir . $fileName;
        if ( !file_exists( $target_file ) ) {
            echo json_encode( [ "status" => Ret::FileNotExists->value ] );
            exit();
        }
    }
    if($wasFile){
        $sql = "DELETE FROM file WHERE fileid = '$fileid' AND userid = '$userid'";
    } else {
        $sql = "DELETE FROM folder WHERE folderid = '$fileid' AND userid = '$userid'";
    }
    if( mysqli_execute_query($conn, $sql) ) {
        if($wasFile){
            unlink($target_file);
        }
        echo json_encode( [ "status" => Ret::Ok->value ] );
    } else {
        echo json_encode( [ "status" => Ret::Other->value, "message" => "Failed to delete file record from database" ] );
    }
    
    
