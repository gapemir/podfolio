<?php
    require_once("../inc.php");
    $data = json_decode(file_get_contents("php://input"), true);

    $userid = $data['userid'];
    if(isset($data['token'])){
        $token = $data['token'];
    }
    
    $sql = "";

    if(!isset($token)){
        $sql = "SELECT fileid, name, fileKey, public, advertize, createdAt, mimetype, parent FROM file WHERE userid = '$userid' AND public = true";
    }else{
        if( validity($userid, $token) != 1){
            echo json_encode( ["status" => Ret::UserTokenMissmatch->value] );
            exit();
        }
        $sql = "SELECT fileid, name, fileKey, public, advertize, createdAt, mimetype, parent FROM file WHERE userid = '$userid'";    
    }
    $result = mysqli_query($conn, $sql);
    $files = [];
    while( $row = mysqli_fetch_assoc($result) ) {
        $row['public'] = (bool)$row['public'];
        $row['advertize'] = (bool)$row['advertize'];
        $files[] = $row;
    }
    if(!isset($token)){
        $sql = "SELECT folderid, name, fileKey, createdAt, public, advertize, parent FROM folder WHERE userid = '$userid' AND public = true";
    }else{
        $sql = "SELECT folderid, name, fileKey, createdAt, public, advertize, parent FROM folder WHERE userid = '$userid'";
    }
    $result = mysqli_query($conn, $sql);
    $folders = [];
    while( $row = mysqli_fetch_assoc($result) ) {
        $row['public'] = (bool)$row['public'];
        $row['advertize'] = (bool)$row['advertize'];
        $folders[] = $row;
    }


    echo json_encode( ["status" => Ret::Ok->value, "files" => $files, "folders" => $folders] );
