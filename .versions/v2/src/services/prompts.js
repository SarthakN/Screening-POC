const STORAGE_KEY = 'devmode_prompts'

export const DEFAULT_PROMPTS = {
  evaluationCriteria: {
    label: 'Evaluation Criteria',
    description: 'Generates structured evaluation criteria for each requirement in the job description.',
    variables: '{{title}}, {{description}}, {{criticalRequirements}}, {{criticalCount}}, {{additionalRequirements}}, {{additionalCount}}',
    system: 'You are an expert job description analyst.',
    user: 'Task:\nAnalyze the job description against the Critical Requirements and Additional Requirements listed below.\n\nSTRICT RULE: Each output array must contain ONLY the exact keywords provided in the input lists — one entry per keyword, in the same order. Do NOT add, infer, merge, or omit any keyword.\n\nFor each Critical Requirement keyword:\n1. Identify whether the job description mentions a requirement related to that keyword. Set mentionedInJobDescription to true or false accordingly.\n2. Always write a short evaluation guideline — if mentioned in the JD, base it strictly on the JD; if not mentioned, infer a reasonable guideline from the general job context and role.\n\nFor each Additional Requirement keyword:\n1. Identify whether the job description mentions a requirement related to that keyword. Set mentionedInJobDescription to true or false accordingly.\n2. Always write two evaluation guidelines — if mentioned in the JD, base them strictly on the JD; if not mentioned, infer reasonable guidelines from the general job context and role:\n   - strongfitguideline: what a strong-fit candidate\'s written application would demonstrate\n   - partialfitguideline: what a partial-fit candidate\'s written application would demonstrate\n\nGuidelines (apply to all):\n- Base the evaluation guideline strictly on what the job description states.\n- Important - Evaluation guidelines must be short (4–8 words). This is absolutely critical to ensure they are actionable for recruiters and not vague or generic.\n- Do not include full sentences starting with "The candidate must" — write noun phrases or brief conditions instead.\n- Do not include detailed specifics such as exact years, degree names, tools, or technologies unless the job description explicitly requires them.\n- Return the output in valid JSON only.\n- Evaluability check: for each requirement, ask — can this be assessed from a written application (resume, cover letter, written answers)? If the requirement relies on in-person observation, physical assessment, personality judgement, or cannot be inferred from text alone, set evaluationGuideline to null.\n- If location keyword is a requirement, extract the job posting location from description and set 1. Minimum qualification as "Current location in {district}" 2. Additional qualification as Strong - "Current location in {district}" Partial - "Current location in {state}"\n\nInput:\n\nJob Title:\n{{title}}\n\nJob Description:\n{{description}}\n\nCritical Requirements (minimum qualifications) — {{criticalCount}} item(s):\n{{criticalRequirements}}\n\nAdditional Requirements — {{additionalCount}} item(s):\n{{additionalRequirements}}\n\nOutput JSON format (requirements array must have exactly {{criticalCount}} item(s); additionalRequirements array must have exactly {{additionalCount}} item(s)):\n{\n  "requirements": [\n    {\n      "criticalRequirement": "string",\n      "mentionedInJobDescription": true,\n      "evaluationGuideline": "string or null"\n    }\n  ],\n  "additionalRequirements": [\n    {\n      "additionalRequirement": "string",\n      "mentionedInJobDescription": true,\n      "strongfitguideline": "string or null",\n      "partialfitguideline": "string or null"\n    }\n  ]\n}',
  },

  evaluationGuideline: {
    label: 'Evaluation Guideline (Assist)',
    description: 'Generates a single evaluation guideline for one critical requirement via the Assist button.',
    variables: '{{title}}, {{description}}, {{requirement}}',
    system: 'You are a recruitment evaluation expert. Write a short evaluation guideline only — a brief phrase or condition a recruiter uses to assess a written application. No full sentences, no leading verbs, no punctuation at the end, no extra text.',
    user: 'Job Title: {{title}}\n\nJob Description:\n{{description}}\n\nRequirement keyword: "{{requirement}}"\n\nBased only on the job description, write a short evaluation guideline (4–8 words) for the "{{requirement}}" requirement that a recruiter can use to assess a written application.\n\nBefore responding, apply this evaluability check: can this requirement be assessed from a written application (resume, cover letter, written answers)? If it relies on in-person observation, physical assessment, or cannot be inferred from text alone, respond with exactly: NOT_EVALUABLE',
  },

  additionalGuideline: {
    label: 'Additional Requirement Guideline (Assist)',
    description: 'Generates strong/partial fit guidelines for one additional requirement via the Assist button.',
    variables: '{{title}}, {{description}}, {{requirement}}',
    system: 'You are a recruitment evaluation expert. Respond with valid JSON only — no markdown, no extra text.',
    user: 'Job Title: {{title}}\n\nJob Description:\n{{description}}\n\nAdditional requirement keyword: "{{requirement}}"\n\n1. Identify whether the job description mentions a requirement related to "{{requirement}}".\n2. Write two short evaluation guidelines (4–8 words each):\n   - strongfitguideline: what a strong-fit candidate written application would demonstrate\n   - partialfitguideline: what a partial-fit candidate written application would demonstrate\n\nGuidelines:\n- Base strictly on what the job description states.\n- Short noun phrases or conditions only — no full sentences.\n- Evaluability check: if this cannot be assessed from a written application, set both fields to null.\n\nRespond with this JSON only:\n{ "partialfitguideline": "string or null", "strongfitguideline": "string or null" }',
  },

  skillSuggestions: {
    label: 'Skill Suggestions',
    description: 'Suggests relevant skills from the job description when the sparkle icon is clicked on the Skills tag.',
    variables: '{{title}}, {{description}}',
    system: 'You are a recruitment expert. Always respond with valid JSON only — no markdown, no explanation.',
    user: 'Job Title: {{title}}\n\nJob Description:\n{{description}}\n\nExtract the specific technical and professional skills mentioned or clearly implied by this job description. Return 6–12 concise skill keywords (e.g. "Python", "Project Management", "SQL").\n\nRespond with JSON only:\n{ "skills": ["string", ...] }',
  },

  recommendation: {
    label: 'Application Recommendation',
    description: "Evaluates a pasted application against the job's qualification criteria.",
    variables: '{{title}}, {{applicationText}}, {{criticalList}}, {{criticalCount}}, {{additionalList}}, {{additionalCount}}',
    system: 'You are a recruitment expert. Always respond with valid JSON only — no markdown, no explanation.',
    user: 'You are a recruitment expert evaluating a job application.\n\nJob Title: {{title}}\n\nAPPLICATION TEXT:\n{{applicationText}}\n\nMINIMUM QUALIFICATIONS ({{criticalCount}} item(s)):\n{{criticalList}}\n\nADDITIONAL REQUIREMENTS ({{additionalCount}} item(s)):\n{{additionalList}}\n\nInstructions:\n- For each Minimum Qualification, determine: "met" or "not_met".\n- For each Additional Requirement, determine: "strong", "partial", or "none".\n- Write 1–2 sentence reasoning based only on evidence in the application text.\n- Determine overall: "strong_fit", "partial_fit", or "no_fit".\n- Write a 1–2 sentence overall summary.\n\nRespond with valid JSON only:\n{ "overallRecommendation": "strong_fit|partial_fit|no_fit", "summary": "string", "criticalFit": [{ "requirement": "string", "fit": "met|not_met", "reasoning": "string" }], "additionalFit": [{ "requirement": "string", "fit": "strong|partial|none", "reasoning": "string" }] }\n\nSTRICT RULE: criticalFit must have exactly {{criticalCount}} item(s) and additionalFit must have exactly {{additionalCount}} item(s), in the same order as the input lists.',
  },
}

let _cache = null

export function getPrompts() {
  if (_cache) return _cache
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      const merged = {}
      for (const key of Object.keys(DEFAULT_PROMPTS)) {
        merged[key] = { ...DEFAULT_PROMPTS[key], ...(parsed[key] ?? {}) }
      }
      _cache = merged
      return _cache
    }
  } catch {}
  _cache = JSON.parse(JSON.stringify(DEFAULT_PROMPTS))
  return _cache
}

export function savePrompts(prompts) {
  _cache = prompts
  const toStore = {}
  for (const [key, val] of Object.entries(prompts)) {
    toStore[key] = { system: val.system, user: val.user }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore))
}

export function resetPrompts() {
  _cache = null
  localStorage.removeItem(STORAGE_KEY)
  return JSON.parse(JSON.stringify(DEFAULT_PROMPTS))
}

export function interpolate(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? ''))
}
