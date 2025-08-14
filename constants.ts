import { Type } from "@google/genai";

export const SOP_PROMPT = `You are an expert in creating Standard Operating Procedures (SOPs) for corporate environments, based on the provided sample document.
From the transcription below, generate a complete SOP in Markdown format.
The SOP must strictly follow this structure:

## General Info
Create a markdown table with two columns: "Field" and "Value". The table must contain the following fields. If a piece of information is not available in the transcript, fill the value with "N/A".
- Task Name
- Path of SOP Shared Drive
- Path of SOP Work Shared Drive
- Created by & date
- Estimated Completion Time
- Purpose of Task
- Trigger
- Apps
- Files used
- Video(s) Link
- Script(s) Link
- Access / Things You Will Need
- What shared drive folders are needed for this task?
- What chat groups
- How to Report Back at the End of the Task
- Additional Notes / Links You'll Need

## Big Picture / Overview
A bulleted list summarizing the overall goal and key phases of the procedure.

## SOP Section
A detailed, numbered list of step-by-step instructions. Each step should be a clear, actionable instruction.

## Q&A / Troubleshooting
Based on the transcript, create a short Q&A section using a bulleted list to address potential ambiguities or common questions that might arise when someone follows this SOP.

Here is the transcription:
---
{transcription_text}
---

Your entire response should be a single Markdown document. Do not add any introductory or concluding text outside of the SOP itself.
`;

export const SUMMARY_PROMPT = `You are a skilled analyst.
Based on the following transcription, provide a concise, executive-level summary of the key points.
The summary should capture the main topic, critical decisions made, and the overall outcome of the discussion.

Here is the transcription:
---
{transcription_text}
---

Format the output as a single, well-written paragraph.`;

export const ACTION_ITEMS_PROMPT = `You are a highly organized project manager.
Based on the following transcription, identify and list all clear action items, tasks, or follow-ups mentioned.
For each item, specify who is responsible if mentioned. If no action items are found, state that "No specific action items were identified."

Here is the transcription:
---
{transcription_text}
---

Format the output as a bulleted list.`;

export const KEY_INFO_PROMPT_SCHEMA = {
    type: Type.OBJECT,
    properties: {
        taskName: {
          type: Type.STRING,
          description: 'The primary task or purpose of the discussion, such as "Quarterly Deployment Process". If not mentioned, use "N/A".'
        },
        mentionedApps: {
            type: Type.ARRAY,
            description: 'A list of all software, applications, or tools mentioned (e.g., "JIRA", "Slack").',
            items: { type: Type.STRING }
        },
        keyPeople: {
            type: Type.ARRAY,
            description: 'A list of names of people involved or mentioned in the transcript.',
            items: { type: Type.STRING }
        },
        datesOrDeadlines: {
            type: Type.ARRAY,
            description: 'A list of any dates, deadlines, or timeframes mentioned (e.g., "Q3", "End of Day").',
            items: { type: Type.STRING }
        }
    },
    required: ["taskName", "mentionedApps", "keyPeople", "datesOrDeadlines"]
};

export const MOCK_TRANSCRIPTION = `Alright team, let's kick off the quarterly deployment process review. First, Sarah, can you confirm that the new staging environment is fully provisioned?

Yeah, Alex, all set. The new servers are up, and I've run the initial configuration scripts. We have staging-v3 ready to go.

Great. Okay, the first step is to pull the latest stable build from the main branch. John, you handle that. Once you have the build, you need to deploy it to staging-v3. Make sure to use the new deployment script, 'deploy-staging.sh', not the old one. This is critical.

Got it. Pull from main, deploy to staging-v3 with the new script. Should I notify the QA team once it's deployed?

Yes, absolutely. Once deployed, ping the QA-alerts channel on Slack. That's their cue to begin regression testing. Maria, your team will take over from there. The testing protocol is in the usual Confluence doc, 'QA-Regression-Checklist-Q3'. Please focus on the new payment gateway integration.

We're on it. We'll need about 4 hours for the full test suite. We'll report any critical bugs back in the project channel immediately.

Perfect. While QA is running, David, I need you to prepare the database migration script. The schema changes are in ticket JIRA-582. Have it ready to run, but do not execute it until we get the green light from QA.

Understood. I'll have the script peer-reviewed by Sarah before finalizing.

Excellent plan. So, to recap: John deploys, notifies QA. Maria's team tests. David prepares the DB migration. Once QA gives the all-clear, we'll convene for a go/no-go decision on the production push. Any questions?

None from me.

All clear.

Okay, let's get this moving. Great work, everyone.`;

export const MOCK_SOP = `## General Info
| Field | Value |
|---|---|
| Task Name | Quarterly Deployment Process |
| Path of SOP Shared Drive | N/A |
| Path of SOP Work Shared Drive | N/A |
| Created by & date | N/A |
| Estimated Completion Time | 5-6 hours |
| Purpose of Task | To safely deploy the latest stable build to the production environment after successful staging tests. |
| Trigger | Scheduled quarterly review meeting. |
| Apps | Git, Slack, Confluence, JIRA |
| Files used | deploy-staging.sh, QA-Regression-Checklist-Q3 |
| Video(s) Link | N/A |
| Script(s) Link | deploy-staging.sh, Database migration script (from JIRA-582) |
| Access / Things You Will Need | Staging environment (staging-v3) access, Git repo access, Slack access, Confluence access, JIRA access |
| What shared drive folders are needed for this task? | N/A |
| What chat groups | #qa-alerts, #project-channel |
| How to Report Back at the End of the Task | Convene for a go/no-go decision on the production push. |
| Additional Notes / Links You'll Need | It is critical to use the new 'deploy-staging.sh' script. |

## Big Picture / Overview
*   Ensure the new staging environment is ready for deployment.
*   Deploy the latest stable build from the main branch to the staging environment.
*   Initiate and complete QA regression testing, with a focus on the new payment gateway.
*   Prepare the database migration script in parallel with QA testing.
*   Make a final go/no-go decision for production push based on QA results.

## SOP Section
1.  **Provision Environment**: Sarah confirms that the new staging environment (staging-v3) is fully provisioned and configured.
2.  **Deploy to Staging**: John pulls the latest stable build from the main branch and deploys it to staging-v3 using the 'deploy-staging.sh' script.
3.  **Notify QA**: John pings the #qa-alerts channel on Slack to inform the QA team that the deployment to staging is complete.
4.  **Begin Regression Testing**: Maria's QA team begins regression testing based on the 'QA-Regression-Checklist-Q3' document in Confluence, focusing on the payment gateway integration.
5.  **Report Bugs**: The QA team reports any critical bugs immediately in the project's Slack channel.
6.  **Prepare Database Migration**: While QA is in progress, David prepares the database migration script as specified in JIRA-582.
7.  **Peer Review Script**: David gets the migration script peer-reviewed by Sarah before finalizing it.
8.  **Await QA Sign-off**: All teams wait for the QA team to provide a green light.
9.  **Hold Go/No-Go Meeting**: Once QA gives the all-clear, the team convenes to make a final decision on the production push.

## Q&A / Troubleshooting
*   **Q: What if the 'deploy-staging.sh' script fails?**
    *   A: Contact John immediately and check the deployment logs for errors. Do not proceed until the staging deployment is successful.
*   **Q: Where can I find the JIRA ticket for the database migration?**
    *   A: The ticket is JIRA-582, as mentioned in the meeting.
*   **Q: What's the protocol if a critical bug is found during QA?**
    *   A: Report it immediately in the project's Slack channel. The go/no-go meeting will be postponed until the bug is resolved and re-tested.
`;

export const MOCK_SUMMARY = `The team reviewed the quarterly deployment process. Key steps include John deploying the latest build to the new staging environment (staging-v3), followed by Maria's team conducting QA regression testing. In parallel, David will prepare and get a peer-review for the database migration script. The process culminates in a go/no-go decision for the production push once QA provides their approval.`;

export const MOCK_ACTION_ITEMS = `*   **John**: Pull the latest stable build, deploy it to staging-v3 using 'deploy-staging.sh', and notify the QA team on Slack.
*   **Maria's Team**: Begin regression testing on staging-v3 as per the Confluence checklist, focusing on the new payment gateway.
*   **David**: Prepare the database migration script from JIRA-582 and have it peer-reviewed by Sarah.
*   **Sarah**: Confirm staging environment provisioning and peer-review David's migration script.
*   **Alex (Implicit)**: Lead the process and convene the final go/no-go meeting.`;

export const MOCK_KEY_INFO = {
    taskName: "Quarterly Deployment Process",
    mentionedApps: ["Slack", "Confluence", "JIRA", "Git"],
    keyPeople: ["Sarah", "Alex", "John", "Maria", "David"],
    datesOrDeadlines: ["Q3"]
};