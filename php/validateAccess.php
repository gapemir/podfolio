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

    $sql = "SELECT storeid, name, public, fileKey FROM file WHERE name = '$file' OR storeid = '$file'";
    $result = mysqli_execute_query($conn, $sql);

    if($dev){
        echo "<pre>";
        echo "userId:";var_dump($userid);
        echo "file:";var_dump($file);
        echo "key:";var_dump($key); 
        echo "result:";var_dump($result);
    }

    if (mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);

        if($dev) {
            var_dump($row);
        }

        if( $row['public'] == true || $row['fileKey'] == $key) {
            $imagePath = '../data/' . $userid . '/' . $row['storeid'] . '.' . pathinfo($row['name'], PATHINFO_EXTENSION);
            if (file_exists($imagePath)) {
                $mimeType = mime_content_type( $imagePath );
                $fileSize = filesize( $imagePath );
                if( !$dev ) {
                    header( 'Content-Type: ' . $mimeType );
                    header( 'Content-Length: ' . $fileSize );
                    header( 'Content-Disposition: attachment; filename="' . basename( $row[ 'name' ] ) . '"' );
                    header( 'X-Robots-Tag: noindex, nofollow', true );

                    // Disable PHP's output buffering for direct output
                    if ( ob_get_level() ) {
                        ob_end_clean();
                    }

                    // Open the file for reading
                    $handle = fopen( $imagePath, 'rb' );
                    if ( $handle === false ) {
                        http_response_code( 500 );
                        echo "Could not open file.";
                        exit();
                    }

                    // Stream the file in 1MB chunks
                    $bufferSize = 1024 * 1024 * 64; // above any images but bellow huge files
                    while ( !feof( $handle ) ) {
                        echo fread( $handle, $bufferSize );
                        flush(); // Send the output buffer to the browser
                    }

                    fclose( $handle );
                    exit();
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