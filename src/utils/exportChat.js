import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export const exportChatAsDocx = async (messages) => {
  const doc = new Document({
    sections: [{
      properties: {},
      children: [
        new Paragraph({
          text: "OpenMedicine - Health Consultation Summary",
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
        }),
        new Paragraph({
          text: "Disclaimer",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 }
        }),
        new Paragraph({
          text: "This document contains general health information for educational purposes only. It is not medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.",
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: "Conversation",
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 }
        }),
        ...messages.map(msg => {
          const isUser = msg.role === 'user';
          return new Paragraph({
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
          });
        }),
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
          text: "• Keep this document secure if it contains personal health information",
          spacing: { after: 400 }
        }),
        new Paragraph({
          text: "© 2025 OpenMedicine - AI Health Companion",
          italics: true,
          alignment: "center",
          spacing: { before: 400 }
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `openhealth-chat-${new Date().toISOString().slice(0, 10)}.docx`;
  saveAs(blob, fileName);
};

export const exportChatAsText = (messages) => {
  let text = "OPENHEALTH - HEALTH CONSULTATION SUMMARY\n";
  text += "=".repeat(40) + "\n\n";
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += "Status: Secure • Anonymous • Educational Purpose Only\n\n";
  text += "DISCLAIMER:\n";
  text += "This document contains general health information for educational purposes only.\n";
  text += "It is not medical advice, diagnosis, or treatment.\n";
  text += "Always consult with a qualified healthcare provider for medical concerns.\n\n";
  text += "=".repeat(40) + "\n";
  text += "CONVERSATION:\n";
  text += "=".repeat(40) + "\n\n";

  messages.forEach(msg => {
    const speaker = msg.role === 'user' ? 'YOU' : 'OPENHEALTH';
    text += `${speaker}:\n${msg.content}\n\n`;
  });

  text += "\n" + "=".repeat(40) + "\n";
  text += "IMPORTANT REMINDERS:\n";
  text += "• If you have a medical emergency, call 911 immediately\n";
  text += "• This conversation is for informational purposes only\n";
  text += "• Always consult with healthcare professionals for medical advice\n";
  text += "• Keep this document secure if it contains personal health information\n\n";
  text += "© 2025 OpenMedicine - AI Health Companion\n";

  const blob = new Blob([text], { type: 'text/plain' });
  const fileName = `openmedicine-chat-${new Date().toISOString().slice(0, 10)}.txt`;
  saveAs(blob, fileName);
};