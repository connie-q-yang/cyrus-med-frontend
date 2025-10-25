import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// Helper function to extract SOAP note from the last message
const extractSOAPNote = (messages) => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.role === 'ai') {
    const content = lastMessage.content;
    // Check if it contains SOAP note sections
    if (content.includes('**S (Subjective):**') || content.includes('S (Subjective):')) {
      return content;
    }
  }
  return null;
};

// Helper function to parse SOAP sections
const parseSOAPSections = (soapText) => {
  const sections = {
    subjective: '',
    objective: '',
    assessment: '',
    plan: '',
    note: ''
  };

  // Extract each section using regex
  const subjectiveMatch = soapText.match(/\*\*S \(Subjective\):\*\*\s*([\s\S]*?)(?=\*\*O \(Objective\):|$)/i);
  const objectiveMatch = soapText.match(/\*\*O \(Objective\):\*\*\s*([\s\S]*?)(?=\*\*A \(Assessment\):|$)/i);
  const assessmentMatch = soapText.match(/\*\*A \(Assessment\):\*\*\s*([\s\S]*?)(?=\*\*P \(Plan\):|$)/i);
  const planMatch = soapText.match(/\*\*P \(Plan\):\*\*\s*([\s\S]*?)(?=\*\*Remember:|---|\n\n\n|$)/i);
  const noteMatch = soapText.match(/\*\*Remember:\*\*\s*([\s\S]*?)$/i);

  if (subjectiveMatch) sections.subjective = subjectiveMatch[1].trim();
  if (objectiveMatch) sections.objective = objectiveMatch[1].trim();
  if (assessmentMatch) sections.assessment = assessmentMatch[1].trim();
  if (planMatch) sections.plan = planMatch[1].trim();
  if (noteMatch) sections.note = noteMatch[1].trim();

  return sections;
};

export const exportChatAsDocx = async (messages) => {
  const soapNote = extractSOAPNote(messages);
  const hasSoapNote = soapNote !== null;

  let docChildren = [
    new Paragraph({
      text: "OpenMedicine - SOAP Note",
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 400 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Generated: ",
          bold: true
        }),
        new TextRun({
          text: new Date().toLocaleString()
        })
      ],
      spacing: { after: 200 }
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "Status: ",
          bold: true
        }),
        new TextRun({
          text: "Secure • Anonymous • Educational Purpose Only",
          italics: true
        })
      ],
      spacing: { after: 400 }
    })
  ];

  if (hasSoapNote) {
    const sections = parseSOAPSections(soapNote);

    docChildren.push(
      new Paragraph({
        text: "SOAP Note - Health Consultation Summary",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 300, before: 200 }
      }),
      new Paragraph({
        text: "S - Subjective",
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 200, before: 300 }
      }),
      new Paragraph({
        text: sections.subjective,
        spacing: { after: 300 }
      }),
      new Paragraph({
        text: "O - Objective",
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 200, before: 200 }
      }),
      new Paragraph({
        text: sections.objective,
        spacing: { after: 300 }
      }),
      new Paragraph({
        text: "A - Assessment",
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 200, before: 200 }
      }),
      new Paragraph({
        text: sections.assessment,
        spacing: { after: 300 }
      }),
      new Paragraph({
        text: "P - Plan",
        heading: HeadingLevel.HEADING_3,
        spacing: { after: 200, before: 200 }
      }),
      new Paragraph({
        text: sections.plan,
        spacing: { after: 400 }
      })
    );

    if (sections.note) {
      docChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: "Important Note: ",
              bold: true,
              italics: true
            }),
            new TextRun({
              text: sections.note,
              italics: true
            })
          ],
          spacing: { after: 400, before: 200 }
        })
      );
    }

    docChildren.push(
      new Paragraph({
        text: "",
        spacing: { after: 400 }
      }),
      new Paragraph({
        text: "Full Conversation History",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 }
      })
    );
  } else {
    docChildren.push(
      new Paragraph({
        text: "Conversation",
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 }
      })
    );
  }

  // Add conversation messages
  messages.forEach(msg => {
    const isUser = msg.role === 'user';
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: isUser ? "You: " : "OpenMedicine: ",
            bold: true,
            color: isUser ? "2563EB" : "10B981"
          }),
          new TextRun({
            text: msg.content
          })
        ],
        spacing: { after: 200 }
      })
    );
  });

  docChildren.push(
    new Paragraph({
      text: "",
      spacing: { after: 400 }
    }),
    new Paragraph({
      text: "Important Reminders",
      heading: HeadingLevel.HEADING_2,
      spacing: { after: 200 }
    }),
    new Paragraph({
      text: "• If you have a medical emergency, call 911 immediately",
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: "• This conversation is for informational purposes only",
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: "• Always consult with healthcare professionals for medical advice",
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: "• Share this SOAP note with your healthcare provider for better care",
      spacing: { after: 100 }
    }),
    new Paragraph({
      text: "• Keep this document secure if it contains personal health information",
      spacing: { after: 400 }
    }),
    new Paragraph({
      text: "© 2025 OpenMedicine - AI Health Companion",
      italics: true,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400 }
    })
  );

  const doc = new Document({
    sections: [{
      properties: {},
      children: docChildren
    }]
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `openmedicine-soap-note-${new Date().toISOString().slice(0, 10)}.docx`;
  saveAs(blob, fileName);
};

export const exportChatAsText = (messages) => {
  const soapNote = extractSOAPNote(messages);
  const hasSoapNote = soapNote !== null;

  let text = "OPENMEDICINE - SOAP NOTE\n";
  text += "=".repeat(50) + "\n\n";
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += "Status: Secure • Anonymous • Educational Purpose Only\n\n";

  if (hasSoapNote) {
    const sections = parseSOAPSections(soapNote);

    text += "=".repeat(50) + "\n";
    text += "SOAP NOTE - HEALTH CONSULTATION SUMMARY\n";
    text += "=".repeat(50) + "\n\n";

    text += "S - SUBJECTIVE:\n";
    text += "-".repeat(50) + "\n";
    text += sections.subjective + "\n\n";

    text += "O - OBJECTIVE:\n";
    text += "-".repeat(50) + "\n";
    text += sections.objective + "\n\n";

    text += "A - ASSESSMENT:\n";
    text += "-".repeat(50) + "\n";
    text += sections.assessment + "\n\n";

    text += "P - PLAN:\n";
    text += "-".repeat(50) + "\n";
    text += sections.plan + "\n\n";

    if (sections.note) {
      text += "IMPORTANT NOTE:\n";
      text += "-".repeat(50) + "\n";
      text += sections.note + "\n\n";
    }

    text += "\n" + "=".repeat(50) + "\n";
    text += "FULL CONVERSATION HISTORY:\n";
    text += "=".repeat(50) + "\n\n";
  } else {
    text += "DISCLAIMER:\n";
    text += "This document contains general health information for educational purposes only.\n";
    text += "It is not medical advice, diagnosis, or treatment.\n";
    text += "Always consult with a qualified healthcare provider for medical concerns.\n\n";
    text += "=".repeat(50) + "\n";
    text += "CONVERSATION:\n";
    text += "=".repeat(50) + "\n\n";
  }

  messages.forEach(msg => {
    const speaker = msg.role === 'user' ? 'YOU' : 'OPENMEDICINE';
    text += `${speaker}:\n${msg.content}\n\n`;
  });

  text += "\n" + "=".repeat(50) + "\n";
  text += "IMPORTANT REMINDERS:\n";
  text += "• If you have a medical emergency, call 911 immediately\n";
  text += "• This conversation is for informational purposes only\n";
  text += "• Always consult with healthcare professionals for medical advice\n";
  text += "• Share this SOAP note with your healthcare provider for better care\n";
  text += "• Keep this document secure if it contains personal health information\n\n";
  text += "© 2025 OpenMedicine - AI Health Companion\n";

  const blob = new Blob([text], { type: 'text/plain' });
  const fileName = `openmedicine-soap-note-${new Date().toISOString().slice(0, 10)}.txt`;
  saveAs(blob, fileName);
};