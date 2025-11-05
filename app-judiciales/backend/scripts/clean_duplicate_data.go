package main

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func DeleteDuplicates() {
	// Connect to MongoDB
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(context.Background())

	db := client.Database("expedientes_db")

	fmt.Println("🧹 Limpiando datos duplicados...")

	// Clean duplicate users by email
	if err := cleanDuplicateUsers(db); err != nil {
		log.Printf("❌ Error cleaning duplicate users: %v", err)
	} else {
		fmt.Println("✅ Usuarios duplicados limpiados")
	}

	// Clean duplicate profiles by slug and name
	if err := cleanDuplicateProfiles(db); err != nil {
		log.Printf("❌ Error cleaning duplicate profiles: %v", err)
	} else {
		fmt.Println("✅ Perfiles duplicados limpiados")
	}

	// Clean duplicate expedientes by numero
	if err := cleanDuplicateExpedientes(db); err != nil {
		log.Printf("❌ Error cleaning duplicate expedientes: %v", err)
	} else {
		fmt.Println("✅ Expedientes duplicados limpiados")
	}

	fmt.Println("🎉 Limpieza completada")
}

func cleanDuplicateUsers(db *mongo.Database) error {
	collection := db.Collection("users")

	// Find duplicate emails
	pipeline := []bson.M{
		{"$group": bson.M{
			"_id":   "$email",
			"count": bson.M{"$sum": 1},
			"docs":  bson.M{"$push": "$$ROOT"},
		}},
		{"$match": bson.M{"count": bson.M{"$gt": 1}}},
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var result struct {
			ID    string   `bson:"_id"`
			Count int      `bson:"count"`
			Docs  []bson.M `bson:"docs"`
		}

		if err := cursor.Decode(&result); err != nil {
			continue
		}

		fmt.Printf("📧 Email duplicado encontrado: %s (%d copias)\n", result.ID, result.Count)

		// Keep the first document, delete the rest
		for i := 1; i < len(result.Docs); i++ {
			doc := result.Docs[i]
			if id, ok := doc["_id"]; ok {
				_, err := collection.DeleteOne(context.Background(), bson.M{"_id": id})
				if err != nil {
					log.Printf("Error deleting duplicate user: %v", err)
				} else {
					fmt.Printf("   🗑️ Eliminado usuario duplicado con ID: %v\n", id)
				}
			}
		}
	}

	return nil
}

func cleanDuplicateProfiles(db *mongo.Database) error {
	collection := db.Collection("profiles")

	// Clean duplicate slugs
	if err := cleanDuplicatesByField(collection, "slug", "Slug"); err != nil {
		return err
	}

	// Clean duplicate names
	if err := cleanDuplicatesByField(collection, "name", "Name"); err != nil {
		return err
	}

	return nil
}

func cleanDuplicatesByField(collection *mongo.Collection, field, fieldName string) error {
	pipeline := []bson.M{
		{"$group": bson.M{
			"_id":   "$" + field,
			"count": bson.M{"$sum": 1},
			"docs":  bson.M{"$push": "$$ROOT"},
		}},
		{"$match": bson.M{"count": bson.M{"$gt": 1}}},
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var result struct {
			ID    string   `bson:"_id"`
			Count int      `bson:"count"`
			Docs  []bson.M `bson:"docs"`
		}

		if err := cursor.Decode(&result); err != nil {
			continue
		}

		fmt.Printf("🏷️ %s duplicado encontrado: %s (%d copias)\n", fieldName, result.ID, result.Count)

		// Keep the first document, delete the rest
		for i := 1; i < len(result.Docs); i++ {
			doc := result.Docs[i]
			if id, ok := doc["_id"]; ok {
				_, err := collection.DeleteOne(context.Background(), bson.M{"_id": id})
				if err != nil {
					log.Printf("Error deleting duplicate profile: %v", err)
				} else {
					fmt.Printf("   🗑️ Eliminado perfil duplicado con ID: %v\n", id)
				}
			}
		}
	}

	return nil
}

func cleanDuplicateExpedientes(db *mongo.Database) error {
	collection := db.Collection("expedientes")

	// Find duplicate numeros
	pipeline := []bson.M{
		{"$group": bson.M{
			"_id":   "$numero",
			"count": bson.M{"$sum": 1},
			"docs":  bson.M{"$push": "$$ROOT"},
		}},
		{"$match": bson.M{"count": bson.M{"$gt": 1}}},
	}

	cursor, err := collection.Aggregate(context.Background(), pipeline)
	if err != nil {
		return err
	}
	defer cursor.Close(context.Background())

	for cursor.Next(context.Background()) {
		var result struct {
			ID    string   `bson:"_id"`
			Count int      `bson:"count"`
			Docs  []bson.M `bson:"docs"`
		}

		if err := cursor.Decode(&result); err != nil {
			continue
		}

		fmt.Printf("📄 Número de expediente duplicado: %s (%d copias)\n", result.ID, result.Count)

		// Keep the first document, delete the rest
		for i := 1; i < len(result.Docs); i++ {
			doc := result.Docs[i]
			if id, ok := doc["_id"]; ok {
				_, err := collection.DeleteOne(context.Background(), bson.M{"_id": id})
				if err != nil {
					log.Printf("Error deleting duplicate expediente: %v", err)
				} else {
					fmt.Printf("   🗑️ Eliminado expediente duplicado con ID: %v\n", id)
				}
			}
		}
	}

	return nil
}
