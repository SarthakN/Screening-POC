# JobBoard: AI-Assisted Candidate Screening

**A guide for recruiters and hiring teams**

---

## What is JobBoard?

JobBoard helps you screen candidates faster by combining your job requirements with AI-generated evaluation criteria and structured application recommendations. You define what matters for a role, review how each requirement should be assessed, and then paste in candidate applications to receive clear, actionable fit signals.

This guide walks you through the product from start to finish.

---

## Who is this for?

JobBoard is built for **recruiters and hiring coordinators** who need to:

- Capture job postings and screening criteria
- Evaluate incoming applications consistently
- Move promising candidates forward with confidence

---

## How the product is organized

JobBoard has two main areas, accessible from the top navigation:

| Area | Purpose |
|------|---------|
| **Jobs** | Create roles and define how applicants will be evaluated |
| **Applications** | Submit candidate materials and review AI recommendations |

You can switch between these areas at any time without losing your place in a session.

A **model selector** in the header lets you choose which AI model powers evaluation and recommendations for your session.

---

## The end-to-end workflow

The typical screening flow follows four stages:

1. **Create a job** — Enter the role title and description, then generate screening criteria.
2. **Review criteria** — Confirm or edit how each requirement should be evaluated.
3. **Add an application** — Paste a resume, cover letter, or application responses and link it to a job.
4. **Review the recommendation** — See an overall fit signal and a requirement-by-requirement breakdown.

```
Jobs  →  Define criteria  →  Applications  →  Review recommendations
```

---

## Step 1: Create a job

### What you need

Every job requires:

- **Job title** — e.g. "Senior Product Designer"
- **Job description** — Responsibilities, context, and expectations for the role

You can also add requirement keywords manually, use AI to suggest skills, or reuse criteria from a similar role you have screened before.

### Generate screening criteria

1. Fill in the job title and description.
2. Click **Generate Criteria**.
3. Wait while the AI builds your screening framework (the button will show "Generating Criteria...").
4. An **Evaluation Criteria** panel opens automatically when generation completes.

If something goes wrong, an error message appears below the form. Your existing work is not lost.

### Reuse criteria from a similar job (optional)

If this role is similar to one you have already set up, you can enable **Reuse criteria from similar previous jobs**. When this option is on:

- Manual keyword entry is disabled.
- The system searches your previous jobs for a close match.
- If one match is found, its criteria are imported for your review.
- If several matches are found, you choose the closest role before importing.
- If no match is found, you will be asked to enter keywords manually instead.

### Add the job

After reviewing the generated criteria in the Evaluation Criteria panel, click **Add Job** to save the role. The job appears at the top of your jobs list. If you cancel, the job is not saved.

---

## Step 2: Review and refine evaluation criteria

Whether you are creating a new job or working with an existing one, the **Evaluation Criteria** panel is where you shape how applicants will be scored.

### What you will see

Criteria are organized into two groups:

**Eligibility requirements** — Must-have qualifications for the role. Each item shows:

- The requirement name
- Whether it appears in the job description ("In JD" or "Not in JD")
- An editable evaluation guideline explaining how to assess it

**Additional requirements** — Differentiators and nice-to-have qualities. Each item shows:

- The requirement name
- Whether it appears in the job description
- Separate guidelines for a **strong fit** and a **partial fit**

### What you can do

- **Edit guidelines** — Adjust the AI-generated text so it matches how your team actually evaluates candidates.
- **Move requirements** — Shift an item between Eligibility and Additional if it is categorized incorrectly.
- **Regenerate** — For jobs already in your list, click **Regenerate** to produce a fresh set of criteria.

When you close the panel from an existing job, your edits are saved. When adding a new job, click **Add Job** to confirm or **Cancel** to discard.

You can close any panel by clicking the × button, clicking outside it, or pressing **Escape**.

### Jobs already in your list

For jobs you have already added:

- Click **Generate** if criteria have not been created yet.
- Click **View Criteria** to open and edit existing criteria.

Only one criteria generation can run at a time across your jobs list.

---

## Step 3: Add and evaluate applications

Switch to the **Applications** tab to screen candidates.

### Before you start

You need at least one job on the Jobs page. If no jobs exist, the application form will prompt you to create one first.

### Add an application

1. Click **+ Add Application**.
2. Select the job this application is for.
3. Optionally enter the applicant's name (defaults to "Unnamed Applicant" if left blank).
4. Paste the application text — a resume, cover letter, or written responses.
5. Click **Add Application**.

The application is added to the top of your list and **AI evaluation begins automatically**. When complete, a result badge appears in the table. The detailed results panel does not open automatically on submit — you can review the summary in the table first.

### Run or re-run evaluation manually

For applications that have not yet been evaluated, click **AI Recommendation**. When evaluation completes, the detailed results panel opens automatically.

For applications that already have a result, click **View** to see the full breakdown, or **Re-evaluate** inside the panel to run a fresh assessment.

Only one evaluation can run at a time across your applications list.

---

## Step 4: Understand your recommendations

### Overall fit signals

Each application receives one of three overall recommendations:

| Recommendation | What it means |
|----------------|---------------|
| **FastTrack** | Strong fit — the candidate meets critical requirements and aligns well with the role |
| **Eligible** | Partial fit — the candidate meets some requirements but has gaps worth reviewing |
| **Needs Review** | Does not meet key requirements — manual review recommended before advancing |

The overall badge appears in the applications table. Open the full recommendation to see the summary and detailed reasoning.

### Requirement-level breakdown

Inside the recommendation detail view, each requirement is assessed individually:

**Eligibility requirements**

| Result | Meaning |
|--------|---------|
| **Met** | The candidate satisfies this requirement |
| **Not Met** | The candidate does not satisfy this requirement |

**Additional requirements**

| Result | Meaning |
|--------|---------|
| **Strong Fit** | The candidate strongly demonstrates this quality |
| **Partial Fit** | The candidate partially demonstrates this quality |
| **No Fit** | The candidate does not demonstrate this quality |

Each item includes a written explanation of why the AI reached that conclusion, so you can verify the reasoning before acting on it.

---

## What to expect during your session

### While the AI is working

| Action | What you will see |
|--------|-------------------|
| Generating criteria | Button shows "Generating Criteria..." |
| Matching a similar job | Button shows "Matching previous job..." |
| Evaluating an application | Button shows "Evaluating..." with a spinner |
| Re-evaluating | Button shows "Re-evaluating..." with a spinner |
| Suggesting skills | Loading indicator on the skills suggestion |

Buttons are disabled while a request is in progress to prevent duplicate evaluations.

### If something goes wrong

- **Form errors** — Missing required fields are highlighted directly below the field.
- **AI errors** — A warning icon appears on the affected row with details on hover or in the panel header.
- **Failed requests do not erase your data** — Previously saved jobs, criteria, and results remain intact.

### Empty states

- **No jobs yet** — "No jobs added yet. Fill in the form above to get started."
- **No applications yet** — "No applications yet. Click '+ Add Application' to get started."

---

## Important things to know

### Jobs come first

Applications must be linked to a job. Create and define criteria for your roles on the Jobs page before screening candidates.

### Better criteria produce better recommendations

When evaluation criteria exist for a job, the AI uses them to score applications. If criteria have not been generated, the system falls back to the job's requirement keywords.

### This is a demo session

Jobs, applications, criteria, and recommendations are held in your current browser session. **Refreshing the page will clear your data.** This makes JobBoard well suited for live demos and exploratory sessions.

### AI features require setup

If AI actions are unavailable, you will see a clear error message rather than a silent failure. Contact your administrator if evaluation or recommendation features are not working.

---

## Quick reference

| I want to… | Go to… | Then… |
|------------|--------|-------|
| Set up a new role | Jobs | Enter title + description → Generate Criteria → Add Job |
| Edit how a role is evaluated | Jobs | Click View Criteria on a job row |
| Screen a candidate | Applications | + Add Application → paste text → submit |
| See why a candidate was scored | Applications | Click View on the application row |
| Re-score a candidate | Applications | Open recommendation → Re-evaluate |
| Reuse criteria from a past role | Jobs | Enable reuse checkbox → Generate Criteria |

---

## Summary

JobBoard puts structured, explainable AI screening in your hands. You stay in control: define the criteria, edit the guidelines, review the reasoning, and decide how to act on each recommendation. The workflow is designed to help you move from job posting to candidate decision faster — without skipping the human judgment that matters.

---

*Document version 1.0 — July 2026*
