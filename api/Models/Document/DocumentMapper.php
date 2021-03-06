<?php

namespace Models\Document;

class DocumentMapper extends \Slim\Extensions\Dmm\Mapper
{
    protected $tableName = 'documents';
    protected $tablePrimaryKey = 'id';

    protected $tableRelationKey = 'user_id';
    protected $relationQuery = "SELECT id FROM users WHERE username = :username LIMIT 1";

    protected $modelClass = '\Models\Document\Document';
    protected $modelCollectionClass = '\Models\Document\DocumentCollection';

    public function __construct(\PDO $pdo)
    {
        parent::__construct($pdo, $this->tableName, $this->tablePrimaryKey);
    }

    public function getForUser($username, $size=15, $lastId=null)
    {
        if (is_null($size)) $size = 15;
        $lastIdBuilder = "";
        $limitBuilder = "LIMIT $size";

        if (!is_null($lastId)) {
            $lastIdBuilder = " AND id < $lastId";
        }

        $sql = "SELECT *
                FROM {$this->tableName}
                WHERE {$this->tableRelationKey} = ({$this->relationQuery}) ".
                $lastIdBuilder.
                " ORDER BY date DESC ".$limitBuilder;

        $bindings = array(
            'username' => strtolower($username)
        );

        $documents = $this->fetchCollection($sql, $bindings);
        
        if ($documents->getCount() == 0) {
            $documents = false;
        }

        return $documents;
    }

    public function getProtected($documentId, $pwd)
    {
        $sql = "SELECT *
                FROM {$this->tableName}
                WHERE {$this->tablePrimaryKey} = :documentId
                AND type = 0
                AND protected = 1
                AND public_password = :pwd
                LIMIT 1";
                
        $bindings = array(
            'documentId' => $documentId,
            'pwd'        => $pwd
        );

        $documents = $this->fetchCollection($sql, $bindings);
        
        if ($documents->getCount() == 0) {
            $documents = false;
        } else {
            $documents = $documents[0];
        }

        return $documents;
    }

    public function getPublic($documentId) 
    {
        $sql = "SELECT *
                FROM {$this->tableName}
                WHERE {$this->tablePrimaryKey} = :documentId
                AND type = 0
                LIMIT 1";
                
        $bindings = array(
            'documentId' => $documentId
        );

        $documents = $this->fetchCollection($sql, $bindings);
        
        if ($documents->getCount() == 0) {
            $documents = false;
        }

        return $documents;
    }

    public function isOwner($userId, $documentId) 
    {
        $sql = "SELECT *
                FROM {$this->tableName}
                WHERE {$this->tablePrimaryKey} = :documentId
                AND {$this->tableRelationKey} = :userId
                LIMIT 1";
                
        $bindings = array(
            'documentId' => $documentId,
            'userId'     => $userId
        );

        $documents = $this->fetchCollection($sql, $bindings);
        
        if ($documents->getCount() > 0) {
            $result = true;
        } else {
            $result = false;
        }

        return $result;
    }

    public function deleteDocument($userId, $documentId) 
    {
        $sql = "DELETE
                FROM {$this->tableName}
                WHERE {$this->tablePrimaryKey} = :documentId
                AND {$this->tableRelationKey} = :userId";
                
        $bindings = array(
            'documentId' => $documentId,
            'userId'     => $userId
        );

        $documents = $this->fetchCollection($sql, $bindings);
        
        if ($documents->getCount() > 0) {
            $result = true;
        } else {
            $result = false;
        }

        return $result;
    }

    public function getRecents($size=15, $lastId=null)
    {
        if (is_null($size)) $size = 15;
        $lastIdBuilder = "";
        $limitBuilder = "LIMIT $size";


        if (!is_null($lastId)) {
            $lastIdBuilder = " AND id < :lastId";
        }

        $sql = "SELECT *
                FROM {$this->tableName}
                WHERE type = 0
                AND protected = 0 ".
                $lastIdBuilder.
                " ORDER BY date DESC ".$limitBuilder;

        $bindings = array(
            'lastId'    => $lastId
        );

        $documents = $this->fetchCollection($sql, $bindings);

        if ($documents->getCount() == 0) {
            $documents = false;
        }

        return $documents;
    }
}
