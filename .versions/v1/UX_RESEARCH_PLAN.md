# UX Research Plan: Evaluation and Scoring Demo

## Why we are doing this
The team has a cold-start problem: we do not yet know the best way to implement evaluation and scoring logic with LLMs. The goal of this research is to use customer demos to learn what users trust, what they understand, and what they need from the scoring experience before we harden the implementation.

## Research goals
- Validate whether customers understand the current evaluation and scoring output.
- Learn which parts of the scoring result feel useful, confusing, or untrustworthy.
- Identify the minimum explanation layer needed for users to act on LLM-generated scores.
- Determine whether users prefer fully automated scoring, editable scoring, or human-in-the-loop review.
- Collect concrete language, examples, and edge cases that should shape the next implementation.

## Key questions
- What does a “good” evaluation result look like to customers?
- Which result components matter most: overall score, rationale, evidence, confidence, or item-level breakdown?
- Where do users lose trust in the model output?
- What would make users comfortable using the score in a real workflow?
- Do customers want to edit, override, or approve LLM output before it is saved?
- What terminology do customers naturally use for fit, score, recommendation, and justification?

## Research approach
Use moderated demo sessions with lightweight observation and post-demo questions. The demo should show the current product flow, but the facilitator should pause at the scoring moments and ask participants to react before explaining how the system works.

This is not a validation study of model accuracy alone. It is a product discovery study about comprehension, trust, and decision usefulness.

## Method
- Moderated customer demos, 30 to 45 minutes each.
- In-session think-aloud while the user watches the job evaluation and application scoring flow.
- Short follow-up questionnaire immediately after the demo.
- Rapid synthesis after every 3 to 5 sessions so the team can adjust the next demo script.

## Participants
Target 5 to 8 customers or customer-proxy participants who represent the likely buyer or daily user.

Prioritize a mix of:
- Recruiters or hiring coordinators.
- Hiring managers who review scores.
- Operators or admins who may configure prompts or review output quality.

## What to test in the demo
1. Job creation and criteria generation.
2. Evaluation modal behavior and scoring breakdown.
3. Application recommendation output and supporting reasoning.
4. What users do when they disagree with the model.
5. Which explanation format increases confidence without overwhelming them.

## Session script
### 1. Context setting
- Explain that this is an early product concept and the goal is to learn from reactions, not to defend the current implementation.
- Ask what they currently use to evaluate candidates or requirements.

### 2. First impression
- Show the score or recommendation result with minimal explanation.
- Ask what they think it means.
- Ask what they would do next based on that result.

### 3. Deep dive on trust
- Ask which fields they trust and which they would ignore.
- Ask what evidence they need before acting on the output.
- Ask what would make them question the score.

### 4. Control and override
- Ask whether they want to edit, approve, or replace model output.
- Ask whether the system should explain its reasoning, expose confidence, or highlight matching evidence.

### 5. Wrap-up
- Ask for one change that would make this useful in their workflow.
- Ask for the most confusing part of the experience.

## Questions to ask
- What do you think this score is telling you?
- What in this result feels credible?
- What feels missing or unhelpful?
- Would you act on this output as shown, or would you want to review it first?
- If the model is wrong, how should the product let you correct it?
- Which language should the product use instead of the current labels?

## Success signals
The research will be considered useful if it produces:
- Clear preference patterns for score presentation.
- Repeated language that matches customer vocabulary.
- A ranked list of trust gaps and explanation gaps.
- A decision on whether the workflow should be read-only, editable, or review-first.
- Specific product changes the team can implement next.

## Capture template
For each session, capture:
- Participant role and context.
- What they understood from the score.
- What they trusted.
- What they challenged.
- What they wanted to change.
- Direct quotes that explain their mental model.
- Product implications and follow-up actions.

## Analysis framework
After each session, classify feedback into one of four buckets:
- Comprehension issue.
- Trust issue.
- Workflow fit issue.
- Terminology issue.

At the end of the round, synthesize findings into:
- Must-fix product changes.
- Nice-to-have improvements.
- Open product decisions.
- Terminology recommendations.

## Expected outcomes
This research should inform:
- Whether the scoring UI needs more explanation or less.
- Whether the user needs editable criteria or a confirmation step.
- Whether to surface confidence, evidence, or rationale more prominently.
- Which scoring labels and wording resonate with customers.
- The next implementation plan for LLM evaluation and scoring.

## Practical next steps
1. Recruit 5 to 8 participants from the target user group.
2. Run one internal dry run of the demo script.
3. Conduct the first 3 sessions and synthesize immediately.
4. Adjust the demo script based on early findings.
5. Run the remaining sessions and turn findings into implementation requirements.
