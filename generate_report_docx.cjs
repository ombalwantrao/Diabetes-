const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  PageBreak
} = require('docx');

function createHeader() {
  return new Header({
    children: [
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: "AN-3K ITR (315004)", size: 18, font: "Calibri", bold: true }),
          new TextRun({ text: "\t\t\t\t\t\t\t\tA.Y.: 2026-27", size: 18, font: "Calibri", bold: true })
        ]
      })
    ]
  });
}

function createFooter() {
  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({
            text: "| D I P L O M A   I N   A R T I F I C I A L   I N T E L L I G E N C E   &   M A C H I N E   L E A R N I N G |   Page ",
            size: 16,
            font: "Calibri"
          }),
          new TextRun({
            children: [PageNumber.CURRENT],
            size: 16,
            font: "Calibri",
            bold: true
          })
        ]
      })
    ]
  });
}

// Styling helpers
const primaryFont = "Calibri";
const titleFont = "Calibri";

function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    children: [
      new TextRun({
        text,
        font: titleFont,
        size: 32, // 16pt
        bold: true,
        color: "1E293B"
      })
    ]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [
      new TextRun({
        text,
        font: titleFont,
        size: 26, // 13pt
        bold: true,
        color: "2563EB"
      })
    ]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text,
        font: titleFont,
        size: 22, // 11pt
        bold: true,
        color: "0F172A"
      })
    ]
  });
}

function p(text, options = {}) {
  return new Paragraph({
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    spacing: { before: 80, after: 100, line: 276 }, // 1.15 line spacing
    children: [
      new TextRun({
        text,
        font: primaryFont,
        size: 22, // 11pt
        bold: !!options.bold,
        italics: !!options.italics,
        color: options.color || "334155"
      })
    ]
  });
}

function bullet(text, boldPrefix = "") {
  const children = [];
  if (boldPrefix) {
    children.push(new TextRun({ text: boldPrefix + " ", font: primaryFont, size: 22, bold: true, color: "0F172A" }));
  }
  children.push(new TextRun({ text, font: primaryFont, size: 22, color: "334155" }));

  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40, after: 60, line: 260 },
    children
  });
}

function createStyledTable(headers, rows, colWidths = []) {
  const borderStyle = { style: BorderStyle.SINGLE, size: 1, color: "CBD5E1" };
  const cellBorders = { top: borderStyle, bottom: borderStyle, left: borderStyle, right: borderStyle };

  const tableRows = [];

  // Header row
  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map((h, idx) =>
        new TableCell({
          borders: cellBorders,
          width: colWidths[idx] ? { size: colWidths[idx], type: WidthType.DXA } : undefined,
          shading: { fill: "F1F5F9" },
          margins: { top: 120, bottom: 120, left: 140, right: 140 },
          children: [
            new Paragraph({
              alignment: AlignmentType.LEFT,
              children: [new TextRun({ text: h, font: primaryFont, size: 20, bold: true, color: "0F172A" })]
            })
          ]
        })
      )
    })
  );

  // Data rows
  rows.forEach((row, rIdx) => {
    tableRows.push(
      new TableRow({
        children: row.map((cellText, idx) =>
          new TableCell({
            borders: cellBorders,
            width: colWidths[idx] ? { size: colWidths[idx], type: WidthType.DXA } : undefined,
            shading: rIdx % 2 === 1 ? { fill: "F8FAFC" } : undefined,
            margins: { top: 100, bottom: 100, left: 140, right: 140 },
            children: [
              new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                  new TextRun({
                    text: cellText,
                    font: primaryFont,
                    size: 20,
                    bold: idx === 0 && row.length > 2 ? false : idx === 0,
                    color: "334155"
                  })
                ]
              })
            ]
          })
        )
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows
  });
}

function keyLearningsBox(items) {
  return [
    heading3("KEY LEARNINGS & OUTCOMES:"),
    ...items.map(item => bullet(item))
  ];
}

async function buildDoc() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: primaryFont, size: 22, color: "334155" }
        }
      }
    },
    sections: [
      {
        properties: {},
        headers: { default: createHeader() },
        footers: { default: createFooter() },
        children: [
          // ================= COVER PAGE =================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 160 },
            children: [
              new TextRun({ text: "MAHARASHTRA STATE BOARD OF TECHNICAL EDUCATION", font: titleFont, size: 28, bold: true, color: "0F172A" }),
              new TextRun({ text: "\n(MSBTE)", font: titleFont, size: 28, bold: true, color: "2563EB" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 200 },
            children: [
              new TextRun({ text: "REPORT ON INDUSTRIAL TRAINING (315004)", font: primaryFont, size: 24, bold: true, color: "475569" }),
              new TextRun({ text: "\nACADEMIC YEAR: 2026 - 2027", font: primaryFont, size: 22, bold: true, color: "0F172A" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 160 },
            children: [
              new TextRun({ text: "DIABETES PREDICTION SYSTEM", font: titleFont, size: 36, bold: true, color: "1E3A8A" }),
              new TextRun({ text: "\nA Full-Stack Machine Learning Web Application for Early Clinical Glycemic Risk Assessment", font: primaryFont, size: 22, italics: true, color: "475569" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 500, after: 200 },
            children: [
              new TextRun({ text: "Submitted by:\n", font: primaryFont, size: 22, color: "64748B" }),
              new TextRun({ text: "[STUDENT FULL NAME]\n", font: primaryFont, size: 26, bold: true, color: "B91C1C" }),
              new TextRun({ text: "Enrollment No.: [Enrollment Number]\nSeat No.: [Seat Number]\n", font: primaryFont, size: 22, color: "334155" }),
              new TextRun({ text: "DIPLOMA IN ARTIFICIAL INTELLIGENCE AND MACHINE LEARNING", font: primaryFont, size: 24, bold: true, color: "0F172A" })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 600, after: 300 },
            children: [
              new TextRun({ text: "YASHODA TECHNICAL CAMPUS, FACULTY OF POLYTECHNIC, SATARA\n", font: titleFont, size: 26, bold: true, color: "0F172A" }),
              new TextRun({ text: "Department of Artificial Intelligence & Machine Learning\nInstitute Code: 1664", font: primaryFont, size: 22, color: "475569" })
            ]
          }),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CERTIFICATE OF COMPLETION =================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "Maharashtra State Board of Technical Education", font: titleFont, size: 28, bold: true, color: "0F172A" }),
              new TextRun({ text: "\nCERTIFICATE OF COMPLETION", font: titleFont, size: 30, bold: true, color: "1E3A8A" }),
              new TextRun({ text: "\nof Industrial Training (315004)", font: primaryFont, size: 22, italics: true, color: "475569" })
            ]
          }),
          p("This is to certify that Mr./Ms. [Student Full Name] with Enrollment No. [Enrollment Number] has successfully completed Industrial Training (315004) at Swami Logipool InfoTech, Warje, Pune from 01/06/2026 to 21/08/2026 for partial fulfillment towards completion of Diploma in Artificial Intelligence & Machine Learning from Yashoda Technical Campus, Faculty of Polytechnic, Satara."),
          p("During this industrial training, the candidate developed a comprehensive, production-grade project titled \"Diabetes Prediction System (ITR Project)\" implementing full-stack machine learning workflows, exploratory data analysis, dynamic physiological feature engineering, model benchmarking, and Flask REST API web deployment."),
          p("Institute Code: 1664\nAcademic Year: 2026 - 2027", { bold: true }),
          new Paragraph({ spacing: { before: 400, after: 200 }, children: [] }),

          // Signatures table
          createStyledTable(
            ["Mr. Gosavi P.R.", "Mr. Dakshat Pawale", "Ms. Dolas S.G.", "Dr. Mrs. Jadhav M.S."],
            [
              [
                "Mentor (Institute)\nYashoda Tech Campus",
                "Project Guide (Industry)\nSwami Logipool InfoTech",
                "Head of Department\nAIML Department",
                "Principal\nYashoda Tech Campus"
              ]
            ],
            [2300, 2300, 2300, 2300]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= ABSTRACT =================
          heading1("ABSTRACT"),
          p("Diabetes mellitus is an escalating global metabolic disorder characterized by chronic hyperglycemia resulting from defects in insulin secretion, action, or both. Early detection and proactive clinical intervention can significantly mitigate acute and chronic microvascular and macrovascular complications. However, conventional laboratory screenings require specialized assays and clinical consultation, often delaying early-stage risk detection."),
          p("This project, \"Diabetes Prediction System (ITR Project),\" was undertaken to design and develop a Machine Learning-based system that predicts whether a patient is at risk of diabetes based on routine diagnostic biometrics (plasma glucose, blood pressure, insulin, body mass index, skinfold thickness, diabetes pedigree function, and age)."),
          p("The project follows a complete, industry-standard Machine Learning lifecycle: problem definition, data collection, exploratory data analysis, physiological zero-value imputation, dynamic feature engineering, multi-model benchmarking, and final deployment. On a clinical dataset of 768 patient records with 14 total columns (diabetes_featured.csv), three candidate algorithms (Logistic Regression, Random Forest, and Gradient Boosting) were trained and evaluated. The Gradient Boosting Classifier was selected as the final champion model based on its superior ROC-AUC score of 0.8522, test accuracy of 78.57%, and balanced recall."),
          p("The trained model pipeline was serialized via joblib (model.pkl, scaler.pkl) and integrated into a Python Flask REST API backend. A modern, responsive web dashboard (built with HTML, Tailwind CSS, and JavaScript) was created to enable clinicians and users to adjust biometrics through interactive dual controls, observe live mathematical calculations of derived features, and view prediction outcomes with an animated radial SVG gauge, 3-tier risk badges (Low, Moderate, High), and clinical factor attributions."),
          p("During 12 Weeks at Swami Logipool Infotech, Pune, I mastered the complete workflow of translating a machine learning idea into a functional web application—including practical skills in clinical data preprocessing, model evaluation, REST API architecture, and frontend integration—applying concepts learned as an Artificial Intelligence & Machine Learning student at Yashoda Technical Campus, Satara."),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= ACKNOWLEDGEMENT =================
          heading1("ACKNOWLEDGEMENT"),
          p("To become a professional in Artificial Intelligence & Machine Learning, industrial training is the foundation for each undergraduate student. It helps students to improve their practical skills related to interpersonal collaboration, problem solving, research, and technical reporting. In addition, it exposes students to the software industry, bridges theoretical concepts with real-world applications, and prepares them for future employment."),
          p("I hereby extend my sincere appreciation and thankfulness to my helpful internship supervisor and guide, Mr. Dakshat Pawale (Swami Logipool Infotech, Pune), who provided continuous mentorship, algorithmic insights, and technical advice throughout the development of this project."),
          p("Further, I would like to express my profound gratitude to Dr. Mrs. Jadhav M.S., Principal of Yashoda Technical Campus, Faculty of Polytechnic, Satara, for her institutional encouragement and support. I also express my sincere gratitude to Ms. Dolas S.G., Head of the Department of Artificial Intelligence and Machine Learning, for her guidance and curriculum supervision."),
          p("My heartfelt thanks also go to Mr. Gosavi P.R., my institute mentor, who was constantly in touch with us during the whole internship period, reviewing project progress and ensuring adherence to academic guidelines."),
          p("Lastly, this industrial training program helped me appreciate the true value of teamwork, disciplined engineering practices, and mutual collaboration. I thank all the faculty members, industry trainers, and fellow students who supported me throughout this journey."),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= TABLE OF CONTENTS =================
          heading1("CONTENT PAGE (TABLE OF CONTENTS)"),
          createStyledTable(
            ["Sr. No", "Chapters", "Page No."],
            [
              ["1.", "Organization Structure & General Layout", "1"],
              ["2.", "Industry Overview & Background History & Mission", "3"],
              ["3.", "Software, Hardware/Tools Used", "5"],
              ["4.", "Introduction to Machine Learning & Project Planning", "7"],
              ["5.", "Dataset Collection, Understanding & Data Preprocessing", "9"],
              ["6.", "Exploratory Data Analysis & Feature Engineering", "12"],
              ["7.", "Model Selection, Training and Evaluation", "15"],
              ["8.", "Flask Backend Development & Model Integration", "18"],
              ["9.", "Frontend Development & Dashboard UI Design", "21"],
              ["10.", "Prediction Results, Model Performance & Validation", "24"],
              ["11.", "Project Finalization, Testing & UI Enhancements", "27"],
              ["12.", "Project Description & Repository Architecture", "29"],
              ["13.", "Future Scope & Enhancements", "32"],
              ["-", "References & Bibliography", "34"]
            ],
            [1200, 6800, 1200]
          ),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 1 =================
          heading1("CHAPTER 1: ORGANIZATION STRUCTURE & GENERAL LAYOUT"),
          heading2("1.1 Introduction to Swami Logipool Infotech"),
          p("Swami Logipool Infotech, Warje, Pune, provides a professional environment for technical learning and practical industrial training. It offers internship programs that help engineering and polytechnic students gain hands-on experience on live enterprise and applied data science projects."),
          p("During my Industrial Training, I worked in the Data Science and Machine Learning domain and developed the \"Diabetes Prediction System (ITR Project)\". The system employs supervised machine learning models to predict clinical glycemic risk, calculate risk probabilities, and present clear medical recommendations to support early diagnostic triage."),
          p("I worked with Python, Pandas, NumPy, Scikit-learn, Joblib, Flask, HTML, Tailwind CSS, and JavaScript for data cleaning, model benchmarking, REST API development, and web application integration."),
          
          heading2("1.2 Organization Profile"),
          createStyledTable(
            ["Particular", "Details"],
            [
              ["Organization Name", "Swami Logipool Infotech Pvt. Ltd."],
              ["Location", "Dodke Dnyanleela, Warje Malwadi, Pune - 411058, Maharashtra"],
              ["Industry", "Information Technology & Software Services"],
              ["Training Domain", "Data Science & Machine Learning"],
              ["Training Type", "Industrial Training / Internship (AN-3K ITR 315004)"],
              ["Training Duration", "01/06/2026 to 21/08/2026 (12 Weeks)"],
              ["Project Title", "Diabetes Prediction System (ITR Project)"],
              ["Main Technologies", "Python, Pandas, NumPy, Scikit-learn, Flask, HTML, CSS, JavaScript"]
            ],
            [3000, 6200]
          ),

          heading2("1.3 Role of the Organization in Industrial Training"),
          p("The industrial training provided an invaluable opportunity to convert theoretical classroom knowledge into production-ready practical skills. The training followed a structured sequence:"),
          p("Problem Identification → Dataset Profiling → Anomaly Imputation → Exploratory Data Analysis → Feature Engineering → Model Benchmarking → Evaluation & Champion Selection → Flask API Development → Frontend Dashboard Design → System Testing → Final Deployment", { bold: true }),

          ...keyLearningsBox([
            "Learned to work within a professional IT software development culture.",
            "Acquired practical data science experience using Pandas, NumPy, and Scikit-learn.",
            "Understood real-world machine learning pipelines from raw CSV ingestion to serialized artifact deployment.",
            "Strengthened full-stack capabilities by integrating ML models into a Python Flask web server.",
            "Improved debugging, code refactoring, teamwork, and technical documentation."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 2 =================
          heading1("CHAPTER 2: INDUSTRY OVERVIEW & BACKGROUND HISTORY & MISSION"),
          heading2("2.1 Industry Overview"),
          p("The Information Technology (IT) industry, particularly the HealthTech and Artificial Intelligence verticals, is experiencing unprecedented growth. Predictive analytics and clinical machine learning models are transforming traditional healthcare from reactive illness management to proactive early diagnosis. By identifying physiological risk patterns before acute clinical symptoms emerge, predictive tools empower patients and medical staff to initiate preventive lifestyle interventions."),
          p("Swami Logipool Infotech focuses on IT education, bespoke enterprise development, and practical skill building, equipping students with the modern tools necessary to build production-grade AI solutions."),

          heading2("2.2 Background History of the Organization"),
          p("Swami Logipool Infotech began its journey in 2018 with a focus on quality IT training and software services. Key organizational milestones include:"),
          bullet("2018: Inception with corporate training in software engineering and web technologies."),
          bullet("2020: Transitioned to advanced hybrid digital training methodologies during the pandemic."),
          bullet("2021: Successfully trained and placed over 300 students in reputable IT firms."),
          bullet("2022: Expanded curriculum to over 500 learners across high-demand frameworks."),
          bullet("2023–2024: Strengthened industry-academia partnerships and enterprise consulting."),
          bullet("2025–2026: Introduced specialized industrial internship tracks in Applied Machine Learning, MLOps, and Cloud-native REST architectures."),

          heading2("2.3 Organizational Mission"),
          p("The mission of Swami Logipool InfoTech is to provide practical, career-focused technical education and cultivate industry-ready software engineers. The organization emphasizes modern technology stacks, real-world data constraints, hands-on lab sessions, and holistic project mentoring to bridge the gap between academic curricula and industrial needs."),

          ...keyLearningsBox([
            "Understood the operational history and development trajectory of an IT services firm.",
            "Gained perspective on the rising adoption of predictive AI in clinical and healthcare domains.",
            "Recognized the importance of industrial internships in developing career readiness."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 3 =================
          heading1("CHAPTER 3: SOFTWARE, HARDWARE/TOOLS USED"),
          heading2("3.1 Hardware Configuration"),
          p("The computational hardware utilized during the development and benchmarking of the project satisfied modern enterprise standards:"),
          createStyledTable(
            ["Sr. No.", "Component", "Requirement / Specification"],
            [
              ["1", "Operating System", "Windows 11 (64-bit) / Ubuntu Linux 22.04 LTS"],
              ["2", "Processor", "Intel Core Ultra 5 / Core i5 (12th Gen+) @ 3.40 GHz"],
              ["3", "RAM", "16 GB DDR4 (3200 MHz)"],
              ["4", "Storage", "512 GB NVMe M.2 Solid State Drive (SSD)"],
              ["5", "Graphics", "Integrated Intel Iris Xe Graphics"],
              ["6", "Display", "15.6-inch Full HD (1920 × 1080) LED Display"],
              ["7", "Connectivity", "Wi-Fi 6, Bluetooth 5.2, Gigabit Ethernet"],
              ["8", "I/O Ports", "USB 3.2, HDMI 2.0, 3.5mm Audio Combo Jack"],
              ["9", "Peripherals", "Integrated HD Webcam, Array Microphone, Keyboard & Optical Mouse"]
            ],
            [1000, 3200, 5000]
          ),

          heading2("3.2 Software Environment & Libraries"),
          p("The software ecosystem was built upon a pure Python open-source stack coupled with modern frontend web standards:"),
          bullet("Python 3.10+: Core programming language chosen for its vast data science ecosystem and robust web frameworks."),
          bullet("Pandas (v2.2.2): Tabular data structures (DataFrames), data ingestion, filtering, and statistical aggregations."),
          bullet("NumPy (v1.26.4): High-performance N-dimensional array processing and mathematical transformations."),
          bullet("Scikit-Learn (v1.5.0): Implementation of StandardScaler, train-test splitting, and classification algorithms (LogisticRegression, RandomForestClassifier, GradientBoostingClassifier)."),
          bullet("Joblib (v1.4.2): Efficient serialization and deserialization of Python data science objects (model.pkl and scaler.pkl)."),
          bullet("Flask (v3.0.3) & Flask-CORS: Lightweight WSGI web framework for defining JSON REST API endpoints (/predict, /health)."),
          bullet("Tailwind CSS: Modern utility-first CSS framework for crafting responsive, high-contrast user interfaces."),
          bullet("Visual Studio Code: Source code editor utilized for debugging Python scripts, writing Flask routes, and editing templates."),
          bullet("Google Chrome: Browser utilized for rendering the diagnostic dashboard, testing AJAX payloads, and verifying responsive layouts."),

          ...keyLearningsBox([
            "Configured an isolated Python virtual environment to manage dependencies safely.",
            "Learned how Scikit-Learn transformers and pipelines prevent data leakage.",
            "Employed Joblib for lightweight and fast persistence of machine learning estimators."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 4 =================
          heading1("CHAPTER 4: INTRODUCTION TO MACHINE LEARNING & PROJECT PLANNING"),
          heading2("4.1 Overview of Machine Learning & Binary Classification"),
          p("Machine Learning is a subfield of Artificial Intelligence where algorithms learn inductive statistical patterns from historical data to make accurate inferences on previously unseen observations. In supervised binary classification, each training sample consists of an input feature vector X and a discrete ground-truth label y ∈ {0, 1}."),
          p("In this project, the target is binary: Outcome = 0 represents a Non-Diabetic patient, while Outcome = 1 represents a Diabetic patient."),

          heading2("4.2 Clinical Problem Statement"),
          p("Early diagnosis of diabetes mellitus is vital for initiating glycemic control, dietary modifications, and physical therapies before irreversible microvascular damage (nephropathy, retinopathy, neuropathy) occurs. Traditional clinical screenings require laboratory blood draws, fasting protocols, and multi-hour oral glucose tolerance tests, resulting in diagnostic delays."),
          p("The objective of this project is to build an accurate, non-invasive, and instantaneous web-based clinical decision-support system. By analyzing standard routine physiological parameters and deriving compound metabolic features, the system predicts diabetes onset probability and stratifies patients into Low, Moderate, or High-Risk categories."),

          heading2("4.3 Prediction Target & Project Workflow"),
          createStyledTable(
            ["Specification Parameter", "Project Value"],
            [
              ["Target Variable", "Outcome (0: Non-Diabetic, 1: Diabetic)"],
              ["Problem Type", "Supervised Binary Classification & Continuous Risk Scoring"],
              ["Total Clinical Observations", "768 patient records"],
              ["Raw Clinical Features", "8 physiological attributes"],
              ["Engineered Features", "5 compound interaction & categorical features"],
              ["Total Model Features", "13 standardized input dimensions"]
            ],
            [4000, 5200]
          ),

          p("Planned Engineering Stages:\n1. Dataset Profiling & Anomaly Resolution → 2. Exploratory Data Analysis → 3. Dynamic Feature Engineering → 4. Model Benchmarking & Metric Evaluation → 5. Champion Model Serialization → 6. Flask REST API Construction → 7. Interactive Frontend Development → 8. End-to-End System Testing", { bold: true }),

          ...keyLearningsBox([
            "Formulated a rigorous clinical problem statement with clear mathematical objectives.",
            "Understood the distinction between classification labels and continuous probability estimates.",
            "Structured an end-to-end development roadmap aligning data science with web engineering."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 5 =================
          heading1("CHAPTER 5: DATASET COLLECTION, UNDERSTANDING & DATA PREPROCESSING"),
          heading2("5.1 Dataset Overview"),
          p("The project utilizes the benchmark clinical diabetes dataset (diabetes_featured.csv) containing 768 patient records. The records originate from the National Institute of Diabetes and Digestive and Kidney Diseases registry and focus on female patients of Pima ancestry aged 21 and older."),

          heading2("5.2 Clinical Feature Definitions"),
          createStyledTable(
            ["Feature Name", "Data Type", "Clinical Meaning & Unit", "Expected Range"],
            [
              ["Pregnancies", "Integer", "Number of pregnancies", "0 - 17"],
              ["Glucose", "Numeric", "2-hr plasma glucose concentration (mg/dL)", "70 - 200 mg/dL"],
              ["BloodPressure", "Numeric", "Diastolic blood pressure (mm Hg)", "40 - 130 mm Hg"],
              ["SkinThickness", "Numeric", "Triceps skinfold thickness (mm)", "10 - 60 mm"],
              ["Insulin", "Numeric", "2-hr serum insulin level (μU/mL)", "15 - 300 μU/mL"],
              ["BMI", "Numeric", "Body Mass Index (weight in kg / (height in m)^2)", "15.0 - 55.0 kg/m²"],
              ["DiabetesPedigreeFunction", "Numeric", "Genetic family history predisposition score", "0.05 - 2.50"],
              ["Age", "Integer", "Patient age in completed years", "21 - 85 years"]
            ],
            [2200, 1400, 3600, 2000]
          ),

          heading2("5.3 Data Cleaning & Anomaly Imputation"),
          p("In raw medical datasets, zero values often represent missing entries rather than true biological readings. A living individual cannot have a blood pressure of 0 mm Hg, a glucose level of 0 mg/dL, or a BMI of 0 kg/m²."),
          bullet("Glucose, BloodPressure, SkinThickness, Insulin, and BMI readings recorded as 0 were flagged as biological anomalies."),
          bullet("These values were imputed using class-conditional medians (grouped by Outcome) to preserve underlying variance without introducing arbitrary artificial bias."),
          bullet("Extreme outliers were verified against standard physiological limits (e.g. BMI ≤ 70, Glucose ≤ 400 mg/dL)."),
          bullet("The dataset was partitioned into an 80% training set (614 samples) and a 20% test set (154 samples) using stratified sampling (random_state=42) to preserve positive-to-negative class balance."),

          ...keyLearningsBox([
            "Recognized the critical importance of domain knowledge when diagnosing data anomalies.",
            "Applied class-conditional median imputation to resolve physiologically missing biological values.",
            "Employed stratified train-test splitting to prevent class distribution shifts."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 6 =================
          heading1("CHAPTER 6: EXPLORATORY DATA ANALYSIS & FEATURE ENGINEERING"),
          heading2("6.1 Exploratory Data Analysis (EDA) Insights"),
          p("EDA revealed significant correlations between specific biometrics and diabetic status:"),
          bullet("Fasting Plasma Glucose showed the single strongest linear correlation (r ≈ 0.49) with the positive class."),
          bullet("BMI and Insulin displayed substantial right-skewness, illustrating a strong clustering of metabolic resistance among diabetic patients."),
          bullet("Age and prior pregnancy counts exhibited compounding interaction effects, where older patients with high parity demonstrated diminished beta-cell responsiveness."),

          heading2("6.2 Dynamic Physiological Feature Engineering"),
          p("To capture multi-system metabolic interactions that individual raw variables cannot represent, 5 high-impact features were engineered:"),
          createStyledTable(
            ["Feature Name", "Mathematical Formulation", "Clinical Significance"],
            [
              ["Glucose_BMI", "Glucose × BMI", "Models combined metabolic stress of hyperglycemia & excessive adiposity."],
              ["Age_BMI", "Age × BMI", "Captures cumulative lifetime duration of excess weight burden."],
              ["Glucose_Age", "Glucose × Age", "Represents cumulative vascular wear and beta-cell degradation over time."],
              ["BMI_Category", "0: <18.5, 1: 18.5-24.9, 2: 25-29.9, 3: ≥30", "Encodes discrete WHO obesity staging (Underweight, Normal, Overweight, Obese)."],
              ["Age_Category", "0: <30 (Young), 1: 30-49 (Middle), 2: ≥50 (Senior)", "Captures discrete life-stage risk thresholds for insulin resistance."]
            ],
            [2200, 2600, 4400]
          ),

          heading2("6.3 Standardization via StandardScaler"),
          p("Because numerical features vary widely in magnitude (e.g., Glucose_Age exceeds 10,000 while DiabetesPedigreeFunction ranges from 0.08 to 2.42), Scikit-Learn's StandardScaler was fitted strictly on the 13 training features and serialized as scaler.pkl:"),
          p("z = (x - μ) / σ", { bold: true, alignment: AlignmentType.CENTER }),
          p("This transformation ensures equal variance across dimensions, preventing gradient bias and optimizing model convergence."),

          ...keyLearningsBox([
            "Designed physiologically meaningful interaction features that markedly elevated model discriminative power.",
            "Converted continuous clinical thresholds into ordinal categorical encodings.",
            "Prevented data leakage by fitting the StandardScaler strictly on the training partition."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 7 =================
          heading1("CHAPTER 7: MODEL SELECTION, TRAINING & EVALUATION"),
          heading2("7.1 Candidate Classification Algorithms"),
          p("Three diverse machine learning algorithms were trained and benchmarked under identical conditions:"),
          bullet("Logistic Regression: Linear generalized model serving as an interpretable statistical baseline with L2 regularization."),
          bullet("Random Forest Classifier: Bagging ensemble combining 150 randomized decision trees to minimize model variance."),
          bullet("Gradient Boosting Classifier: Boosting ensemble consisting of 120 sequentially optimized shallow estimators minimizing cross-entropy deviance."),

          heading2("7.2 Model Benchmark Results (Test Set)"),
          createStyledTable(
            ["Model", "Test Accuracy", "ROC-AUC Score", "Precision", "Recall", "F1-Score"],
            [
              ["Logistic Regression", "77.27%", "0.8354", "71.15%", "68.52%", "0.6981"],
              ["Random Forest (150 trees)", "77.92%", "0.8410", "73.08%", "70.37%", "0.7170"],
              ["Gradient Boosting (Champion)", "78.57%", "0.8522", "74.51%", "70.37%", "0.7238"]
            ],
            [2600, 1300, 1300, 1300, 1300, 1400]
          ),

          heading2("7.3 Champion Model Justification & Serialization"),
          p("The Gradient Boosting Classifier was selected as the final champion model. It achieved the highest ROC-AUC score (0.8522) and test accuracy (78.57%), demonstrating superior capability in ranking true diabetic patients above non-diabetic individuals across varying decision thresholds."),
          p("Analysis of feature importance indicated that the engineered feature Glucose_BMI contributed over 21% of total decision splits, validating the feature engineering hypothesis."),
          p("Both the champion model and the fitted scaler were serialized to disk using joblib:"),
          bullet("model.pkl: Contains the serialized Gradient Boosting model pipeline."),
          bullet("scaler.pkl: Contains the mean and standard deviation vectors of the 13 training features."),

          ...keyLearningsBox([
            "Learned to rigorously compare multiple classifiers using multi-metric evaluation criteria.",
            "Understood the clinical significance of ROC-AUC and Recall in disease screening tasks.",
            "Exported reproducible model pipelines to disk using joblib."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 8 =================
          heading1("CHAPTER 8: FLASK BACKEND DEVELOPMENT & MODEL INTEGRATION"),
          heading2("8.1 Backend Architecture Overview"),
          p("The backend was engineered using Python Flask (app.py) as a lightweight, high-performance WSGI microservice. It serves the static diagnostic frontend and provides stateless JSON REST API endpoints."),

          heading2("8.2 API Endpoints Specification"),
          createStyledTable(
            ["Endpoint", "HTTP Method", "Input Format", "Response Format", "Description"],
            [
              ["/", "GET", "None", "text/html", "Serves the main diagnostic dashboard."],
              ["/health", "GET", "None", "application/json", "Health check confirming model.pkl and scaler.pkl status."],
              ["/predict", "POST", "JSON / Form", "application/json", "Accepts 8 raw inputs, derives 5 features, returns prediction & risk level."]
            ],
            [1400, 1200, 1600, 1800, 3200]
          ),

          heading2("8.3 On-the-Fly Feature Engineering at Inference Time"),
          p("To provide a seamless user experience, the client is only required to supply the 8 routine biometrics. Upon receiving a request at /predict, the Flask backend dynamically calculates the 5 engineered variables before assembling the 13-feature array:"),
          bullet("Glucose_BMI = Glucose * BMI"),
          bullet("Age_BMI = Age * BMI"),
          bullet("Glucose_Age = Glucose * Age"),
          bullet("BMI_Category = categorized (0 to 3) according to WHO bounds"),
          bullet("Age_Category = categorized (0 to 2) according to age thresholds"),
          p("The full vector is passed through scaler.transform() and evaluated with model.predict_proba(), ensuring complete parity with the training pipeline."),

          ...keyLearningsBox([
            "Architected a modular REST API separating inference logic from presentation layers.",
            "Implemented on-the-fly feature engineering to guarantee pipeline consistency.",
            "Added robust payload validation and error handling for out-of-range requests."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 9 =================
          heading1("CHAPTER 9: FRONTEND DEVELOPMENT & DASHBOARD UI DESIGN"),
          heading2("9.1 User Interface Architecture"),
          p("The user interface was built using HTML5, modern Tailwind CSS, and vanilla JavaScript. Designed following clinical Human-Computer Interaction (HCI) standards, the interface presents a clean, distraction-free environment:"),
          bullet("Synchronized Dual Controls: Every biometric parameter features both an interactive slider and a numeric input box that remain continuously synchronized."),
          bullet("Dynamic Telemetry Bar: Displays real-time calculations for Glucose_BMI, Age_BMI, and categorical tiers as the user moves the sliders."),
          bullet("1-Click Clinical Presets: Three pre-configured patient archetypes (Healthy Baseline, Pre-Diabetic Profile, High-Risk Case) allow immediate demonstration and validation."),
          bullet("Asynchronous Communication: Uses the native JavaScript fetch() API to post data to /predict without page refreshes, providing instant tactile feedback."),

          heading2("9.2 UI Page Layout & Structure"),
          p("The dashboard layout utilizes a responsive two-column grid:"),
          bullet("Left Column: Biometric input controls organized by physiological groups (Metabolic Indicators, Physical Measurements, and Clinical History)."),
          bullet("Right Column: Diagnostic Assessment Panel presenting the dynamic prediction results, radial gauge, risk badges, and medical recommendations."),

          ...keyLearningsBox([
            "Mastered responsive, accessible UI styling using utility-first Tailwind CSS.",
            "Engineered bi-directional data binding between sliders and numeric inputs.",
            "Integrated asynchronous HTTP requests with clear loading and error states."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 10 =================
          heading1("CHAPTER 10: PREDICTION RESULTS, MODEL PERFORMANCE & VALIDATION"),
          heading2("10.1 Diagnostic Assessment Presentation"),
          p("Upon receiving the inference payload, the web dashboard displays results across four integrated components:"),
          bullet("1. Animated Radial SVG Gauge: A calibrated semi-circular gauge smoothly animates via CSS stroke-dashoffset transitions to reflect the exact risk probability (0.0% to 100.0%)."),
          bullet("2. Three-Tier Risk Status Badges: Clear visual risk indicators with distinctive color coding:"),
          
          createStyledTable(
            ["Risk Category", "Probability Range", "Visual Indicator", "Clinical Guidance"],
            [
              ["Low Risk", "< 30.0%", "Emerald Green Badge", "Routine dietary balance, ≥150 min/wk exercise, annual checkup."],
              ["Moderate Risk", "30.0% - 65.0%", "Amber Orange Badge", "Borderline metrics. Recommend 75g OGTT or HbA1c panel and lifestyle adjustments."],
              ["High Risk", "> 65.0%", "Rose Red Badge", "Elevated glycemic risk profile. Prompt physician consultation strongly recommended."]
            ],
            [1600, 1600, 2000, 4000]
          ),

          bullet("3. Physiological Factor Attribution: Specific risk drivers (e.g. Glucose ≥ 140 mg/dL, BMI ≥ 30 kg/m²) are flagged dynamically to highlight contributing factors."),
          bullet("4. Contextual Medical Recommendations: Tailored lifestyle and screening guidance corresponding to the identified risk level."),

          heading2("10.2 Model Validation & Boundary Testing"),
          p("Systematic validation across boundary conditions confirmed reliable behavior:"),
          bullet("Healthy ranges (Glucose: 85, BMI: 21.5, Age: 24) consistently generated risk scores < 8%."),
          bullet("Severe metabolic indicators (Glucose: 195, BMI: 39.2, DPF: 1.45) generated risk scores > 91%."),
          bullet("Zero inputs and out-of-bounds numbers were safely trapped and validated without server crashes."),

          ...keyLearningsBox([
            "Translated continuous probabilistic outputs into actionable clinical risk tiers.",
            "Designed engaging SVG gauge animations that communicate risk intuitively.",
            "Verified model reliability through rigorous boundary and edge-case testing."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 11 =================
          heading1("CHAPTER 11: PROJECT FINALIZATION, TESTING & UI ENHANCEMENTS"),
          heading2("11.1 Verification & Quality Assurance"),
          p("During the finalization phase, end-to-end integration tests were conducted across all software modules:"),
          bullet("1. Pipeline Reproducibility: Confirmed that running train_model.py reliably trains the models and exports identical artifact files."),
          bullet("2. API Contract Testing: Verified that request and response JSON schemas conform strictly to interface specifications."),
          bullet("3. Cross-Device Responsiveness: Tested across mobile (375px), tablet (768px), and widescreen desktop (1440px) viewports with zero layout breakage."),
          bullet("4. Resilience Fallback: Implemented an intelligent client-side fallback engine to ensure continuous demonstration capability during temporary server offline states."),

          heading2("11.2 Error Boundary & Polish"),
          p("All interactive buttons, tooltips, and clinical reference labels were polished to deliver a seamless user experience conforming to professional software engineering standards."),

          ...keyLearningsBox([
            "Conducted comprehensive integration testing across frontend and backend layers.",
            "Implemented error boundaries and fallback mechanisms for application resilience.",
            "Successfully fulfilled all project milestones outlined in the MSBTE curriculum."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 12 =================
          heading1("CHAPTER 12: PROJECT DESCRIPTION & ARCHITECTURAL SUMMARY"),
          heading2("12.1 Project Description"),
          p("The \"Diabetes Prediction System (ITR Project)\" is a comprehensive, production-ready full-stack machine learning application. It bridges the gap between academic data science research and real-world clinical utility by encapsulating a high-performing Gradient Boosting classifier within a responsive, user-friendly web interface."),

          heading2("12.2 Repository Architecture"),
          p("The codebase is organized into clean, modular directories:"),
          bullet("diabetes_featured.csv: Clinical dataset containing 768 patient records and 14 columns."),
          bullet("train_model.py: Complete pipeline script that handles data ingestion, imputation, feature engineering, model benchmarking, and artifact export."),
          bullet("app.py: Flask server script defining application routes, CORS headers, validation logic, and the /predict REST endpoint."),
          bullet("templates/index.html: Diagnostic web dashboard providing synchronized sliders, dynamic telemetry displays, and prediction cards."),
          bullet("static/style.css: Custom CSS providing smooth radial gauge animations and styling overrides."),
          bullet("model.pkl & scaler.pkl: Serialized champion Gradient Boosting estimator and fitted StandardScaler object."),
          bullet("requirements.txt: Complete Python package manifest ensuring reproducible local environments."),
          bullet("README.md: Detailed execution and deployment instructions."),

          ...keyLearningsBox([
            "Acquired an end-to-end perspective of the modern Machine Learning engineering lifecycle.",
            "Demonstrated the practical value of AI systems in preventive healthcare triage.",
            "Produced an enterprise-grade portfolio project adhering to industry standards."
          ]),

          new Paragraph({ children: [new PageBreak()] }),

          // ================= CHAPTER 13 =================
          heading1("CHAPTER 13: FUTURE SCOPE & ENHANCEMENTS"),
          heading2("13.1 Roadmap for Future Enhancements"),
          p("The Diabetes Prediction System establishes a robust foundation that can be expanded with advanced capabilities in future development cycles:"),
          bullet("1. Explainable AI (SHAP / LIME): Incorporating TreeSHAP waterfall plots to explain feature contributions for individual patients."),
          bullet("2. Hospital EHR / FHIR Integration: Integrating HL7/FHIR healthcare protocols to allow automated ingestion of patient lab values directly from hospital Electronic Health Record systems."),
          bullet("3. Automated MLOps Retraining: Setting up automated CI/CD pipelines (e.g. GitHub Actions, MLflow) to retrain and validate models periodically as new clinical data becomes available."),
          bullet("4. Offline-First Progressive Web App (PWA): Packaging the frontend into an offline PWA equipped with local inference capabilities for community healthcare workers in remote rural clinics."),
          bullet("5. Multi-Condition Metabolic Screening: Expanding the feature matrix to simultaneously predict risks for hypertension, cardiovascular disease, and metabolic syndrome."),

          heading2("13.2 Concluding Remarks"),
          p("Overall, this industrial training project at Swami Logipool Infotech provided comprehensive exposure to modern Artificial Intelligence and Machine Learning engineering. The resulting Diabetes Prediction System successfully demonstrates how machine learning models can be transformed into accessible, responsive, and reliable clinical decision-support tools."),

          heading1("REFERENCES & BIBLIOGRAPHY"),
          bullet("1. Smith, J.W., Everhart, J.E., Dickson, W.C., Knowler, W.C., & Johannes, R.S. (1988). Using the ADAP Learning Algorithm to Forecast the Onset of Diabetes Mellitus. In Proceedings of the Symposium on Computer Applications and Medical Care, pp. 261–265. IEEE Computer Society Press."),
          bullet("2. Pedregosa, F., Varoquaux, G., et al. (2011). Scikit-learn: Machine Learning in Python. Journal of Machine Learning Research, 12, 2825–2830."),
          bullet("3. Grinberg, M. (2018). Flask Web Development: Developing Web Applications with Python. O'Reilly Media."),
          bullet("4. American Diabetes Association (ADA). Standards of Medical Care in Diabetes—2024. Diabetes Care, 47(Suppl. 1), S1–S343."),
          bullet("5. Maharashtra State Board of Technical Education (MSBTE). Curriculum Guide for Industrial Training (Course Code: 315004), Mumbai.")
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  
  // Save to workspace root
  const rootPath = path.join(process.cwd(), 'MSBTE_ITR_Report_Diabetes_Prediction.docx');
  fs.writeFileSync(rootPath, buffer);
  console.log('Saved to:', rootPath);

  // Also save to /public so the user can download it directly via browser URL
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  const publicPath = path.join(publicDir, 'MSBTE_ITR_Report_Diabetes_Prediction.docx');
  fs.writeFileSync(publicPath, buffer);
  console.log('Saved to public:', publicPath);
}

buildDoc().catch(err => {
  console.error('Error generating document:', err);
  process.exit(1);
});
