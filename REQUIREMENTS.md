# JobBoard Requirements Document

## 1. Purpose

Define the product requirements for the JobBoard web app flow covering:
- Job creation and management
- AI-based evaluation criteria generation
- Application intake
- AI-based application recommendation
- Developer mode prompt and feature configuration

## 2. Scope

### 2.1 In Scope
- Single-page React app with tab-based navigation.
- Jobs page end-to-end flow.
- Applications page end-to-end flow.
- Hidden Dev Mode page and its settings persistence.
- OpenAI chat-completions integration for evaluation and recommendation features.

### 2.2 Out of Scope
- Authentication and user accounts.
- Backend database and server-side persistence.
- Multi-tenant, role-based access control, and audit trails.

## 3. Users and Goals

### 3.1 Primary User
- Recruiter or hiring coordinator who needs to:
  - Capture job postings.
  - Define or generate screening criteria.
  - Evaluate incoming application text quickly.

### 3.2 Secondary User
- Developer or QA user who needs to:
  - Tune prompts used by AI calls.
  - Toggle experimental features.

## 4. Product Flow Summary

### 4.1 Global Navigation
- App header provides tabs for:
  - Jobs
  - Applications
  - Dev Mode (hidden unless enabled)
- Users can switch pages without route reload.

### 4.2 Hidden Dev Mode Entry
- Clicking the logo 3 times within 800 ms toggles Dev Mode.
- When toggled on, Dev Mode tab becomes visible and can be opened.
- Toggling off exits Dev Mode and returns user context to Jobs page.

### 4.3 Model Selection
- A global model selector exists in header.
- Supported options:
  - gpt-4o
  - gpt-5.4
  - gpt-5.5
- Selected model is used by all AI features that accept model input.

## 5. Functional Requirements

## 5.1 Jobs Page

### 5.1.1 Add Job Form
- User can create a job with:
  - Job Title (required)
  - Job Description (required)
  - Eligibility Requirements (keyword tags)
  - Additional Requirements (keyword tags)
- Validation rules:
  - Empty title blocks submission and shows inline error.
  - Empty description blocks submission and shows inline error.
- On successful submit:
  - Job is added to top of list.
  - Form is reset.

### 5.1.2 Requirement Tag Input
- Each requirement section supports:
  - Preset tags (Education, Experience, Certification, Location, Background Verification, Skills).
  - Free-form tags added via Enter or comma.
  - Backspace removes most recent tag if input is empty.
- Duplicate tags are prevented by value match.
- Preset tag state is toggleable.

### 5.1.3 Skill Suggestion Helper
- In Skills preset chip, user can click spark action to generate suggested skills.
- Preconditions:
  - Job description must be non-empty.
- Result behavior:
  - Returns 6-12 suggested skill keywords.
  - User can click suggestions to add/remove from selected tags.
- Errors are displayed inline in the form section.

### 5.1.4 Criteria Reuse Feature (Experimental)
- Available only when feature flag criteriaReuseEnabled is true in Dev Mode.
- User can enable "Reuse criteria from similar previous jobs".
- While enabled:
  - Manual keyword selection is disabled for both requirement sections.
  - Existing manual tags are cleared from the pending form.
- On submit with reuse enabled:
  - System finds prior jobs with saved criteria using token overlap scoring.
  - If no match exists, submission is blocked with message.
  - If one match exists, criteria are copied immediately.
  - If multiple matches exist, user must pick one source job before import.
- Copied criteria are stored into both:
  - Job tags (as reused=true metadata)
  - Evaluation results map for that new job.

### 5.1.5 Job List Display
- Jobs table shows:
  - Job title
  - Description preview (trimmed)
  - Eligibility tags
  - Additional tags
  - Action column
- Empty state appears when no jobs exist.

### 5.1.6 Generate Evaluation Criteria
- Per job, user can click Generate or Regenerate.
- Only one generation request may be active in Job List at a time.
- AI call output is expected as JSON:
  - requirements[] for eligibility
  - additionalRequirements[] for additional
- On success:
  - Result is saved under that job id.
  - Evaluation modal opens automatically.
- On failure:
  - Row-level error indicator is shown.

### 5.1.7 Evaluation Modal Editing
- Modal presents generated criteria split into:
  - Eligibility Requirements
  - Additional Requirements
- For each eligibility item:
  - User can edit evaluation guideline text.
  - Assist button can regenerate guideline for that item.
- For each additional item:
  - User can edit strong-fit and partial-fit guideline texts.
  - Assist button can regenerate both fields.
- Data merge rule:
  - If AI omits additional items, modal must still include job additional tags with default values.
- Closing behavior:
  - Closing modal persists current edits back to in-memory evaluationResults.
  - Escape key closes modal.
  - Clicking backdrop closes modal.

## 5.2 Applications Page

### 5.2.1 Add Application
- User can open Add Application modal.
- Form fields:
  - Job (required)
  - Applicant Name (optional; defaults to "Unnamed Applicant")
  - Application Text (required)
- User cannot submit when required fields are missing.
- If no jobs exist, form explains prerequisite to create jobs first.
- On success:
  - Application is added to top of list.
  - Modal closes and form resets.

### 5.2.2 Application List Display
- Table columns:
  - Applicant
  - Job
  - Application Preview (trimmed)
  - Result
  - Action
- Empty state appears when no applications exist.

### 5.2.3 Generate AI Recommendation
- User can run AI Recommendation per application.
- Recommendation uses:
  - Saved evaluation criteria for that job when available.
  - Fallback to raw job requirement tags when criteria are unavailable.
- Only one recommendation request may be active in Applications table at a time.
- On success:
  - Recommendation stored by application id.
  - Recommendation modal opens automatically.
- On failure:
  - Row-level error indicator is shown.

### 5.2.4 Recommendation Result Semantics
- Required top-level output:
  - overallRecommendation: strong_fit | partial_fit | no_fit
  - summary
  - criticalFit[] (met | not_met)
  - additionalFit[] (strong | partial | none)
- UI must show:
  - Overall badge mapping:
    - strong_fit -> FastTrack
    - partial_fit -> Eligible
    - no_fit -> Needs Review
  - Requirement-level fit badges and reasoning.
- Summary cell in table must include:
  - Overall badge
  - Critical met ratio bar
  - Additional fit dot indicators

### 5.2.5 Recommendation Modal
- Modal displays detailed recommendation for one application.
- Modal can be opened by:
  - Auto-open after generation
  - View button when result already exists
- Escape key closes modal.
- Backdrop click closes modal when clicking outside content panel.

## 5.3 Dev Mode Page

### 5.3.1 Prompt Editing
- Dev Mode must list editable prompt templates for:
  - Evaluation Criteria
  - Evaluation Guideline (Assist)
  - Additional Requirement Guideline (Assist)
  - Skill Suggestions
  - Application Recommendation
- Each template must show:
  - Label
  - Description
  - Variable tokens
  - Editable system and user textareas

### 5.3.2 Feature Toggles
- Dev Mode must expose criteriaReuseEnabled toggle.
- Toggle state immediately affects UI behavior in Add Job flow.

### 5.3.3 Save and Reset
- Save action persists prompts and feature flags to localStorage.
- Reset action clears custom values and restores defaults.
- Reset action requires explicit user confirmation.

## 6. Data and State Requirements

### 6.1 In-Memory Domain Objects
- Job:
  - id (number, generated with Date.now)
  - title (string)
  - description (string)
  - criticalRequirements (array of tag objects)
  - additionalRequirements (array of tag objects)
- Tag object:
  - value (string)
  - preset (boolean)
  - reused (optional boolean)
- Application:
  - id (number)
  - jobId (number)
  - applicantName (string)
  - text (string)

### 6.2 Evaluation Result Shape
- Stored by job id in evaluationResults map.
- Includes:
  - requirements[]
    - criticalRequirement
    - mentionedInJobDescription
    - evaluationGuideline
  - additionalRequirements[]
    - additionalRequirement
    - mentionedInJobDescription
    - strongfitguideline
    - partialfitguideline

### 6.3 Recommendation Result Shape
- Stored by application id in recommendations map.
- Includes:
  - overallRecommendation
  - summary
  - criticalFit[]
  - additionalFit[]

### 6.4 Persistence Rules
- Jobs, applications, evaluation results, and recommendations are in-memory only and are not persisted across page reload.
- Dev Mode prompt overrides and feature toggles persist in localStorage.

## 7. AI and Integration Requirements

### 7.1 External API
- All AI generation uses OpenAI chat completions endpoint:
  - POST https://api.openai.com/v1/chat/completions
- Authorization header must use bearer token from VITE_OPENAI_API_KEY.

### 7.2 Environment Configuration
- Required env var:
  - VITE_OPENAI_API_KEY
- Optional env var:
  - VITE_OPENAI_MODEL (default model selection fallback)
- Missing or placeholder API key must produce actionable error message.

### 7.3 Response Format Enforcement
- Evaluation criteria and recommendations must parse as strict JSON.
- Invalid JSON must surface a retryable error.
- Prompt contracts require exact list lengths/order for requirement arrays.

### 7.4 Reliability Rules
- Per-screen request locking prevents concurrent duplicate operations:
  - One active generate request in Job List.
  - One active recommendation request in Applications page.

## 8. UX Requirements

### 8.1 Error Feedback
- Validation errors appear inline near fields.
- AI request errors appear at row/action level without crashing page.
- Failed operations do not clear previously saved data.

### 8.2 Loading Feedback
- Long-running AI actions show spinner and loading label.
- Action buttons are disabled while request is in progress.

### 8.3 Empty States
- Jobs page displays empty state when no jobs exist.
- Applications page displays empty state when no applications exist.

### 8.4 Accessibility Baseline
- Modal dialogs must expose role="dialog" and aria-modal="true".
- Close actions available via button and Escape key.

## 9. Non-Functional Requirements

### 9.1 Performance
- UI interactions (typing, tag add/remove, modal open/close, tab switch) should be immediate under normal local usage.

### 9.2 Maintainability
- Prompt text and experimental features must be configurable without code redeploy through Dev Mode local storage.

### 9.3 Security and Privacy
- API key must not be hardcoded in source.
- No server-side storage of job/application content in this version.
- Users should treat entered data as local-memory data unless sent to AI endpoint during generation.

## 10. Acceptance Criteria (End-to-End)

1. User can add a job with title and description, plus requirement tags, and see it in the Jobs table.
2. User can generate evaluation criteria for a job, open modal, edit guidelines, and have edits saved after closing.
3. User can add an application linked to a job and see it in Applications table.
4. User can run AI recommendation and view structured results in both table summary and detailed modal.
5. When criteria reuse feature is enabled in Dev Mode, Add Job supports matching and importing criteria from similar prior jobs.
6. Prompt changes and feature toggle changes in Dev Mode persist after refresh.
7. Missing API key blocks AI actions with clear error message rather than silent failure.

## 11. Known Constraints

- All business data except Dev Mode settings is volatile and resets on reload.
- IDs rely on Date.now and are suitable only for local single-user operation.
- Similar-job matching is heuristic token overlap, not semantic embedding.
- AI output quality depends on prompt quality and model behavior.
