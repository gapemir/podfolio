<?php
    require_once("../inc.php");

    $userid = $_POST['userid'];
    $fileName = $_POST['fileName'];
    $token = $_POST['token'];
    $parent = $_POST['parent'];


    if(validity($userid, $token) != Ret::Ok->value) {
        echo JSON_encode(["status" => Ret::UserTokenMissmatch->value]);
        exit();
    }
   
    if ( $_SERVER['REQUEST_METHOD'] == 'POST' && isset( $_FILES['file'] ) ) {
        $target_dir = __DIR__ . "/../../data/" . $userid . "/";
        if ( strlen( $fileName ) > 0 )
            $target_file = $target_dir . $fileName . "." . pathinfo( $_FILES["file"]["name"], PATHINFO_EXTENSION );
        else
            $target_file = $target_dir . basename($_FILES["file"]["name"]);
        //$imageFileType = strtolower( pathinfo( $target_file, PATHINFO_EXTENSION ) );

        /*// Check if file is a actual image or fake image
        $check = getimagesize($_FILES["file"]["tmp_name"]);
        if ($check !== false) {
            echo "File is an image - " . $check["mime"] . ".";
        } else {
            echo "File is not an image.";
            exit();
        }*/

        // Check if file already exists
        if ( file_exists( $target_file ) ) {
            echo json_encode( [ "status" => Ret::FIleExists->value ] );
            exit();
        }
        // Check file size
        // 50MB
        if ( $_FILES["file"]["size"] > 50000000 ) {
            echo json_encode( [ "status" => Ret::FileTooLarge->value ] );
            exit();
        }
        /*
        // Allow certain file formats
        if ($imageFileType != "jpg" && $imageFileType != "png" && $imageFileType != "jpeg" && $imageFileType != "gif") {
            echo "Sorry, only JPG, JPEG, PNG & GIF files are allowed.";
            exit();
        }*/
 
        if ( move_uploaded_file ($_FILES["file"]["tmp_name"], $target_file ) ) {
            $fileKey = bin2hex(random_bytes(32));
            $fileNameToStore = basename($target_file);
            $internalFileName = substr( hash( "sha256", $fileNameToStore ), 0, 20 );
            $mimeType = mime_content_type($target_file);
            $sql = "INSERT INTO file (fileid, name, fileKey, userid, mimetype, parent) VALUES ('$internalFileName', '$fileNameToStore', '$fileKey', '$userid', '$mimeType', '$parent')";
            if( mysqli_execute_query($conn, $sql) ) {
                echo json_encode( [ "status" => Ret::Ok->value, "file" => [
                    "fileid" => $internalFileName, 
                    "name"=> $fileNameToStore,
                    "fileKey" => $fileKey,
                    "public" => false,
                    "advertize" => false,
                    "createdAt" => date("Y-m-d H:i:s"),
                    "mimetype" => $mimeType,
                    "arent" => $parent,
                    ] ] );
            } else {
                unlink($target_file);
                echo json_encode( [ "status" => Ret::Other->value, "message" => "Failed to insert file record into database" ] );
            }
        } else {
            echo json_encode( [ "status" => Ret::Other->value, "message" => "Sorry, there was an error uploading your file." ] );
        }
    } else {
        echo json_encode( [ "status" => Ret::Other->value, "message" => "No file was uploaded." ] );
    }
