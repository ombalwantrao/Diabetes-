import React, { useState, useEffect } from 'react';
import { 
  User, 
  LogIn, 
  LogOut, 
  Save, 
  Trash2, 
  History, 
  Clock, 
  Check, 
  AlertCircle,
  FileCheck,
  ShieldCheck,
  ArrowUpRight,
  Radio,
  Globe,
  ExternalLink
} from 'lucide-react';
import { 
  auth, 
  signInWithGoogle, 
  logOut, 
  savePredictionRecord, 
  fetchUserPredictions, 
  subscribeUserPredictions,
  deletePredictionRecord, 
  SavedPrediction 
} from '../firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

interface AuthAndHistoryProps {
  currentMetrics: {
    pregnancies: number;
    glucose: number;
    bloodPressure: number;
    skinThickness: number;
    insulin: number;
    bmi: number;
    dpf: number;
    age: number;
  };
  currentEngineered: {
    glucoseBmi: number;
    ageBmi: number;
    glucoseAge: number;
    bmiCategory: string;
    ageCategory: string;
  };
  currentPrediction: {
    prediction: number;
    riskPercentage: number;
    riskLevel: 'Low' | 'Moderate' | 'High';
    factors: string[];
  };
  onLoadRecord: (record: SavedPrediction) => void;
}

export const AuthAndHistory: React.FC<AuthAndHistoryProps> = ({
  currentMetrics,
  currentEngineered,
  currentPrediction,
  onLoadRecord
}) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [records, setRecords] = useState<SavedPrediction[]>([]);
  const [patientName, setPatientName] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribeFirestore: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
        unsubscribeFirestore = null;
      }

      if (currentUser) {
        setIsLoadingHistory(true);
        // Real-time synchronization with Firestore
        unsubscribeFirestore = subscribeUserPredictions(
          currentUser.uid,
          (data) => {
            setRecords(data);
            setIsLoadingHistory(false);
          },
          (err) => {
            console.error('Real-time sync error:', err);
            setIsLoadingHistory(false);
          }
        );
      } else {
        setRecords([]);
        setIsLoadingHistory(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, []);

  const loadHistory = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    setIsLoadingHistory(true);
    try {
      const data = await fetchUserPredictions();
      setRecords(data);
    } catch (err: any) {
      console.error('Failed to load user history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithGoogle();
      setFeedback('Successfully signed in with Google!');
      setTimeout(() => setFeedback(null), 3500);
    } catch (err: any) {
      console.error('Sign-in error:', err);
      setAuthError(err.message || 'Google sign-in failed');
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
      setFeedback('Signed out successfully.');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error('Sign-out error:', err);
    }
  };

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setAuthError('Please sign in with Google to save patient assessments to Firestore.');
      return;
    }

    setIsSaving(true);
    setFeedback(null);
    setAuthError(null);

    try {
      await savePredictionRecord({
        userId: user.uid,
        patientName: patientName.trim() || `Patient #${Math.floor(1000 + Math.random() * 9000)}`,
        patientId: `PT-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toISOString(),
        metrics: currentMetrics,
        engineered: currentEngineered,
        prediction: currentPrediction.prediction,
        riskPercentage: currentPrediction.riskPercentage,
        riskLevel: currentPrediction.riskLevel,
        factors: currentPrediction.factors,
        notes: patientNotes.trim()
      });

      setFeedback('Assessment safely persisted to Firebase Firestore in real-time!');
      setPatientName('');
      setPatientNotes('');
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      console.error('Failed to save assessment:', err);
      setAuthError(err.message || 'Error saving to Firestore.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRecord = async (recordId?: string) => {
    if (!recordId) return;
    if (!confirm('Are you sure you want to delete this patient record?')) return;

    try {
      await deletePredictionRecord(recordId);
      setFeedback('Record deleted in real-time.');
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      console.error('Failed to delete record:', err);
      setAuthError(err.message || 'Failed to delete record.');
    }
  };

  const publicUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-zqkp3qgnmpshtvjhckg4sd-195574904887.asia-southeast1.run.app';

  return (
    <div className="space-y-6">
      {/* Real-time Google Chrome Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-sky-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-sm">Real-Time Cloud Synchronization</h4>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                <Radio className="w-2.5 h-2.5 text-emerald-600 animate-pulse" />
                Live Firestore Active
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Instant multi-tab live sync via Firebase on Google Chrome. Clinical updates reflect automatically across all connected browsers.
            </p>
          </div>
        </div>
        <a
          href={publicUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open in Chrome Tab</span>
        </a>
      </div>
      {/* Auth State Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {user?.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || 'Clinician'} 
              className="w-12 h-12 rounded-full border border-slate-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {user ? user.displayName || 'Clinician User' : 'Clinician Account (Firebase Auth)'}
              </h3>
              {user && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Authenticated
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {user ? user.email : 'Sign in with Google to securely persist patient assessments to Firestore cloud database.'}
            </p>
          </div>
        </div>

        <div>
          {user ? (
            <button
              type="button"
              onClick={handleSignOut}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSignIn}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white transition flex items-center gap-2 shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In with Google</span>
            </button>
          )}
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-medium">{feedback}</span>
        </div>
      )}

      {authError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span className="font-medium">{authError}</span>
        </div>
      )}

      {/* Save Assessment to Firestore Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Save className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Save Current Patient Assessment</h3>
              <p className="text-xs text-slate-500">Record current 13-feature diagnostic state to Firestore</p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
            currentPrediction.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
            currentPrediction.riskLevel === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
            'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            Current Risk: {currentPrediction.riskPercentage}% ({currentPrediction.riskLevel})
          </span>
        </div>

        <form onSubmit={handleSaveAssessment} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient Name or Hospital Record ID
              </label>
              <input
                type="text"
                value={patientName}
                onChange={e => setPatientName(e.target.value)}
                placeholder="e.g. John Doe / PT-9821"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Notes / Physician Remarks
              </label>
              <input
                type="text"
                value={patientNotes}
                onChange={e => setPatientNotes(e.target.value)}
                placeholder="e.g. Fasting sample verified, scheduled for follow-up"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-[11px] text-slate-500">
              {user ? 'Logged in as ' + user.email : 'Sign-in required to submit to Firestore.'}
            </div>
            <button
              type="submit"
              disabled={isSaving || !user}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
                isSaving || !user
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving to Cloud...' : 'Save to Firestore'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Historical Patient Records Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Patient History Cloud Database</h3>
              <p className="text-xs text-slate-500">Persisted documents stored under your authenticated account</p>
            </div>
          </div>

          {user && (
            <button
              type="button"
              onClick={loadHistory}
              disabled={isLoadingHistory}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Refresh</span>
            </button>
          )}
        </div>

        {!user ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <History className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No Patient Records Displayed</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-3">
              Sign in with Google using the button above to view and manage your saved clinical evaluations.
            </p>
            <button
              type="button"
              onClick={handleSignIn}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition inline-flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In with Google</span>
            </button>
          </div>
        ) : records.length === 0 ? (
          <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <FileCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700">No Assessments Saved Yet</p>
            <p className="text-xs text-slate-500">
              Run a prediction on the dashboard and click "Save to Firestore" above to record your first patient assessment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Patient</th>
                  <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-3 font-semibold">Glucose / BMI</th>
                  <th className="py-2.5 px-3 font-semibold">Age</th>
                  <th className="py-2.5 px-3 font-semibold">ML Risk Score</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{rec.patientName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{rec.patientId}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{new Date(rec.timestamp).toLocaleDateString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(rec.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      <div><span className="font-semibold">{rec.metrics?.glucose}</span> mg/dL</div>
                      <div className="text-[10px] text-slate-500">BMI: {rec.metrics?.bmi}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-700">
                      {rec.metrics?.age} yrs
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        rec.riskLevel === 'Low' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        rec.riskLevel === 'Moderate' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}>
                        {rec.riskPercentage}% ({rec.riskLevel})
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onLoadRecord(rec)}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition flex items-center gap-1"
                          title="Load metrics into diagnostic dashboard"
                        >
                          <span>Load</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord(rec.id)}
                          className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition"
                          title="Delete from Firestore"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
