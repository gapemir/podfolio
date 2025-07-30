<?php
    require_once("../inc.php");
    $data = JSON_decode(file_get_contents("php://input"), true);

    $userid = $data['userid'];
    $parent = $data['parent'];

    if(validity($userid, $data['token']) != Ret::Ok->value) {
        echo JSON_encode(["status" => Ret::UserTokenMissmatch->value]);
        exit();
    }

    $fileKey = bin2hex(random_bytes(32));
    $encNote = hash("sha256", $fileKey . time());
    $encNote = substr($encNote, 0, 16);
    $encNote = strtoupper($encNote);

    $today = date('d-m-Y'); // TODO we should check if we already have note with this name so we coudl do 1.2.2025(2)

    $sql = "INSERT INTO note (storeid, name, content, userid, fileKey, parent) VALUES ('$encNote', '$today', '', '$userid', '$fileKey', NULLIF('$parent', ''))";
    $result = mysqli_query($conn, $sql);
    if($result) {
        echo json_encode( [ "status" => Ret::Ok->value, "note" => [
                    "storeid" => $encNote, 
                    "name" => $today,
                    "content" => "",
                    "mimetype" => "gn-note/v1",
                    "fileKey" => $fileKey,
                    "public" => false,
                    "advertise" => false,
                    "createdAt" => date("Y-m-d H:i:s"),
                    "parent" => $parent=="null" ? null : $parent,
                    ] ] );
    } else {
        echo JSON_encode(["status" => Ret::ERROR->value]);
    }

