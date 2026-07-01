// UI translations. Add a language by adding a code here and to LANGUAGES — any
// missing key falls back to English, so partial translations are safe.
//
// Church-authored content (events, sermons, names, feature labels) is shown as
// entered; this dictionary covers the app's own chrome and account/settings UI.
export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
  { code: "ko", label: "한국어" },
];

export const translations = {
  en: {
    home: "Home", help: "Help", myAccount: "My Account", settings: "Settings", accounts: "Accounts",
    signOut: "Sign out", signIn: "Sign in", signInToContinue: "Sign in to continue",
    usernameOrEmail: "Username or email", password: "Password", language: "Language",
    profile: "Profile", displayName: "Display name", saveName: "Save name",
    changePassword: "Change password", newPassword: "New password",
    confirmPassword: "Confirm new password", updatePassword: "Update password",
    session: "Session", administrator: "Administrator", member: "Member", viewer: "Viewer",
  },
  es: {
    home: "Inicio", help: "Ayuda", myAccount: "Mi cuenta", settings: "Configuración", accounts: "Cuentas",
    signOut: "Cerrar sesión", signIn: "Iniciar sesión", signInToContinue: "Inicia sesión para continuar",
    usernameOrEmail: "Usuario o correo", password: "Contraseña", language: "Idioma",
    profile: "Perfil", displayName: "Nombre visible", saveName: "Guardar nombre",
    changePassword: "Cambiar contraseña", newPassword: "Nueva contraseña",
    confirmPassword: "Confirmar nueva contraseña", updatePassword: "Actualizar contraseña",
    session: "Sesión", administrator: "Administrador", member: "Miembro", viewer: "Espectador",
  },
  fr: {
    home: "Accueil", help: "Aide", myAccount: "Mon compte", settings: "Paramètres", accounts: "Comptes",
    signOut: "Se déconnecter", signIn: "Se connecter", signInToContinue: "Connectez-vous pour continuer",
    usernameOrEmail: "Identifiant ou e-mail", password: "Mot de passe", language: "Langue",
    profile: "Profil", displayName: "Nom affiché", saveName: "Enregistrer le nom",
    changePassword: "Changer le mot de passe", newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmer le nouveau mot de passe", updatePassword: "Mettre à jour le mot de passe",
    session: "Session", administrator: "Administrateur", member: "Membre", viewer: "Lecteur",
  },
  pt: {
    home: "Início", help: "Ajuda", myAccount: "Minha conta", settings: "Configurações", accounts: "Contas",
    signOut: "Sair", signIn: "Entrar", signInToContinue: "Entre para continuar",
    usernameOrEmail: "Usuário ou e-mail", password: "Senha", language: "Idioma",
    profile: "Perfil", displayName: "Nome de exibição", saveName: "Salvar nome",
    changePassword: "Alterar senha", newPassword: "Nova senha",
    confirmPassword: "Confirmar nova senha", updatePassword: "Atualizar senha",
    session: "Sessão", administrator: "Administrador", member: "Membro", viewer: "Visualizador",
  },
  ko: {
    home: "홈", help: "도움말", myAccount: "내 계정", settings: "설정", accounts: "계정 관리",
    signOut: "로그아웃", signIn: "로그인", signInToContinue: "계속하려면 로그인하세요",
    usernameOrEmail: "사용자 이름 또는 이메일", password: "비밀번호", language: "언어",
    profile: "프로필", displayName: "표시 이름", saveName: "이름 저장",
    changePassword: "비밀번호 변경", newPassword: "새 비밀번호",
    confirmPassword: "새 비밀번호 확인", updatePassword: "비밀번호 업데이트",
    session: "세션", administrator: "관리자", member: "회원", viewer: "뷰어",
  },
};
