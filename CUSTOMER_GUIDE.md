# JobBoard: End-to-End Screening Workflow

A guide for recruiters and hiring teams using JobBoard to screen candidates with AI-assisted evaluation.

---

## Overview

JobBoard has two main areas:

| Area | Purpose |
|------|---------|
| **Jobs** | Create roles, select requirement pills, and define how applicants will be evaluated |
| **Applications** | Submit candidate materials and review AI-generated recommendations |

The screening workflow:

```
1. Enter job title and description
2. Select requirement pills (Eligibility + Additional)
3. Generate and review evaluation criteria
4. Add an application
5. Review the AI recommendation
```

---

## Step 1: Enter job details

On the **Jobs** page, fill in the **Add a Job** form:

- **Job title** — e.g. "Senior Product Designer"
- **Job description** — role responsibilities and context

Both fields are required before you can continue.

---

## Step 2: Select requirement pills

Directly below the job description, you will see **two columns** for selecting requirement pills:

| Column | Purpose |
|--------|---------|
| **Eligibility Requirements** | Must-have areas for the role |
| **Additional Requirements** | Nice-to-have areas for the role |

Each column shows the same set of clickable **preset pills**. Click a pill to select it (a checkmark appears). Click again to deselect.

### Preset pills

| Pill | Use for |
|------|---------|
| **Education** | Degree or education requirements |
| **Experience** | Years or type of work experience |
| **Certification** | Licenses or certifications |
| **Language** | Language proficiency requirements |
| **Work Authorization** | Visa, work permit, or right-to-work requirements |
| **Location** | Location or work arrangement |
| **Background Verification** | Background check requirements |
| **Skills** | Technical or role-specific skills |

Select the pills that apply in **each column independently**. For example:

- **Eligibility:** Education, Experience, Work Authorization, Certification
- **Additional:** Skills, Language, Location

### Custom keywords

Below the pills in each column, type a custom keyword and press **Enter** or **comma** to add it.

### Skill suggestions

On the **Skills** pill, click the **✨** icon to generate AI-suggested skills from your job description (add a description first). Click any suggestion to add or remove it.

> **Note:** If **Reuse criteria from similar previous jobs** is enabled and checked, pill selection is disabled while the system matches a previous role.

---

## Step 3: Generate and review evaluation criteria

Click **Generate Criteria**. The AI uses your job description and selected pills to build a detailed screening framework.

When generation completes, the **Evaluation Criteria** panel opens. Each requirement shows:

- The requirement name
- An **In JD** or **Not in JD** badge
- Editable evaluation guidelines

| Group | What you edit |
|-------|---------------|
| **Eligibility requirements** | One evaluation guideline per item |
| **Additional requirements** | Separate **Strong fit** and **Partial fit** guidelines per item |

You can edit guidelines, move items between groups, and click **Regenerate** on existing jobs for a fresh set.

Click **Add Job** to save the role, or **Cancel** to discard. The job appears in your table with the confirmed requirements shown as tags.

---

## Step 4: Add an application

Switch to the **Applications** page. You need at least one job created first.

1. Click **+ Add Application**
2. Select the **job**
3. Optionally enter the **applicant name** (defaults to "Unnamed Applicant")
4. Paste the **application text** (resume, cover letter, or responses)
5. Click **Add Application**

AI evaluation runs automatically. A result badge appears in the table when complete. Click **View** for the full breakdown.

---

## Step 5: Review the recommendation

| Badge | Meaning |
|-------|---------|
| **FastTrack** | Strong fit |
| **Eligible** | Partial fit — worth a closer look |
| **Needs Review** | Does not meet key requirements |

The panel shows a summary and a per-requirement breakdown:

- **Eligibility:** Met or Not Met
- **Additional:** Strong Fit, Partial Fit, or No Fit

Each item includes written reasoning. Click **Re-evaluate** to run a fresh assessment.

---

## Your data

All screening data is **saved across sessions**. When you return to JobBoard, your work is still there:

| Saved data | What it includes |
|------------|------------------|
| **Jobs** | Titles, descriptions, requirement tags, and evaluation criteria |
| **Applications** | Applicant names, application text, and linked jobs |
| **Recommendations** | AI scoring results and per-requirement reasoning |

You can close the browser, log out, and come back later without losing jobs or applications.

---

## Archiving jobs and applications

When a role or application is no longer active, you can **archive** it instead of deleting it.

### What archiving does

- Archived jobs and applications are **hidden from the Jobs and Applications pages**
- The data is **not deleted** — it is kept on the backend for reference and audit
- Archived items no longer appear in job dropdowns or active lists

### Restoring archived items

Archived jobs and applications can be **restored through Dev Mode** (see below). Once restored, they reappear in the main Jobs or Applications views with their criteria and recommendations intact.

---

## AI usage and costs

JobBoard tracks AI usage on the backend. Every AI action is logged with a **cost breakdown** so your team can monitor spend.

### Tracked actions

| Action | When it runs |
|--------|--------------|
| **Evaluation criteria generation** | Clicking Generate Criteria on a new or existing job |
| **Criteria regeneration** | Clicking Regenerate inside the Evaluation Criteria panel |
| **Skill suggestions** | Clicking ✨ on the Skills pill |
| **Application recommendation** | Submitting an application or clicking AI Recommendation |
| **Re-evaluation** | Clicking Re-evaluate inside the AI Recommendation panel |

### Cost breakdown

Each logged action includes:

- The action type (e.g. criteria generation, application recommendation)
- The AI model used
- Token usage (input and output)
- Estimated cost for that specific action
- A reference to the related job or application

Administrators can review cumulative and per-action costs to understand where AI spend is going across the screening workflow.

---

## Dev Mode (administrators)

Dev Mode is a hidden settings area for administrators and power users. It is not shown in the normal navigation.

### How to open Dev Mode

Click the **JobBoard logo** in the header **three times within 800 milliseconds**. A **Dev Mode** tab appears in the navigation and opens automatically.

Click the logo three times again to close Dev Mode. The tab disappears and you return to the Jobs page.

### What you can do in Dev Mode

#### Experimental features

| Feature | Effect |
|---------|--------|
| **Reuse criteria from similar previous jobs** | Shows a checkbox on the Add Job form. When enabled, manual pill selection is disabled and criteria are copied from a matching previous job. |

Toggle features on or off, then click **Save Changes** to apply them.

#### Prompt templates

Dev Mode lets you edit the instructions sent to the AI for each action:

| Template | Used when |
|----------|-----------|
| **Evaluation Criteria** | Generating screening criteria from a job |
| **Evaluation Guideline (Assist)** | Regenerating a single eligibility guideline |
| **Additional Requirement Guideline (Assist)** | Regenerating strong/partial fit guidelines for one additional requirement |
| **Skill Suggestions** | Generating skill keywords from the ✨ action on the Skills pill |
| **Application Recommendation** | Scoring a candidate application |

Each template has editable **System** and **User** prompt fields. Dynamic values (such as job title, description, and requirement lists) are inserted using `{{variable}}` syntax shown on each card.

#### Archive management

Dev Mode includes controls to **view and restore archived jobs and applications**. Restored items return to the active Jobs or Applications lists.

#### Save and reset

- **Save Changes** — persists prompt edits and feature toggles across sessions
- **Reset to Defaults** — restores all Dev Mode settings to their original values (requires confirmation)

### Model selection

The **Model** dropdown in the header (visible on all pages) controls which AI model is used for criteria generation, skill suggestions, and application recommendations. Dev Mode prompt changes apply regardless of which model is selected.

---

## Quick reference

| Goal | Action |
|------|--------|
| Set up a role | Title + description → **select pills in both columns** → Generate Criteria → Add Job |
| Screen a candidate | Applications → + Add Application → submit |
| See scoring detail | Applications → View on an evaluated row |
| Archive a job or application | Use the archive action on the item (hidden from main lists) |
| Restore an archived item | Dev Mode → archive management → restore |
| Review AI spend | Backend cost report → per-action breakdown |

---

*Document version 3.1 — July 2026*
