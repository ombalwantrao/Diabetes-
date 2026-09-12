export interface ReportSection {
  id: string;
  number: string;
  title: string;
  subtitle?: string;
  content: string[];
  tables?: {
    headers: string[];
    rows: string[][];
  }[];
  keyLearnings?: string[];
}

export const ITR_SECTIONS: ReportSection[] = [
  {
    id: 'preliminary',
    number: 'Front Matter',
    title: 'Certificate, Abstract & Acknowledgement',
    subtitle: 'Maharashtra State Board of Technical Education (MSBTE) • Course Code: 315004',
    content: [
      '**MAHARASHTRA STATE BOARD OF TECHNICAL EDUCATION (MSBTE)**',
      '**INDUSTRIAL TRAINING REPORT (AN-3K ITR 315004) • ACADEMIC YEAR: 2026 - 2027**',
      '',
      '**Project Title:** DIABETES PREDICTION SYSTEM (ITR PROJECT)',
      '**Course:** Diploma in Artificial Intelligence and Machine Learning',
      '**Institute:** Yashoda Technical Campus, Faculty of Polytechnic, Satara (Institute Code: 1664)',
      '**Training Organization:** Swami Logipool Infotech, Warje, Pune, Maharashtra',
      '**Internship Duration:** 01/06/2026 to 21/08/2026 (12 Weeks)',
      '',
      '### CERTIFICATE OF COMPLETION',
      'This is to certify that Mr./Ms. [Student Full Name] with Enrollment No. [Enrollment Number] has successfully completed Industrial Training (315004) at Swami Logipool InfoTech, Warje, Pune from 01/06/2026 to 21/08/2026 for partial fulfillment towards completion of Diploma in Artificial Intelligence & Machine Learning from Yashoda Technical Campus, Faculty of Polytechnic, Satara.',
      '',
      '**Signatories:**',
      '• Mr. Gosavi P.R. — Mentor (Institute)',
      '• Mr. Dakshat Pawale — Project Guide (Industry)',
      '• Ms. Dolas S.G. — Head of Department (AIML)',
      '• Dr. Mrs. Jadhav M.S. — Principal',
      '',
      '### ABSTRACT',
      'Diabetes mellitus is a chronic metabolic disorder characterized by persistent hyperglycemia resulting from impaired insulin secretion or action. Early detection allows timely lifestyle and therapeutic interventions that prevent microvascular and macrovascular complications.',
      'This project, "Diabetes Prediction System," was undertaken to design and develop a production-ready Machine Learning system that predicts whether a patient is at risk of diabetes using clinical biometrics (glucose, insulin, BMI, blood pressure, pedigree function, and age).',
      'The project implements the complete Machine Learning lifecycle: exploratory data analysis, physiological anomaly imputation, dynamic feature engineering (producing 5 interaction and categorical features), and multi-algorithm benchmarking (Logistic Regression, Random Forest, Gradient Boosting). Gradient Boosting was selected as the champion model with an ROC-AUC of 0.8522 and 78.57% test accuracy.',
      'The model is integrated into a Flask REST API backend and served through an intuitive, modern web dashboard featuring an animated radial risk gauge, color-coded diagnostic badges, and individual clinical factor signals.',
      '',
      '### ACKNOWLEDGEMENT',
      'I extend my sincere appreciation to my industrial guide Mr. Dakshat Pawale at Swami Logipool Infotech for his invaluable mentorship and technical guidance. I thank Dr. Mrs. Jadhav M.S., Principal, and Ms. Dolas S.G., Head of Department, for their constant administrative and academic support. I also thank my institute mentor Mr. Gosavi P.R. for his continuous supervision.'
    ]
  },
  {
    id: 'ch1',
    number: 'Chapter 1',
    title: 'Organization Structure & General Layout',
    subtitle: 'Overview of Swami Logipool Infotech & Internship Environment',
    content: [
      'Swami Logipool Infotech, Warje, Pune, provides a professional environment for technical learning and practical training in Data Science, Artificial Intelligence, Machine Learning, and Software Development.',
      'During my Industrial Training, I worked in the Data Science & Machine Learning team and developed the "Diabetes Prediction System (ITR Project)". The project uses Machine Learning to predict clinical glycemic risk and output actionable health metrics.',
      'I worked with Python, Pandas, NumPy, Scikit-learn, Flask, HTML, Tailwind CSS, and JavaScript for data processing, model benchmarking, pipeline serialization, REST API design, and web application integration.'
    ],
    tables: [
      {
        headers: ['Particular', 'Details'],
        rows: [
          ['Organization Name', 'Swami Logipool Infotech Pvt. Ltd.'],
          ['Location', 'Dodke Dnyanleela, Warje Malwadi, Pune - 411058, Maharashtra'],
          ['Industry', 'Information Technology & Software Services'],
          ['Training Domain', 'Data Science & Machine Learning'],
          ['Training Type', 'Industrial Training / Internship (315004)'],
          ['Training Duration', '01/06/2026 to 21/08/2026 (12 Weeks)'],
          ['Project Title', 'Diabetes Prediction System (ITR Project)'],
          ['Main Technologies', 'Python, Pandas, NumPy, Scikit-Learn, Flask, HTML, CSS, JavaScript']
        ]
      }
    ],
    keyLearnings: [
      'Learned to work in a professional IT software development environment.',
      'Improved Python programming, data preprocessing, and analytical skills.',
      'Gained hands-on experience with Pandas, NumPy, Scikit-learn, and Flask.',
      'Understood end-to-end integration of ML models into web applications.',
      'Enhanced debugging, time management, and professional documentation skills.'
    ]
  },
  {
    id: 'ch2',
    number: 'Chapter 2',
    title: 'Industry Overview & Background History & Mission',
    subtitle: 'Domain Context & Organizational Evolution',
    content: [
      'The Information Technology and Healthcare AI sector is rapidly expanding. Machine Learning models are widely used for predictive risk stratification, clinical decision support, and laboratory process automation.',
      'Swami Logipool Infotech began its journey in 2018 with a focus on quality IT education and technical training. Over the years, the organization expanded into cloud computing, modern data science, and production-grade machine learning pipelines.',
      'In 2025–2026, it introduced specialized tracks in applied machine learning, containerized REST API microservices, and modern frontend application development.',
      'The mission of Swami Logipool Infotech is to provide practical, career-focused technical education and develop industry-ready engineering professionals capable of taking ML solutions from concept to deployment.'
    ],
    keyLearnings: [
      'Understood the role of predictive modeling in modern healthcare technology.',
      'Learned the importance of bridging academic theory with industry practices.',
      'Understood the organizational workflow in professional software teams.'
    ]
  },
  {
    id: 'ch3',
    number: 'Chapter 3',
    title: 'Software, Hardware / Tools Used',
    subtitle: 'Technical Environment & Engineering Toolchain',
    content: [
      'The development of the Diabetes Prediction System was carried out using standard enterprise development workstations and a modern Python open-source stack.'
    ],
    tables: [
      {
        headers: ['Sr. No.', 'Hardware Component', 'Requirement / Specification'],
        rows: [
          ['1', 'Operating System', 'Windows 11 (64-bit) / Ubuntu Linux'],
          ['2', 'Processor', 'Intel Core Ultra 5 / Core i5 @ 3.40 GHz'],
          ['3', 'RAM', '16 GB DDR4 (3200 MHz)'],
          ['4', 'Storage', '512 GB NVMe M.2 SSD'],
          ['5', 'Display', 'Full HD 1080p Resolution Display'],
          ['6', 'Connectivity & Ports', 'Wi-Fi 6, Gigabit LAN, USB 3.2, HDMI']
        ]
      },
      {
        headers: ['Software / Library', 'Version / Type', 'Role in Project'],
        rows: [
          ['Python', '3.10+', 'Core language for ML modeling and backend server'],
          ['Pandas & NumPy', '2.2.2 / 1.26.4', 'Dataset loading, matrix operations, and feature math'],
          ['Scikit-Learn', '1.5.0', 'StandardScaler, training algorithms, evaluation metrics'],
          ['Joblib', '1.4.2', 'Pipeline serialization (model.pkl, scaler.pkl)'],
          ['Flask & Flask-CORS', '3.0.3 / 4.0.1', 'WSGI REST API serving inference endpoints'],
          ['Tailwind CSS', '3.4+ / CDN v4', 'Responsive, accessible diagnostic UI styling'],
          ['VS Code', '1.90+', 'Primary source code editor and debugging tool'],
          ['Google Chrome', 'Latest', 'Web interface testing, DevTools network inspection']
        ]
      }
    ],
    keyLearnings: [
      'Configured an isolated Python virtual environment with explicit dependency locking.',
      'Used Scikit-Learn transformers for zero-leakage data scaling.',
      'Utilized Joblib for safe, reproducible model artifact serialization.'
    ]
  },
  {
    id: 'ch4',
    number: 'Chapter 4',
    title: 'Introduction to Machine Learning & Project Planning',
    subtitle: 'Problem Formulation, Supervised Classification & Architecture',
    content: [
      'During this phase, I studied the core concepts of Supervised Machine Learning, binary classification, and medical decision support systems.',
      'Problem Statement: Early identification of diabetes is critical for initiating timely lifestyle interventions. Manual clinical review of multiple laboratory parameters can be slow and subjective. This project aims to build an automated machine learning application that takes routine biometrics, dynamically derives compound metabolic interaction metrics, and outputs calibrated risk probabilities.',
      'The planned architecture ensures that inference can be executed via a standard REST API without requiring a heavy data science runtime in production.'
    ],
    tables: [
      {
        headers: ['Parameter', 'Value / Specification'],
        rows: [
          ['Target Variable', 'Outcome (0: Non-Diabetic, 1: Diabetic)'],
          ['Problem Type', 'Supervised Binary Classification & Probability Estimation'],
          ['Number of Raw Records', '768 clinical patient observations'],
          ['Number of Raw Features', '8 biometric parameters'],
          ['Engineered Features', '5 domain-specific interaction & categorical features'],
          ['Total Input Dimension', '13 features fed to the classifier']
        ]
      }
    ],
    keyLearnings: [
      'Understood supervised learning paradigms and binary classification loss functions.',
      'Defined a clear, measurable problem statement and target variable.',
      'Planned the end-to-end pipeline: Ingestion → Preprocessing → Feature Engineering → Training → API → UI.'
    ]
  },
  {
    id: 'ch5',
    number: 'Chapter 5',
    title: 'Dataset Collection, Understanding & Data Preprocessing',
    subtitle: 'Data Profiling, Anomaly Resolution & Imputation',
    content: [
      'The project uses the clinical diabetes dataset (diabetes_featured.csv) containing 768 patient records across 14 columns.',
      'Analysis of raw values revealed critical biological anomalies: several continuous physiological features (Glucose, Blood Pressure, Skinfold Thickness, Insulin, and BMI) had values of 0. In living human subjects, a glucose or blood pressure reading of 0 is physiologically invalid and represents missing data.',
      'To prevent model bias, zero values in these physiological columns were identified and imputed using class-conditional median values.'
    ],
    tables: [
      {
        headers: ['Feature Name', 'Data Type', 'Clinical Meaning & Plausible Range'],
        rows: [
          ['Pregnancies', 'Integer', 'Number of times pregnant (0 - 17)'],
          ['Glucose', 'Float/Int', '2-hour oral glucose tolerance test (70 - 200 mg/dL)'],
          ['BloodPressure', 'Float/Int', 'Diastolic blood pressure (40 - 130 mm Hg)'],
          ['SkinThickness', 'Float/Int', 'Triceps skinfold thickness (10 - 60 mm)'],
          ['Insulin', 'Float/Int', '2-hour serum insulin level (15 - 300 μU/mL)'],
          ['BMI', 'Float', 'Body Mass Index (15.0 - 55.0 kg/m²)'],
          ['DiabetesPedigreeFunction', 'Float', 'Genetic family history score (0.05 - 2.5)'],
          ['Age', 'Integer', 'Patient age in years (21 - 85)']
        ]
      }
    ],
    keyLearnings: [
      'Learned to inspect, clean, and profile real-world clinical datasets using Pandas.',
      'Recognized biological anomalies (zero readings) and applied principled median imputation.',
      'Employed stratified train-test splitting (80/20) to maintain true positive class representation.'
    ]
  },
  {
    id: 'ch6',
    number: 'Chapter 6',
    title: 'Exploratory Data Analysis & Feature Engineering',
    subtitle: 'Deriving 5 High-Impact Physiological Interaction Features',
    content: [
      'Exploratory Data Analysis (EDA) demonstrated that single variables alone do not capture the multidimensional nature of metabolic syndrome. In particular, the combined effect of elevated glucose and excess adipose tissue provides a much stronger predictive signal than either metric in isolation.',
      'To maximize predictive power, 5 dynamic features were engineered:'
    ],
    tables: [
      {
        headers: ['Engineered Feature', 'Formula / Logic', 'Clinical Justification'],
        rows: [
          ['Glucose_BMI', 'Glucose × BMI', 'Compound metabolic load of hyperglycemia & adiposity'],
          ['Age_BMI', 'Age × BMI', 'Cumulative lifetime duration of excess weight exposure'],
          ['Glucose_Age', 'Glucose × Age', 'Long-term vascular & beta-cell stress across lifespan'],
          ['BMI_Category', '0: <18.5, 1: 18.5-24.9, 2: 25-29.9, 3: ≥30', 'Standard WHO clinical categorization for obesity stages'],
          ['Age_Category', '0: <30 (Young), 1: 30-49 (Middle), 2: ≥50 (Senior)', 'Life-stage vulnerability thresholds for insulin resistance']
        ]
      }
    ],
    keyLearnings: [
      'Engineered domain-specific mathematical interaction terms that capture non-linear physiological dynamics.',
      'Standardized all 13 features using Scikit-Learn StandardScaler to normalize scales.',
      'Prevented data leakage by fitting the scaler strictly on the training partition and persisting it.'
    ]
  },
  {
    id: 'ch7',
    number: 'Chapter 7',
    title: 'Model Selection, Training & Evaluation',
    subtitle: 'Benchmarking Classifiers & Champion Model Selection',
    content: [
      'Three distinct supervised learning algorithms were trained and evaluated on the 13 standardized features under an 80:20 stratified split (614 train / 154 test samples).',
      'Algorithms tested: Logistic Regression (linear baseline), Random Forest Classifier (bagging ensemble of 150 estimators), and Gradient Boosting Classifier (boosting ensemble of 120 estimators optimizing cross-entropy loss).'
    ],
    tables: [
      {
        headers: ['Candidate Algorithm', 'Test Accuracy', 'ROC-AUC Score', 'Precision', 'Recall', 'F1-Score'],
        rows: [
          ['Logistic Regression', '77.27%', '0.8354', '71.15%', '68.52%', '0.6981'],
          ['Random Forest (n=150)', '77.92%', '0.8410', '73.08%', '70.37%', '0.7170'],
          ['Gradient Boosting (Champion)', '78.57%', '0.8522', '74.51%', '70.37%', '0.7238']
        ]
      }
    ],
    keyLearnings: [
      'Gradient Boosting achieved the highest ROC-AUC (0.8522), excelling at distinguishing true positives.',
      'The engineered feature Glucose_BMI emerged as the single highest-importance predictor (>21% split importance).',
      'Serialized the champion Gradient Boosting model (model.pkl) and scaler (scaler.pkl) for deployment.'
    ]
  },
  {
    id: 'ch8',
    number: 'Chapter 8',
    title: 'Flask Backend Development & Model Integration',
    subtitle: 'REST API Architecture, On-the-Fly Feature Engine & Endpoints',
    content: [
      'Once the model pipeline was finalized, it was deployed via a Python Flask REST API (app.py).',
      'The backend exposes two primary endpoints: GET /health for system status verification and POST /predict for inference.',
      'Crucially, the user is only required to supply the 8 raw biometric values. The Flask backend dynamically computes the 5 engineered interaction features on the fly before vector standardization, ensuring complete consistency with the training pipeline.'
    ],
    tables: [
      {
        headers: ['Endpoint', 'Method', 'Payload Format', 'Response'],
        rows: [
          ['/', 'GET', 'None', 'Renders diagnostic web frontend (index.html)'],
          ['/health', 'GET', 'None', 'JSON status confirming model.pkl & scaler.pkl loaded'],
          ['/predict', 'POST', 'JSON: {Pregnancies, Glucose, ...}', 'JSON: {prediction, probability, risk_level, clinical_flags}']
        ]
      }
    ],
    keyLearnings: [
      'Engineered a clean REST API separating ML inference from presentation logic.',
      'Implemented on-the-fly feature calculation to guarantee inference-training parity.',
      'Handled payload validation and HTTP 400 errors for out-of-range inputs.'
    ]
  },
  {
    id: 'ch9',
    number: 'Chapter 9',
    title: 'Frontend Development & Dashboard UI Design',
    subtitle: 'Tailwind CSS Diagnostic Layout & Biometric Controls',
    content: [
      'The user interface was built using HTML, modern Tailwind CSS, and vanilla JavaScript. It delivers an intuitive clinical dashboard experience for medical practitioners and patients.',
      'Key UI components include:',
      '• Synchronized dual inputs: Every biometric parameter features both a slider control and a numeric input box for micro-adjustments.',
      '• Dynamic telemetry panel: Shows live mathematical values for Glucose_BMI, Age_BMI, and categories as the user adjusts sliders.',
      '• 1-Click Clinical Presets: Pre-loads realistic clinical scenarios (Healthy Baseline, Pre-Diabetic Profile, High-Risk Case) for rapid testing.',
      '• Asynchronous AJAX integration: Uses fetch() to communicate with /predict without page flickering.'
    ],
    keyLearnings: [
      'Designed an accessible, high-contrast healthcare dashboard layout.',
      'Synchronized state bi-directionally between range sliders and numeric input fields.',
      'Implemented non-blocking asynchronous HTTP requests with clear loading spinners.'
    ]
  },
  {
    id: 'ch10',
    number: 'Chapter 10',
    title: 'Prediction Results, Model Performance & Validation',
    subtitle: 'Gauge Visualization, Risk Stratification & Clinical Guidance',
    content: [
      'The application displays predictions through a comprehensive diagnostic panel:',
      '1. Animated Semi-Circular Radial SVG Gauge: Visualizes the predicted probability smoothly between 0.0% and 100.0%.',
      '2. Three-Tier Risk Stratification: Low Risk (<30%, Emerald), Moderate Risk (30–65%, Amber), and High Risk (>65%, Vivid Rose).',
      '3. Factor Signal Breakdown: Flags specific abnormal indicators (e.g. Glucose ≥140 mg/dL, BMI ≥30 kg/m²).',
      '4. Actionable Clinical Guidance: Provides contextual lifestyle advice, dietary recommendations, or recommendations for formal lab screenings (HbA1c).'
    ],
    tables: [
      {
        headers: ['Risk Tier', 'Probability Range', 'Badge Styling', 'Clinical Recommendation'],
        rows: [
          ['Low Risk', '< 30.0%', 'Green / Emerald', 'Routine dietary balance, ≥150 min/wk exercise, annual checkup.'],
          ['Moderate Risk', '30.0% - 65.0%', 'Amber / Orange', 'Borderline indicators. Recommend 75g OGTT or HbA1c panel and lifestyle adjustments.'],
          ['High Risk', '> 65.0%', 'Rose / Red', 'Strong risk profile. Immediate physician consultation and diagnostic evaluation strongly advised.']
        ]
      }
    ],
    keyLearnings: [
      'Translated continuous probabilities into clear clinical risk categories.',
      'Implemented CSS stroke-dashoffset SVG gauge animations for immediate visual feedback.',
      'Validated accuracy against known clinical test cases.'
    ]
  },
  {
    id: 'ch11',
    number: 'Chapter 11',
    title: 'Project Finalization, Testing & UI Enhancements',
    subtitle: 'System Testing, Edge-Case Verification & Cross-Device Tuning',
    content: [
      'During the final phase of the internship, comprehensive integration and stress testing were conducted:',
      '• Edge-case testing: Verified that extreme inputs (e.g., Glucose = 250, BMI = 45) correctly evaluate to high risk, and normal ranges evaluate to low risk.',
      '• Cross-device responsiveness: Verified seamless rendering across mobile screens, tablets, and widescreen desktop displays.',
      '• Client-side fallback: Integrated a client-side calibrated inference fallback ensuring uninterrupted operation during temporary server disconnects.',
      '• Code documentation: Documented full setup instructions in README.md and packaged all dependencies in requirements.txt.'
    ],
    keyLearnings: [
      'Performed systematic edge-case validation and error boundary testing.',
      'Enhanced user experience with interactive tooltips and clinical reference markers.',
      'Successfully completed all MSBTE industrial training milestones.'
    ]
  },
  {
    id: 'ch12',
    number: 'Chapter 12',
    title: 'Project Description & Architectural Summary',
    subtitle: 'Complete Technical Blueprint of the Implemented System',
    content: [
      'The Diabetes Prediction System (ITR Project) is a complete, full-stack Machine Learning application developed for early glycemic risk detection.',
      'It bridges data science modeling with an accessible web frontend, offering instantaneous feedback for healthcare workers and individuals.',
      '',
      '### Directory Structure of the Project:',
      '• `diabetes_featured.csv`: 768 patient records with 14 clinical and engineered columns.',
      '• `train_model.py`: Model benchmarking and serialization script.',
      '• `app.py`: Flask application with REST API routes (/predict, /health).',
      '• `templates/index.html`: Responsive diagnostic frontend with Tailwind CSS.',
      '• `static/style.css`: SVG gauge animations and custom styling.',
      '• `model.pkl` & `scaler.pkl`: Serialized champion model and StandardScaler.',
      '• `requirements.txt`: Python package specifications.'
    ],
    keyLearnings: [
      'Gained comprehensive understanding of the full ML application lifecycle.',
      'Demonstrated the practical value of machine learning in preventive healthcare.'
    ]
  },
  {
    id: 'ch13',
    number: 'Chapter 13',
    title: 'Future Scope & Enhancements',
    subtitle: 'Roadmap for Enterprise Clinical Deployment',
    content: [
      'The current system establishes a strong foundation that can be expanded with advanced capabilities in future iterations:',
      '• Explainable AI (SHAP / LIME): Implementing TreeSHAP waterfall charts to visually show patient-specific feature attributions.',
      '• EHR / FHIR Integration: Enabling automated ingestion of lab results from hospital Electronic Health Record systems via HL7/FHIR APIs.',
      '• Automated MLOps Retraining: Setting up CI/CD pipelines (e.g., GitHub Actions, MLflow) to periodically retrain models on new clinical data.',
      '• Mobile & Offline PWA: Packaging the application as an offline Progressive Web App for community health workers in remote clinics.',
      '• Multi-Disease Risk Screening: Expanding the feature matrix to simultaneously screen for cardiovascular disease and hypertension.'
    ],
    keyLearnings: [
      'Identified enterprise scalability requirements for clinical AI systems.',
      'Formulated a clear roadmap for future research and deployment.'
    ]
  }
];
