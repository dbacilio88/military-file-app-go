package main

import (
	"context"
	"fmt"
	"log"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Fix() {
	// Connect to MongoDB
	client, err := mongo.Connect(context.Background(), options.Client().ApplyURI("mongodb://localhost:27017"))
	if err != nil {
		log.Fatal("Failed to connect to MongoDB:", err)
	}
	defer client.Disconnect(context.Background())

	db := client.Database("expedientes_db")

	fmt.Println("🧹 Eliminando datos duplicados específicos...")

	// Remove duplicate user with email "admin@tribunal.com"
	usersCollection := db.Collection("users")

	// Find all users with this email
	cursor, err := usersCollection.Find(context.Background(), bson.M{"email": "admin@tribunal.com"})
	if err != nil {
		log.Printf("Error finding duplicate users: %v", err)
	} else {
		var users []bson.M
		if err := cursor.All(context.Background(), &users); err == nil {
			fmt.Printf("📧 Encontrados %d usuarios con email admin@tribunal.com\n", len(users))

			// Keep only the first one, delete the rest
			for i := 1; i < len(users); i++ {
				if id, ok := users[i]["_id"]; ok {
					result, err := usersCollection.DeleteOne(context.Background(), bson.M{"_id": id})
					if err != nil {
						log.Printf("Error deleting user: %v", err)
					} else if result.DeletedCount > 0 {
						fmt.Printf("   🗑️ Eliminado usuario duplicado\n")
					}
				}
			}
		}
	}

	// Remove duplicate profile with slug "administrador-completo"
	profilesCollection := db.Collection("profiles")

	// Find all profiles with this slug
	cursor, err = profilesCollection.Find(context.Background(), bson.M{"slug": "administrador-completo"})
	if err != nil {
		log.Printf("Error finding duplicate profiles: %v", err)
	} else {
		var profiles []bson.M
		if err := cursor.All(context.Background(), &profiles); err == nil {
			fmt.Printf("🏷️ Encontrados %d perfiles con slug administrador-completo\n", len(profiles))

			// Keep only the first one, delete the rest
			for i := 1; i < len(profiles); i++ {
				if id, ok := profiles[i]["_id"]; ok {
					result, err := profilesCollection.DeleteOne(context.Background(), bson.M{"_id": id})
					if err != nil {
						log.Printf("Error deleting profile: %v", err)
					} else if result.DeletedCount > 0 {
						fmt.Printf("   🗑️ Eliminado perfil duplicado\n")
					}
				}
			}
		}
	}

	// Check for duplicate profile names
	pipeline := []bson.M{
		{"$group": bson.M{
			"_id":   "$name",
			"count": bson.M{"$sum": 1},
			"docs":  bson.M{"$push": "$$ROOT"},
		}},
		{"$match": bson.M{"count": bson.M{"$gt": 1}}},
	}

	cursor, err = profilesCollection.Aggregate(context.Background(), pipeline)
	if err != nil {
		log.Printf("Error finding duplicate profile names: %v", err)
	} else {
		for cursor.Next(context.Background()) {
			var result struct {
				ID    string   `bson:"_id"`
				Count int      `bson:"count"`
				Docs  []bson.M `bson:"docs"`
			}

			if err := cursor.Decode(&result); err != nil {
				continue
			}

			fmt.Printf("📛 Nombre de perfil duplicado: %s (%d copias)\n", result.ID, result.Count)

			// Keep only the first one, delete the rest
			for i := 1; i < len(result.Docs); i++ {
				doc := result.Docs[i]
				if id, ok := doc["_id"]; ok {
					deleteResult, err := profilesCollection.DeleteOne(context.Background(), bson.M{"_id": id})
					if err != nil {
						log.Printf("Error deleting duplicate profile name: %v", err)
					} else if deleteResult.DeletedCount > 0 {
						fmt.Printf("   🗑️ Eliminado perfil con nombre duplicado\n")
					}
				}
			}
		}
	}

	fmt.Println("✅ Limpieza completada")
}
