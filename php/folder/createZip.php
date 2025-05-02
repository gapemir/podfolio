<?php
    require_once("../inc.php");
    $data = JSON_decode(file_get_contents("php://input"), true);

    $userid = $data['userid'];
    $folderid = $data['folderid'];

    if(isset($data['token'])){
        $token = $data['token'];
        if(validity($userid, $token) != Ret::Ok->value) {
            echo json_encode(["status" => Ret::UserTokenMissmatch->value]);
            exit();
        }
    }else{
        $sql = "SELECT folderid FROM folder WHERE folderid = '$folderid' AND public = true";
        $result = mysqli_query($conn, $sql);
        if( mysqli_num_rows($result) == 0 ) {
            echo json_encode(["status" => Ret::FolderNotFound->value]);
            exit();
        }
    }
    $sql = "SELECT fileid, name FROM file WHERE parent = '$folderid'";
    $result = mysqli_execute_query($conn, $sql);
    $result = mysqli_fetch_all($result, MYSQLI_ASSOC);

    $zip = new ZipArchive();
    $foldername = "../../data/".$userid."/".$folderid.".zip";
    if ($zip->open($foldername, ZipArchive::CREATE) !== TRUE) {
        echo json_encode(["status" => Ret::Other->value]);
        exit();
    }
    foreach($result as $file) {
        $filePath = "../../data/".$userid."/".$file['fileid'].".".pathinfo($file['name'], PATHINFO_EXTENSION);
        if(file_exists($filePath)) {
            $zip->addFile($filePath, $file['name']);
        }
    }
    $zip->close();
    header('Content-Type: application/zip');
    readfile($foldername);
    unlink($foldername);
