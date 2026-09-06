import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { LocalDatabaseBar } from './components/LocalDatabaseBar';
import { GoogleSyncBar } from './components/GoogleSyncBar';
import { CourseModule } from './components/CourseModule';
import { StudentModule } from './components/StudentModule';
import { ClassLogModule } from './components/ClassLogModule';
import { AntiXTerminalGuideModal } from './components/AntiXTerminalGuideModal';
import { Student, ClassSession, GoogleUser, WorkspaceSyncState, Course } from './types';
import { INITIAL_STUDENTS, INITIAL_CLASSES, INITIAL_COURSES, calculatePromedio, getStudentStatus } from './data/initialData';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  getAccessToken 
} from './services/firebaseAuth';
import { 
  initializeGoogleWorkspace, 
  syncStudentsToSheet, 
  syncClassesToSheet 
} from './services/googleWorkspace';

function AppContent() {
  const { theme } = useTheme();

  // Active Tab: 'courses' | 'students' | 'classes'
  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'classes'>('courses');

  // Selected Course ID for filtering when switching to students view
  const [selectedCourseId, setSelectedCourseId] = useState<string | 'all'>('all');

  // antiX Terminal Guide Modal
  const [isAntiXGuideOpen, setIsAntiXGuideOpen] = useState(false);

  // Authentication State
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Workspace Sync State
  const [syncState, setSyncState] = useState<WorkspaceSyncState>({
    isConnected: false,
    isSyncing: false,
    spreadsheetId: null,
    spreadsheetName: 'Gestion_Estudiantes_DB',
    spreadsheetUrl: null,
    folderId: null,
    folderUrl: null,
    lastSyncTime: null,
    error: null,
  });

  // Courses State with Local Persistence
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('gestion_cursos_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved courses:', e);
      }
    }
    return INITIAL_COURSES;
  });

  // Students & Classes State with Local Persistence Fallback
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('gestion_estudiantes_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved students:', e);
      }
    }
    return INITIAL_STUDENTS;
  });

  const [classSessions, setClassSessions] = useState<ClassSession[]>(() => {
    const saved = localStorage.getItem('gestion_clases_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error loading saved classes:', e);
      }
    }
    return INITIAL_CLASSES;
  });

  // Persist courses locally on change
  useEffect(() => {
    localStorage.setItem('gestion_cursos_data', JSON.stringify(courses));
  }, [courses]);

  // Persist data locally on change
  useEffect(() => {
    localStorage.setItem('gestion_estudiantes_data', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('gestion_clases_data', JSON.stringify(classSessions));
  }, [classSessions]);

  // Sync function to push state to Google Sheets if connected
  const performSync = useCallback(async (token: string, sheetId: string, currentStudents: Student[], currentClasses: ClassSession[]) => {
    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      await syncStudentsToSheet(token, sheetId, currentStudents);
      await syncClassesToSheet(token, sheetId, currentClasses);
      const nowTime = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: nowTime,
        error: null,
      }));
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Error al sincronizar con Google Sheets',
      }));
    }
  }, []);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (authUser, token) => {
        if (authUser) {
          const currentToken = token || await getAccessToken();
          setUser({
            uid: authUser.uid,
            email: authUser.email,
            displayName: authUser.displayName,
            photoURL: authUser.photoURL,
            accessToken: currentToken,
          });
          setAccessToken(currentToken);

          if (currentToken) {
            try {
              setSyncState(prev => ({ ...prev, isSyncing: true }));
              const wsInfo = await initializeGoogleWorkspace(currentToken);
              setSyncState(prev => ({
                ...prev,
                isConnected: true,
                spreadsheetId: wsInfo.spreadsheetId,
                spreadsheetUrl: wsInfo.spreadsheetUrl,
                folderId: wsInfo.folderId,
                folderUrl: wsInfo.folderUrl || null,
                isSyncing: false,
              }));

              // If newly created or on first load, push current students & classes
              await performSync(currentToken, wsInfo.spreadsheetId, students, classSessions);
            } catch (err: any) {
              console.error('Error initializing Google Workspace:', err);
              setSyncState(prev => ({
                ...prev,
                isSyncing: false,
                error: err.message || 'No se pudo conectar con Google Sheets/Drive',
              }));
            }
          }
        }
      },
      () => {
        setUser(null);
        setAccessToken(null);
        setSyncState(prev => ({
          ...prev,
          isConnected: false,
          spreadsheetId: null,
          spreadsheetUrl: null,
          folderId: null,
          folderUrl: null,
        }));
      }
    );

    return () => unsubscribe();
  }, [students, classSessions, performSync]);

  // Handle Google Sign In
  const handleLogin = async () => {
    try {
      setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));
      const res = await googleSignIn();
      if (res && res.accessToken) {
        setAccessToken(res.accessToken);
        setUser({
          uid: res.user.uid,
          email: res.user.email,
          displayName: res.user.displayName,
          photoURL: res.user.photoURL,
          accessToken: res.accessToken,
        });

        // Initialize / Link Google Workspace Spreadsheet
        const wsInfo = await initializeGoogleWorkspace(res.accessToken);
        setSyncState(prev => ({
          ...prev,
          isConnected: true,
          spreadsheetId: wsInfo.spreadsheetId,
          spreadsheetUrl: wsInfo.spreadsheetUrl,
          folderId: wsInfo.folderId,
          folderUrl: wsInfo.folderUrl || null,
        }));

        await performSync(res.accessToken, wsInfo.spreadsheetId, students, classSessions);
      }
    } catch (err: any) {
      console.error('Error signing in with Google:', err);
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Error durante el inicio de sesión con Google',
      }));
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setAccessToken(null);
    setSyncState(prev => ({
      ...prev,
      isConnected: false,
      spreadsheetId: null,
      spreadsheetUrl: null,
      folderId: null,
      folderUrl: null,
      lastSyncTime: null,
      error: null,
    }));
  };

  // Manual Trigger Sync Now
  const handleSyncNow = async () => {
    if (accessToken && syncState.spreadsheetId) {
      await performSync(accessToken, syncState.spreadsheetId, students, classSessions);
    } else {
      handleLogin();
    }
  };

  // Student Actions
  const handleSaveStudent = (studentData: Student) => {
    setStudents(prev => {
      const exists = prev.some(s => s.id === studentData.id);
      let updated: Student[];
      if (exists) {
        updated = prev.map(s => s.id === studentData.id ? studentData : s);
      } else {
        updated = [...prev, studentData];
      }

      if (accessToken && syncState.spreadsheetId) {
        syncStudentsToSheet(accessToken, syncState.spreadsheetId, updated).catch(console.error);
      }
      return updated;
    });
  };

  const handleDeleteStudent = (studentId: string) => {
    setStudents(prev => {
      const updated = prev.filter(s => s.id !== studentId);
      if (accessToken && syncState.spreadsheetId) {
        syncStudentsToSheet(accessToken, syncState.spreadsheetId, updated).catch(console.error);
      }
      return updated;
    });
  };

  // Quick Attendance Update
  const handleUpdateAttendance = (attendanceMap: Record<string, boolean>, date: string) => {
    setStudents(prev => {
      const updated = prev.map(s => {
        const isPresent = attendanceMap[s.id] !== false;
        // Increment or adjust attendance percentage
        const newAsistencia = isPresent 
          ? Math.min(100, s.asistencia + 2) 
          : Math.max(0, s.asistencia - 6);
        const newPromedio = calculatePromedio(s.notasParciales, s.trabajoEnClase);
        return {
          ...s,
          asistencia: newAsistencia,
          promedioFinal: newPromedio,
          estado: getStudentStatus(newPromedio, newAsistencia)
        };
      });

      if (accessToken && syncState.spreadsheetId) {
        syncStudentsToSheet(accessToken, syncState.spreadsheetId, updated).catch(console.error);
      }
      return updated;
    });

    // Also record this session into class sessions
    setClassSessions(prev => {
      const nextNum = prev.length > 0 ? Math.max(...prev.map(c => c.numeroClase)) + 1 : 1;
      const newSession: ClassSession = {
        id: `CLS-${Date.now().toString().slice(-4)}`,
        numeroClase: nextNum,
        fecha: date,
        temario: `Sesión de Clase #${nextNum}: Control de asistencia y contenidos pedagógicos.`,
        observaciones: 'Asistencia registrada con toma rápida.',
        progresoEstudiantes: students.map(s => ({
          studentId: s.id,
          presente: attendanceMap[s.id] !== false,
          participacion: attendanceMap[s.id] !== false ? 'Buena' : 'No participo',
          tareaEntregada: attendanceMap[s.id] !== false,
        }))
      };
      const updatedSessions = [newSession, ...prev];

      if (accessToken && syncState.spreadsheetId) {
        syncClassesToSheet(accessToken, syncState.spreadsheetId, updatedSessions).catch(console.error);
      }
      return updatedSessions;
    });
  };

  // Class Log Actions
  const handleSaveClassSession = (session: ClassSession) => {
    setClassSessions(prev => {
      const updated = [session, ...prev];
      if (accessToken && syncState.spreadsheetId) {
        syncClassesToSheet(accessToken, syncState.spreadsheetId, updated).catch(console.error);
      }
      return updated;
    });
  };

  const handleDeleteClassSession = (sessionId: string) => {
    setClassSessions(prev => {
      const updated = prev.filter(c => c.id !== sessionId);
      if (accessToken && syncState.spreadsheetId) {
        syncClassesToSheet(accessToken, syncState.spreadsheetId, updated).catch(console.error);
      }
      return updated;
    });
  };

  // Course Actions
  const handleSaveCourse = (courseData: Course) => {
    setCourses(prev => {
      const exists = prev.some(c => c.id === courseData.id);
      if (exists) {
        return prev.map(c => c.id === courseData.id ? courseData : c);
      }
      return [...prev, courseData];
    });
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    // Clear course assignment from students of this course without deleting the students
    setStudents(prev => prev.map(s => s.courseId === courseId ? { ...s, courseId: undefined } : s));
  };

  // Full Database Import (restore JSON backup)
  const handleImportFullDatabase = (data: { courses: Course[]; students: Student[]; classSessions: ClassSession[] }) => {
    if (data.courses && data.courses.length > 0) {
      setCourses(data.courses);
    }
    if (data.students && data.students.length > 0) {
      setStudents(data.students);
    }
    if (data.classSessions && data.classSessions.length > 0) {
      setClassSessions(data.classSessions);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar with Course/Student/Class switcher, Account Switcher and 8-bit theme */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenAntiXGuide={() => setIsAntiXGuideOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Local antiX Database & Office Integration Bar (Primary) */}
        <LocalDatabaseBar
          courses={courses}
          students={students}
          classSessions={classSessions}
          onImportStudents={(importedStudents) => setStudents(importedStudents)}
          onImportFullDatabase={handleImportFullDatabase}
          onOpenTerminalGuide={() => setIsAntiXGuideOpen(true)}
        />

        {/* Google Workspace Sync (Optional Cloud Mirror) */}
        {user && (
          <GoogleSyncBar
            syncState={syncState}
            onSync={handleSyncNow}
            onLogin={handleLogin}
          />
        )}

        {/* Dynamic Views: Cursos / Grupos, Estudiantes y Registro de Clases */}
        {activeTab === 'courses' ? (
          <CourseModule
            courses={courses}
            students={students}
            classSessions={classSessions}
            onSaveCourse={handleSaveCourse}
            onDeleteCourse={handleDeleteCourse}
            onSelectCourseForStudents={(courseId) => {
              setSelectedCourseId(courseId);
              setActiveTab('students');
            }}
            onQuickAddStudentToCourse={(courseId) => {
              setSelectedCourseId(courseId);
              setActiveTab('students');
            }}
          />
        ) : activeTab === 'students' ? (
          <StudentModule
            students={students}
            classSessions={classSessions}
            courses={courses}
            selectedCourseId={selectedCourseId}
            onSelectCourseId={(cId) => setSelectedCourseId(cId)}
            onOpenNewCourse={() => setActiveTab('courses')}
            onSaveStudent={handleSaveStudent}
            onDeleteStudent={handleDeleteStudent}
            onUpdateAttendance={handleUpdateAttendance}
            accessToken={accessToken}
            folderId={syncState.folderId}
          />
        ) : (
          <ClassLogModule
            classSessions={classSessions}
            students={students}
            onSaveClassSession={handleSaveClassSession}
            onDeleteClassSession={handleDeleteClassSession}
          />
        )}
      </main>

      {/* Footer focused purely on local antiX Linux execution */}
      <footer className={`py-6 border-t ${theme.borderClass} ${theme.cardBgClass} text-xs ${theme.textSecondaryClass}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Gestión Pedagógica y Cursos • 100% Autónomo para <strong>antiX Linux</strong> & LibreOffice Calc</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              id="btn-footer-antix-terminal"
              type="button"
              onClick={() => setIsAntiXGuideOpen(true)}
              className="text-emerald-400 hover:text-emerald-300 font-semibold inline-flex items-center gap-1"
            >
              <span>🐧 Comandos Terminal antiX</span>
            </button>
          </div>
        </div>
      </footer>

      {/* antiX Linux Terminal Installation & Run Guide Modal */}
      <AntiXTerminalGuideModal
        isOpen={isAntiXGuideOpen}
        onClose={() => setIsAntiXGuideOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
