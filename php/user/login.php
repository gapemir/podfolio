<?php
    require_once("../inc.php");

    $data = JSON_decode(file_get_contents("php://input"), true);
    $username = $data['username'];
    $password = $data['password'];


    $sql = "SELECT userid, password, token FROM user WHERE username = '$username' OR email = '$username'";
    $result = mysqli_query($conn, $sql);
    if( mysqli_num_rows($result) == 0 ) {
        echo JSON_encode(["status" => Ret::IncorrectPassword->value]);
        exit();
    }
    $row = mysqli_fetch_assoc($result);

    //if( password_verify($password, $row['password']) ) {
    if( $password == $row['password'] ) {
        echo JSON_encode(["status" => Ret::Ok->value,"token" => $row['token'], "userid" => $row['userid']]);
    } else {
        echo JSON_encode(["status" => Ret::IncorrectPassword->value]);
    }
