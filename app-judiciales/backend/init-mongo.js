// MongoDB initialization script
db = db.getSiblingDB('expedientes_db');

// Create collections
db.createCollection('users');
db.createCollection('expedientes');
db.createCollection('movimientos');
db.createCollection('juzgados');
db.createCollection('audit_logs');
db.createCollection('profiles');

// Create profiles and admin user
const adminProfile = db.profiles.insertOne({
  _id: ObjectId(),
  name: "Administrador",
  slug: "administrador",
  roles: ["crear", "eliminar", "actualizar", "leer", "imprimir", "exportar", "importar", "ver"],
  active: true,
  created_at: new Date(),
  updated_at: new Date()
});

// Insert admin user and link to admin profile
db.users.insertOne({
  _id: ObjectId(),
  email: "admin@judiciales.com",
  password: "$2a$10$XQK8q7QvQJ5HZ8ZjPz7Ow.YVMzRlH2nN5YJfP3Dz4qE7UJGfQwY0a", // hashed: admin123
  nombre: "Administrador Sistema",
  apellido: "",
  documento: "12345678",
  telefono: "+54 11 1234-5678",
  profile_id: adminProfile.insertedId,
  roles: ["crear", "eliminar", "actualizar", "leer", "imprimir", "exportar", "importar", "ver"],
  activo: true,
  created_at: new Date(),
  updated_at: new Date()
});

// Create sample juzgado
db.juzgados.insertOne({
  _id: ObjectId(),
  nombre: "1er Juzgado Civil de Lima",
  tipo: "civil",
  competencias: ["Civil", "Comercial"],
  direccion: "Av. Abancay 123, Lima",
  telefono: "01-4264000",
  email: "juzgado1civil@pj.gob.pe",
  activo: true,
  salas_audiencia: [
    {
      numero: "101",
      nombre: "Sala Principal",
      capacidad: 50,
      equipamiento: ["Proyector", "Audio", "Video"],
      activa: true
    }
  ],
  created_at: new Date(),
  updated_at: new Date()
});

print('Database initialized successfully');