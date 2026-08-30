const fs = require('fs');
const path = require('path');

const newTranslations = {
  "Authentication": {
    ar: "المصادقة", tr: "Kimlik Doğrulama", fr: "Authentification", hi: "प्रमाणीकरण",
    es: "Autenticación", et: "Autentimine", de: "Authentifizierung",
    "zh-hans": "身份验证", "zh-hant": "身份驗證", ur: "تصدیق", tl: "Pagpapatunay"
  },
  "Sign in or create an account to access your flight bookings.": {
    ar: "قم بتسجيل الدخول أو إنشاء حساب للوصول إلى حجوزات رحلاتك.", tr: "Uçuş rezervasyonlarınıza erişmek için giriş yapın veya hesap oluşturun.", fr: "Connectez-vous ou créez un compte pour accéder à vos réservations de vols.", hi: "अपनी उड़ान बुकिंग तक पहुँचने के लिए साइन इन करें या खाता बनाएँ।",
    es: "Inicie sesión o cree una cuenta para acceder a sus reservas de vuelos.", et: "Logige sisse või looge konto, et pääseda juurde oma lennubroneeringutele.", de: "Melden Sie sich an oder erstellen Sie ein Konto, um auf Ihre Flugbuchungen zuzugreifen.",
    "zh-hans": "登录或创建账户以访问您的航班预订。", "zh-hant": "登錄或創建賬戶以訪問您的航班預訂。", ur: "اپنی فلائٹ بکنگ تک رسائی کے لیے سائن ان کریں یا اکاؤنٹ بنائیں۔", tl: "Mag-sign in o gumawa ng account para ma-access ang iyong mga flight booking."
  },
  "Back to sign-in": {
    ar: "العودة إلى تسجيل الدخول", tr: "Giriş sayfasına dön", fr: "Retour à la connexion", hi: "साइन-इन पर वापस जाएं",
    es: "Volver a iniciar sesión", et: "Tagasi sisselogimisele", de: "Zurück zur Anmeldung",
    "zh-hans": "返回登录", "zh-hant": "返回登錄", ur: "سائن ان پر واپس جائیں", tl: "Bumalik sa sign-in"
  },
  "Forgot your password?": {
    ar: "هل نسيت كلمة المرور؟", tr: "Şifrenizi mi unuttunuz?", fr: "Mot de passe oublié ?", hi: "क्या आप अपना पासवर्ड भूल गए?",
    es: "¿Olvidaste tu contraseña?", et: "Unustasid parooli?", de: "Passwort vergessen?",
    "zh-hans": "忘记密码？", "zh-hant": "忘記密碼？", ur: "اپنا پاس ورڈ بھول گئے؟", tl: "Nakalimutan ang password?"
  },
  "Enter verification code": {
    ar: "أدخل رمز التحقق", tr: "Doğrulama kodunu girin", fr: "Entrez le code de vérification", hi: "सत्यापन कोड दर्ज करें",
    es: "Ingresar código de verificación", et: "Sisesta kinnituskood", de: "Bestätigungscode eingeben",
    "zh-hans": "输入验证码", "zh-hant": "輸入驗證碼", ur: "تصدیقی کوڈ درج کریں", tl: "Ilagay ang verification code"
  },
  "Reset your password": {
    ar: "إعادة تعيين كلمة المرور", tr: "Şifrenizi sıfırlayın", fr: "Réinitialiser votre mot de passe", hi: "अपना पासवर्ड रीसेट करें",
    es: "Restablecer su contraseña", et: "Lähtesta oma parool", de: "Setzen Sie Ihr Passwort zurück",
    "zh-hans": "重置密码", "zh-hant": "重置密碼", ur: "اپنا پاس ورڈ ری سیٹ کریں", tl: "I-reset ang iyong password"
  },
  "Enter your account email and we'll send a reset link.": {
    ar: "أدخل بريد حسابك وسنرسل لك رابط إعادة التعيين.", tr: "Hesap e-postanızı girin, size bir sıfırlama bağlantısı gönderelim.", fr: "Entrez l'e-mail de votre compte et nous vous enverrons un lien de réinitialisation.", hi: "अपने खाते का ईमेल दर्ज करें और हम एक रीसेट लिंक भेजेंगे।",
    es: "Ingrese el correo electrónico de su cuenta y le enviaremos un enlace de restablecimiento.", et: "Sisesta oma konto e-posti aadress ja me saadame lähtestamise lingi.", de: "Geben Sie die E-Mail-Adresse Ihres Kontos ein, und wir senden Ihnen einen Link zum Zurücksetzen.",
    "zh-hans": "输入您的账户邮箱，我们将发送重置链接。", "zh-hant": "輸入您的賬戶郵箱，我們將發送重置鏈接。", ur: "اپنے اکاؤنٹ کا ای میل درج کریں اور ہم ایک ری سیٹ لنک بھیجیں گے۔", tl: "Ilagay ang email ng iyong account at magpapadala kami ng reset link."
  },
  "Enter the 6-digit OTP code sent to your email.": {
    ar: "أدخل رمز التحقق (OTP) المكون من 6 أرقام المرسل إلى بريدك الإلكتروني.", tr: "E-postanıza gönderilen 6 haneli OTP kodunu girin.", fr: "Entrez le code OTP à 6 chiffres envoyé à votre adresse e-mail.", hi: "आपके ईमेल पर भेजा गया 6-अंकीय OTP कोड दर्ज करें।",
    es: "Ingrese el código OTP de 6 dígitos enviado a su correo electrónico.", et: "Sisesta oma e-postile saadetud 6-kohaline OTP-kood.", de: "Geben Sie den 6-stelligen OTP-Code ein, der an Ihre E-Mail gesendet wurde.",
    "zh-hans": "输入发送至您邮箱的6位数OTP验证码。", "zh-hant": "輸入發送至您郵箱的6位數OTP驗證碼。", ur: "اپنے ای میل پر بھیجا گیا 6 ہندسوں کا OTP کوڈ درج کریں۔", tl: "Ilagay ang 6-digit OTP code na ipinadala sa iyong email."
  },
  "Enter a new secure password for your account.": {
    ar: "أدخل كلمة مرور آمنة جديدة لحسابك.", tr: "Hesabınız için yeni ve güvenli bir şifre girin.", fr: "Entrez un nouveau mot de passe sécurisé pour votre compte.", hi: "अपने खाते के लिए एक नया सुरक्षित पासवर्ड दर्ज करें।",
    es: "Ingrese una nueva contraseña segura para su cuenta.", et: "Sisesta oma kontole uus turvaline parool.", de: "Geben Sie ein neues, sicheres Passwort für Ihr Konto ein.",
    "zh-hans": "为您的账户输入新的安全密码。", "zh-hant": "為您的賬戶輸入新的安全密碼。", ur: "اپنے اکاؤنٹ کے لیے نیا محفوظ پاس ورڈ درج کریں۔", tl: "Ilagay ang bagong secure na password para sa iyong account."
  },
  "name@example.com": {
    ar: "الاسم@example.com", tr: "isim@ornek.com", fr: "nom@exemple.com", hi: "name@example.com",
    es: "nombre@ejemplo.com", et: "nimi@naide.ee", de: "name@beispiel.de",
    "zh-hans": "name@example.com", "zh-hant": "name@example.com", ur: "name@example.com", tl: "pangalan@example.com"
  },
  "Sending...": {
    ar: "جاري الإرسال...", tr: "Gönderiliyor...", fr: "Envoi en cours...", hi: "भेजा जा रहा है...",
    es: "Enviando...", et: "Saadab...", de: "Senden...",
    "zh-hans": "发送中...", "zh-hant": "發送中...", ur: "بھیج رہا ہے...", tl: "Ipinapadala..."
  },
  "Send OTP": {
    ar: "إرسال رمز التحقق", tr: "OTP Gönder", fr: "Envoyer l'OTP", hi: "OTP भेजें",
    es: "Enviar OTP", et: "Saada OTP", de: "OTP Senden",
    "zh-hans": "发送OTP", "zh-hant": "發送OTP", ur: "OTP بھیجیں", tl: "Ipadala ang OTP"
  },
  "Verifying...": {
    ar: "جاري التحقق...", tr: "Doğrulanıyor...", fr: "Vérification en cours...", hi: "सत्यापन हो रहा है...",
    es: "Verificando...", et: "Kinnitamine...", de: "Überprüfung...",
    "zh-hans": "验证中...", "zh-hant": "驗證中...", ur: "تصدیق کر رہا ہے...", tl: "Bine-verify..."
  },
  "Verify OTP": {
    ar: "التحقق من الرمز", tr: "OTP'yi Doğrula", fr: "Vérifier l'OTP", hi: "OTP सत्यापित करें",
    es: "Verificar OTP", et: "Kinnita OTP", de: "OTP Bestätigen",
    "zh-hans": "验证OTP", "zh-hant": "驗證OTP", ur: "OTP کی تصدیق کریں", tl: "I-verify ang OTP"
  },
  "Didn't get code? Resend OTP in": {
    ar: "لم يصلك الرمز؟ إعادة إرسال الرمز خلال", tr: "Kodu almadınız mı? OTP'yi tekrar gönder:", fr: "Vous n'avez pas reçu le code ? Renvoyer l'OTP dans", hi: "कोड नहीं मिला? OTP दोबारा भेजें",
    es: "¿No recibió el código? Reenviar OTP en", et: "Ei saanud koodi? Saada OTP uuesti", de: "Code nicht erhalten? OTP erneut senden in",
    "zh-hans": "没有收到验证码？重新发送OTP", "zh-hant": "沒有收到驗證碼？重新發送OTP", ur: "کوڈ نہیں ملا؟ OTP دوبارہ بھیجیں", tl: "Hindi nakuha ang code? I-resend ang OTP sa"
  },
  "Resend verification code": {
    ar: "إعادة إرسال رمز التحقق", tr: "Doğrulama kodunu tekrar gönder", fr: "Renvoyer le code de vérification", hi: "सत्यापन कोड दोबारा भेजें",
    es: "Reenviar código de verificación", et: "Saada kinnituskood uuesti", de: "Bestätigungscode erneut senden",
    "zh-hans": "重新发送验证码", "zh-hant": "重新發送驗證碼", ur: "تصدیقی کوڈ دوبارہ بھیجیں", tl: "I-resend ang verification code"
  },
  "New password": {
    ar: "كلمة مرور جديدة", tr: "Yeni şifre", fr: "Nouveau mot de passe", hi: "नया पासवर्ड",
    es: "Nueva contraseña", et: "Uus parool", de: "Neues Passwort",
    "zh-hans": "新密码", "zh-hant": "新密碼", ur: "نیا پاس ورڈ", tl: "Bagong password"
  },
  "Resetting...": {
    ar: "جاري إعادة التعيين...", tr: "Sıfırlanıyor...", fr: "Réinitialisation...", hi: "रीसेट हो रहा है...",
    es: "Restableciendo...", et: "Lähtestab...", de: "Zurücksetzen...",
    "zh-hans": "重置中...", "zh-hant": "重置中...", ur: "ری سیٹ ہو رہا ہے...", tl: "Nire-reset..."
  },
  "Set New Password": {
    ar: "تعيين كلمة المرور الجديدة", tr: "Yeni Şifre Belirle", fr: "Définir le nouveau mot de passe", hi: "नया पासवर्ड सेट करें",
    es: "Establecer nueva contraseña", et: "Määra uus parool", de: "Neues Passwort festlegen",
    "zh-hans": "设置新密码", "zh-hant": "設置新密碼", ur: "نیا پاس ورڈ سیٹ کریں", tl: "I-set ang Bagong Password"
  },
  "Welcome back": {
    ar: "مرحبًا بعودتك", tr: "Tekrar hoş geldiniz", fr: "Bon retour", hi: "वापसी पर स्वागत है",
    es: "Bienvenido de nuevo", et: "Tere tulemast tagasi", de: "Willkommen zurück",
    "zh-hans": "欢迎回来", "zh-hant": "歡迎回來", ur: "خوش آمدید", tl: "Welcome back"
  },
  "Sign in to your account": {
    ar: "قم بتسجيل الدخول إلى حسابك", tr: "Hesabınıza giriş yapın", fr: "Connectez-vous à votre compte", hi: "अपने खाते में साइन इन करें",
    es: "Inicie sesión en su cuenta", et: "Logi oma kontole sisse", de: "Melden Sie sich an Ihrem Konto an",
    "zh-hans": "登录您的账户", "zh-hant": "登錄您的賬戶", ur: "اپنے اکاؤنٹ میں سائن ان کریں", tl: "Mag-sign in sa iyong account"
  },
  "Continue with Google": {
    ar: "المتابعة باستخدام جوجل", tr: "Google ile Devam Et", fr: "Continuer avec Google", hi: "Google के साथ जारी रखें",
    es: "Continuar con Google", et: "Jätka Google'iga", de: "Mit Google fortfahren",
    "zh-hans": "使用Google继续", "zh-hant": "使用Google繼續", ur: "Google کے ساتھ جاری رکھیں", tl: "Magpatuloy sa Google"
  },
  "or": {
    ar: "أو", tr: "veya", fr: "ou", hi: "या",
    es: "o", et: "või", de: "oder",
    "zh-hans": "或", "zh-hant": "或", ur: "یا", tl: "o"
  },
  "Continue with Email": {
    ar: "المتابعة باستخدام البريد الإلكتروني", tr: "E-posta ile Devam Et", fr: "Continuer avec l'e-mail", hi: "ईमेल के साथ जारी रखें",
    es: "Continuar con Correo", et: "Jätka E-postiga", de: "Mit E-Mail fortfahren",
    "zh-hans": "使用邮箱继续", "zh-hant": "使用郵箱繼續", ur: "ای میل کے ساتھ جاری رکھیں", tl: "Magpatuloy sa Email"
  },
  "By continuing, you agree to our": {
    ar: "بالمتابعة، أنت توافق على", tr: "Devam ederek şunları kabul etmiş olursunuz:", fr: "En continuant, vous acceptez nos", hi: "जारी रखकर, आप हमारी सहमति देते हैं",
    es: "Al continuar, aceptas nuestros", et: "Jätkates nõustud meie", de: "Durch Fortfahren stimmen Sie unseren zu",
    "zh-hans": "继续即表示您同意我们的", "zh-hant": "繼續即表示您同意我們的", ur: "جاری رکھ کر، آپ ہماری سے متفق ہوتے ہیں", tl: "Sa pagpapatuloy, sumasang-ayon ka sa aming"
  },
  "Terms": {
    ar: "الشروط", tr: "Şartlar", fr: "Conditions", hi: "शर्तें",
    es: "Términos", et: "Tingimused", de: "Bedingungen",
    "zh-hans": "条款", "zh-hant": "條款", ur: "شرائط", tl: "Mga Tuntunin"
  },
  "and": {
    ar: "و", tr: "ve", fr: "et", hi: "और",
    es: "y", et: "ja", de: "und",
    "zh-hans": "和", "zh-hant": "和", ur: "اور", tl: "at"
  },
  "Privacy": {
    ar: "الخصوصية", tr: "Gizlilik", fr: "Confidentialité", hi: "गोपनीयता",
    es: "Privacidad", et: "Privaatsus", de: "Datenschutz",
    "zh-hans": "隐私", "zh-hant": "隱私", ur: "رازداری", tl: "Privacy"
  },
  "New to Ezee Flights?": {
    ar: "جديد في إيزي فلايتس؟", tr: "Ezee Flights'ta yeni misiniz?", fr: "Nouveau sur Ezee Flights ?", hi: "Ezee Flights पर नए हैं?",
    es: "¿Nuevo en Ezee Flights?", et: "Uus Ezee Flights'is?", de: "Neu bei Ezee Flights?",
    "zh-hans": "新用户？", "zh-hant": "新用戶？", ur: "ایزی فلائٹس پر نئے ہیں؟", tl: "Bago sa Ezee Flights?"
  },
  "Create account": {
    ar: "إنشاء حساب", tr: "Hesap oluştur", fr: "Créer un compte", hi: "खाता बनाएँ",
    es: "Crear cuenta", et: "Loo konto", de: "Konto erstellen",
    "zh-hans": "创建账户", "zh-hant": "創建賬戶", ur: "اکاؤنٹ بنائیں", tl: "Gumawa ng account"
  },
  "Back to sign-in options": {
    ar: "العودة إلى خيارات تسجيل الدخول", tr: "Giriş seçeneklerine dön", fr: "Retour aux options de connexion", hi: "साइन-इन विकल्पों पर वापस जाएं",
    es: "Volver a las opciones de inicio de sesión", et: "Tagasi sisselogimisvalikute juurde", de: "Zurück zu den Anmeldeoptionen",
    "zh-hans": "返回登录选项", "zh-hant": "返回登錄選項", ur: "سائن ان کے اختیارات پر واپس جائیں", tl: "Bumalik sa mga sign-in option"
  },
  "By joining, you agree to our": {
    ar: "بالانضمام، أنت توافق على", tr: "Katılarak şunları kabul etmiş olursunuz:", fr: "En vous inscrivant, vous acceptez nos", hi: "शामिल होकर, आप हमारी सहमति देते हैं",
    es: "Al unirte, aceptas nuestros", et: "Liitudes nõustud meie", de: "Durch Beitritt stimmen Sie unseren zu",
    "zh-hans": "加入即表示您同意我们的", "zh-hant": "加入即表示您同意我們的", ur: "شامل ہو کر، آپ ہماری سے متفق ہوتے ہیں", tl: "Sa pagsali, sumasang-ayon ka sa aming"
  },
  "Already have an account?": {
    ar: "هل لديك حساب بالفعل؟", tr: "Zaten bir hesabınız var mı?", fr: "Vous avez déjà un compte ?", hi: "क्या पहले से खाता है?",
    es: "¿Ya tienes una cuenta?", et: "Kas sul on juba konto?", de: "Haben Sie bereits ein Konto?",
    "zh-hans": "已有账户？", "zh-hant": "已有賬戶？", ur: "کیا آپ کا پہلے ہی اکاؤنٹ ہے؟", tl: "Mayroon ka na bang account?"
  },
  "Sign in": {
    ar: "تسجيل الدخول", tr: "Giriş yap", fr: "Se connecter", hi: "साइन इन करें",
    es: "Iniciar sesión", et: "Logi sisse", de: "Anmelden",
    "zh-hans": "登录", "zh-hant": "登錄", ur: "سائن ان کریں", tl: "Mag-sign in"
  },
  "Searching hotels...": {
    ar: "البحث عن الفنادق...", tr: "Oteller aranıyor...", fr: "Recherche d'hôtels...", hi: "होटल खोजा जा रहा है...",
    es: "Buscando hoteles...", et: "Otsib hotelle...", de: "Suche nach Hotels...",
    "zh-hans": "正在搜索酒店...", "zh-hant": "正在搜索酒店...", ur: "ہوٹل تلاش کر رہا ہے...", tl: "Naghahanap ng mga hotel..."
  },
  "Searching flights...": {
    ar: "البحث عن الرحلات...", tr: "Uçuşlar aranıyor...", fr: "Recherche de vols...", hi: "उड़ानें खोजी जा रही हैं...",
    es: "Buscando vuelos...", et: "Otsib lende...", de: "Suche nach Flügen...",
    "zh-hans": "正在搜索航班...", "zh-hant": "正在搜索航班...", ur: "فلائٹس تلاش کر رہا ہے...", tl: "Naghahanap ng mga flight..."
  }
};

const translationsDir = path.join(__dirname, 'translations');
const files = fs.readdirSync(translationsDir).filter(f => f.endsWith('.json'));

files.forEach(file => {
  const lang = file.replace('.json', '');
  const filePath = path.join(translationsDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  for (const [key, t] of Object.entries(newTranslations)) {
    if (!data[key]) {
      data[key] = t[lang] || key;
      if (lang === 'en') {
        data[key] = key;
      }
    }
  }

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Updated ${file}`);
});
