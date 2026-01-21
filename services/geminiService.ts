
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PositionLevel, CodingQuestion, MCQQuestion, Exam, UserAnswer, RunResult, SectionType } from "../types";
import { LEVEL_DNA } from "../constants";

// Initialize the Google GenAI client using a named parameter and environment variable.
const apiKey = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const safeParseJson = (text: string | undefined, fallbackName: string) => {
  if (!text) throw new Error(`Empty response for ${fallbackName}`);
  try {
    // Remove any markdown blocks that might wrap the JSON
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Parse Error:", e, text);
    throw new Error(`Invalid JSON structure in ${fallbackName}. The model provided a malformed response.`);
  }
};

const checkApiKey = () => {
  if (!apiKey || apiKey === 'your_gemini_api_key' || apiKey === '') {
    throw new Error("Gemini API Key is missing. Please add API_KEY to your .env file.");
  }
};

export const geminiService = {
  async generateCompleteAssessment(company: string, role: string, level: PositionLevel): Promise<Exam> {
    checkApiKey();
    const dna = LEVEL_DNA[level];
    const prompt = `
      ACT AS A SENIOR RECRUITMENT ARCHITECT FOR ${company}. 
      GENERATE A PROFESSIONAL MULTI-SECTION EXAM FOR THE ${role} ROLE AT ${level} LEVEL.
      
      DIFFICULTY TARGETS (DNA SCALING):
      - Very Easy: ${dna.difficulty.veryEasy}%
      - Easy: ${dna.difficulty.easy}%
      - Medium: ${dna.difficulty.medium}%
      - Hard: ${dna.difficulty.hard}%
      - Very Hard: ${dna.difficulty.veryHard}%
      - Ultra Hard: ${dna.difficulty.ultraHard}%

      MANDATORY REQUIREMENTS:
      - EXACTLY 2 (TWO) CODING QUESTIONS.
      - 5 TECHNICAL MCQS, 5 QUANTITATIVE, 5 REASONING.
      - Return a valid JSON object strictly following the schema. Do not include any text outside the JSON.
    `;

    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sections: {
                type: Type.OBJECT,
                properties: {
                  technical: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        question: {type: Type.STRING}, 
                        options: {type: Type.ARRAY, items: {type: Type.STRING}}, 
                        correctAnswer: {type: Type.INTEGER}, 
                        explanation: {type: Type.STRING}, 
                        topic: {type: Type.STRING} 
                      }, 
                      required: ["question", "options", "correctAnswer", "explanation"] 
                    } 
                  },
                  coding: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        title: {type: Type.STRING}, 
                        problem: {type: Type.STRING}, 
                        constraints: {type: Type.STRING}, 
                        starterCodes: { 
                          type: Type.OBJECT,
                          properties: {
                            javascript: { type: Type.STRING },
                            python: { type: Type.STRING },
                            java: { type: Type.STRING },
                            cpp: { type: Type.STRING }
                          }
                        }, 
                        samples: { 
                          type: Type.ARRAY, 
                          items: { 
                            type: Type.OBJECT, 
                            properties: { 
                              input: {type: Type.STRING}, 
                              output: {type: Type.STRING},
                              explanation: {type: Type.STRING}
                            }
                          } 
                        }, 
                        hidden_tests: { 
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              input: { type: Type.STRING },
                              output: { type: Type.STRING }
                            }
                          }
                        }, 
                        solution_code: {type: Type.STRING}, 
                        solution_explanation: {type: Type.STRING}, 
                        difficulty: {type: Type.STRING}, 
                        topic: {type: Type.STRING} 
                      }
                    } 
                  },
                  quantitative: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        question: {type: Type.STRING}, 
                        options: {type: Type.ARRAY, items: {type: Type.STRING}}, 
                        correctAnswer: {type: Type.INTEGER},
                        explanation: {type: Type.STRING}
                      }
                    } 
                  },
                  reasoning: { 
                    type: Type.ARRAY, 
                    items: { 
                      type: Type.OBJECT, 
                      properties: { 
                        question: {type: Type.STRING}, 
                        options: {type: Type.ARRAY, items: {type: Type.STRING}}, 
                        correctAnswer: {type: Type.INTEGER},
                        explanation: {type: Type.STRING}
                      }
                    } 
                  }
                },
                required: ["technical", "coding", "quantitative", "reasoning"]
              },
              timeMinutes: { type: Type.NUMBER },
              inference: { 
                type: Type.OBJECT, 
                properties: { 
                  vibe: {type: Type.STRING}, 
                  predictedTopics: {type: Type.ARRAY, items: {type: Type.STRING}}, 
                  confidence: {type: Type.STRING}, 
                  category: {type: Type.STRING},
                  assumptions: {type: Type.ARRAY, items: {type: Type.STRING}},
                  includesAptitude: {type: Type.BOOLEAN}
                }
              }
            },
            required: ["sections", "timeMinutes"]
          }
        }
      });

      const parsed = safeParseJson(response.text, "Exam Synthesis");
      const addIds = (list: any[], section: SectionType) => (list || []).map(item => ({ ...item, id: crypto.randomUUID(), section }));

      return {
        id: crypto.randomUUID(),
        company, role, level,
        sections: {
          technical: addIds(parsed.sections.technical, 'Technical'),
          coding: addIds(parsed.sections.coding, 'Coding'),
          quantitative: addIds(parsed.sections.quantitative, 'Quantitative'),
          reasoning: addIds(parsed.sections.reasoning, 'Reasoning')
        },
        timeMinutes: parsed.timeMinutes || 90,
        createdAt: Date.now(),
        inference: { ...parsed.inference, company, role, level }
      };
    } catch (e) {
      console.error(e);
      throw e;
    }
  },

  async generatePracticeSet(topic: string, difficulty: string): Promise<CodingQuestion[]> {
    checkApiKey();
    const prompt = `
      GENERATE A SET OF EXACTLY 5 (FIVE) UNIQUE PROBLEMS FOR TOPIC: "${topic}" AT ${difficulty} LEVEL.
      Return a JSON array of objects following the defined coding question schema.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              problem: { type: Type.STRING },
              constraints: { type: Type.STRING },
              starterCodes: {
                type: Type.OBJECT,
                properties: {
                  javascript: { type: Type.STRING },
                  python: { type: Type.STRING },
                  java: { type: Type.STRING },
                  cpp: { type: Type.STRING }
                }
              },
              samples: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    input: { type: Type.STRING },
                    output: { type: Type.STRING },
                    explanation: { type: Type.STRING }
                  }
                }
              },
              hidden_tests: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    input: { type: Type.STRING },
                    output: { type: Type.STRING }
                  }
                }
              },
              solution_code: { type: Type.STRING },
              solution_explanation: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              topic: { type: Type.STRING }
            },
            required: ["title", "problem", "starterCodes", "samples", "solution_code"]
          }
        }
      }
    });

    const parsed = safeParseJson(response.text, "Practice Set Synthesis");
    return parsed.map((q: any) => ({ ...q, id: crypto.randomUUID(), topic, difficulty }));
  },

  async runCodeAgainstTests(question: CodingQuestion, code: string, language: string): Promise<RunResult> {
    checkApiKey();
    const prompt = `
      JUDGE THE FOLLOWING CODE FOR THE PROBLEM: ${question.title}.
      CODE:
      ${code}
      
      EVALUATE AGAINST 15 TEST CASES. Return JSON with pass/fail and scores.
    `;
    
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              passed: { type: Type.BOOLEAN },
              score: { type: Type.NUMBER },
              testCaseResults: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    input: { type: Type.STRING },
                    expectedOutput: { type: Type.STRING },
                    actualOutput: { type: Type.STRING },
                    passed: { type: Type.BOOLEAN },
                    category: { type: Type.STRING },
                    isHidden: { type: Type.BOOLEAN }
                  }
                }
              }
            },
            required: ["passed", "score", "testCaseResults"]
          }
        }
      });
      return safeParseJson(response.text, "Code Judge");
    } catch (e) {
      return { passed: false, score: 0, testCaseResults: [] };
    }
  },

  async evaluateAnswers(exam: Exam, answers: Record<string, UserAnswer>): Promise<any> {
    checkApiKey();
    const prompt = `
      GRADE THE EXAM ANSWERS AGAINST THE EXAM METADATA.
      EXAM: ${JSON.stringify(exam)}
      ANSWERS: ${JSON.stringify(answers)}
    `;
    
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              totalScore: { type: Type.NUMBER },
              readinessScore: { type: Type.NUMBER },
              overallFeedback: { type: Type.STRING },
              sectionScores: {
                type: Type.OBJECT,
                properties: { 
                  technical: {type: Type.NUMBER}, 
                  coding: {type: Type.NUMBER}, 
                  quantitative: {type: Type.NUMBER}, 
                  reasoning: {type: Type.NUMBER} 
                }
              },
              evaluations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    questionId: { type: Type.STRING },
                    score: { type: Type.NUMBER },
                    feedback: { type: Type.STRING },
                    correctSolution: { type: Type.STRING },
                    passedCount: { type: Type.NUMBER },
                    totalCount: { type: Type.NUMBER }
                  }
                }
              }
            }
          }
        }
      });
      return safeParseJson(response.text, "Final Evaluation");
    } catch (e) {
      throw e;
    }
  }
};
