
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PositionLevel, CodingQuestion, MCQQuestion, Exam, UserAnswer, RunResult, SectionType } from "../types";
import { LEVEL_DNA } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeParseJson = (text: string | undefined, fallbackName: string) => {
  if (!text) throw new Error(`Empty response for ${fallbackName}`);
  try {
    const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.error("Parse Error:", e, text);
    throw new Error(`Invalid JSON in ${fallbackName}`);
  }
};

export const geminiService = {
  async generateCompleteAssessment(company: string, role: string, level: PositionLevel): Promise<Exam> {
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
      - Each section must strictly follow the difficulty tiers above.
      
      CODING SPECS:
      - Functional starter code for all major languages.
      - SOLUTION_CODE: Full, optimized SDE-level solution.
      - SAMPLES: At least 2 public test cases with detailed explanations.
      - CONSTRAINTS: Must be realistic and challenging for the level.
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
                          },
                          required: ["javascript", "python", "java", "cpp"]
                        }, 
                        samples: { 
                          type: Type.ARRAY, 
                          items: { 
                            type: Type.OBJECT, 
                            properties: { 
                              input: {type: Type.STRING}, 
                              output: {type: Type.STRING},
                              explanation: {type: Type.STRING}
                            },
                            required: ["input", "output", "explanation"]
                          } 
                        }, 
                        hidden_tests: { 
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              input: { type: Type.STRING },
                              output: { type: Type.STRING }
                            },
                            required: ["input", "output"]
                          }
                        }, 
                        solution_code: {type: Type.STRING}, 
                        solution_explanation: {type: Type.STRING}, 
                        difficulty: {type: Type.STRING}, 
                        topic: {type: Type.STRING} 
                      }, 
                      required: ["title", "problem", "starterCodes", "samples", "constraints", "solution_code", "solution_explanation"] 
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
                      },
                      required: ["question", "options", "correctAnswer", "explanation"]
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
                      },
                      required: ["question", "options", "correctAnswer", "explanation"]
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
                },
                required: ["vibe", "predictedTopics", "confidence", "category"]
              }
            },
            required: ["sections", "timeMinutes", "inference"]
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

  async runCodeAgainstTests(question: CodingQuestion, code: string, language: string): Promise<RunResult> {
    const prompt = `
      ULTRA-FAST CODE JUDGE. PROBLEM: ${question.title}.
      CODE:
      ${code}
      
      EVALUATE AGAINST 15 INTERNAL TEST CASES. 
      BE STRICT. 
      If code is empty or just boiler plate, all tests fail (Score 0).
      Provide expectedOutput and actualOutput for each case.
    `;
    
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
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
                  },
                  required: ["passed", "category", "expectedOutput", "actualOutput", "input"]
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
    const prompt = `
      ACT AS A BRUTAL COMPETITIVE EXAMINER. 
      TASK: GRADE THE EXAM ANSWERS AGAINST THE EXAM METADATA.
      
      CRITICAL SCORING PROTOCOL (STRICT ENFORCEMENT):
      1. MCQs (Technical, Quantitative, Reasoning):
         - IF User choice is NULL, EMPTY, or UNDEFINED: SCORE = 0.
         - IF User choice is WRONG: SCORE = 0.
         - NO PARTIAL CREDIT. If it's not perfect, it's 0.
      2. CODING:
         - IF User provided NO CODE or 'runResult' is missing: SCORE = 0.
         - OTHERWISE: USE THE EXACT 'runResult.score'.
      3. REFERENCE SOLUTIONS:
         - YOU MUST PROVIDE THE COMPLETE 'correctSolution' (full text or code) FOR EVERY SINGLE QUESTION.
         - For Coding, return the 'solution_code' exactly.
      
      GENERATE REPORT:
      - 'readinessScore' is the absolute average of all question scores.
      - If no answers provided, readinessScore MUST BE 0.
      
      DATA:
      EXAM: ${JSON.stringify(exam)}
      ANSWERS: ${JSON.stringify(answers)}
    `;
    
    try {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: 0 },
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
                },
                required: ["technical", "coding", "quantitative", "reasoning"]
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
                  },
                  required: ["questionId", "score", "feedback", "correctSolution"]
                }
              }
            },
            required: ["totalScore", "readinessScore", "overallFeedback", "sectionScores", "evaluations"]
          }
        }
      });
      return safeParseJson(response.text, "Final Evaluation");
    } catch (e) {
      throw e;
    }
  }
};
