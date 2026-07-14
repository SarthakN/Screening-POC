import { getPrompts, interpolate } from './prompts'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'your', 'our', 'are', 'will', 'this', 'that',
  'from', 'have', 'has', 'into', 'role', 'job', 'work', 'team', 'teams', 'candidate',
  'candidates', 'ability', 'required', 'preferred', 'responsibilities', 'requirements',
])

function tokenize(text = '') {
  return new Set(
    String(text)
      .toLowerCase()
      .replace(/[^a-z0-9+#.]+/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1 && !STOP_WORDS.has(token))
  )
}

function overlapScore(sourceTokens, text) {
  const targetTokens = tokenize(text)
  if (!sourceTokens.size || !targetTokens.size) return 0
  let score = 0
  for (const token of targetTokens) {
    if (sourceTokens.has(token)) score += 1
  }
  return score
}

function getCriteriaSearchText(criteria) {
  const critical = criteria?.requirements ?? []
  const additional = criteria?.additionalRequirements ?? []
  return [
    ...critical.flatMap(item => [item.criticalRequirement, item.evaluationGuideline]),
    ...additional.flatMap(item => [
      item.additionalRequirement,
      item.strongfitguideline,
      item.partialfitguideline,
    ]),
  ].filter(Boolean).join(' ')
}

function hasCriteria(criteria) {
  return Boolean((criteria?.requirements?.length ?? 0) || (criteria?.additionalRequirements?.length ?? 0))
}

function hasConfiguredApiKey() {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  return Boolean(apiKey && apiKey !== 'your_openai_api_key_here')
}

function firstMeaningfulTokens(text, max = 4) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]+/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 1 && !STOP_WORDS.has(token))
    .slice(0, max)
}

function briefGuideline(requirement, prefix) {
  const tokens = firstMeaningfulTokens(requirement)
  if (!tokens.length) return null
  return `${prefix} ${tokens.join(' ')}`
}

function isRequirementMentioned(requirement, descriptionTokens) {
  const reqTokens = tokenize(requirement)
  if (!reqTokens.size || !descriptionTokens.size) return false
  let overlap = 0
  for (const token of reqTokens) {
    if (descriptionTokens.has(token)) overlap += 1
  }
  const ratio = overlap / reqTokens.size
  return ratio >= 0.5 || overlap >= 2
}

function buildLocalCriteria(job) {
  const descriptionTokens = tokenize(job?.description || '')
  const criticalRequirements = job?.criticalRequirements || []
  const additionalRequirements = job?.additionalRequirements || []

  return {
    requirements: criticalRequirements.map(tag => {
      const mentioned = isRequirementMentioned(tag.value, descriptionTokens)
      return {
        criticalRequirement: tag.value,
        mentionedInJobDescription: mentioned,
        evaluationGuideline: briefGuideline(tag.value, mentioned ? 'Evidence of' : 'Relevant'),
      }
    }),
    additionalRequirements: additionalRequirements.map(tag => {
      const mentioned = isRequirementMentioned(tag.value, descriptionTokens)
      return {
        additionalRequirement: tag.value,
        mentionedInJobDescription: mentioned,
        strongfitguideline: briefGuideline(tag.value, mentioned ? 'Strong evidence of' : 'Direct evidence of'),
        partialfitguideline: briefGuideline(tag.value, 'Basic evidence of'),
      }
    }),
  }
}

function uniqByLower(items = []) {
  const seen = new Set()
  const out = []
  for (const item of items) {
    const key = String(item ?? '').trim().toLowerCase()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(String(item).trim())
  }
  return out
}

function normalizeCriteriaPayload(payload) {
  return {
    requirements: (payload?.requirements ?? [])
      .map(item => ({
        criticalRequirement: String(item?.criticalRequirement ?? '').trim(),
        mentionedInJobDescription: Boolean(item?.mentionedInJobDescription),
        evaluationGuideline: item?.evaluationGuideline ?? '',
      }))
      .filter(item => item.criticalRequirement),
    additionalRequirements: (payload?.additionalRequirements ?? [])
      .map(item => ({
        additionalRequirement: String(item?.additionalRequirement ?? '').trim(),
        mentionedInJobDescription: Boolean(item?.mentionedInJobDescription),
        strongfitguideline: item?.strongfitguideline ?? '',
        partialfitguideline: item?.partialfitguideline ?? '',
      }))
      .filter(item => item.additionalRequirement),
  }
}

function buildLocalInferredCriteria(job) {
  const descriptionTokens = tokenize(job?.description || '')
  const title = String(job?.title || '').trim()

  const eligibilitySeed = uniqByLower([
    title ? `${title} role experience` : null,
    'Role-relevant experience',
    'Core technical proficiency',
    'Communication and collaboration skills',
    'Problem-solving capability',
  ])

  const additionalSeed = uniqByLower([
    'Leadership and ownership',
    'Adaptability to changing priorities',
    'Stakeholder collaboration',
    'Process improvement mindset',
  ])

  return {
    requirements: eligibilitySeed.map(req => ({
      criticalRequirement: req,
      mentionedInJobDescription: isRequirementMentioned(req, descriptionTokens),
      evaluationGuideline: briefGuideline(req, 'Evidence of') ?? 'Relevant role evidence',
    })),
    additionalRequirements: additionalSeed.map(req => ({
      additionalRequirement: req,
      mentionedInJobDescription: isRequirementMentioned(req, descriptionTokens),
      strongfitguideline: briefGuideline(req, 'Strong evidence of') ?? 'Strong evidence in application',
      partialfitguideline: briefGuideline(req, 'Basic evidence of') ?? 'Basic evidence in application',
    })),
  }
}

async function generateCriteriaFromDescription(job, model) {
  if (!hasConfiguredApiKey()) {
    return buildLocalInferredCriteria(job)
  }

  const systemMsg = 'You are an expert job description analyst. Return valid JSON only.'
  const userMsg = `Job Title:\n${job.title}\n\nJob Description:\n${job.description}\n\nTask:\nInfer screening criteria from the job description and categorize them into two groups:\n1) Eligibility Requirements (minimum qualifications)\n2) Additional Requirements (preferred qualifications)\n\nRules:\n- Return 4 to 8 eligibility requirements and 3 to 7 additional requirements.\n- Requirements must be short keyword-like phrases (2-8 words).\n- Add mentionedInJobDescription = true/false based on evidence in the description.\n- For each eligibility item, provide evaluationGuideline (4-8 words).\n- For each additional item, provide strongfitguideline and partialfitguideline (each 4-8 words).\n- Guidelines must be assessable from written applications only.\n- No markdown, no explanation. JSON only.\n\nOutput shape:\n{\n  "requirements": [{ "criticalRequirement": "string", "mentionedInJobDescription": true, "evaluationGuideline": "string" }],\n  "additionalRequirements": [{ "additionalRequirement": "string", "mentionedInJobDescription": true, "strongfitguideline": "string", "partialfitguideline": "string" }]\n}`

  const raw = await callLLM(model, systemMsg, userMsg)
  return normalizeCriteriaPayload(JSON.parse(stripFences(raw)))
}

function scoreRequirementEvidence(requirement, applicationTokens) {
  const requirementTokens = tokenize(requirement)
  if (!requirementTokens.size) return 0
  let overlap = 0
  for (const token of requirementTokens) {
    if (applicationTokens.has(token)) overlap += 1
  }
  return overlap / requirementTokens.size
}

function buildLocalRecommendation(applicationText, job, criteria) {
  const applicationTokens = tokenize(applicationText || '')
  const criticalItems = criteria?.requirements ?? (job?.criticalRequirements || []).map(tag => ({
    criticalRequirement: tag.value,
    evaluationGuideline: null,
  }))
  const additionalItems = criteria?.additionalRequirements ?? (job?.additionalRequirements || []).map(tag => ({
    additionalRequirement: tag.value,
    strongfitguideline: null,
    partialfitguideline: null,
  }))

  const criticalFit = criticalItems.map(item => {
    const requirement = item.criticalRequirement
    const score = scoreRequirementEvidence(requirement, applicationTokens)
    const met = score >= 0.34 || (applicationTokens.size > 0 && score >= 0.2)
    return {
      requirement,
      fit: met ? 'met' : 'not_met',
      reasoning: met
        ? 'Application includes evidence related to this requirement.'
        : 'Application does not provide clear evidence for this requirement.',
    }
  })

  const additionalFit = additionalItems.map(item => {
    const requirement = item.additionalRequirement
    const score = scoreRequirementEvidence(requirement, applicationTokens)
    let fit = 'none'
    if (score >= 0.5) fit = 'strong'
    else if (score >= 0.2) fit = 'partial'
    return {
      requirement,
      fit,
      reasoning:
        fit === 'strong'
          ? 'Application strongly demonstrates this additional requirement.'
          : fit === 'partial'
            ? 'Application shows partial evidence for this additional requirement.'
            : 'No clear evidence found for this additional requirement.',
    }
  })

  const metCritical = criticalFit.filter(item => item.fit === 'met').length
  const strongAdditional = additionalFit.filter(item => item.fit === 'strong').length
  const partialAdditional = additionalFit.filter(item => item.fit === 'partial').length

  let overallRecommendation = 'no_fit'
  if (criticalFit.length === 0 || metCritical === criticalFit.length) {
    overallRecommendation = strongAdditional > 0 || partialAdditional > 0 ? 'strong_fit' : 'partial_fit'
  } else if (metCritical > 0) {
    overallRecommendation = 'partial_fit'
  }

  const summary =
    overallRecommendation === 'strong_fit'
      ? 'Candidate meets core qualifications and shows strong evidence across additional requirements.'
      : overallRecommendation === 'partial_fit'
        ? 'Candidate shows partial alignment with the role based on the application content.'
        : 'Candidate does not currently show enough evidence for key role requirements.'

  return {
    overallRecommendation,
    summary,
    criticalFit,
    additionalFit,
  }
}

function shortlistPreviousJobs(job, jobs, evaluationResults) {
  const sourceTokens = tokenize(`${job.title} ${job.description}`)
  return jobs
    .map(previousJob => {
      const criteria = evaluationResults[previousJob.id]
      if (!hasCriteria(criteria)) return null
      const text = `${previousJob.title} ${previousJob.description} ${getCriteriaSearchText(criteria)}`
      const score = overlapScore(sourceTokens, text)
      return score > 0 ? { job: previousJob, criteria, score } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}

function copyCriteriaSet(criteria) {
  return {
    requirements: (criteria?.requirements ?? []).map(item => ({
      criticalRequirement: item.criticalRequirement,
      mentionedInJobDescription: item.mentionedInJobDescription ?? true,
      evaluationGuideline: item.evaluationGuideline ?? null,
    })).filter(item => item.criticalRequirement),
    additionalRequirements: (criteria?.additionalRequirements ?? []).map(item => ({
      additionalRequirement: item.additionalRequirement,
      mentionedInJobDescription: item.mentionedInJobDescription ?? true,
      strongfitguideline: item.strongfitguideline ?? null,
      partialfitguideline: item.partialfitguideline ?? null,
    })).filter(item => item.additionalRequirement),
  }
}

async function callLLM(model, systemMsg, userMsg) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key is not configured. Set VITE_OPENAI_API_KEY in your .env file.')
  }
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemMsg },
        { role: 'user', content: userMsg },
      ],
    }),
  })
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }
  const data = await response.json()
  return (data.choices?.[0]?.message?.content ?? '').trim()
}

function stripFences(raw) {
  return raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
}

function buildPrompt(job) {
  const additional = job.additionalRequirements || []

  return `You are an expert job description analyst.

Task:
Analyze the job description against the Critical Requirements and Additional Requirements listed below.

STRICT RULE: Each output array must contain ONLY the exact keywords provided in the input lists — one entry per keyword, in the same order. Do NOT add, infer, merge, or omit any keyword.

For each Critical Requirement keyword:
1. Identify whether the job description mentions a requirement related to that keyword. Set mentionedInJobDescription to true or false accordingly.
2. Always write a short evaluation guideline — if mentioned in the JD, base it strictly on the JD; if not mentioned, infer a reasonable guideline from the general job context and role.

For each Additional Requirement keyword:
1. Identify whether the job description mentions a requirement related to that keyword. Set mentionedInJobDescription to true or false accordingly.
2. Always write two evaluation guidelines — if mentioned in the JD, base them strictly on the JD; if not mentioned, infer reasonable guidelines from the general job context and role:
   - strongfitguideline: what a strong-fit candidate's written application would demonstrate
   - partialfitguideline: what a partial-fit candidate's written application would demonstrate

Guidelines (apply to all):
- Base the evaluation guideline strictly on what the job description states.
- Important - Evaluation guidelines must be short (4–8 words). This is absolutely critical to ensure they are actionable for recruiters and not vague or generic.
- Do not include full sentences starting with “The candidate must” — write noun phrases or brief conditions instead.
- Do not include detailed specifics such as exact years, degree names, tools, or technologies unless the job description explicitly requires them.
- Return the output in valid JSON only.
- Evaluability check: for each requirement, ask — can this be assessed from a written application (resume, cover letter, written answers)? If the requirement relies on in-person observation, physical assessment, personality judgement, or cannot be inferred from text alone, set evaluationGuideline to null.
- If location keyword is a requirement, extract the job posting location from description and set 1. Minimum qualification as "Current location in {district}" 2. Additional qualification as Strong - "Current location in {district}" Partial - "Current location in {state}"

Input:

Job Title:
${job.title}

Job Description:
${job.description}

Critical Requirements (minimum qualifications) — ${job.criticalRequirements.length} item(s):
${job.criticalRequirements.map(t => `- ${t.value}`).join('\n') || '- None specified'}

Additional Requirements — ${additional.length} item(s):
${additional.length ? additional.map(t => `- ${t.value}`).join('\n') : '- None specified'}

Output JSON format (requirements array must have exactly ${job.criticalRequirements.length} item(s); additionalRequirements array must have exactly ${additional.length} item(s)):
{
  "requirements": [
    {
      "criticalRequirement": "string",
      "mentionedInJobDescription": true,
      "evaluationGuideline": "string or null"
    }
  ],
  "additionalRequirements": [
    {
      "additionalRequirement": "string",
      "mentionedInJobDescription": true,
      "strongfitguideline": "string or null",
      "partialfitguideline": "string or null"
    }
  ]
}`
}

export async function generateEvaluationCriteria(job, model) {
  model = model || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o'
  const hasManualRequirements = Boolean((job?.criticalRequirements?.length ?? 0) || (job?.additionalRequirements?.length ?? 0))

  if (!hasManualRequirements) {
    return generateCriteriaFromDescription(job, model)
  }

  if (!hasConfiguredApiKey()) {
    return buildLocalCriteria(job)
  }
  const additional = job.additionalRequirements || []
  const p = getPrompts().evaluationCriteria
  const vars = {
    title: job.title,
    description: job.description,
    criticalCount: job.criticalRequirements.length,
    criticalRequirements: job.criticalRequirements.map(t => `- ${t.value}`).join('\n') || '- None specified',
    additionalCount: additional.length,
    additionalRequirements: additional.length ? additional.map(t => `- ${t.value}`).join('\n') : '- None specified',
  }
  const raw = await callLLM(model, interpolate(p.system, vars), interpolate(p.user, vars))
  try {
    return normalizeCriteriaPayload(JSON.parse(stripFences(raw)))
  } catch {
    throw new Error('LLM returned invalid JSON. Try again.')
  }
}

export async function generateEvaluationGuideline(job, requirement, model) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  model = model || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o'

  if (!apiKey || apiKey === 'your_openai_api_key_here') {
    throw new Error('OpenAI API key is not configured. Set VITE_OPENAI_API_KEY in your .env file.')
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You are a recruitment evaluation expert. Write a short evaluation guideline only — a brief phrase or condition a recruiter uses to assess a written application. No full sentences starting with "The candidate must", no leading verbs, no punctuation at the end, no extra text.',
        },
        {
          role: 'user',
          content: `Job Title: ${job.title}

Job Description:
${job.description}

Requirement keyword: "${requirement}"

Based only on the job description, write a short evaluation guideline (4–8 words) for the "${requirement}" requirement that a recruiter can use to assess a written application. Examples of the correct format: "Prior experience within Anne Arundel County Public Schools", "Bachelor’s degree in Computer Science or related field", "3+ years managing cross-functional teams".

Before responding, apply this evaluability check: can this requirement be assessed from a written application (resume, cover letter, written answers)? If it relies on in-person observation, physical assessment, or cannot be inferred from text alone, respond with exactly: NOT_EVALUABLE`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || `API error ${response.status}`)
  }

  const data = await response.json()
  const text = (data.choices?.[0]?.message?.content ?? '').trim()
  if (text === 'NOT_EVALUABLE') return null
  return text
}

export async function generateAdditionalGuideline(job, requirement, model) {
  model = model || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o'
  const p = getPrompts().additionalGuideline
  const vars = { title: job.title, description: job.description, requirement }
  const raw = await callLLM(model, interpolate(p.system, vars), interpolate(p.user, vars))
  return JSON.parse(stripFences(raw))
}

export async function generateSkillSuggestions(jobTitle, jobDescription, model) {
  model = model || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o'
  const p = getPrompts().skillSuggestions
  const vars = { title: jobTitle, description: jobDescription }
  const raw = await callLLM(model, interpolate(p.system, vars), interpolate(p.user, vars))
  const parsed = JSON.parse(stripFences(raw))
  return parsed.skills ?? []
}

export function findSimilarCriteriaJobs(job, jobs, evaluationResults) {
  return shortlistPreviousJobs(job, jobs, evaluationResults).map(match => ({
    job: match.job,
    score: match.score,
    criteria: copyCriteriaSet(match.criteria),
  }))
}

export async function generateReusableCriteria(job, jobs, evaluationResults) {
  const matches = findSimilarCriteriaJobs(job, jobs, evaluationResults)
  return matches[0]?.criteria ?? { requirements: [], additionalRequirements: [] }
}

export async function generateRecommendation(applicationText, job, criteria, model) {
  model = model || import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o'
  if (!hasConfiguredApiKey()) {
    return buildLocalRecommendation(applicationText, job, criteria)
  }

  const criticalItems = criteria?.requirements ?? job.criticalRequirements.map(t => ({
    criticalRequirement: t.value,
    evaluationGuideline: null,
  }))

  const additionalItems = criteria?.additionalRequirements ?? (job.additionalRequirements || []).map(t => ({
    additionalRequirement: t.value,
    strongfitguideline: null,
    partialfitguideline: null,
  }))

  const criticalList = criticalItems.map((item, i) => {
    const guide = item.evaluationGuideline ? ` — Guideline: "${item.evaluationGuideline}"` : ''
    return `${i + 1}. ${item.criticalRequirement}${guide}`
  }).join('\n') || '- None specified'

  const additionalList = additionalItems.map((item, i) => {
    const strong = item.strongfitguideline ? `\n   Strong fit: "${item.strongfitguideline}"` : ''
    const partial = item.partialfitguideline ? `\n   Partial fit: "${item.partialfitguideline}"` : ''
    return `${i + 1}. ${item.additionalRequirement}${strong}${partial}`
  }).join('\n') || '- None specified'

  const p = getPrompts().recommendation
  const vars = {
    title: job.title,
    applicationText,
    criticalList,
    criticalCount: criticalItems.length,
    additionalList,
    additionalCount: additionalItems.length,
  }
  const raw = await callLLM(model, interpolate(p.system, vars), interpolate(p.user, vars))
  return JSON.parse(stripFences(raw))
}
