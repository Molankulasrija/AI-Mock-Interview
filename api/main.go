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
)

func init() {
	if os.Getenv("GEMINI_API_KEY") == "" {
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

	app.Get("/api/get-questions", func(c *fiber.Ctx) error {
		data, err := os.ReadFile("Questions.txt")
		if err != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Questions not found. Please upload a resume first."})
		}
		
		lines := strings.Split(string(data), "\n")
		var questions []string
		for _, line := range lines {
			trimmed := strings.TrimSpace(line)
			if trimmed != "" {
				questions = append(questions, trimmed)
			}
		}
		return c.JSON(fiber.Map{"status": "success", "questions": questions})
	})

	app.Post("/api/save-answers", func(c *fiber.Ctx) error {
		type AnswerPayload struct {
			Answers []string `json:"answers"`
		}
		var payload AnswerPayload
		if err := c.BodyParser(&payload); err != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Invalid "})
		}

		file, err := os.Create("Answers.txt")
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to create Answers.txt"})
		}
		defer file.Close()

		for i, ans := range payload.Answers {
			file.WriteString(fmt.Sprintf("Question %d Answer:\n%s\n\n", i+1, ans))
		}

		log.Println("Successfully saved user responses to Answers.txt!")
		return c.JSON(fiber.Map{"status": "success"})
	})

	app.Get("/api/evaluate-interview", func(c *fiber.Ctx) error {
		qData, errQ := os.ReadFile("Questions.txt")
		aData, errA := os.ReadFile("Answers.txt")
		
		if errQ != nil || errA != nil {
			return c.Status(400).JSON(fiber.Map{"error": "Could not find interview data. Make sure you completed the interview."})
		}

		ctx := context.Background()
		client, err := genai.NewClient(ctx, option.WithAPIKey(os.Getenv("GEMINI_API_KEY")))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Failed to initialize Gemini Client"})
		}
		defer client.Close()

		model := client.GenerativeModel("gemini-2.5-flash")
		model.ResponseMIMEType = "application/json"
		
		prompt := fmt.Sprintf(`
		You are a strict but fair Senior Staff Software Engineer evaluating a candidate's technical interview.
		Review the questions asked and the candidate's answers below.
		
		You MUST return ONLY a raw JSON object matching this EXACT structure. Do not use markdown blocks.
		{
			"overall_score": <number between 0 and 100>,
			"strengths": ["<string>", "<string>"],
			"improvements": ["<string>", "<string>"],
			"feedback": [
				{
					"question": "<string>", 
					"score": <number out of 10>, 
					"analysis": "<short explanation of what they got right/wrong>"
				}
			]
		}
		
		Questions:
		%s
		
		Answers:
		%s`, string(qData), string(aData))

		genaiResp, err := model.GenerateContent(ctx, genai.Text(prompt))
		if err != nil {
			return c.Status(500).JSON(fiber.Map{"error": "Gemini grading failed"})
		}

		var aiResponse string
		// 🔥 The correct index is applied here
		if len(genaiResp.Candidates) > 0 && genaiResp.Candidates[0].Content != nil {
			for _, part := range genaiResp.Candidates[0].Content.Parts {
				aiResponse += fmt.Sprintf("%v", part)
			}
		}

		aiResponse = strings.TrimPrefix(aiResponse, "```json")
		aiResponse = strings.TrimSuffix(aiResponse, "```")
		aiResponse = strings.TrimSpace(aiResponse)

		var result map[string]interface{}
		if err := json.Unmarshal([]byte(aiResponse), &result); err != nil {
			log.Printf("JSON Parse Error: %s", aiResponse)
			return c.Status(500).JSON(fiber.Map{"error": "Failed to parse AI grading JSON"})
		}

		return c.JSON(fiber.Map{
			"status": "success",
			"analytics": result,
		})
	})

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

	model := client.GenerativeModel("gemini-2.5-flash")
	model.ResponseMIMEType = "application/json"

	prompt := fmt.Sprintf(`
	You are an expert technical interviewer evaluating a candidate.
	Analyze the following resume text and generate 5 highly technical interview questions based strictly on the candidate's stated experience. 
	Focus heavily on probing their understanding of low-level systems, hardware-software bridging, memory management (C/C++), or scalable infrastructure/DevOps workflows if present in their profile.
	
	You must return the output ONLY as a raw JSON array of strings. Do not include markdown blocks or conversational text.
	
	Resume Text:
	%s`, resumeText)

	genaiResp, err := model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Gemini generation failed"})
	}

	var aiResponse string
	// 🔥 The correct index is applied here
	if len(genaiResp.Candidates) > 0 && genaiResp.Candidates[0].Content != nil {
		for _, part := range genaiResp.Candidates[0].Content.Parts {
			if text, ok := part.(genai.Text); ok {
				aiResponse += string(text)
			}
		}
	} else {
		return c.Status(500).JSON(fiber.Map{"error": "AI returned empty response"})
	}

	start := strings.Index(aiResponse, "[")
	end := strings.LastIndex(aiResponse, "]")

	if start != -1 && end != -1 && start < end {
		aiResponse = aiResponse[start : end+1]
	} else {
		log.Printf("Failed to find JSON array. Raw response: %s", aiResponse)
		return c.Status(500).JSON(fiber.Map{"error": "AI response did not contain a valid array"})
	}

	var questions []string
	if err := json.Unmarshal([]byte(aiResponse), &questions); err != nil {
		log.Printf("JSON Parse Error. Cleaned string was: %s", aiResponse)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to parse Gemini output into JSON array"})
	}

	file, err := os.Create("Questions.txt")
	if err != nil {
		log.Printf("Failed to create file: %v", err)
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create Questions.txt"})
	}
	defer file.Close()

	for i, question := range questions {
		line := fmt.Sprintf("%d. %s\n\n", i+1, question)
		if _, err := file.WriteString(line); err != nil {
			log.Printf("Failed to write to file: %v", err)
		}
	}
	
	log.Println("Successfully saved 5 questions to Questions.txt!")

	return c.JSON(fiber.Map{
		"status":    "success",
		"message":   "Questions generated and saved to Questions.txt",
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