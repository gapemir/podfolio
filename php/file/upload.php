<?php

    require_once("../inc.php");

    $userid = $_POST['userid'];
    $token = $_POST['token'];
    $parent = $_POST['parent'];

    $mode = "single";
    if( isset( $_POST["fp"] ) && isset( $_POST["tp"] ) ) {
        $chunkPart = (int)($_POST['fp'] ?? 1);
        $totalChunks = (int)($_POST['tp'] ?? 1);

        if ( $chunkPart < 1  ) {
           $chunkPart = 1;
        }
        $mode = "chunk";
    }

    if($parent == "null") {
        $parent = NULL;
    }

    if(validity($userid, $token) != Ret::Ok->value) {
        echo JSON_encode(["status" => Ret::UserTokenMissmatch->value]);
        exit();
    }

    if (empty($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        die(json_encode(['status' => Ret::Other->value, 'message' => 'No file provided. Upload failed.']));
    }    

    // 50MB
    if ( $_FILES["file"]["size"] > 1024*1024*50 ) {
        echo json_encode( [ "status" => Ret::FileTooLarge->value ] );
        exit();
    }

    $target_dir = __DIR__ . "/../../data/" . $userid . "/";

    $fileNameToStore = basename($_FILES["file"]["name"]);

    if( $mode === "single" ) {
        $fileKey = bin2hex(random_bytes(32));
        $mimeType = mime_content_type($_FILES["file"]["tmp_name"]);
        $internalFileName = substr( hash( "sha256", $fileNameToStore . time() . uniqid() ), 0, 20 ); // Add uniqid() for better collision avoidance
        $target_file = $target_dir . $internalFileName . "." . pathinfo( $_FILES["file"]["name"], PATHINFO_EXTENSION );

        if ( move_uploaded_file ($_FILES["file"]["tmp_name"], $target_file ) ) {
            $sql = "INSERT INTO file (storeid, name, fileKey, userid, mimetype, parent) VALUES ('$internalFileName', '$fileNameToStore', '$fileKey', '$userid', '$mimeType', NULLIF('$parent',''))";
            if( mysqli_execute_query($conn, $sql) ) {
                echo json_encode( [ "status" => Ret::Ok->value, "file" => [
                    "storeid" => $internalFileName, 
                    "name"=> $fileNameToStore,
                    "fileKey" => $fileKey, // Return the unique fileKey
                    "public" => false,
                    "advertise" => false,
                    "createdAt" => date("Y-m-d H:i:s"),
                    "mimetype" => $mimeType,
                    "parent" => $parent=="null" ? null : $parent,
                ] ] );
            } else {
                unlink($target_file);
                die( json_encode( [ "status" => Ret::Other->value, "message" => "Failed to insert file record into database" ] ) );
            }
        } else {
            die( json_encode( [ "status" => Ret::Other->value, "message" => "Sorry, there was an error uploading your file." ] ) );
        }
    } else {
        if( $chunkPart == 1 ) {
            $internalFileName = substr( hash( "sha256", $fileNameToStore . time() . uniqid() ), 0, 20 ); // Add uniqid() for better collision avoidance
        } else {
            $sql = "SELECT storeid FROM file WHERE name='$fileNameToStore'";
            $result = mysqli_execute_query($conn, $sql);
            if ( mysqli_num_rows( $result ) == 0 ) {
                die(json_encode(['status' => Ret::Other->value, 'message' => 'File not found.']));
            }
            $row = mysqli_fetch_assoc( $result );
            $internalFileName = $row['storeid'];
        }
        
        $temp_dir = $target_dir . $internalFileName . "_temp/";
        if (!is_dir($temp_dir)) {
            mkdir($temp_dir, 0777, true);
        }

        $chunkFileName = $temp_dir . $internalFileName . "_chunk_" . $chunkPart;

        if (move_uploaded_file($_FILES["file"]["tmp_name"], $chunkFileName)) {
            if( $chunkPart == 1 ) {
                $fileKey = bin2hex(random_bytes(32));
                $mimeType = mime_content_type($_FILES["file"]["tmp_name"]);
                $sql = "INSERT INTO file (storeid, name, fileKey, userid, mimetype, parent) VALUES ('$internalFileName', '$fileNameToStore', '$fileKey', '$userid', '$mimeType', NULLIF('$parent',''))";
                if( !mysqli_execute_query($conn, $sql) ) {
                    die( json_encode( [ "status" => Ret::Other->value, "message" => "Failed to insert file record into database" ] ) );
                }
            }

            $uploadedChunks = glob($temp_dir . $internalFileName . "_chunk_*");
            if (count($uploadedChunks) == $totalChunks) {
                // All chunks received, begin reassembly

                $finalFile = $target_dir . $internalFileName . "." . pathinfo($fileNameToStore, PATHINFO_EXTENSION);
                $finalFileHandle = fopen($finalFile, 'wb');

                if (!$finalFileHandle) {
                    die(json_encode(['status' => Ret::Other->value, 'message' => 'Could not open final file for writing.']));
                }

                sort($uploadedChunks, SORT_NATURAL);

                foreach ($uploadedChunks as $chunkPath) {
                    $chunkHandle = fopen($chunkPath, 'rb');
                    while (!feof($chunkHandle)) {
                        fwrite($finalFileHandle, fread($chunkHandle, 4096));
                    }
                    fclose($chunkHandle);
                    unlink($chunkPath);
                }

                fclose($finalFileHandle);
                rmdir($temp_dir); // Clean up the temporary directory
                // It's good practice to update the file status in the database here
                // e.g., 'is_complete' = 1 or something similar.
                //echo json_encode(["status" => Ret::Ok->value, "message" => "File reassembly complete."]);

                $mimeType = mime_content_type($finalFile);
                $sql = "UPDATE file SET mimetype='$mimeType' WHERE storeid='$internalFileName'";
                mysqli_execute_query($conn, $sql);

                $sql = "SELECT fileKey, public, advertise, createdAt, mimetype FROM file WHERE storeid='$internalFileName'";
                $result = mysqli_execute_query($conn, $sql);
                $row = mysqli_fetch_assoc($result);
                $fileKey = $row['fileKey'];
                $public = $row['public'];
                $advertise = $row['advertise'];
                $createdAt = $row['createdAt'];
                echo json_encode( [ "status" => Ret::Ok->value, "file" => [
                    "storeid" => $internalFileName, 
                    "name"=> $fileNameToStore,
                    "fileKey" => $fileKey,
                    "public" => false,
                    "advertise" => false,
                    "createdAt" => date("Y-m-d H:i:s"),
                    "mimetype" => $mimeType,
                    "parent" => $parent=="null" ? null : $parent,
                ] ] );
            }
            else {
                echo json_encode(["status" => Ret::Ok->value, "message" => "Chunk " . $chunkPart . " uploaded."]);
            }
        } else {
            die(json_encode(['status' => Ret::Other->value, 'message' => 'Failed to move uploaded chunk.']));
        }
    }
