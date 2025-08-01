<?php
    require_once("../inc.php");
    $data = JSON_decode(file_get_contents("php://input"), true);

    $userid = $data['userid'];
    $storeid = $data['storeid'];

    if(isset($data['token'])) {
        $token = $data['token'];
        if(validity($userid, $token) != Ret::Ok->value) {
            echo json_encode(["status" => Ret::UserTokenMissmatch->value]);
            exit();
        }
    } else {
        $sql = "SELECT storeid FROM folder WHERE storeid = '$storeid' AND public = true";
        $result = mysqli_query($conn, $sql);
        if( mysqli_num_rows($result) == 0 ) {
            echo json_encode(["status" => Ret::FolderNotFound->value]);
            exit();
        }
    }

    $zip = new ZipArchive();
    $foldername = "../../data/".$userid."/".$storeid.".zip";
    if ($zip->open($foldername, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== TRUE) {
        echo json_encode(["status" => Ret::Other->value]);
        exit();
    }

    constructZip($zip, $storeid);

    $zip->close();
    header('Content-Type: application/zip');
    readfile($foldername);
    unlink($foldername);

    function constructZip($zip, $parentId, $folderPath = "/") {
        global $conn, $userid;

        $sql = "SELECT storeid, name FROM file WHERE parent = '$parentId'";
        $result = mysqli_execute_query($conn, $sql);
        $result = mysqli_fetch_all($result, MYSQLI_ASSOC);

        foreach($result as $file) {
            $filePath = "../../data/".$userid."/".$file['storeid'].".".pathinfo($file['name'], PATHINFO_EXTENSION);
            if(file_exists($filePath)) {
                $zip->addFile($filePath, $folderPath.$file['name']);
            }
        }

        $sql = "SELECT storeid, name FROM folder WHERE parent = '$parentId'";
        $result = mysqli_execute_query($conn, $sql);
        $result = mysqli_fetch_all($result, MYSQLI_ASSOC);
        foreach($result as $folder) {
            constructZip($zip, $folder['storeid'], $folderPath.$folder['name']."/");
        }
    }