<?php

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: X-Requested-With, Authorization, Content-Type');

require 'Slim/Slim.php';

\Slim\Slim::registerAutoloader();

\Slim\Extensions\Config::init(
    array(
        'BASE_PATH'   => '',
        'CONFIGS_DIR' => '../config/'
    )
);

$app = new \Slim\Slim();

$app->container->singleton('pdo', function () {
    return new \PDO(
        "mysql:host=" . \Slim\Extensions\Config::get('db.default.host') .
        ";dbname=". \Slim\Extensions\Config::get('db.default.dbname'), 
        \Slim\Extensions\Config::get('db.default.user'), 
        \Slim\Extensions\Config::get('db.default.password')
    );
});

require 'Resources/Get.php';
require 'Resources/Post.php';

$app->run();
