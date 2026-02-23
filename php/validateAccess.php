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

    //$sql = "SELECT storeid, name, public, fileKey FROM file WHERE name = '$file' OR storeid = '$file'";


    $sql = "SELECT storeid, name, public, fileKey, mimeType, '__EMPTY__' AS content FROM file WHERE name = '$file' OR storeid = '$file'
        UNION
        SELECT storeid, name, public, fileKey, 'gn-note/' AS mimeType, content FROM note WHERE name = '$file' OR storeid = '$file'";
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
            $isNote = str_starts_with($row['mimeType'], "gn-note/");
            if (file_exists($imagePath) || $isNote ) {
                $mimeType = mime_content_type( $imagePath );
                $fileSize = filesize( $imagePath );
                if( !$dev ) {
                    if( $mimeType === false && $isNote ) {
                        $mimeType = "text/plain";
                        $fileSize = strlen($row['content']);
                    }

                    header( 'Content-Type: ' . $mimeType );
                    header( 'Content-Length: ' . $fileSize );
                    // header( 'Content-Disposition: attachment; filename="' . basename( $row[ 'name' ] ) . '"' );  //INFO this makes browser try to render content, else it would download
                    header( 'X-Robots-Tag: noindex, nofollow', true );

                    if ( ob_get_level() ) {
                        ob_end_clean();
                    }

                    if( $isNote ) {
                        echo $row['content'];

                    } else {
                        $handle = fopen( $imagePath, 'rb' );
                        if ( $handle === false ) {
                            http_response_code( 500 );
                            echo "Could not open file.";
                            exit();
                        }

                        // Stream the file in 1MB chunks
                        $bufferSize = 1024 * 1024 * 64;
                        while ( !feof( $handle ) ) {
                            echo fread( $handle, $bufferSize );
                            flush();
                        }
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
                echo "Content not found.";
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