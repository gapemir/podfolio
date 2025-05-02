<?php
    require_once("inc.php");
    
    $userid = $_GET['userid'];
    $file = $_GET['file'];
    $key = "";
    if( isset($_GET['key']) )
        $key = $_GET['key'];
    
    //dev only
    $dev = false;
    if (isset($_GET['dev'])) {
        if($_GET['dev'] == "true")
            $dev = true;
    }

    $sql = "SELECT fileid, name, public, fileKey FROM file WHERE name = '$file' OR fileid = '$file'";
    $result = mysqli_execute_query($conn, $sql);

    if($dev){
        echo "<pre>";
        var_dump($userid);
        var_dump($file);
        var_dump($key); 
        var_dump($result);
    }

    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);

        if($dev) {
            var_dump($row);
        }

        if( $row['public'] == true || $row['fileKey'] == $key) {
            $imagePath = '../data/' . $userid . '/' . $row['fileid'] . '.' . pathinfo($row['name'], PATHINFO_EXTENSION);
            if (file_exists($imagePath)) {
                $mimeType = mime_content_type($imagePath);
                if(!$dev) {
                    header('Content-Type: ' . $mimeType);
                    readfile($imagePath);
                } else {
                    var_dump($imagePath);
                    var_dump($mimeType);
                    exit();
                }
            } else {
                http_response_code(404);
                echo "Image not found.";
            }
        }
        http_response_code(403);
        echo "Access denied.";
        exit();
    } else {
        http_response_code(403);
        echo "Access denied.";
    }
?>