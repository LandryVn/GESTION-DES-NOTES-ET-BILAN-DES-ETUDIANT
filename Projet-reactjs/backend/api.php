<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");




$host = 'localhost';
$db   = 'gestion_etudiant'; 
$user = 'root';              
$pass = '';                  
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
];

try {
    $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {

    die(json_encode([
        'success' => false,
        'message' => 'Erreur de connexion à la base de données: ' . $e->getMessage()
    ]));
}



$action = $_GET['action'] ?? '';


switch ($action) {
    case 'add':
        $data = json_decode(file_get_contents('php://input'), true);
        
     
        if (empty($data['numEt']) || empty($data['nom'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Le numéro et le nom sont obligatoires']);
            exit;
        }
    
    
        if (!is_numeric($data['note_math']) || !is_numeric($data['note_phys']) ||
            $data['note_math'] < 0 || $data['note_math'] > 20 ||
            $data['note_phys'] < 0 || $data['note_phys'] > 20) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Les notes doivent être entre 0 et 20']);
            exit;
        }
    
        try {
            
            $check = $pdo->prepare("SELECT numEt FROM etudiant WHERE numEt = ?");
            $check->execute([$data['numEt']]);
            
            if ($check->fetch()) {
                http_response_code(409);
                echo json_encode(['success' => false, 'message' => 'Ce numéro étudiant existe déjà']);
                exit;
            }
    
           
            $stmt = $pdo->prepare("INSERT INTO etudiant 
                                 (numEt, nom, note_math, note_phys) 
                                 VALUES (:numEt, :nom, :note_math, :note_phys)");
            
            $success = $stmt->execute([
                ':numEt' => htmlspecialchars($data['numEt']),
                ':nom' => htmlspecialchars($data['nom']),
                ':note_math' => floatval($data['note_math']),
                ':note_phys' => floatval($data['note_phys'])
            ]);
            
            http_response_code($success ? 201 : 500);
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Étudiant ajouté avec succès!' : 'Erreur lors de l\'ajout'
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erreur SQL: ' . $e->getMessage()
            ]);
        }
        break;

    case 'list':
        try {
         
            $stmt = $pdo->query("
                SELECT 
                    numEt,
                    nom,
                    note_math,
                    note_phys,
                    ROUND((note_math + note_phys) / 2, 2) AS moyenne
                FROM etudiant
                ORDER BY nom ASC
            ");
            
            $students = $stmt->fetchAll();
            
            echo json_encode([
                'success' => true,
                'data' => $students
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Erreur lors de la récupération des étudiants: ' . $e->getMessage()
            ]);
        }
        break;

    case 'update':
        $data = json_decode(file_get_contents('php://input'), true);
        
        try {
            $stmt = $pdo->prepare("
                UPDATE etudiant 
                SET nom = :nom, 
                    note_math = :note_math, 
                    note_phys = :note_phys 
                WHERE numEt = :numEt
            ");
            
            $success = $stmt->execute([
                ':numEt' => $data['numEt'],
                ':nom' => $data['nom'],
                ':note_math' => floatval($data['note_math']),
                ':note_phys' => floatval($data['note_phys'])
            ]);
            
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Mise à jour réussie!' : 'Étudiant non trouvé'
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Erreur de mise à jour: ' . $e->getMessage()
            ]);
        }
        break;

    case 'delete':
        $numEt = $_GET['numEt'] ?? '';
        
        try {
            $stmt = $pdo->prepare("DELETE FROM etudiant WHERE numEt = ?");
            $success = $stmt->execute([$numEt]);
            
            echo json_encode([
                'success' => $success,
                'message' => $success ? 'Étudiant supprimé!' : 'Étudiant non trouvé'
            ]);
        } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Erreur de suppression: ' . $e->getMessage()
            ]);
        }
        break;

        case 'stats':
            try {
                
                $baseStats = $pdo->query("
                    SELECT 
                        COUNT(*) AS total,
                        ROUND(AVG((note_math + note_phys) / 2), 2) AS avg_moyenne,
                        ROUND(MIN((note_math + note_phys) / 2), 2) AS min_moyenne,
                        ROUND(MAX((note_math + note_phys) / 2), 2) AS max_moyenne
                    FROM etudiant
                ")->fetch();
        
                
                $admis = $pdo->query("SELECT COUNT(*) FROM etudiant WHERE (note_math + note_phys) >= 20")->fetchColumn();
                $redoublants = $pdo->query("SELECT COUNT(*) FROM etudiant WHERE (note_math + note_phys) < 20")->fetchColumn();
        
                
                $result = [
                    'total_etudiants' => (int)$baseStats['total'],
                    'moyenne_classe' => (float)$baseStats['avg_moyenne'],
                    'moyenne_min' => (float)$baseStats['min_moyenne'],
                    'moyenne_max' => (float)$baseStats['max_moyenne'],
                    'admis' => (int)$admis,
                    'redoublants' => (int)$redoublants
                ];
        
                echo json_encode([
                    'success' => true,
                    'data' => $result
                ]);
        
            } catch (PDOException $e) {
                error_log("ERREUR STATS: " . $e->getMessage());
                
                echo json_encode([
                    'success' => false,
                    'message' => 'Erreur de calcul des statistiques',
                    'error_details' => [
                        'code' => $e->getCode(),
                        'message' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]
                ]);
            }
            break;
        
    default:
        echo json_encode([
            'success' => false,
            'message' => 'Action non reconnue'
        ]);
}