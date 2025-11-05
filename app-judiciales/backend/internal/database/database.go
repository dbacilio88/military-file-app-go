package database

import (
	"context"
	"log"
	"strings"
	"time"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	client   *mongo.Client
	database *mongo.Database
}

func Connect(uri, dbName string) (*Database, error) {
	// Log connection details (hide sensitive information)
	maskedURI := maskURI(uri)
	log.Printf("🔗 Conectando a MongoDB...")
	log.Printf("📍 URI: %s", maskedURI)
	log.Printf("🗄️  Base de datos: %s", dbName)

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		log.Printf("❌ Error conectando a MongoDB: %v", err)
		return nil, err
	}

	// Ping the database to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		log.Printf("❌ Error ping a MongoDB: %v", err)
		return nil, err
	}

	log.Printf("✅ Conexión exitosa a MongoDB!")
	log.Printf("🏠 Conectado a: %s", dbName)

	database := client.Database(dbName)

	return &Database{
		client:   client,
		database: database,
	}, nil
}

func (db *Database) Collection(name string) *mongo.Collection {
	return db.database.Collection(name)
}

func (db *Database) GetMongoDB() *mongo.Database {
	return db.database
}

func (db *Database) Disconnect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	log.Printf("🔌 Desconectando de MongoDB...")
	return db.client.Disconnect(ctx)
}

// maskURI oculta las credenciales sensibles en la URI para logging
func maskURI(uri string) string {
	if strings.Contains(uri, "://") {
		parts := strings.SplitN(uri, "://", 2)
		if len(parts) == 2 {
			protocol := parts[0]
			rest := parts[1]

			// Si tiene credenciales (usuario:password@host)
			if strings.Contains(rest, "@") {
				hostPart := strings.SplitN(rest, "@", 2)
				if len(hostPart) == 2 {
					return protocol + "://***:***@" + hostPart[1]
				}
			}
		}
	}
	return uri
}

func (db *Database) CreateIndexes() error {
	ctx := context.Background()

	// Users collection indexes
	usersCollection := db.Collection("users")
	userIndexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "email", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys:    bson.D{{Key: "documento", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
	}

	_, err := usersCollection.Indexes().CreateMany(ctx, userIndexes)
	if err != nil {
		log.Printf("⚠️ Warning: Failed to create database indexes: %v", err)
		// Continue with other indexes instead of failing completely
	} else {
		log.Printf("✅ Users indexes created successfully")
	}

	// Expedientes collection indexes
	expedientesCollection := db.Collection("expedientes")
	expedienteIndexes := []mongo.IndexModel{
		{
			Keys:    bson.D{{Key: "cip", Value: 1}},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: bson.D{
				{Key: "apellidos_nombres", Value: "text"},
				{Key: "grado", Value: "text"},
				{Key: "ubicacion", Value: "text"},
			},
		},
		{
			Keys: bson.D{{Key: "estado", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "grado", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "situacion_militar", Value: 1}},
		},
		{
			Keys: bson.D{{Key: "created_at", Value: -1}},
		},
		{
			Keys: bson.D{{Key: "orden", Value: 1}},
		},
	}

	_, err = expedientesCollection.Indexes().CreateMany(ctx, expedienteIndexes)
	if err != nil {
		log.Printf("⚠️ Warning: Failed to create expedientes indexes: %v", err)
		// Continue instead of failing completely
	} else {
		log.Printf("✅ Expedientes indexes created successfully")
	}

	return nil
}
