<?php
    $conn = mysqli_connect("localhost", "root", "", "podfolio");

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
?>