# Diabetes Prediction System (ITR Project)

A complete, production-grade Machine Learning and Full-Stack Web Application for clinical diabetes risk prediction using **Python**, **scikit-learn**, and **Flask**, styled with **Tailwind CSS**.

---

## 1. Project Architecture & File Structure

```text
├── diabetes_featured.csv   # Dataset with 14 columns (8 raw + 5 engineered + 1 outcome)
├── train_model.py          # Machine learning training, evaluation, and serialization pipeline
├── app.py                  # Production Flask REST API and web application server
├── templates/
│   └── index.html          # Responsive interactive frontend with live gauge & dynamic features
├── static/
│   └── style.css           # Custom CSS styling for animations, glowing badges, and gauge
├── requirements.txt        # Python dependency manifest
├── model.pkl               # Champion trained ML model (generated upon running train_model.py)
├── scaler.pkl              # Fitted StandardScaler (generated upon running train_model.py)
└── README.md               # Setup and execution guide
```

---

## 2. Feature Specifications (14 Total Columns)

### Raw Biometric Inputs (8)
1. **Pregnancies**: Total number of pregnancies (0–20)
2. **Glucose**: 2-hour fasting plasma glucose concentration (mg/dL)
3. **BloodPressure**: Diastolic blood pressure (mm Hg)
4. **SkinThickness**: Triceps skin fold thickness (mm)
5. **Insulin**: 2-hour serum insulin (µU/mL)
6. **BMI**: Body mass index (weight in kg / (height in m)²)
7. **DiabetesPedigreeFunction**: Genetic diabetes lineage score (0.00–2.50)
8. **Age**: Patient age in years

### Dynamically Engineered Features (5)
*Computed on the fly in Flask before model inference:*
- **`Glucose_BMI`** = `Glucose * BMI` (Physiological metabolic load)
- **`Age_BMI`** = `Age * BMI` (Cumulative adiposity over lifespan)
- **`Glucose_Age`** = `Glucose * Age` (Long-term glycemic impact)
- **`BMI_Category`**:
  * Underweight (`< 18.5`): `0`
  * Normal (`18.5 - 24.9`): `1`
  * Overweight (`25.0 - 29.9`): `2`
  * Obese (`>= 30.0`): `3`
- **`Age_Category`**:
  * Young (`< 30`): `0`
  * Middle (`30 - 49`): `1`
  * Senior (`>= 50`): `2`

### Target Variable (1)
- **Outcome**: `0` = Non-Diabetic, `1` = Diabetic

---

## 3. Quickstart & Local Setup Guide

### Step 1: Clone or Navigate to Project Directory
```bash
cd diabetes-prediction-itr
```

### Step 2: Create and Activate Virtual Environment
```bash
# On macOS / Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Required Python Packages
```bash
pip install -r requirements.txt
```

### Step 4: Train and Evaluate Machine Learning Models
Run the training pipeline script. It benchmarks **Logistic Regression**, **Random Forest**, and **Gradient Boosting**, picks the champion model based on ROC-AUC, and serializes `model.pkl` and `scaler.pkl`:
```bash
python train_model.py
```
*Expected output:*
```text
======================================================================
 Diabetes Prediction System (ITR Project) - ML Training Pipeline
======================================================================
[*] Total dataset shape: 768 rows, 14 columns
[*] Train set size: 614 | Test set size: 154
[✓] Features successfully standardized using StandardScaler.

--- Model Benchmark Evaluation ---
  • Logistic Regression   : Accuracy = 0.7727 | ROC-AUC = 0.8354 | F1-Score = 0.6538
  • Random Forest         : Accuracy = 0.7792 | ROC-AUC = 0.8410 | F1-Score = 0.6733
  • Gradient Boosting     : Accuracy = 0.7857 | ROC-AUC = 0.8522 | F1-Score = 0.6869
----------------------------------------------------------------------
[★] Champion Model Selected: Gradient Boosting (ROC-AUC: 0.8522)
----------------------------------------------------------------------
[✓] Saved model artifact: 'model.pkl'
[✓] Saved scaler artifact: 'scaler.pkl'
```

### Step 5: Start the Application

- **Cloud Deployment (AI Studio / Cloud Run)**:
  The application is automatically hosted and accessible via the Cloud Run ingress URL:
  ```text
  https://ais-dev-zqkp3qgnmpshtvjhckg4sd-195574904887.asia-southeast1.run.app
  ```
  *(Note: Cloud containers route internally on port 3000 to this public HTTPS URL. Do not use http://localhost:3000 from external browsers).*

- **Local Development / Standalone Flask (Optional)**:
  If running the Python script on your personal computer:
  ```bash
  python app.py
  ```
  Open your web browser and navigate to:
  ```text
  http://127.0.0.1:5000  (or http://localhost:5000)
  ```

---

## 4. REST API Documentation

### `POST /predict`
Performs risk inference given raw biometric inputs.

**Sample Request (`application/json`):**
```json
{
  "Pregnancies": 2,
  "Glucose": 140,
  "BloodPressure": 78,
  "SkinThickness": 28,
  "Insulin": 130,
  "BMI": 32.5,
  "DiabetesPedigreeFunction": 0.52,
  "Age": 45
}
```

**Sample Response (`200 OK`):**
```json
{
  "success": true,
  "prediction": 1,
  "probability": 68.4,
  "risk_level": "High Risk",
  "risk_color": "red",
  "recommendation": "Elevated diabetes indicators detected. Comprehensive clinical consultation, fasting plasma glucose confirmation, and formal glycemic evaluation strongly advised.",
  "engineered_features": {
    "Glucose_BMI": 4550.0,
    "Age_BMI": 1462.5,
    "Glucose_Age": 6300.0,
    "BMI_Category": 3,
    "BMI_Category_Label": "Obese (≥30.0)",
    "Age_Category": 1,
    "Age_Category_Label": "Middle-aged (30-49)"
  },
  "clinical_flags": [
    { "metric": "Glucose", "value": "140 mg/dL", "status": "Elevated (≥140)", "severity": "high" },
    { "metric": "BMI", "value": "32.5 kg/m²", "status": "Obese (≥30)", "severity": "high" }
  ]
}
```

---

## 5. Production Deployment Notes
For production web servers, serve using `gunicorn`:
```bash
gunicorn --bind 0.0.0.0:5000 --workers 4 app:app
```
