<?php
    require_once("../inc.php");
    $data = json_decode(file_get_contents("php://input"), true);

    $userid = $data['userid'];
    if(isset($data['token'])){
        $token = $data['token'];
    }
    
    $sql = "";

    if(!isset($token)){
        $sql = "SELECT storeid, name, fileKey, public, advertise, createdAt, mimetype, parent FROM file WHERE userid = '$userid' AND public = true";
    }else{
        if( validity($userid, $token) != 1){
            echo json_encode( ["status" => Ret::UserTokenMissmatch->value] );
            exit();
        }
        $sql = "SELECT storeid, name, fileKey, public, advertise, createdAt, mimetype, parent FROM file WHERE userid = '$userid'";    
    }
    $result = mysqli_query($conn, $sql);
    $files = [];
    while( $row = mysqli_fetch_assoc($result) ) {
        $row['public'] = (bool)$row['public'];
        $row['advertise'] = (bool)$row['advertise'];
        $files[] = $row;
    }
    if(!isset($token)){
        $sql = "SELECT storeid, name, content, fileKey, public, advertise, createdAt, parent FROM note WHERE userid = '$userid' AND public = true";
    }else{
        if( validity($userid, $token) != 1){
            echo json_encode( ["status" => Ret::UserTokenMissmatch->value] );
            exit();
        }
        $sql = "SELECT storeid, name, content, fileKey, public, advertise, createdAt, parent FROM note WHERE userid = '$userid'";    
    }
    $result = mysqli_query($conn, $sql);
    $notes = [];
    while( $row = mysqli_fetch_assoc($result) ) {
        $row['public'] = (bool)$row['public'];
        $row['advertise'] = (bool)$row['advertise'];
        $row['mimetype'] = "gn-note/v1";
        $notes[] = $row;
    }
    if(!isset($token)){
        $sql = "SELECT storeid, name, fileKey, createdAt, public, advertise, parent FROM folder WHERE userid = '$userid' AND public = true";
    }else{
        $sql = "SELECT storeid, name, fileKey, createdAt, public, advertise, parent FROM folder WHERE userid = '$userid'";
    }
    $result = mysqli_query($conn, $sql);
    $folders = [];
    while( $row = mysqli_fetch_assoc($result) ) {
        $row['public'] = (bool)$row['public'];
        $row['advertise'] = (bool)$row['advertise'];
        $folders[] = $row;
    }


    echo json_encode( ["status" => Ret::Ok->value, "files" => $files, "notes" => $notes, "folders" => $folders] );
