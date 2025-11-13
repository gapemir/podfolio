<?php
    $host=getenv("DB_HOST");
    $user=getenv("DB_USERNAME");
    $password=getenv("DB_PASSWORD");
    $db=getenv("DB_DATABASE");
    $port=(int)getenv("DB_PORT");

    $conn = mysqli_connect($host, $user, $password, $db, $port);

    enum Ret : int{
        case Ok = 1;
        case UserTokenMissmatch = -1;
        case IncorrectPassword = -2;
        case Timeout = -3;
        case UserExists = -4;

    
        case FIleExists = -21;
        case FileTooLarge = -22;
        case FileNotExists = -23;

        
        case ERROR = -97;
        case TestUserNotDeletable = -98;
        case Other = -99;
    };

    function validity( $userid, $token ) {
        global $conn;
        $sql = "SELECT token FROM user WHERE userid = '$userid'";
        $result = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($result);
        if( mysqli_num_rows($result) == 0 ) {
            return Ret::UserTokenMissmatch->value;
        }
        if( $row['token'] == $token ) {
            return Ret::Ok->value;
        } else {
            return Ret::UserTokenMissmatch->value;
        }
    }
    function getAllChildFiles($conn, $storeid) {
        $sql = "SELECT storeid FROM file WHERE parent = '$storeid'";
        $result = mysqli_query($conn, $sql);
        $children = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $children[] = $row['storeid'];
        }
        $sql = "SELECT storeid FROM folder WHERE parent = '$storeid'";
        $result = mysqli_query($conn, $sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $children = array_merge($children, getAllChildFiles($conn, $row['storeid']));
        }
        return $children;
    }
    function getAllChildFolders($conn, $storeid) {
        $sql = "SELECT storeid FROM folder WHERE parent = '$storeid'";
        $result = mysqli_query($conn, $sql);
        $children = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $children = array_merge($children, getAllChildFolders($conn, $row['storeid']));
            $children[] = $row['storeid'];
        }
        return $children;
    }
    function arrayToDbValueIN($conn, $items){
        $items = array_unique($items);
        $items = array_map(function($item) use ($conn) {
            return mysqli_real_escape_string($conn, $item);
        }, $items);
        $items = implode("','", $items);
        return $items;
    }