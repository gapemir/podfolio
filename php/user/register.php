<?php
    require_once("../inc.php");

    $data = JSON_decode(file_get_contents("php://input"), true);
    $username = $data['username'];
    $password = $data['password'];
    $email = $data['email'];


    //$password = password_hash($password, PASSWORD_DEFAULT);
    $encUsername = hash("sha256", $username . time());
    $encUsername = substr($encUsername, 0, 16);
    $encUsername = strtoupper($encUsername);

    $sql = "SELECT * FROM user WHERE username = '$username' OR email = '$email'";
    $result = mysqli_query($conn, $sql);
    if( mysqli_num_rows($result) > 0 ) {
        echo JSON_encode(["status" => Ret::UserExists->value]);
        exit();
    }


    if( !mkdir( "../../data/$encUsername") ){
        echo JSON_encode(["status" => Ret::Other->value]);
        exit();
    }

    $token = bin2hex(random_bytes(32));
    $sql = "INSERT INTO user (username, userid, password, email, token) VALUES ('$username', '$encUsername', '$password', '$email', '$token')";
    if( mysqli_execute_query($conn, $sql) ) {
        echo JSON_encode(["status" => Ret::Ok->value, "token" => $token, "userid" => $encUsername]);
    } else {
        echo JSON_encode(["status" => Ret::Other->value]);
    }
?>