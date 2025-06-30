export class Templates {
	static getSampleNoteContent(): string {
		return `# Sample Note Created by Agent

Created on: ${new Date().toLocaleString()}

## Introduction
This is a sample note created by the Agentic Chatbot plugin to demonstrate the file creation functionality.

## Features Demonstrated
- Automatic file creation
- Markdown formatting
- Date/time stamping
- Folder organization support

## Sample Content
You can modify this template to create different types of notes:

### Daily Journal Template
- What did I accomplish today?
- What challenges did I face?
- What are my goals for tomorrow?

### Meeting Notes Template
- **Date:** ${new Date().toLocaleDateString()}
- **Attendees:** 
- **Agenda:**
- **Action Items:**

### Research Notes Template
- **Topic:** 
- **Sources:**
- **Key Findings:**
- **Next Steps:**

## Tags
#sample #agent-created #template

---
*This file was created automatically by the Agentic Chatbot plugin.*`;
	}

	static getDailyJournalTemplate(): string {
		return `# Daily Journal - ${new Date().toLocaleDateString()}

## Today's Goals
- [ ] 
- [ ] 
- [ ] 

## Accomplishments
- 
- 
- 

## Challenges Faced
- 
- 

## Lessons Learned
- 
- 

## Tomorrow's Priorities
- [ ] 
- [ ] 
- [ ] 

## Gratitude
- 
- 
- 

---
*Created on ${new Date().toLocaleString()}*`;
	}

	static getMeetingNotesTemplate(): string {
		return `# Meeting Notes

**Date:** ${new Date().toLocaleDateString()}
**Time:** ${new Date().toLocaleTimeString()}
**Attendees:** 
**Location/Platform:** 

## Agenda
1. 
2. 
3. 

## Discussion Points
### Topic 1
- 
- 

### Topic 2
- 
- 

## Decisions Made
- 
- 

## Action Items
- [ ] **[Name]** - Task description - Due: 
- [ ] **[Name]** - Task description - Due: 

## Next Steps
- 
- 

## Follow-up Meeting
**Date:** 
**Time:** 
**Agenda:** 

---
*Meeting notes created on ${new Date().toLocaleString()}*`;
	}

	static getResearchNotesTemplate(): string {
		return `# Research Notes

**Topic:** 
**Date:** ${new Date().toLocaleDateString()}
**Researcher:** 

## Research Question
What specific question are you trying to answer?

## Background
Brief context and why this research is important.

## Sources
1. [Source Name](URL) - Brief description
2. [Source Name](URL) - Brief description
3. [Source Name](URL) - Brief description

## Key Findings
### Finding 1
- Evidence:
- Significance:

### Finding 2
- Evidence:
- Significance:

## Methodology
How did you conduct this research?

## Conclusions
What can you conclude from your findings?

## Next Steps
- [ ] 
- [ ] 
- [ ] 

## References
- 
- 
- 

---
*Research notes created on ${new Date().toLocaleString()}*`;
	}
}