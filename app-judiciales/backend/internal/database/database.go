package database

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Database struct {
	client   *mongo.Client
	database *mongo.Database
}

func Connect(uri, dbName string) (*Database, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return nil, err
	}

	// Ping the database to verify connection
	if err := client.Ping(ctx, nil); err != nil {
		return nil, err
	}

	database := client.Database(dbName)

	return &Database{
		client:   client,
		database: database,
	}, nil
}

func (db *Database) Collection(name string) *mongo.Collection {
	return db.database.Collection(name)
}

func (db *Database) Disconnect() error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	return db.client.Disconnect(ctx)
}

func (db *Database) CreateIndexes() error {
	ctx := context.Background()

	// Users collection indexes
	usersCollection := db.Collection("users")
	_, err := usersCollection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: map[string]interface{}{"email": 1},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: map[string]interface{}{"documento": 1},
			Options: options.Index().SetUnique(true),
		},
	})
	if err != nil {
		return err
	}

	// Expedientes collection indexes
	expedientesCollection := db.Collection("expedientes")
	_, err = expedientesCollection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: map[string]interface{}{"numero": 1},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: map[string]interface{}{"demandante.nombre": "text", "demandado.nombre": "text", "descripcion": "text"},
		},
		{
			Keys: map[string]interface{}{"estado": 1},
		},
		{
			Keys: map[string]interface{}{"tipo_proceso": 1},
		},
		{
			Keys: map[string]interface{}{"juzgado_id": 1},
		},
		{
			Keys: map[string]interface{}{"created_at": -1},
		},
	})
	if err != nil {
		return err
	}

	// Movimientos collection indexes
	movimientosCollection := db.Collection("movimientos")
	_, err = movimientosCollection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: map[string]interface{}{"expediente_id": 1},
		},
		{
			Keys: map[string]interface{}{"expediente_id": 1, "numero": 1},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: map[string]interface{}{"fecha": -1},
		},
		{
			Keys: map[string]interface{}{"tipo": 1},
		},
	})
	if err != nil {
		return err
	}

	// Juzgados collection indexes
	juzgadosCollection := db.Collection("juzgados")
	_, err = juzgadosCollection.Indexes().CreateMany(ctx, []mongo.IndexModel{
		{
			Keys: map[string]interface{}{"nombre": 1},
			Options: options.Index().SetUnique(true),
		},
		{
			Keys: map[string]interface{}{"activo": 1},
		},
	})
	if err != nil {
		return err
	}

	return nil
}