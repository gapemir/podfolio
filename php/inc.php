<?php
    require_once("env.php");
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
    function getAllChildFiles($conn, $folderid) {
        $sql = "SELECT fileid FROM file WHERE parent = '$folderid'";
        $result = mysqli_query($conn, $sql);
        $children = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $children[] = $row['fileid'];
        }
        $sql = "SELECT folderid FROM folder WHERE parent = '$folderid'";
        $result = mysqli_query($conn, $sql);
        while ($row = mysqli_fetch_assoc($result)) {
            $children = array_merge($children, getAllChildFiles($conn, $row['folderid']));
        }
        return $children;
    }
    function getAllChildFolders($conn, $folderid) {
        $sql = "SELECT folderid FROM folder WHERE parent = '$folderid'";
        $result = mysqli_query($conn, $sql);
        $children = array();
        while ($row = mysqli_fetch_assoc($result)) {
            $children = array_merge($children, getAllChildFolders($conn, $row['folderid']));
            $children[] = $row['folderid'];
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