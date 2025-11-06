import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';

// Helper function to extract SOAP note from the last message
const extractSOAPNote = (messages) => {
  const lastMessage = messages[messages.length - 1];
  if (lastMessage && lastMessage.role === 'ai') {
    const content = lastMessage.content;
    // Check if it contains SOAP note sections (both old and new formats)
    if (content.includes('**SOAP NOTE') ||
        content.includes('**Chief Complaint:**') ||
        content.includes('**S (Subjective):**') ||
        content.includes('S (Subjective):')) {
      return content;
    }
  }
  return null;
};

// Helper function to parse SOAP sections (supports both H&P and traditional SOAP formats)
const parseSOAPSections = (soapText) => {
  const sections = {
    chiefComplaint: '',
    hpi: '',
    pmh: '',
    psh: '',
    medications: '',
    allergies: '',
    ros: '',
    assessment: '',
    plan: '',
    // Legacy format support
    subjective: '',
    objective: '',
    note: ''
  };

  // New H&P format
  const ccMatch = soapText.match(/\*\*Chief Complaint:\*\*\s*([\s\S]*?)(?=\*\*History of Present Illness|$)/i);
  const hpiMatch = soapText.match(/\*\*History of Present Illness \(HPI\):\*\*\s*([\s\S]*?)(?=\*\*Past Medical History|$)/i);
  const pmhMatch = soapText.match(/\*\*Past Medical History \(PMH\):\*\*\s*([\s\S]*?)(?=\*\*Past Surgical History|$)/i);
  const pshMatch = soapText.match(/\*\*Past Surgical History \(PSH\):\*\*\s*([\s\S]*?)(?=\*\*Medications:|$)/i);
  const medsMatch = soapText.match(/\*\*Medications:\*\*\s*([\s\S]*?)(?=\*\*Allergies:|$)/i);
  const allergiesMatch = soapText.match(/\*\*Allergies:\*\*\s*([\s\S]*?)(?=\*\*Review of Systems|$)/i);
  const rosMatch = soapText.match(/\*\*Review of Systems \(ROS\):\*\*\s*([\s\S]*?)(?=\*\*Assessment:|$)/i);
  const assessmentMatch = soapText.match(/\*\*Assessment:\*\*\s*([\s\S]*?)(?=\*\*Plan:|$)/i);
  const planMatch = soapText.match(/\*\*Plan:\*\*\s*([\s\S]*?)(?=\*\*Remember:|---|\n\n\n|$)/i);

  // Legacy SOAP format
  const subjectiveMatch = soapText.match(/\*\*S \(Subjective\):\*\*\s*([\s\S]*?)(?=\*\*O \(Objective\):|$)/i);
  const objectiveMatch = soapText.match(/\*\*O \(Objective\):\*\*\s*([\s\S]*?)(?=\*\*A \(Assessment\):|$)/i);
  const legacyAssessmentMatch = soapText.match(/\*\*A \(Assessment\):\*\*\s*([\s\S]*?)(?=\*\*P \(Plan\):|$)/i);
  const legacyPlanMatch = soapText.match(/\*\*P \(Plan\):\*\*\s*([\s\S]*?)(?=\*\*Remember:|---|\n\n\n|$)/i);

  const noteMatch = soapText.match(/\*\*Remember:\*\*\s*([\s\S]*?)$/i);

  // New format
  if (ccMatch) sections.chiefComplaint = ccMatch[1].trim();
  if (hpiMatch) sections.hpi = hpiMatch[1].trim();
  if (pmhMatch) sections.pmh = pmhMatch[1].trim();
  if (pshMatch) sections.psh = pshMatch[1].trim();
  if (medsMatch) sections.medications = medsMatch[1].trim();
  if (allergiesMatch) sections.allergies = allergiesMatch[1].trim();
  if (rosMatch) sections.ros = rosMatch[1].trim();
  if (assessmentMatch) sections.assessment = assessmentMatch[1].trim();
  if (planMatch) sections.plan = planMatch[1].trim();

  // Legacy format
  if (subjectiveMatch) sections.subjective = subjectiveMatch[1].trim();
  if (objectiveMatch) sections.objective = objectiveMatch[1].trim();
  if (legacyAssessmentMatch && !sections.assessment) sections.assessment = legacyAssessmentMatch[1].trim();
  if (legacyPlanMatch && !sections.plan) sections.plan = legacyPlanMatch[1].trim();

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
    const isNewFormat = sections.chiefComplaint || sections.hpi;

    if (isNewFormat) {
      // New H&P format
      docChildren.push(
        new Paragraph({
          text: "Clinical H&P Note",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 300, before: 200 }
        })
      );

      if (sections.chiefComplaint) {
        docChildren.push(
          new Paragraph({
            text: "Chief Complaint",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200, before: 300 }
          }),
          new Paragraph({
            text: sections.chiefComplaint,
            spacing: { after: 300 }
          })
        );
      }

      if (sections.hpi) {
        docChildren.push(
          new Paragraph({
            text: "History of Present Illness (HPI)",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200, before: 200 }
          }),
          new Paragraph({
            text: sections.hpi,
            spacing: { after: 300 }
          })
        );
      }

      if (sections.pmh) {
        docChildren.push(
          new Paragraph({
            text: "Past Medical History (PMH)",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200, before: 200 }
          }),
          new Paragraph({
            text: sections.pmh,
            spacing: { after: 300 }
          })
        );
      }

      if (sections.psh) {
        docChildren.push(
          new Paragraph({
            text: "Past Surgical History (PSH)",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200, before: 200 }
          }),
          new Paragraph({
            text: sections.psh,
            spacing: { after: 300 }
          })
        );
      }

      if (sections.medications) {
        docChildren.push(
          new Paragraph({
            text: "Medications",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200, before: 200 }
          }),
          new Paragraph({
            text: sections.medications,
            spacing: { after: 300 }
          })
        );
      }

      if (sections.allergies) {
        docChildren.push(
          new Paragraph({
            text: "Allergies",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200, before: 200 }
          }),
          new Paragraph({
            text: sections.allergies,
            spacing: { after: 300 }
          })
        );
      }

      if (sections.ros) {
        docChildren.push(
          new Paragraph({
            text: "Review of Systems (ROS)",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200, before: 200 }
          }),
          new Paragraph({
            text: sections.ros,
            spacing: { after: 300 }
          })
        );
      }

      if (sections.assessment) {
        docChildren.push(
          new Paragraph({
            text: "Assessment",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200, before: 200 }
          }),
          new Paragraph({
            text: sections.assessment,
            spacing: { after: 300 }
          })
        );
      }

      if (sections.plan) {
        docChildren.push(
          new Paragraph({
            text: "Plan",
            heading: HeadingLevel.HEADING_3,
            spacing: { after: 200, before: 200 }
          }),
          new Paragraph({
            text: sections.plan,
            spacing: { after: 400 }
          })
        );
      }
    } else {
      // Legacy SOAP format
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
    }

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
      text: "© 2025 OpenMedicine - AI Menopause Specialist",
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
    const isNewFormat = sections.chiefComplaint || sections.hpi;

    text += "=".repeat(50) + "\n";
    if (isNewFormat) {
      text += "CLINICAL H&P NOTE\n";
    } else {
      text += "SOAP NOTE - HEALTH CONSULTATION SUMMARY\n";
    }
    text += "=".repeat(50) + "\n\n";

    if (isNewFormat) {
      // New H&P format
      if (sections.chiefComplaint) {
        text += "CHIEF COMPLAINT:\n";
        text += "-".repeat(50) + "\n";
        text += sections.chiefComplaint + "\n\n";
      }

      if (sections.hpi) {
        text += "HISTORY OF PRESENT ILLNESS (HPI):\n";
        text += "-".repeat(50) + "\n";
        text += sections.hpi + "\n\n";
      }

      if (sections.pmh) {
        text += "PAST MEDICAL HISTORY (PMH):\n";
        text += "-".repeat(50) + "\n";
        text += sections.pmh + "\n\n";
      }

      if (sections.psh) {
        text += "PAST SURGICAL HISTORY (PSH):\n";
        text += "-".repeat(50) + "\n";
        text += sections.psh + "\n\n";
      }

      if (sections.medications) {
        text += "MEDICATIONS:\n";
        text += "-".repeat(50) + "\n";
        text += sections.medications + "\n\n";
      }

      if (sections.allergies) {
        text += "ALLERGIES:\n";
        text += "-".repeat(50) + "\n";
        text += sections.allergies + "\n\n";
      }

      if (sections.ros) {
        text += "REVIEW OF SYSTEMS (ROS):\n";
        text += "-".repeat(50) + "\n";
        text += sections.ros + "\n\n";
      }

      if (sections.assessment) {
        text += "ASSESSMENT:\n";
        text += "-".repeat(50) + "\n";
        text += sections.assessment + "\n\n";
      }

      if (sections.plan) {
        text += "PLAN:\n";
        text += "-".repeat(50) + "\n";
        text += sections.plan + "\n\n";
      }
    } else {
      // Legacy SOAP format
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
    }

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
  text += "© 2025 OpenMedicine - AI Menopause Specialist\n";

  const blob = new Blob([text], { type: 'text/plain' });
  const fileName = `openmedicine-soap-note-${new Date().toISOString().slice(0, 10)}.txt`;
  saveAs(blob, fileName);
};