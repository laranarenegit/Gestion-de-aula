import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  FolderTree, 
  Code, 
  Key, 
  Cloud, 
  GitBranch, 
  Terminal,
  ExternalLink
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface DeploymentGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeploymentGuideModal: React.FC<DeploymentGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'structure' | 'code' | 'env' | 'gcp' | 'git'>('structure');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const projectTree = `gestion-estudiantes-nextjs/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # Configuración de NextAuth con Google Provider y Scopes
│   │   ├── students/
│   │   │   └── route.ts              # API Route server-side para sincronizar Sheets
│   │   └── reports/
│   │       └── route.ts              # API Route server-side para Docs & Drive
│   ├── layout.tsx                    # Root Layout con ThemeProvider y SessionProvider
│   ├── page.tsx                      # Dashboard Principal (Estudiantes, Calificaciones y Bitácora)
│   └── globals.css                   # Tailwind CSS v4 / v3
├── components/
│   ├── Navbar.tsx                    # Barra de navegación, cambio de cuenta y selector de temas
│   ├── StudentTable.tsx              # Tabla interactiva con columnas de Sheets
│   ├── QuickAttendanceModal.tsx      # Toma rápida de asistencia y recálculo automático
│   ├── ClassLogView.tsx              # Bitácora de temarios y progreso individual
│   ├── ReportGeneratorModal.tsx      # Generador oficial Google Docs & PDF
│   └── GoogleSyncBar.tsx             # Estado de sincronización en tiempo real
├── lib/
│   ├── googleWorkspace.ts            # Cliente Google Sheets, Docs y Drive API
│   └── authOptions.ts                # Opciones de NextAuth y tokens OAuth
├── types/
│   └── index.ts                      # Interfaces TypeScript (Student, ClassSession, etc.)
├── .env.local.example                # Plantilla de variables de entorno seguras
├── package.json                      # Dependencias (next, react, next-auth, googleapis, lucide-react)
├── tailwind.config.ts                # Configuración de estilos
└── tsconfig.json                     # Configuración estricta de TypeScript`;

  const nextAuthRouteCode = `// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
            "https://www.googleapis.com/auth/documents"
          ].join(" "),
          prompt: "select_account", // Permite elegir o cambiar de cuenta Google
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };`;

  const envContent = `# .env.local (Desarrollo y Producción en Vercel)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="openssl_rand_base64_32_generado_aqui"

# Google Cloud Console OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="1234567890-abcdefg.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-MiSecretoDeGoogleCloud"

# Workspace Settings
GOOGLE_SPREADSHEET_NAME="Gestion_Estudiantes_DB"
GOOGLE_DRIVE_FOLDER_NAME="Gestion_Estudiantes_Informes"`;

  const gitCommands = `# 1. Inicializar repositorio git
git init
git add .
git commit -m "feat: Sistema de Gestion de Estudiantes con Google Workspace y Next.js"

# 2. Crear repositorio en GitHub (desde github.com) y vincular:
git branch -M main
git remote add origin https://github.com/TU_USUARIO/gestion-estudiantes-nextjs.git
git push -u origin main`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        id="deployment-guide-modal-card"
        className={`w-full max-w-4xl p-6 rounded-2xl shadow-2xl border ${theme.cardBgClass} ${theme.borderClass} max-h-[92vh] overflow-y-auto`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-lg font-bold ${theme.textPrimaryClass}`}>
                Guía de Exportación y Despliegue (Next.js, GitHub & Vercel)
              </h3>
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Arquitectura completa, credenciales de Google Workspace y despliegue a producción
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="mt-4 flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200 dark:border-[#30363D]">
          <button
            type="button"
            onClick={() => setActiveTab('structure')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'structure'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8B949E] hover:bg-slate-100 dark:hover:bg-[#1F2937]'
            }`}
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>1. Estructura Next.js</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8B949E] hover:bg-slate-100 dark:hover:bg-[#1F2937]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>2. Código Clave (NextAuth)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('env')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'env'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8B949E] hover:bg-slate-100 dark:hover:bg-[#1F2937]'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>3. .env.local.example</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('gcp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'gcp'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8B949E] hover:bg-slate-100 dark:hover:bg-[#1F2937]'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>4. Google Cloud Console</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('git')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === 'git'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-[#8B949E] hover:bg-slate-100 dark:hover:bg-[#1F2937]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>5. GitHub & Vercel</span>
          </button>
        </div>

        {/* Tab 1: Project Structure */}
        {activeTab === 'structure' && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Estructura modular lista para Next.js 14/15 con App Router y TypeScript:
              </p>
              <button
                type="button"
                onClick={() => handleCopy(projectTree, 'tree')}
                className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline"
              >
                {copiedKey === 'tree' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'tree' ? 'Copiado' : 'Copiar Árbol'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#0D1117] text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-[#30363D]">
              {projectTree}
            </pre>
          </div>
        )}

        {/* Tab 2: Key Code */}
        {activeTab === 'code' && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Configuración del endpoint OAuth 2.0 con NextAuth y Scopes de Workspace:
              </p>
              <button
                type="button"
                onClick={() => handleCopy(nextAuthRouteCode, 'route')}
                className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline"
              >
                {copiedKey === 'route' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'route' ? 'Copiado' : 'Copiar Código'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#0D1117] text-slate-100 text-xs font-mono overflow-x-auto leading-relaxed border border-[#30363D]">
              {nextAuthRouteCode}
            </pre>
          </div>
        )}

        {/* Tab 3: Environment Variables */}
        {activeTab === 'env' && (
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <p className={`text-xs ${theme.textSecondaryClass}`}>
                Copia este archivo como <span className="font-mono font-bold">.env.local</span> en la raíz de tu proyecto Next.js:
              </p>
              <button
                type="button"
                onClick={() => handleCopy(envContent, 'env')}
                className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline"
              >
                {copiedKey === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'env' ? 'Copiado' : 'Copiar Variables'}</span>
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-[#0D1117] text-emerald-300 text-xs font-mono overflow-x-auto leading-relaxed border border-[#30363D]">
              {envContent}
            </pre>
          </div>
        )}

        {/* Tab 4: Google Cloud Console */}
        {activeTab === 'gcp' && (
          <div className="mt-4 space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 text-indigo-900 dark:text-indigo-200">
              <h4 className="font-bold text-sm mb-1">Configuración en Google Cloud Console Paso a Paso</h4>
              <p>Sigue estos pasos para habilitar las APIs y obtener tu <code>client_secret.json</code> o Client ID:</p>
            </div>

            <ol className="space-y-3 list-decimal list-inside text-slate-700 dark:text-[#C9D1D9]">
              <li className="p-3 rounded-lg border border-slate-200 dark:border-[#30363D] dark:bg-[#0D1117]">
                <strong className="text-slate-900 dark:text-[#E2E8F0]">Crear o Seleccionar Proyecto:</strong>
                <p className="mt-1 text-slate-600 dark:text-[#8B949E]">Ingresa a <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="w-3 h-3" /></a> y crea un nuevo proyecto (ej. <code>gestion-estudiantes</code>).</p>
              </li>

              <li className="p-3 rounded-lg border border-slate-200 dark:border-[#30363D] dark:bg-[#0D1117]">
                <strong className="text-slate-900 dark:text-[#E2E8F0]">Habilitar las 3 APIs de Google Workspace:</strong>
                <p className="mt-1 text-slate-600 dark:text-[#8B949E]">Ve a <em>APIs & Services &gt; Library</em> y habilita:</p>
                <ul className="list-disc list-inside mt-1 ml-2 font-mono text-slate-700 dark:text-[#C9D1D9]">
                  <li>Google Sheets API</li>
                  <li>Google Drive API</li>
                  <li>Google Docs API</li>
                </ul>
              </li>

              <li className="p-3 rounded-lg border border-slate-200 dark:border-[#30363D] dark:bg-[#0D1117]">
                <strong className="text-slate-900 dark:text-[#E2E8F0]">Configurar Pantalla de Consentimiento OAuth:</strong>
                <p className="mt-1 text-slate-600 dark:text-[#8B949E]">Ve a <em>APIs & Services &gt; OAuth consent screen</em>. Elige "Externo" (o Interno en Google Workspace institucional). Agrega los scopes: <code>spreadsheets</code>, <code>drive.file</code>, <code>documents</code>.</p>
              </li>

              <li className="p-3 rounded-lg border border-slate-200 dark:border-[#30363D] dark:bg-[#0D1117]">
                <strong className="text-slate-900 dark:text-[#E2E8F0]">Crear Credenciales OAuth 2.0 (Client ID & Secret):</strong>
                <p className="mt-1 text-slate-600 dark:text-[#8B949E]">Ve a <em>Credentials &gt; Create Credentials &gt; OAuth client ID</em>. Tipo: <strong>Web application</strong>.</p>
                <div className="mt-2 p-2 rounded-md bg-slate-100 dark:bg-[#161B22] border dark:border-[#30363D] font-mono text-[11px]">
                  <p><strong>Authorized JavaScript origins:</strong></p>
                  <p><code>http://localhost:3000</code> y <code>https://tu-app.vercel.app</code></p>
                  <p className="mt-1"><strong>Authorized redirect URIs:</strong></p>
                  <p><code>http://localhost:3000/api/auth/callback/google</code></p>
                  <p><code>https://tu-app.vercel.app/api/auth/callback/google</code></p>
                </div>
              </li>
            </ol>
          </div>
        )}

        {/* Tab 5: GitHub & Vercel */}
        {activeTab === 'git' && (
          <div className="mt-4 space-y-4 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-[#E2E8F0]">1. Subir a GitHub</h4>
                <button
                  type="button"
                  onClick={() => handleCopy(gitCommands, 'git')}
                  className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:underline"
                >
                  {copiedKey === 'git' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'git' ? 'Copiado' : 'Copiar Comandos'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-[#0D1117] text-slate-100 font-mono text-xs overflow-x-auto border border-[#30363D]">
                {gitCommands}
              </pre>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 dark:border-[#30363D] dark:bg-[#0D1117] space-y-2">
              <h4 className="font-bold text-sm text-slate-900 dark:text-[#E2E8F0]">2. Conectar y Desplegar en Vercel</h4>
              <ol className="list-decimal list-inside space-y-1.5 text-slate-600 dark:text-[#8B949E]">
                <li>Inicia sesión en <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">vercel.com</a> con tu cuenta de GitHub.</li>
                <li>Haz clic en <strong>"Add New... &gt; Project"</strong> e importa el repositorio <code>gestion-estudiantes-nextjs</code>.</li>
                <li>En la sección <strong>"Environment Variables"</strong>, añade cada variable de tu <code>.env.local</code>:
                  <ul className="list-disc list-inside ml-4 mt-1 font-mono text-[11px] text-slate-700 dark:text-[#C9D1D9]">
                    <li><code>NEXTAUTH_URL</code> = <code>https://tu-app.vercel.app</code></li>
                    <li><code>NEXTAUTH_SECRET</code> = [tu clave secreta]</li>
                    <li><code>GOOGLE_CLIENT_ID</code> = [tu ID de Google Cloud]</li>
                    <li><code>GOOGLE_CLIENT_SECRET</code> = [tu Secreto de Google Cloud]</li>
                  </ul>
                </li>
                <li>Haz clic en <strong>"Deploy"</strong>. ¡Tu aplicación estará 100% online y operativa en segundos!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-[#30363D] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 text-xs font-semibold rounded-lg border ${theme.borderClass} ${theme.textPrimaryClass} hover:bg-slate-100 dark:hover:bg-[#1F2937] transition-colors`}
          >
            Entendido, cerrar guía
          </button>
        </div>
      </div>
    </div>
  );
};
