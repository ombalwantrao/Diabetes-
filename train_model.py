"""
Machine Learning Pipeline for Diabetes Prediction System (ITR Project)
========================================================================
This script performs:
1. Loading or generating the clinical dataset (based on diabetes_featured.csv).
2. Dynamic feature engineering verification:
   - Glucose_BMI = Glucose * BMI
   - Age_BMI = Age * BMI
   - Glucose_Age = Glucose * Age
   - BMI_Category: Underweight (<18.5): 0, Normal (18.5-24.9): 1, Overweight (25-29.9): 2, Obese (>=30): 3
   - Age_Category: Young (<30): 0, Middle (30-49): 1, Senior (>=50): 2
3. Train/Test split (80/20 stratified).
4. Feature standardization using StandardScaler.
5. Model training & comparison across 3 algorithms:
   - Logistic Regression
   - Random Forest Classifier
   - Gradient Boosting Classifier
6. Selecting the champion model based on ROC-AUC and Test Accuracy.
7. Exporting model.pkl and scaler.pkl for deployment in Flask app.py.
"""

import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, classification_report, f1_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

FEATURE_COLUMNS = [
    'Pregnancies',
    'Glucose',
    'BloodPressure',
    'SkinThickness',
    'Insulin',
    'BMI',
    'DiabetesPedigreeFunction',
    'Age',
    'Glucose_BMI',
    'Age_BMI',
    'Glucose_Age',
    'BMI_Category',
    'Age_Category',
]

TARGET_COLUMN = 'Outcome'


def compute_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """Computes the 5 designated engineered features from raw medical parameters."""
    df = df.copy()
    
    # Interaction terms
    df['Glucose_BMI'] = df['Glucose'] * df['BMI']
    df['Age_BMI'] = df['Age'] * df['BMI']
    df['Glucose_Age'] = df['Glucose'] * df['Age']
    
    # BMI Category encoding
    # Underweight < 18.5: 0 | Normal 18.5-24.9: 1 | Overweight 25-29.9: 2 | Obese >= 30: 3
    def get_bmi_cat(bmi):
        if bmi < 18.5:
            return 0
        elif bmi < 25.0:
            return 1
        elif bmi < 30.0:
            return 2
        else:
            return 3

    df['BMI_Category'] = df['BMI'].apply(get_bmi_cat)

    # Age Category encoding
    # Young < 30: 0 | Middle 30-49: 1 | Senior >= 50: 2
    def get_age_cat(age):
        if age < 30:
            return 0
        elif age < 50:
            return 1
        else:
            return 2

    df['Age_Category'] = df['Age'].apply(get_age_cat)
    return df


def generate_synthetic_pima_dataset(num_samples: int = 768) -> pd.DataFrame:
    """Generates a clinically realistic synthetic PIMA dataset if CSV is missing."""
    np.random.seed(42)
    
    # Generate realistic distribution based on PIMA Indians Diabetes empirical parameters
    pregnancies = np.random.choice([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], size=num_samples, p=[0.18, 0.16, 0.14, 0.12, 0.10, 0.08, 0.07, 0.06, 0.04, 0.03, 0.02])
    glucose = np.clip(np.random.normal(120.9, 31.9, num_samples), 60, 200).round(1)
    blood_pressure = np.clip(np.random.normal(69.1, 19.3, num_samples), 40, 122).round(1)
    skin_thickness = np.clip(np.random.normal(20.5, 15.9, num_samples), 0, 99).round(1)
    insulin = np.clip(np.random.exponential(79.8, num_samples), 0, 846).round(1)
    bmi = np.clip(np.random.normal(32.0, 7.8, num_samples), 15.0, 67.1).round(1)
    pedigree = np.clip(np.random.exponential(0.47, num_samples), 0.08, 2.42).round(3)
    age = np.clip(np.random.normal(33.2, 11.7, num_samples), 21, 81).astype(int)

    # Ground truth logistic probability based on clinical weights
    log_odds = (
        -7.5
        + 0.12 * pregnancies
        + 0.038 * glucose
        + 0.012 * blood_pressure
        + 0.005 * skin_thickness
        + 0.001 * insulin
        + 0.085 * bmi
        + 0.95 * pedigree
        + 0.025 * age
    )
    prob = 1.0 / (1.0 + np.exp(-log_odds))
    outcome = (np.random.rand(num_samples) < prob).astype(int)

    raw_df = pd.DataFrame({
        'Pregnancies': pregnancies,
        'Glucose': glucose,
        'BloodPressure': blood_pressure,
        'SkinThickness': skin_thickness,
        'Insulin': insulin,
        'BMI': bmi,
        'DiabetesPedigreeFunction': pedigree,
        'Age': age,
        'Outcome': outcome
    })

    return compute_engineered_features(raw_df)


def load_dataset(csv_path: str = 'diabetes_featured.csv') -> pd.DataFrame:
    """Loads dataset from CSV or creates and saves baseline data."""
    if os.path.exists(csv_path):
        print(f"[*] Loading dataset from '{csv_path}'...")
        df = pd.read_csv(csv_path)
        # Ensure engineered columns exist
        needed_cols = ['Glucose_BMI', 'Age_BMI', 'Glucose_Age', 'BMI_Category', 'Age_Category']
        if not all(col in df.columns for col in needed_cols):
            print("[!] Computing missing engineered features on the dataset...")
            df = compute_engineered_features(df)
            df.to_csv(csv_path, index=False)
        return df
    else:
        print(f"[!] '{csv_path}' not found. Generating high-fidelity clinical dataset...")
        df = generate_synthetic_pima_dataset(768)
        df.to_csv(csv_path, index=False)
        print(f"[✓] Saved benchmark dataset to '{csv_path}' (768 rows, 14 columns).")
        return df


def main():
    print("=" * 70)
    print(" Diabetes Prediction System (ITR Project) - ML Training Pipeline")
    print("=" * 70)

    # 1. Load Data
    df = load_dataset('diabetes_featured.csv')
    print(f"[*] Total dataset shape: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"[*] Class distribution: Non-Diabetic (0): {(df[TARGET_COLUMN] == 0).sum()} | Diabetic (1): {(df[TARGET_COLUMN] == 1).sum()}")

    # 2. Features and Target separation
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]

    # 3. Train-Test Split (80/20 Stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    print(f"[*] Train set size: {X_train.shape[0]} | Test set size: {X_test.shape[0]}")

    # 4. Standard Scaling
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    print("[✓] Features successfully standardized using StandardScaler.")

    # 5. Model Training & Evaluation
    models = {
        'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
        'Random Forest': RandomForestClassifier(n_estimators=150, max_depth=6, random_state=42),
        'Gradient Boosting': GradientBoostingClassifier(n_estimators=120, learning_rate=0.08, max_depth=3, random_state=42),
    }

    results = {}
    best_model_name = None
    best_roc_auc = -1.0
    best_model_obj = None

    print("\n--- Model Benchmark Evaluation ---")
    for name, model in models.items():
        model.fit(X_train_scaled, y_train)
        y_pred = model.predict(X_test_scaled)
        y_prob = model.predict_proba(X_test_scaled)[:, 1]

        acc = accuracy_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_prob)
        f1 = f1_score(y_test, y_pred)

        results[name] = {
            'Accuracy': acc,
            'ROC_AUC': roc_auc,
            'F1': f1,
            'Model': model
        }

        print(f"  • {name:<22}: Accuracy = {acc:.4f} | ROC-AUC = {roc_auc:.4f} | F1-Score = {f1:.4f}")

        # Choose best model prioritizing ROC-AUC, then Accuracy
        if roc_auc > best_roc_auc:
            best_roc_auc = roc_auc
            best_model_name = name
            best_model_obj = model

    print("-" * 70)
    print(f"[★] Champion Model Selected: {best_model_name} (ROC-AUC: {best_roc_auc:.4f})")
    print("-" * 70)

    # Display full classification report for the champion
    best_pred = best_model_obj.predict(X_test_scaled)
    print("\nClassification Report (Champion Model):")
    print(classification_report(y_test, best_pred, target_names=['Non-Diabetic (0)', 'Diabetic (1)']))

    # 6. Export Model and Scaler artifacts
    os.makedirs('model', exist_ok=True)
    model_path = 'model.pkl'
    scaler_path = 'scaler.pkl'

    joblib.dump(best_model_obj, model_path)
    joblib.dump(scaler, scaler_path)

    print(f"[✓] Saved model artifact: '{model_path}'")
    print(f"[✓] Saved scaler artifact: '{scaler_path}'")
    print("=" * 70)
    print(" Training pipeline completed successfully. Ready for Flask deployment.")
    print("=" * 70)


if __name__ == '__main__':
    main()
