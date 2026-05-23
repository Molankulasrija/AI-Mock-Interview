package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/google/generative-ai-go/genai"
	"github.com/ledongthuc/pdf"
	"google.golang.org/api/option"
)

const (
	SupabaseURL = "https://qmbynnacdszzyacrifea.supabase.co"
	// GeminiAPIKey should be loaded from environment variable
)

func init() {
	// Load from environment; set a default if needed
	if os.Getenv("GEMINI_API_KEY") == "" {
		// You must set the GEMINI_API_KEY environment variable
		fmt.Println("Warning: GEMINI_API_KEY not set. Please set it before running.")
	}
}

func main() {
	app := fiber.New()

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:3000",
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Post("/api/analyze-resume", analyzeResumeHandler)

	log.Println("Go Server running on port 8080...")
	log.Fatal(app.Listen(":8080"))
}

func analyzeResumeHandler(c *fiber.Ctx) error {
	fileHeader, err := c.FormFile("resume")
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Failed to receive file from frontend"})
	}

	tempFile, err := os.CreateTemp("", "resume-*.pdf")
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create temp file"})
	}
	defer os.Remove(tempFile.Name())

	if err := c.SaveFile(fileHeader, tempFile.Name()); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to save file to disk"})
	}

	resumeText, err := extractTextFromPDF(tempFile.Name())
	if err != nil || resumeText == "" {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to parse text from PDF"})
	}

	ctx := context.Background()
	client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GEMINI_API_KEY")))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to initialize Gemini Client"})
	}
	defer client.Close()

	model := client.GenerativeModel("gemini-2.0-flash")

	prompt := fmt.Sprintf(`
	You are an expert technical interviewer evaluating a candidate.
	Analyze the following resume text and generate 5 highly technical interview questions based strictly on the candidate's stated experience. 
	Focus heavily on probing their understanding of low-level systems, hardware-software bridging, memory management (C/C++), or scalable infrastructure/DevOps workflows if present in their profile.
	
	You must return the output ONLY as a raw JSON array of strings. Do not include markdown blocks or conversational text.
	
	Resume Text:
	%s`, resumeText)

	genaiResp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		log.Printf("Gemini error: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": fmt.Sprintf("Gemini generation failed: %v", err)})
	}

	// Safely extract the response: marshal the whole response to JSON and
	// extract the first JSON array found (the model is instructed to return
	// a raw JSON array of strings).
	respBytes, err := json.Marshal(genaiResp)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to serialize Gemini response"})
	}
	respStr := string(respBytes)

	// find the first JSON array in the response string
	start := strings.Index(respStr, "[")
	if start == -1 {
		return c.Status(500).JSON(fiber.Map{"error": "AI returned no JSON array"})
	}
	// find matching closing bracket
	depth := 0
	end := -1
	for i := start; i < len(respStr); i++ {
		switch respStr[i] {
		case '[':
			depth++
		case ']':
			depth--
			if depth == 0 {
				end = i
				break
			}
		}
	}
	if end == -1 {
		return c.Status(500).JSON(fiber.Map{"error": "Malformed JSON array in AI response"})
	}

	aiResponse := respStr[start : end+1]
	aiResponse = strings.TrimSpace(aiResponse)

	var questions []string
	if err := json.Unmarshal([]byte(aiResponse), &questions); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to parse Gemini output into JSON array"})
	}

	return c.JSON(fiber.Map{
		"status":    "success",
		"questions": questions,
	})
}

func extractTextFromPDF(path string) (string, error) {
	f, r, err := pdf.Open(path)
	if err != nil {
		return "", err
	}
	defer f.Close()

	var buf bytes.Buffer
	b, err := r.GetPlainText()
	if err != nil {
		return "", err
	}
	buf.ReadFrom(b)
	return buf.String(), nil
}
