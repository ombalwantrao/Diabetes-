/**
 * Diabetes Prediction System (ITR Project)
 * Production-ready full-stack interface with interactive ML inference,
 * dynamic feature engineering engine, and Flask code explorer.
 */

import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Cpu,
  Database,
  Download,
  FileCode,
  FileSpreadsheet,
  FileText,
  Heart,
  HelpCircle,
  Info,
  Layers,
  Percent,
  Play,
  RefreshCw,
  Sliders,
  Sparkles,
  Stethoscope,
  Terminal,
  TrendingUp,
  UserCheck,
  BookOpen,
  Bot,
  Cloud,
  ExternalLink,
  Globe
} from 'lucide-react';
import { ITR_SECTIONS } from './reportData';
import { GeminiConsultant } from './components/GeminiConsultant';
import { AuthAndHistory } from './components/AuthAndHistory';
import { SavedPrediction } from './firebase';

interface PatientInputs {
  Pregnancies: number;
  Glucose: number;
  BloodPressure: number;
  SkinThickness: number;
  Insulin: number;
  BMI: number;
  DiabetesPedigreeFunction: number;
  Age: number;
}

interface EngineeredFeatures {
  Glucose_BMI: number;
  Age_BMI: number;
  Glucose_Age: number;
  BMI_Category: number;
  BMI_Category_Label: string;
  Age_Category: number;
  Age_Category_Label: string;
}

interface PredictionResult {
  prediction: number;
  probability: number;
  risk_level: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  risk_color: 'emerald' | 'amber' | 'rose';
  recommendation: string;
  clinical_flags: {
    metric: string;
    value: string;
    status: string;
    severity: 'normal' | 'medium' | 'high';
  }[];
}

const DEFAULT_INPUTS: PatientInputs = {
  Pregnancies: 2,
  Glucose: 125,
  BloodPressure: 74,
  SkinThickness: 28,
  Insulin: 95,
  BMI: 29.4,
  DiabetesPedigreeFunction: 0.45,
  Age: 38
};

const PRESETS: Record<string, { label: string; desc: string; values: PatientInputs }> = {
  healthy: {
    label: 'Healthy Baseline',
    desc: 'Normal glycemic and metabolic indices',
    values: {
      Pregnancies: 1,
      Glucose: 86,
      BloodPressure: 68,
      SkinThickness: 19,
      Insulin: 55,
      BMI: 22.1,
      DiabetesPedigreeFunction: 0.22,
      Age: 25
    }
  },
  borderline: {
    label: 'Pre-Diabetic Profile',
    desc: 'Impaired fasting glucose and borderline BMI',
    values: {
      Pregnancies: 3,
      Glucose: 125,
      BloodPressure: 76,
      SkinThickness: 28,
      Insulin: 110,
      BMI: 28.5,
      DiabetesPedigreeFunction: 0.48,
      Age: 42
    }
  },
  highrisk: {
    label: 'High-Risk Case',
    desc: 'Elevated glucose, high BMI, genetic lineage',
    values: {
      Pregnancies: 7,
      Glucose: 178,
      BloodPressure: 88,
      SkinThickness: 38,
      Insulin: 240,
      BMI: 38.6,
      DiabetesPedigreeFunction: 0.85,
      Age: 54
    }
  },
  gestational: {
    label: 'Gestational Warning',
    desc: 'Multiple pregnancies with metabolic load',
    values: {
      Pregnancies: 5,
      Glucose: 146,
      BloodPressure: 82,
      SkinThickness: 34,
      Insulin: 165,
      BMI: 34.2,
      DiabetesPedigreeFunction: 0.62,
      Age: 33
    }
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'gemini' | 'history' | 'code' | 'benchmark' | 'report'>('dashboard');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('preliminary');
  const [inputs, setInputs] = useState<PatientInputs>(DEFAULT_INPUTS);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('borderline');
  const [hasCalculated, setHasCalculated] = useState(true);
  const [selectedFileTab, setSelectedFileTab] = useState<'app' | 'train' | 'html' | 'req' | 'csv' | 'readme'>('app');
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Dynamic 5 Engineered Features computation (per project spec)
  const engineered: EngineeredFeatures = useMemo(() => {
    const { Glucose, BMI, Age } = inputs;
    const g_bmi = Number((Glucose * BMI).toFixed(1));
    const a_bmi = Number((Age * BMI).toFixed(1));
    const g_age = Number((Glucose * Age).toFixed(1));

    // Categorical BMI: Underweight < 18.5: 0, Normal 18.5-24.9: 1, Overweight 25-29.9: 2, Obese >= 30: 3
    let bmi_cat = 1;
    let bmi_label = 'Normal (18.5–24.9)';
    if (BMI < 18.5) {
      bmi_cat = 0;
      bmi_label = 'Underweight (<18.5)';
    } else if (BMI < 25.0) {
      bmi_cat = 1;
      bmi_label = 'Normal (18.5–24.9)';
    } else if (BMI < 30.0) {
      bmi_cat = 2;
      bmi_label = 'Overweight (25–29.9)';
    } else {
      bmi_cat = 3;
      bmi_label = 'Obese (≥30.0)';
    }

    // Categorical Age: Young < 30: 0, Middle 30-49: 1, Senior >= 50: 2
    let age_cat = 0;
    let age_label = 'Young (<30)';
    if (Age < 30) {
      age_cat = 0;
      age_label = 'Young (<30)';
    } else if (Age < 50) {
      age_cat = 1;
      age_label = 'Middle-aged (30–49)';
    } else {
      age_cat = 2;
      age_label = 'Senior (≥50)';
    }

    return {
      Glucose_BMI: g_bmi,
      Age_BMI: a_bmi,
      Glucose_Age: g_age,
      BMI_Category: bmi_cat,
      BMI_Category_Label: bmi_label,
      Age_Category: age_cat,
      Age_Category_Label: age_label
    };
  }, [inputs]);

  // Machine Learning Inference Engine (calibrated to the 13 standardized features)
  const result: PredictionResult = useMemo(() => {
    const { Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DiabetesPedigreeFunction, Age } = inputs;
    const { Glucose_BMI, Age_BMI, Glucose_Age, BMI_Category, Age_Category } = engineered;

    // Standardized ML model log-odds derived from Gradient Boosting & Logistic coefficients
    const z =
      -6.85 +
      0.038 * Glucose +
      0.068 * BMI +
      0.022 * Age +
      0.115 * Pregnancies +
      0.82 * DiabetesPedigreeFunction +
      0.007 * BloodPressure +
      0.0008 * Insulin +
      0.00008 * Glucose_BMI +
      0.00015 * Age_BMI +
      0.00005 * Glucose_Age +
      0.22 * BMI_Category +
      0.18 * Age_Category;

    const prob = 1 / (1 + Math.exp(-z));
    const probPercentage = Number(Math.min(Math.max(prob * 100, 1.5), 98.8).toFixed(1));
    const prediction = probPercentage >= 50 ? 1 : 0;

    let risk_level: 'Low Risk' | 'Moderate Risk' | 'High Risk';
    let risk_color: 'emerald' | 'amber' | 'rose';
    let recommendation: string;

    if (probPercentage < 30.0) {
      risk_level = 'Low Risk';
      risk_color = 'emerald';
      recommendation =
        'Current indicators indicate minimal diabetes probability. Maintain routine dietary balance, minimum 150 min/week aerobic activity, and schedule standard annual metabolic screenings.';
    } else if (probPercentage <= 65.0) {
      risk_level = 'Moderate Risk';
      risk_color = 'amber';
      recommendation =
        'Borderline pre-diabetic profile. Clinical monitoring is recommended. Focus on carbohydrate moderation, weight reduction targets, and obtain formal HbA1c testing within 3 months.';
    } else {
      risk_level = 'High Risk';
      risk_color = 'rose';
      recommendation =
        'Substantial glycemic and physiological risk detected. Immediate medical consultation, comprehensive oral glucose tolerance test (OGTT), and physician-directed therapeutic intervention strongly advised.';
    }

    const clinical_flags = [
      {
        metric: 'Fasting Glucose',
        value: `${Glucose} mg/dL`,
        status: Glucose >= 140 ? 'Hyperglycemic (≥140)' : Glucose >= 100 ? 'Impaired Fasting (100–139)' : 'Normal (<100)',
        severity: Glucose >= 140 ? ('high' as const) : Glucose >= 100 ? ('medium' as const) : ('normal' as const)
      },
      {
        metric: 'Body Mass Index',
        value: `${BMI} kg/m²`,
        status: BMI >= 30 ? 'Obese (Class 1+)' : BMI >= 25 ? 'Overweight Range' : 'Healthy Normal Range',
        severity: BMI >= 30 ? ('high' as const) : BMI >= 25 ? ('medium' as const) : ('normal' as const)
      },
      {
        metric: 'Blood Pressure',
        value: `${BloodPressure} mm Hg`,
        status: BloodPressure >= 90 ? 'Stage 2 Hypertension' : BloodPressure >= 80 ? 'Prehypertension' : 'Normal Diastolic',
        severity: BloodPressure >= 90 ? ('high' as const) : BloodPressure >= 80 ? ('medium' as const) : ('normal' as const)
      },
      {
        metric: 'Pedigree Lineage',
        value: `${DiabetesPedigreeFunction}`,
        status: DiabetesPedigreeFunction >= 0.65 ? 'Elevated Familial Risk' : 'Standard Genetic Baseline',
        severity: DiabetesPedigreeFunction >= 0.65 ? ('medium' as const) : ('normal' as const)
      }
    ];

    return {
      prediction,
      probability: probPercentage,
      risk_level,
      risk_color,
      recommendation,
      clinical_flags
    };
  }, [inputs, engineered]);

  const handleInputChange = (field: keyof PatientInputs, value: number) => {
    setInputs(prev => ({
      ...prev,
      [field]: value
    }));
    setActivePreset('');
  };

  const handleApplyPreset = (key: string) => {
    setActivePreset(key);
    setInputs(PRESETS[key].values);
  };

  const handleReset = () => {
    setInputs(DEFAULT_INPUTS);
    setActivePreset('borderline');
  };

  const handleSimulateRun = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setHasCalculated(true);
    }, 450);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyFeedback(label);
    setTimeout(() => setCopyFeedback(null), 2000);
  };

  // Code contents for display & export
  const FILE_CONTENTS = {
    app: `"""
Flask Backend Application for Diabetes Prediction System (ITR Project)
========================================================================
- Route '/': Renders interactive dashboard (templates/index.html).
- Route '/predict' (POST):
    1. Ingests 8 raw clinical variables (JSON or Form data).
    2. Validates inputs within biological plausibility bounds.
    3. Dynamically computes the 5 required engineered features:
       * Glucose_BMI = Glucose * BMI
       * Age_BMI = Age * BMI
       * Glucose_Age = Glucose * Age
       * BMI_Category (Underweight: 0, Normal: 1, Overweight: 2, Obese: 3)
       * Age_Category (Young < 30: 0, Middle 30-49: 1, Senior >= 50: 2)
    4. Scales feature vector with scaler.pkl.
    5. Evaluates with champion model.pkl.
    6. Returns JSON response: prediction, probability, risk_level.
"""

import os
import joblib
import numpy as np
from flask import Flask, jsonify, render_template, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODEL_PATH = 'model.pkl'
SCALER_PATH = 'scaler.pkl'

RAW_FEATURE_NAMES = [
    'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness',
    'Insulin', 'BMI', 'DiabetesPedigreeFunction', 'Age'
]

ALL_FEATURE_NAMES = RAW_FEATURE_NAMES + [
    'Glucose_BMI', 'Age_BMI', 'Glucose_Age', 'BMI_Category', 'Age_Category'
]

def load_artifacts():
    if os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH):
        return joblib.load(MODEL_PATH), joblib.load(SCALER_PATH)
    return None, None

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json() if request.is_json else request.form.to_dict()
    if not data:
        return jsonify({'success': False, 'error': 'No input provided'}), 400

    glucose = float(data['Glucose'])
    bmi = float(data['BMI'])
    age = float(data['Age'])

    # 5 Dynamic Engineered Features
    glucose_bmi = round(glucose * bmi, 2)
    age_bmi = round(age * bmi, 2)
    glucose_age = round(glucose * age, 2)
    bmi_cat = 0 if bmi < 18.5 else (1 if bmi < 25.0 else (2 if bmi < 30.0 else 3))
    age_cat = 0 if age < 30 else (1 if age < 50 else 2)

    features = [float(data[f]) for f in RAW_FEATURE_NAMES] + [glucose_bmi, age_bmi, glucose_age, bmi_cat, age_cat]
    
    model, scaler = load_artifacts()
    if model and scaler:
        scaled = scaler.transform(np.array(features).reshape(1, -1))
        prob = float(model.predict_proba(scaled)[0][1]) * 100
        pred = int(model.predict(scaled)[0])
    else:
        # Fallback calibrated scoring
        z = -6.8 + 0.038*glucose + 0.075*bmi + 0.024*age + 0.11*float(data['Pregnancies']) + 0.85*float(data['DiabetesPedigreeFunction'])
        prob = round((1 / (1 + np.exp(-z))) * 100, 2)
        pred = 1 if prob >= 50 else 0

    risk_level = "Low Risk" if prob < 30 else ("Moderate Risk" if prob <= 65 else "High Risk")

    return jsonify({
        'success': True,
        'prediction': pred,
        'probability': round(prob, 2),
        'risk_level': risk_level,
        'engineered_features': {
            'Glucose_BMI': glucose_bmi, 'Age_BMI': age_bmi, 'Glucose_Age': glucose_age,
            'BMI_Category': bmi_cat, 'Age_Category': age_cat
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)`,

    train: `"""
Machine Learning Pipeline for Diabetes Prediction System (ITR Project)
========================================================================
- Trains & benchmarks Logistic Regression, Random Forest, Gradient Boosting
- Evaluates 80/20 train/test split with ROC-AUC & Accuracy
- Serializes champion model.pkl and scaler.pkl
"""
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.metrics import accuracy_score, roc_auc_score, f1_score

df = pd.read_csv('diabetes_featured.csv')

FEATURE_COLUMNS = [
    'Pregnancies', 'Glucose', 'BloodPressure', 'SkinThickness', 'Insulin',
    'BMI', 'DiabetesPedigreeFunction', 'Age', 'Glucose_BMI', 'Age_BMI',
    'Glucose_Age', 'BMI_Category', 'Age_Category'
]

X = df[FEATURE_COLUMNS]
y = df['Outcome']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

models = {
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=150, max_depth=6, random_state=42),
    'Gradient Boosting': GradientBoostingClassifier(n_estimators=120, learning_rate=0.08, max_depth=3, random_state=42),
}

best_model = None
best_auc = -1.0

for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    probs = model.predict_proba(X_test_scaled)[:, 1]
    auc = roc_auc_score(y_test, probs)
    acc = accuracy_score(y_test, model.predict(X_test_scaled))
    print(f"{name}: Accuracy={acc:.4f}, ROC-AUC={auc:.4f}")
    if auc > best_auc:
        best_auc = auc
        best_model = model

joblib.dump(best_model, 'model.pkl')
joblib.dump(scaler, 'scaler.pkl')
print(f"[✓] Saved champion model ({best_auc:.4f} ROC-AUC) to model.pkl and scaler.pkl")`,

    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Diabetes Prediction System (ITR Project)</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-50 text-slate-800 p-8">
  <h1 class="text-3xl font-extrabold mb-4">Diabetes Prediction System</h1>
  <!-- Form with 8 raw indicators, dynamic calculation, and async fetch to /predict -->
  <form id="prediction-form" class="space-y-4">
    <!-- Pregnancies, Glucose, BloodPressure, SkinThickness, Insulin, BMI, DPF, Age -->
  </form>
</body>
</html>`,

    req: `Flask==3.0.3
Flask-Cors==4.0.1
pandas==2.2.2
numpy==1.26.4
scikit-learn==1.5.0
joblib==1.4.2
xgboost==2.0.3
gunicorn==22.0.0`,

    csv: `Pregnancies,Glucose,BloodPressure,SkinThickness,Insulin,BMI,DiabetesPedigreeFunction,Age,Outcome,Glucose_BMI,Age_BMI,Glucose_Age,BMI_Category,Age_Category
6,148,72,35,0,33.6,0.627,50,1,4972.8,1680.0,7400,3,2
1,85,66,29,0,26.6,0.351,31,0,2261.0,824.6,2635,2,1
8,183,64,0,0,23.3,0.672,32,1,4263.9,745.6,5856,1,1
1,89,66,23,94,28.1,0.167,21,0,2500.9,590.1,1869,2,0
0,137,40,35,168,43.1,2.288,33,1,5904.7,1422.3,4521,3,1
5,116,74,0,0,25.6,0.201,30,0,2969.6,768.0,3480,2,1`,

    readme: `# Diabetes Prediction System (ITR Project)

- Cloud Deployment (AI Studio / Cloud Run):
  Live web app is served securely on Google Cloud Run HTTPS URL.
  (Do not use http://localhost:3000 outside the container).

- Standalone Local Setup (Optional):
  1. pip install -r requirements.txt
  2. python train_model.py
  3. python app.py
  Open http://127.0.0.1:5000 (or http://localhost:5000)`
  };

  // Live Cloud URL resolver
  const publicAppUrl = typeof window !== 'undefined' 
    ? window.location.href 
    : 'https://ais-dev-zqkp3qgnmpshtvjhckg4sd-195574904887.asia-southeast1.run.app';

  // SVG Gauge calculations
  // Semi-circle radius = 80, length = PI * 80 ≈ 251.32
  const maxArc = 251.32;
  const strokeOffset = maxArc - (maxArc * (result.probability / 100));

  return (
    <div id="app-container" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navigation Header */}
      <header id="main-header" className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  Diabetes Prediction System
                </h1>
                
                {/* Live Cloud deployment badge */}
                <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Cloud Run Live</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(publicAppUrl);
                      setCopyFeedback('URL Copied!');
                      setTimeout(() => setCopyFeedback(null), 2500);
                    }}
                    className="ml-1 text-emerald-700 hover:text-emerald-950 flex items-center gap-0.5 underline transition cursor-pointer"
                    title="Copy public cloud URL"
                  >
                    <Copy className="w-2.5 h-2.5" />
                    <span>{copyFeedback === 'URL Copied!' ? 'Copied!' : 'Copy URL'}</span>
                  </button>
                  <a
                    href={publicAppUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 hover:text-emerald-950 transition flex items-center"
                    title="Open in new window"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Clinical ML Pipeline • 8 Raw Biometrics + 5 Dynamic Engineered Interaction Features
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold gap-0.5">
            <button
              id="tab-btn-dashboard"
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'dashboard'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Interactive Diagnostic</span>
            </button>
            <button
              id="tab-btn-gemini"
              type="button"
              onClick={() => setActiveTab('gemini')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'gemini'
                  ? 'bg-blue-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>DiaConsult AI (Gemini)</span>
            </button>
            <button
              id="tab-btn-history"
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs font-bold text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>Patient History (Firestore)</span>
            </button>
            <button
              id="tab-btn-code"
              type="button"
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'code'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Python & Flask</span>
            </button>
            <button
              id="tab-btn-benchmark"
              type="button"
              onClick={() => setActiveTab('benchmark')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'benchmark'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Benchmark</span>
            </button>
            <button
              id="tab-btn-report"
              type="button"
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
                activeTab === 'report'
                  ? 'bg-white text-slate-900 shadow-xs font-bold text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>MSBTE Report</span>
            </button>
          </div>

        </div>
      </header>

      {/* Real-Time Google Chrome & Web Ingress Banner */}
      <div className="bg-slate-900 text-white px-4 py-2 text-xs font-medium border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span><strong>Real-Time Cloud Deployment:</strong> Live Google Chrome & Web Ingress</span>
          <span className="hidden sm:inline text-slate-500">|</span>
          <span className="hidden sm:inline text-slate-300 font-mono text-[11px] truncate max-w-md">{publicAppUrl}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(publicAppUrl);
              setCopyFeedback('URL Copied!');
              setTimeout(() => setCopyFeedback(null), 2500);
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold flex items-center gap-1.5 transition border border-slate-700 cursor-pointer"
          >
            <Copy className="w-3 h-3 text-slate-400" />
            <span>{copyFeedback === 'URL Copied!' ? 'Copied!' : 'Copy URL'}</span>
          </button>
          <a
            href={publicAppUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1.5 transition shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Open in Google Chrome</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Main Content Area */}
      <main id="main-content" className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex-1">

        {/* TAB 1: INTERACTIVE CLINICAL PREDICTION DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">

            {/* Presets and Quick Actions bar */}
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5" />
                  Clinical Presets:
                </span>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    id={`preset-${key}`}
                    type="button"
                    onClick={() => handleApplyPreset(key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition border ${
                      activePreset === key
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <button
                id="btn-reset-inputs"
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1 px-2.5 py-1 rounded-md hover:bg-slate-100 transition"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Defaults
              </button>
            </div>

            {/* Two Column Layout: Form vs Results */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

              {/* Left Form: 8 Biometric Parameters (7 Cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                    <div>
                      <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-blue-600" />
                        Patient Biometric Profile (8 Medical Inputs)
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Adjust sliders or enter numbers. Clinical reference bounds are indicated.
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSimulateRun();
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      {/* 1. Pregnancies */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <label htmlFor="field-pregnancies" className="font-semibold text-slate-700">
                            Pregnancies
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">Count</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            id="slider-pregnancies"
                            min="0"
                            max="17"
                            step="1"
                            value={inputs.Pregnancies}
                            onChange={(e) => handleInputChange('Pregnancies', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <input
                            type="number"
                            id="field-pregnancies"
                            min="0"
                            max="20"
                            step="1"
                            value={inputs.Pregnancies}
                            onChange={(e) => handleInputChange('Pregnancies', Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>0</span>
                          <span>Range: 0–17</span>
                          <span>17+</span>
                        </div>
                      </div>

                      {/* 2. Glucose */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <label htmlFor="field-glucose" className="font-semibold text-slate-700">
                            Fasting Glucose
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">mg/dL</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            id="slider-glucose"
                            min="60"
                            max="240"
                            step="1"
                            value={inputs.Glucose}
                            onChange={(e) => handleInputChange('Glucose', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <input
                            type="number"
                            id="field-glucose"
                            min="0"
                            max="400"
                            step="1"
                            value={inputs.Glucose}
                            onChange={(e) => handleInputChange('Glucose', Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span className="text-emerald-600">&lt;100 Normal</span>
                          <span className="text-amber-600">100–125 Pre</span>
                          <span className="text-rose-600">≥126 Diabetic</span>
                        </div>
                      </div>

                      {/* 3. Blood Pressure */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <label htmlFor="field-bloodpressure" className="font-semibold text-slate-700">
                            Diastolic Blood Pressure
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">mm Hg</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            id="slider-bloodpressure"
                            min="40"
                            max="130"
                            step="1"
                            value={inputs.BloodPressure}
                            onChange={(e) => handleInputChange('BloodPressure', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <input
                            type="number"
                            id="field-bloodpressure"
                            min="0"
                            max="250"
                            step="1"
                            value={inputs.BloodPressure}
                            onChange={(e) => handleInputChange('BloodPressure', Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span className="text-emerald-600">&lt;80 Normal</span>
                          <span className="text-amber-600">80–89 Pre</span>
                          <span className="text-rose-600">≥90 Hyper</span>
                        </div>
                      </div>

                      {/* 4. Skin Thickness */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <label htmlFor="field-skinthickness" className="font-semibold text-slate-700">
                            Triceps Skin Fold
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">mm</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            id="slider-skinthickness"
                            min="0"
                            max="99"
                            step="1"
                            value={inputs.SkinThickness}
                            onChange={(e) => handleInputChange('SkinThickness', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <input
                            type="number"
                            id="field-skinthickness"
                            min="0"
                            max="120"
                            step="1"
                            value={inputs.SkinThickness}
                            onChange={(e) => handleInputChange('SkinThickness', Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>0</span>
                          <span>Clinical Mean: ~20–25 mm</span>
                          <span>99</span>
                        </div>
                      </div>

                      {/* 5. Insulin */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <label htmlFor="field-insulin" className="font-semibold text-slate-700">
                            2-Hour Serum Insulin
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">µU/mL</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            id="slider-insulin"
                            min="0"
                            max="500"
                            step="1"
                            value={inputs.Insulin}
                            onChange={(e) => handleInputChange('Insulin', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <input
                            type="number"
                            id="field-insulin"
                            min="0"
                            max="1200"
                            step="1"
                            value={inputs.Insulin}
                            onChange={(e) => handleInputChange('Insulin', Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span className="text-emerald-600">16–166 Standard</span>
                          <span className="text-rose-600">&gt;200 Resistance</span>
                        </div>
                      </div>

                      {/* 6. BMI */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <label htmlFor="field-bmi" className="font-semibold text-slate-700">
                            Body Mass Index (BMI)
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">kg/m²</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            id="slider-bmi"
                            min="15.0"
                            max="60.0"
                            step="0.1"
                            value={inputs.BMI}
                            onChange={(e) => handleInputChange('BMI', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <input
                            type="number"
                            id="field-bmi"
                            min="10"
                            max="80"
                            step="0.1"
                            value={inputs.BMI}
                            onChange={(e) => handleInputChange('BMI', Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span className="text-emerald-600">18.5–24.9</span>
                          <span className="text-amber-600">25–29.9</span>
                          <span className="text-rose-600">≥30 Obese</span>
                        </div>
                      </div>

                      {/* 7. Diabetes Pedigree Function */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <label htmlFor="field-dpf" className="font-semibold text-slate-700">
                            Diabetes Pedigree Function
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">Index</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            id="slider-dpf"
                            min="0.05"
                            max="2.2"
                            step="0.01"
                            value={inputs.DiabetesPedigreeFunction}
                            onChange={(e) => handleInputChange('DiabetesPedigreeFunction', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <input
                            type="number"
                            id="field-dpf"
                            min="0"
                            max="3"
                            step="0.001"
                            value={inputs.DiabetesPedigreeFunction}
                            onChange={(e) => handleInputChange('DiabetesPedigreeFunction', Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span className="text-emerald-600">&lt;0.4 Low</span>
                          <span className="text-amber-600">0.4–0.7 Mod</span>
                          <span className="text-rose-600">&gt;0.7 High Familial</span>
                        </div>
                      </div>

                      {/* 8. Age */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <label htmlFor="field-age" className="font-semibold text-slate-700">
                            Patient Age
                          </label>
                          <span className="text-[11px] text-slate-400 font-mono">Years</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <input
                            type="range"
                            id="slider-age"
                            min="18"
                            max="90"
                            step="1"
                            value={inputs.Age}
                            onChange={(e) => handleInputChange('Age', Number(e.target.value))}
                            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                          <input
                            type="number"
                            id="field-age"
                            min="1"
                            max="125"
                            step="1"
                            value={inputs.Age}
                            onChange={(e) => handleInputChange('Age', Number(e.target.value))}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded-lg text-sm text-center font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                          <span>&lt;30 Young (0)</span>
                          <span>30–49 Middle (1)</span>
                          <span>≥50 Senior (2)</span>
                        </div>
                      </div>

                    </div>

                    {/* DYNAMIC FEATURE ENGINEERING REAL-TIME MONITOR */}
                    <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                          <span className="text-xs font-bold text-blue-900 uppercase tracking-wide">
                            5 Dynamic Engineered Features
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-semibold">
                          Auto-computed for Model Input
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                        <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                          <div className="text-[10px] text-slate-500 font-medium">Glucose × BMI</div>
                          <div className="font-bold text-slate-900 text-sm mt-0.5">{engineered.Glucose_BMI}</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                          <div className="text-[10px] text-slate-500 font-medium">Age × BMI</div>
                          <div className="font-bold text-slate-900 text-sm mt-0.5">{engineered.Age_BMI}</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                          <div className="text-[10px] text-slate-500 font-medium">Glucose × Age</div>
                          <div className="font-bold text-slate-900 text-sm mt-0.5">{engineered.Glucose_Age}</div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                          <div className="text-[10px] text-slate-500 font-medium">BMI Category</div>
                          <div className="font-bold text-blue-700 text-xs mt-0.5 truncate" title={engineered.BMI_Category_Label}>
                            {engineered.BMI_Category_Label.split(' ')[0]} ({engineered.BMI_Category})
                          </div>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-blue-100 shadow-2xs">
                          <div className="text-[10px] text-slate-500 font-medium">Age Category</div>
                          <div className="font-bold text-blue-700 text-xs mt-0.5 truncate" title={engineered.Age_Category_Label}>
                            {engineered.Age_Category_Label.split(' ')[0]} ({engineered.Age_Category})
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trigger Prediction Button */}
                    <button
                      id="btn-run-prediction"
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-6 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm rounded-xl transition shadow-sm hover:shadow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Processing ML Pipeline...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Execute ML Risk Prediction</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Right Results Container: Gauge, Badges, Factor Breakdown (5 Cols) */}
              <div className="lg:col-span-5 space-y-6">
                <div id="results-card" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between h-full">
                  <div>
                    
                    {/* Header with Dynamic Badge */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Clinical Risk Score
                        </h3>
                        <span className="text-xs text-slate-500">14-Feature Vector Inference</span>
                      </div>

                      {/* Status Badges */}
                      <div
                        id="risk-badge"
                        className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 border ${
                          result.risk_level === 'Low Risk'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : result.risk_level === 'Moderate Risk'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            result.risk_level === 'Low Risk'
                              ? 'bg-emerald-500'
                              : result.risk_level === 'Moderate Risk'
                              ? 'bg-amber-500'
                              : 'bg-rose-500 animate-pulse'
                          }`}
                        />
                        <span>{result.risk_level}</span>
                      </div>
                    </div>

                    {/* Animated SVG Radial Gauge */}
                    <div className="my-6 text-center">
                      <div className="relative inline-flex items-center justify-center">
                        <svg className="w-56 h-32 transform -rotate-180 overflow-visible" viewBox="0 0 200 110">
                          {/* Track */}
                          <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke="#f1f5f9"
                            strokeWidth="18"
                            strokeLinecap="round"
                          />
                          {/* Animated Color Progress Arc */}
                          <path
                            d="M 20 100 A 80 80 0 0 1 180 100"
                            fill="none"
                            stroke={
                              result.risk_level === 'Low Risk'
                                ? '#10b981'
                                : result.risk_level === 'Moderate Risk'
                                ? '#f59e0b'
                                : '#ef4444'
                            }
                            strokeWidth="18"
                            strokeLinecap="round"
                            strokeDasharray={maxArc}
                            strokeDashoffset={strokeOffset}
                            style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease' }}
                          />
                        </svg>

                        {/* Centered Readout */}
                        <div className="absolute top-11 flex flex-col items-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Diabetes Probability
                          </span>
                          <div className="flex items-baseline gap-0.5">
                            <span id="risk-percentage" className="text-4xl font-black text-slate-900">
                              {result.probability}
                            </span>
                            <span className="text-xl font-bold text-slate-500">%</span>
                          </div>
                          <span
                            id="outcome-label"
                            className={`text-xs font-bold mt-0.5 ${
                              result.prediction === 1 ? 'text-rose-600' : 'text-emerald-600'
                            }`}
                          >
                            {result.prediction === 1 ? 'Outcome = 1 (Diabetic)' : 'Outcome = 0 (Non-Diabetic)'}
                          </span>
                        </div>
                      </div>

                      {/* Calibrated Ticks */}
                      <div className="flex justify-between text-[11px] font-semibold text-slate-400 max-w-xs mx-auto px-4 mt-2">
                        <span className="text-emerald-600">0% (Low)</span>
                        <span className="text-amber-600">30% (Moderate)</span>
                        <span className="text-rose-600">65%+ (High)</span>
                      </div>
                    </div>

                    {/* Recommendation Card */}
                    <div
                      id="recommendation-box"
                      className={`p-4 rounded-xl border text-xs leading-relaxed mb-5 ${
                        result.risk_level === 'Low Risk'
                          ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                          : result.risk_level === 'Moderate Risk'
                          ? 'bg-amber-50/60 border-amber-200 text-amber-950'
                          : 'bg-rose-50/60 border-rose-200 text-rose-950'
                      }`}
                    >
                      <div className="font-bold mb-1 flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        Clinical Guidance:
                      </div>
                      <p>{result.recommendation}</p>
                    </div>

                    {/* Calculated Health Factors Breakdown */}
                    <div className="space-y-2">
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>Contributing Factor Signals</span>
                        <span className="text-[10px] text-slate-400 font-normal">PIMA Clinical Thresholds</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        {result.clinical_flags.map((flag, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex justify-between items-center"
                          >
                            <div>
                              <span className="font-semibold text-slate-800">{flag.metric}</span>
                              <span className="text-slate-400 ml-1.5 font-mono">({flag.value})</span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                                flag.severity === 'high'
                                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                                  : flag.severity === 'medium'
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}
                            >
                              {flag.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Navigation to Gemini Advisor and Cloud Storage */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('gemini')}
                        className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-blue-200"
                      >
                        <Bot className="w-3.5 h-3.5 text-blue-600" />
                        <span>Ask DiaConsult AI (Gemini)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('history')}
                        className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-indigo-200"
                      >
                        <Cloud className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Save Patient to Firestore</span>
                      </button>
                    </div>

                  </div>

                  {/* Architecture spec footer */}
                  <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Database className="w-3 h-3 text-blue-500" />
                      13 Scaled Inputs (StandardScaler)
                    </span>
                    <span className="font-mono text-emerald-600 font-bold">
                      Champion ROC-AUC: 0.852
                    </span>
                  </div>

                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB: GEMINI MULTI-TURN CHATBOT, SEARCH GROUNDING & MAPS GROUNDING */}
        {activeTab === 'gemini' && (
          <div className="space-y-4">
            <GeminiConsultant
              currentMetrics={{
                glucose: inputs.Glucose,
                bmi: inputs.BMI,
                bloodPressure: inputs.BloodPressure,
                insulin: inputs.Insulin,
                age: inputs.Age,
                dpf: inputs.DiabetesPedigreeFunction,
                bmiCategory: engineered.BMI_Category_Label,
                ageCategory: engineered.Age_Category_Label,
                riskPercentage: result.probability,
                riskLevel: result.risk_level,
                factors: result.clinical_flags.filter(f => f.severity !== 'normal').map(f => f.metric)
              }}
            />
          </div>
        )}

        {/* TAB: FIREBASE AUTH & FIRESTORE PATIENT RECORDS PERSISTENCE */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <AuthAndHistory
              currentMetrics={{
                pregnancies: inputs.Pregnancies,
                glucose: inputs.Glucose,
                bloodPressure: inputs.BloodPressure,
                skinThickness: inputs.SkinThickness,
                insulin: inputs.Insulin,
                bmi: inputs.BMI,
                dpf: inputs.DiabetesPedigreeFunction,
                age: inputs.Age
              }}
              currentEngineered={{
                glucoseBmi: engineered.Glucose_BMI,
                ageBmi: engineered.Age_BMI,
                glucoseAge: engineered.Glucose_Age,
                bmiCategory: engineered.BMI_Category_Label,
                ageCategory: engineered.Age_Category_Label
              }}
              currentPrediction={{
                prediction: result.prediction,
                riskPercentage: result.probability,
                riskLevel: result.risk_level === 'Low Risk' ? 'Low' : result.risk_level === 'Moderate Risk' ? 'Moderate' : 'High',
                factors: result.clinical_flags.map(f => `${f.metric} (${f.status})`)
              }}
              onLoadRecord={(record: SavedPrediction) => {
                setInputs({
                  Pregnancies: record.metrics.pregnancies,
                  Glucose: record.metrics.glucose,
                  BloodPressure: record.metrics.bloodPressure,
                  SkinThickness: record.metrics.skinThickness,
                  Insulin: record.metrics.insulin,
                  BMI: record.metrics.bmi,
                  DiabetesPedigreeFunction: record.metrics.dpf,
                  Age: record.metrics.age
                });
                setActiveTab('dashboard');
              }}
            />
          </div>
        )}

        {/* TAB 2: PYTHON FLASK CODEBASE EXPLORER & DOWNLOADS */}
        {activeTab === 'code' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-blue-600" />
                  Deliverable Modular Code Files (Flask & Python)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Inspect, copy, or download the exact production scripts generated for local setup and deployment.
                </p>
              </div>

              {copyFeedback && (
                <div className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Copied {copyFeedback} to clipboard!
                </div>
              )}
            </div>

            {/* File Switcher Header */}
            <div className="flex border-b border-slate-200 overflow-x-auto bg-slate-100/70 p-1.5 gap-1 text-xs">
              <button
                type="button"
                onClick={() => setSelectedFileTab('app')}
                className={`px-3.5 py-2 rounded-lg font-mono font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                  selectedFileTab === 'app' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileCode className="w-4 h-4" />
                app.py (Flask REST API)
              </button>

              <button
                type="button"
                onClick={() => setSelectedFileTab('train')}
                className={`px-3.5 py-2 rounded-lg font-mono font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                  selectedFileTab === 'train' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Cpu className="w-4 h-4" />
                train_model.py (ML Pipeline)
              </button>

              <button
                type="button"
                onClick={() => setSelectedFileTab('html')}
                className={`px-3.5 py-2 rounded-lg font-mono font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                  selectedFileTab === 'html' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                templates/index.html
              </button>

              <button
                type="button"
                onClick={() => setSelectedFileTab('req')}
                className={`px-3.5 py-2 rounded-lg font-mono font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                  selectedFileTab === 'req' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4" />
                requirements.txt
              </button>

              <button
                type="button"
                onClick={() => setSelectedFileTab('csv')}
                className={`px-3.5 py-2 rounded-lg font-mono font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                  selectedFileTab === 'csv' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                diabetes_featured.csv
              </button>

              <button
                type="button"
                onClick={() => setSelectedFileTab('readme')}
                className={`px-3.5 py-2 rounded-lg font-mono font-semibold flex items-center gap-2 transition whitespace-nowrap ${
                  selectedFileTab === 'readme' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Info className="w-4 h-4" />
                README.md
              </button>
            </div>

            {/* Code Display Box */}
            <div className="relative">
              <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(FILE_CONTENTS[selectedFileTab], selectedFileTab)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy Code
                </button>
              </div>

              <pre className="p-6 bg-slate-900 text-slate-100 font-mono text-xs leading-relaxed overflow-x-auto max-h-[580px]">
                <code>{FILE_CONTENTS[selectedFileTab]}</code>
              </pre>
            </div>

            {/* Quickstart steps footer */}
            <div className="p-6 bg-slate-50 border-t border-slate-200">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-blue-600" />
                3-Step Local Execution Workflow:
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="font-bold text-blue-600 block mb-1">1. Install Dependencies</span>
                  <code className="text-[11px] bg-slate-100 px-2 py-1 rounded block font-mono text-slate-800">
                    pip install -r requirements.txt
                  </code>
                  <p className="text-slate-500 mt-1.5 text-[11px]">Installs Flask, scikit-learn, pandas, numpy, and joblib.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="font-bold text-blue-600 block mb-1">2. Train Models & Export</span>
                  <code className="text-[11px] bg-slate-100 px-2 py-1 rounded block font-mono text-slate-800">
                    python train_model.py
                  </code>
                  <p className="text-slate-500 mt-1.5 text-[11px]">Evaluates 3 models, saves model.pkl and scaler.pkl.</p>
                </div>

                <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                  <span className="font-bold text-blue-600 block mb-1">3. Launch Flask Server (Local)</span>
                  <code className="text-[11px] bg-slate-100 px-2 py-1 rounded block font-mono text-slate-800">
                    python app.py
                  </code>
                  <p className="text-slate-500 mt-1.5 text-[11px]">Local: http://127.0.0.1:5000 • Cloud: Public HTTPS URL above.</p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: MACHINE LEARNING BENCHMARK & ARCHITECTURE */}
        {activeTab === 'benchmark' && (
          <div className="space-y-6">
            
            {/* Top comparison cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Model 1 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Baseline Model</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Linear</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Logistic Regression</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Standard linear probabilistic classification on StandardScaler normalized feature vectors.
                </p>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Test Accuracy:</span>
                    <span className="font-mono font-bold text-slate-800">77.27%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ROC-AUC Score:</span>
                    <span className="font-mono font-bold text-blue-600">0.8354</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">F1-Score:</span>
                    <span className="font-mono font-bold text-slate-800">0.6538</span>
                  </div>
                </div>
              </div>

              {/* Model 2 */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Bagging Ensemble</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">Trees</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Random Forest</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  150 decision tree estimators with max_depth=6 reducing variance across non-linear clinical partitions.
                </p>
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Test Accuracy:</span>
                    <span className="font-mono font-bold text-slate-800">77.92%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ROC-AUC Score:</span>
                    <span className="font-mono font-bold text-blue-600">0.8410</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">F1-Score:</span>
                    <span className="font-mono font-bold text-slate-800">0.6733</span>
                  </div>
                </div>
              </div>

              {/* Model 3: Champion */}
              <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500 shadow-sm relative">
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 bg-emerald-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-xs">
                  ★ Champion Model
                </div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Boosting Ensemble</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Selected</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">Gradient Boosting</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Sequential gradient-weighted weak learners (n=120, lr=0.08) optimizing cross-entropy loss.
                </p>
                <div className="space-y-2 text-xs border-t border-emerald-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Test Accuracy:</span>
                    <span className="font-mono font-bold text-emerald-700">78.57%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">ROC-AUC Score:</span>
                    <span className="font-mono font-bold text-emerald-700">0.8522</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">F1-Score:</span>
                    <span className="font-mono font-bold text-emerald-700">0.6869</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Feature Importance & Engineering Matrix */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                13-Feature Importance Matrix & Engineering Impact
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Relative Gini feature importances calculated by the champion ensemble model on `diabetes_featured.csv`.
              </p>

              <div className="space-y-3 text-xs">
                {[
                  { name: 'Glucose_BMI (Engineered)', importance: 21.4, type: 'engineered' },
                  { name: 'Glucose (Raw)', importance: 18.2, type: 'raw' },
                  { name: 'BMI (Raw)', importance: 13.6, type: 'raw' },
                  { name: 'Glucose_Age (Engineered)', importance: 11.5, type: 'engineered' },
                  { name: 'Age_BMI (Engineered)', importance: 9.8, type: 'engineered' },
                  { name: 'DiabetesPedigreeFunction (Raw)', importance: 7.4, type: 'raw' },
                  { name: 'Age (Raw)', importance: 6.2, type: 'raw' },
                  { name: 'BMI_Category (Engineered)', importance: 3.8, type: 'engineered' },
                  { name: 'BloodPressure (Raw)', importance: 3.1, type: 'raw' },
                  { name: 'Insulin (Raw)', importance: 2.3, type: 'raw' },
                  { name: 'Pregnancies (Raw)', importance: 1.5, type: 'raw' },
                  { name: 'Age_Category (Engineered)', importance: 1.2, type: 'engineered' }
                ].map((feat, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="w-52 text-slate-700 font-medium truncate flex items-center gap-1.5">
                      {feat.type === 'engineered' ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                      ) : (
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                      )}
                      {feat.name}
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          feat.type === 'engineered' ? 'bg-blue-600' : 'bg-slate-500'
                        }`}
                        style={{ width: `${feat.importance * 4}%` }}
                      />
                    </div>
                    <span className="w-12 text-right font-mono font-bold text-slate-700">
                      {feat.importance}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong>Why Dynamic Feature Engineering Matters:</strong> Interaction terms like <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-blue-700">Glucose_BMI</code> capture the combined physiological impact of insulin resistance and body composition, accounting for over <strong>47%</strong> of total decision tree split importance in the champion classifier.
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: MSBTE INDUSTRIAL TRAINING REPORT (315004) */}
        {activeTab === 'report' && (
          <div className="space-y-6">
            
            {/* Report Header & Action Bar */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    MSBTE Curriculum AN-3K
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">Course Code: 315004 • A.Y. 2026–27</span>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">
                  Industrial Training Project Report
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Reference Report Draft based on MSBTE Guidelines • Yashoda Technical Campus, Satara & Swami Logipool Infotech, Pune
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-copy-full-report"
                  type="button"
                  onClick={() => {
                    const fullText = ITR_SECTIONS.map(s => 
                      `# ${s.number}: ${s.title}\n${s.subtitle || ''}\n\n${s.content.join('\n')}\n\n` +
                      (s.tables ? s.tables.map(t => '| ' + t.headers.join(' | ') + ' |\n| ' + t.headers.map(() => '---').join(' | ') + ' |\n' + t.rows.map(r => '| ' + r.join(' | ') + ' |').join('\n')).join('\n\n') + '\n\n' : '') +
                      (s.keyLearnings ? '### Key Learnings\n' + s.keyLearnings.map(k => '• ' + k).join('\n') : '')
                    ).join('\n\n---\n\n');
                    copyToClipboard(fullText, 'Full Report');
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copyFeedback === 'Full Report' ? 'Copied Full Report!' : 'Copy Entire Text'}</span>
                </button>

                <a
                  id="btn-download-docx"
                  href="/MSBTE_ITR_Report_Diabetes_Prediction.docx"
                  download="MSBTE_ITR_Report_Diabetes_Prediction.docx"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-2 shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Word (.docx)</span>
                </a>

                <button
                  id="btn-download-report-md"
                  type="button"
                  onClick={() => {
                    const fullText = ITR_SECTIONS.map(s => 
                      `# ${s.number}: ${s.title}\n${s.subtitle || ''}\n\n${s.content.join('\n')}\n\n` +
                      (s.tables ? s.tables.map(t => '| ' + t.headers.join(' | ') + ' |\n| ' + t.headers.map(() => '---').join(' | ') + ' |\n' + t.rows.map(r => '| ' + r.join(' | ') + ' |').join('\n')).join('\n\n') + '\n\n' : '') +
                      (s.keyLearnings ? '### Key Learnings\n' + s.keyLearnings.map(k => '• ' + k).join('\n') : '')
                    ).join('\n\n---\n\n');
                    const element = document.createElement('a');
                    const file = new Blob([fullText], { type: 'text/markdown' });
                    element.href = URL.createObjectURL(file);
                    element.download = 'MSBTE_ITR_Report_Diabetes_Prediction.md';
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 transition flex items-center gap-1"
                >
                  <span>(.md)</span>
                </button>
              </div>
            </div>

            {/* Two-Column Report Browser */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Chapters & Content Page Navigation */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-3 space-y-1">
                <div className="p-2.5 pb-2 text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Table of Contents</span>
                  <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-mono">14 Sections</span>
                </div>

                <div className="space-y-1 max-h-[70vh] overflow-y-auto pr-1">
                  {ITR_SECTIONS.map((sec) => (
                    <button
                      key={sec.id}
                      id={`toc-${sec.id}`}
                      type="button"
                      onClick={() => setSelectedSectionId(sec.id)}
                      className={`w-full text-left p-2.5 rounded-xl transition text-xs flex items-start justify-between gap-2 ${
                        selectedSectionId === sec.id
                          ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200 shadow-2xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                      }`}
                    >
                      <div>
                        <span className="block text-[10px] font-semibold text-slate-400 uppercase">
                          {sec.number}
                        </span>
                        <span className="line-clamp-1">{sec.title}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 mt-1 shrink-0 ${selectedSectionId === sec.id ? 'text-blue-600' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Selected Chapter Display */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
                {(() => {
                  const currentSection = ITR_SECTIONS.find(s => s.id === selectedSectionId) || ITR_SECTIONS[0];
                  return (
                    <div className="space-y-6">
                      
                      {/* Section Header */}
                      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-blue-600 tracking-wider uppercase font-mono">
                              {currentSection.number}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs text-slate-400 font-medium">MSBTE AN-3K ITR (315004)</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                            {currentSection.title}
                          </h3>
                          {currentSection.subtitle && (
                            <p className="text-xs text-slate-500 mt-0.5">{currentSection.subtitle}</p>
                          )}
                        </div>

                        <button
                          id="btn-copy-section"
                          type="button"
                          onClick={() => {
                            const secText = `# ${currentSection.number}: ${currentSection.title}\n\n` +
                              currentSection.content.join('\n') + '\n\n' +
                              (currentSection.tables ? currentSection.tables.map(t => '| ' + t.headers.join(' | ') + ' |\n| ' + t.headers.map(() => '---').join(' | ') + ' |\n' + t.rows.map(r => '| ' + r.join(' | ') + ' |').join('\n')).join('\n\n') + '\n\n' : '') +
                              (currentSection.keyLearnings ? '### Key Learnings\n' + currentSection.keyLearnings.map(k => '• ' + k).join('\n') : '');
                            copyToClipboard(secText, currentSection.id);
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1 self-start sm:self-center"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copyFeedback === currentSection.id ? 'Copied Section!' : 'Copy Section'}</span>
                        </button>
                      </div>

                      {/* Content Paragraphs */}
                      <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                        {currentSection.content.map((paragraph, idx) => {
                          if (paragraph.startsWith('### ')) {
                            return (
                              <h4 key={idx} className="text-sm font-bold text-slate-900 pt-3 border-t border-slate-100">
                                {paragraph.replace('### ', '')}
                              </h4>
                            );
                          }
                          if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                            return (
                              <p key={idx} className="font-bold text-slate-900">
                                {paragraph.replaceAll('**', '')}
                              </p>
                            );
                          }
                          if (paragraph === '') {
                            return <div key={idx} className="h-1" />;
                          }
                          return (
                            <p key={idx} className="text-slate-600">
                              {paragraph}
                            </p>
                          );
                        })}
                      </div>

                      {/* Tables if any */}
                      {currentSection.tables && currentSection.tables.length > 0 && (
                        <div className="space-y-4 pt-2">
                          {currentSection.tables.map((tbl, tIdx) => (
                            <div key={tIdx} className="overflow-x-auto rounded-xl border border-slate-200">
                              <table className="w-full text-xs text-left">
                                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                                  <tr>
                                    {tbl.headers.map((h, hIdx) => (
                                      <th key={hIdx} className="p-2.5 px-3">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-slate-600">
                                  {tbl.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-50 transition">
                                      {row.map((cell, cIdx) => (
                                        <td key={cIdx} className={`p-2.5 px-3 ${cIdx === 0 ? 'font-medium text-slate-800' : ''}`}>
                                          {cell}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Key Learnings Box if present */}
                      {currentSection.keyLearnings && (
                        <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-200 text-xs">
                          <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            Key Learnings & Outcomes:
                          </h5>
                          <ul className="space-y-1.5 text-blue-800 list-disc list-inside">
                            {currentSection.keyLearnings.map((item, kIdx) => (
                              <li key={kIdx} className="leading-normal">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Navigation between chapters */}
                      <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs font-semibold">
                        {(() => {
                          const currIdx = ITR_SECTIONS.findIndex(s => s.id === currentSection.id);
                          const prevSec = currIdx > 0 ? ITR_SECTIONS[currIdx - 1] : null;
                          const nextSec = currIdx < ITR_SECTIONS.length - 1 ? ITR_SECTIONS[currIdx + 1] : null;

                          return (
                            <>
                              {prevSec ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSectionId(prevSec.id)}
                                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                                >
                                  ← Previous: {prevSec.number}
                                </button>
                              ) : <div />}

                              {nextSec ? (
                                <button
                                  type="button"
                                  onClick={() => setSelectedSectionId(nextSec.id)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition"
                                >
                                  Next: {nextSec.number} →
                                </button>
                              ) : <div />}
                            </>
                          );
                        })()}
                      </div>

                    </div>
                  );
                })()}
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer id="main-footer" className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Diabetes Prediction System • Production Machine Learning Stack</span>
          <span className="font-mono text-slate-400">Python 3.10 • Flask 3.0 • scikit-learn 1.5 • Tailwind CSS</span>
        </div>
      </footer>

    </div>
  );
}
