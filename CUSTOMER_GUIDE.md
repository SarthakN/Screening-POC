# JobBoard: End-to-End Screening Workflow

A guide for recruiters and hiring teams using JobBoard to screen candidates with AI-assisted evaluation.

---

## Overview

JobBoard has two main areas:

| Area | Purpose |
|------|---------|
| **Jobs** | Create roles, select requirement areas, and define how applicants will be evaluated |
| **Applications** | Submit candidate materials and review AI-generated recommendations |

The screening workflow follows four steps:

```
1. Create a job          →  title, description, and requirement pills
2. Generate & review     →  AI builds detailed evaluation criteria
3. Add an application    →  paste candidate text and link to a job
4. Review recommendation →  overall fit signal and per-requirement breakdown
```

---

## Step 1: Create a job

On the **Jobs** page, complete the **Add a Job** form.

### Required fields

- **Job title** — e.g. "Senior Product Designer"
- **Job description** — role responsibilities and context

### Select requirement areas

Below the description, two side-by-side sections let you indicate what matters for the role:

**Eligibility Requirements** (must-haves) and **Additional Requirements** (nice-to-haves).

In each section, click the preset pills that apply:

- Education
- Experience
- Certification
- Location
- Background Verification
- Skills

You can select different pills in each column — for example, Education and Experience under Eligibility, and Skills under Additional.

You can also:

- **Add custom keywords** — type a keyword and press Enter or comma
- **Get skill suggestions** — click ✨ on the Skills pill (requires a job description first), then click suggested skills to add or remove them

### Generate criteria

Click **Generate Criteria**. The AI uses your job description and selected requirement areas to produce a detailed screening framework. The button shows "Generating Criteria..." while processing.

### Optional: Reuse criteria from a similar job

If enabled for your session, you may see a **Reuse criteria from similar previous jobs** checkbox. When checked:

- Manual keyword selection is disabled
- The system searches your previous jobs for a close match
- One match imports criteria directly; multiple matches let you pick the closest role
- If no match is found, uncheck reuse and select keywords manually instead

---

## Step 2: Review and confirm evaluation criteria

After generation, the **Evaluation Criteria** panel opens automatically.

### What you see

Each requirement includes:

- The requirement name
- An **In JD** or **Not in JD** badge showing whether it appeared in your job description
- Editable evaluation guidelines

Requirements are grouped as:

| Group | Guidelines |
|-------|------------|
| **Eligibility requirements** | One evaluation guideline per item (must-have bar) |
| **Additional requirements** | Separate **Strong fit** and **Partial fit** guidelines per item |

### What you can do

- **Edit guidelines** — adjust the AI-generated text to match how your team evaluates
- **Move requirements** — use **Move to Additional** or **Move to Eligibility** if an item is in the wrong group
- **Regenerate** — for jobs already in your list, open criteria and click **Regenerate** for a fresh set

### Save the job

- When creating a new job: click **Add Job** to save, or **Cancel** to discard
- When editing an existing job: close the panel to save your edits

The saved job appears in your jobs table with its eligibility and additional requirements shown as tags.

For jobs already listed that do not yet have criteria, click **Generate** on the row. For jobs with existing criteria, click **View Criteria**.

---

## Step 3: Add an application

Switch to the **Applications** page.

### Before you start

You need at least one job. If none exist, the form will prompt you to create a job on the Jobs page first.

### Submit an application

1. Click **+ Add Application**
2. Select the **job** this application is for
3. Optionally enter the **applicant name** (defaults to "Unnamed Applicant" if left blank)
4. Paste the **application text** — resume, cover letter, or written responses
5. Click **Add Application**

The application is added to the top of your list and **AI evaluation begins automatically**. When complete, a result badge appears in the **Result** column. The detailed panel does not open automatically — review the badge in the table first, then click **View** for the full breakdown.

If evaluation did not run or failed, click **AI Recommendation** on the row. When triggered manually, the detailed panel opens automatically on completion.

---

## Step 4: Review the recommendation

Click **View** on an evaluated application to open the **AI Recommendation** panel.

### Overall fit signal

| Badge | Meaning |
|-------|---------|
| **FastTrack** | Strong fit — meets critical requirements and aligns well with the role |
| **Eligible** | Partial fit — meets some requirements; worth a closer look |
| **Needs Review** | Does not meet key requirements — manual review recommended |

A written **summary** appears below the overall badge.

### Requirement-level breakdown

**Eligibility requirements**

| Result | Meaning |
|--------|---------|
| **Met** | Candidate satisfies this requirement |
| **Not Met** | Candidate does not satisfy this requirement |

**Additional requirements**

| Result | Meaning |
|--------|---------|
| **Strong Fit** | Candidate strongly demonstrates this quality |
| **Partial Fit** | Candidate partially demonstrates this quality |
| **No Fit** | Candidate does not demonstrate this quality |

Each requirement includes a written explanation of the AI's reasoning.

Click **Re-evaluate** inside the panel to run a fresh assessment at any time.

---

## How recommendations are scored

The AI uses the **evaluation criteria** saved for the linked job when available. If criteria have not been generated for that job, it falls back to the requirement tags shown on the job.

Generating and reviewing criteria before screening produces the most accurate recommendations.

---

## During your session

### While the AI is working

| Action | What you see |
|--------|--------------|
| Generating criteria | "Generating Criteria..." |
| Matching a similar job | "Matching previous job..." |
| Evaluating an application | "Evaluating..." with a spinner |
| Re-evaluating | "Re-evaluating..." with a spinner |

Only one AI action runs at a time within the Jobs list or Applications list.

### If something goes wrong

- Missing required fields show an error below the field
- AI failures show a warning on the affected row
- Failed requests do not erase jobs, criteria, or applications already saved

### Session data

Jobs, applications, criteria, and recommendations are held in your current browser session. **Refreshing the page clears your data.** This product is designed for live demos and exploratory screening sessions.

---

## Quick reference

| Goal | Where | Action |
|------|-------|--------|
| Set up a new role | Jobs | Title + description → select pills → Generate Criteria → Add Job |
| Edit screening criteria | Jobs | View Criteria on a job row |
| Screen a candidate | Applications | + Add Application → paste text → submit |
| See full scoring detail | Applications | View on an evaluated row |
| Re-score a candidate | Applications | Open recommendation → Re-evaluate |

---

*Document version 2.0 — July 2026*
