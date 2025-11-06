// Script de inicialización MongoDB - Sistema de Expedientes Militares
// Se ejecuta automáticamente al iniciar el contenedor MongoDB por primera vez

// Cambiar a la base de datos de la aplicación
db = db.getSiblingDB('expedientes_db');

// Crear índices básicos para optimización
db.users.createIndex({ "email": 1 }, { unique: true });
db.expedientes.createIndex({ "numero": 1 }, { unique: true });

// Insertar usuario administrador por defecto
db.users.insertOne({
  nombre: "Administrador",
  apellido: "Sistema",
  email: "admin@sistema.mil",
  cedula: "00000000",
  password: "$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", // password: admin123
  rol: "admin",
  activo: true,
  fecha_creacion: new Date(),
  fecha_actualizacion: new Date()
});

print('✅ Base de datos inicializada con usuario admin@sistema.mil');