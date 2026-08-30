const fs = require('fs');
const path = require('path');

const newTranslations = {
  // flights/booking/page.tsx
  "Travelers": { "ar": "المسافرون", "fr": "Voyageurs" },
  "Cabin not available": { "ar": "المقصورة غير متاحة", "fr": "Cabine non disponible" },
  "This flight is only offered in": { "ar": "تُقدم هذه الرحلة فقط في", "fr": "Ce vol est uniquement proposé en" },
  "Live pricing unavailable": { "ar": "التسعير المباشر غير متاح", "fr": "Tarification en direct indisponible" },
  "Showing the fare from your search. Our team will confirm before ticketing.": { "ar": "عرض السعر من بحثك. سيؤكد فريقنا قبل إصدار التذاكر.", "fr": "Affichage du tarif de votre recherche. Notre équipe confirmera avant l'émission des billets." },
  "Please fill in First Name, Last Name, Passport Number, Date of Birth, Gender, and Nationality for all travelers.": { "ar": "يرجى ملء الاسم الأول واسم العائلة ورقم الجواز وتاريخ الميلاد والجنس والجنسية لجميع المسافرين.", "fr": "Veuillez indiquer le prénom, le nom, le numéro de passeport, la date de naissance, le sexe et la nationalité pour tous les voyageurs." },
  "Incomplete Details": { "ar": "تفاصيل غير مكتملة", "fr": "Détails incomplets" },
  "Passport Number must be at least 4 characters long.": { "ar": "يجب أن يكون رقم الجواز 4 أحرف على الأقل.", "fr": "Le numéro de passeport doit comporter au moins 4 caractères." },
  "Invalid Passport Number": { "ar": "رقم جواز سفر غير صالح", "fr": "Numéro de passeport invalide" },
  "Payment verification failed.": { "ar": "فشل التحقق من الدفع.", "fr": "Échec de la vérification du paiement." },
  "Payment Simulator": { "ar": "محاكي الدفع", "fr": "Simulateur de paiement" },
  "Razorpay is running in": { "ar": "يعمل Razorpay في", "fr": "Razorpay est en cours d'exécution dans" },
  "sandbox mode": { "ar": "وضع الحماية", "fr": "mode bac à sable" },
  "Simulate a successful payment to continue testing the booking flow.": { "ar": "محاكاة دفع ناجح لمواصلة اختبار تدفق الحجز.", "fr": "Simulez un paiement réussi pour continuer à tester le flux de réservation." },
  "Cancel": { "ar": "إلغاء", "fr": "Annuler" },
  "Simulate Payment": { "ar": "محاكاة الدفع", "fr": "Simuler le paiement" },
  "Complete your profile": { "ar": "أكمل ملفك الشخصي", "fr": "Complétez votre profil" },
  "Add your passport and name to speed up booking.": { "ar": "أضف جواز سفرك واسمك لتسريع الحجز.", "fr": "Ajoutez votre passeport et votre nom pour accélérer la réservation." },
  "Edit Profile": { "ar": "تعديل الملف الشخصي", "fr": "Modifier le profil" },
  "Confirm Booking": { "ar": "تأكيد الحجز", "fr": "Confirmer la réservation" },
  "Please provide traveler information to complete your booking.": { "ar": "يرجى تقديم معلومات المسافر لإكمال حجزك.", "fr": "Veuillez fournir les informations du voyageur pour compléter votre réservation." },
  "Please fill in the details for": { "ar": "يرجى ملء تفاصيل", "fr": "Veuillez remplir les détails pour" },
  "traveler": { "ar": "مسافر", "fr": "voyageur" },
  "travelers": { "ar": "المسافرين", "fr": "voyageurs" },
  "Review Your Details": { "ar": "مراجعة التفاصيل الخاصة بك", "fr": "Vérifiez vos détails" },
  "Please verify your information before submitting to EzeeFlights.": { "ar": "يرجى التحقق من معلوماتك قبل تقديمها إلى EzeeFlights.", "fr": "Veuillez vérifier vos informations avant de les soumettre à EzeeFlights." },
  "Passenger Information": { "ar": "معلومات المسافر", "fr": "Informations sur les passagers" },
  "Selected Flight": { "ar": "الرحلة المختارة", "fr": "Vol sélectionné" },
  "Secure with Deposit": { "ar": "تأمين بالوديعة", "fr": "Sécuriser avec un dépôt" },
  "Instant Confirmation": { "ar": "تأكيد فوري", "fr": "Confirmation instantanée" },
  "To lock in this standby price, a fully refundable deposit is required. If your bid is not successful within 24 hours, the full amount will be credited back to your account.": { "ar": "لتثبيت سعر الاستعداد هذا ، يلزم إيداع قابل للاسترداد بالكامل...", "fr": "Pour bloquer ce prix de réserve, un dépôt entièrement remboursable est requis..." },
  "Your booking is being confirmed instantly. No payment is required at this stage. Our EzeeFlights specialists will provide your e-ticket shortly.": { "ar": "يتم تأكيد حجزك على الفور. لا يشترط الدفع في هذه المرحلة...", "fr": "Votre réservation est confirmée instantanément..." },
  "Pay Deposit & Bid": { "ar": "دفع الوديعة والمزايدة", "fr": "Payer l'acompte et enchérir" },
  "Submit Booking": { "ar": "تقديم الحجز", "fr": "Soumettre la réservation" },
  "Processing...": { "ar": "جاري المعالجة...", "fr": "Traitement en cours..." },
  "Ref Number": { "ar": "الرقم المرجعي", "fr": "Numéro de référence" },
  "Flight Summary": { "ar": "ملخص الرحلة", "fr": "Résumé du vol" },
  "Traveler": { "ar": "المسافر", "fr": "Voyageur" },
  "Passenger Details": { "ar": "تفاصيل الراكب", "fr": "Détails du passager" },
  "Payment Summary": { "ar": "ملخص الدفع", "fr": "Résumé du paiement" },
  "Base Fare": { "ar": "السعر الأساسي", "fr": "Tarif de base" },
  "Taxes & Fees": { "ar": "الضرائب والرسوم", "fr": "Taxes et frais" },
  "Total Amount": { "ar": "المبلغ الإجمالي", "fr": "Montant total" },
  "Hotel Add-on Details": { "ar": "تفاصيل الوظيفة الإضافية للفندق", "fr": "Détails du module complémentaire de l'hôtel" },
  "Included in Trip": { "ar": "مدرج في الرحلة", "fr": "Inclus dans le voyage" },
  "Remove Hotel Add-on": { "ar": "إزالة الوظيفة الإضافية للفندق", "fr": "Supprimer le module complémentaire de l'hôtel" },
  "Browse More Flights": { "ar": "تصفح المزيد من الرحلات", "fr": "Parcourir plus de vols" },
  "View My Trip": { "ar": "عرض رحلتي", "fr": "Voir mon voyage" },

  // hotels/confirmation/page.tsx
  "Loading your booking confirmation...": { "ar": "جاري تحميل تأكيد حجزك...", "fr": "Chargement de la confirmation de votre réservation..." },
  "Retrieving your booking confirmation...": { "ar": "جاري استرداد تأكيد حجزك...", "fr": "Récupération de la confirmation de votre réservation..." },
  "Booking Confirmed!": { "ar": "تم تأكيد الحجز!", "fr": "Réservation confirmée !" },
  "Your stay at": { "ar": "إقامتك في", "fr": "Votre séjour à" },
  "is reserved.": { "ar": "محجوزة.", "fr": "est réservé." },
  "Booking reference": { "ar": "المرجع", "fr": "Référence de réservation" },
  "Copied!": { "ar": "تم النسخ!", "fr": "Copié !" },
  "Booking reference copied to clipboard.": { "ar": "تم نسخ المرجع إلى الحافظة.", "fr": "Référence de réservation copiée." },
  "Hotel details": { "ar": "تفاصيل الفندق", "fr": "Détails de l'hôtel" },
  "Total price": { "ar": "السعر الإجمالي", "fr": "Prix total" },
  "Check-in / Out": { "ar": "تسجيل الدخول / الخروج", "fr": "Arrivée / Départ" },
  "Night": { "ar": "ليلة", "fr": "Nuit" },
  "Nights": { "ar": "ليالٍ", "fr": "Nuits" },
  "Address": { "ar": "العنوان", "fr": "Adresse" },
  "Address available in your confirmation email": { "ar": "العنوان متاح في بريدك الإلكتروني للتأكيد", "fr": "Adresse disponible dans votre e-mail de confirmation" },
  "Payment & Status": { "ar": "الدفع والحالة", "fr": "Paiement et statut" },
  "Authorized & Paid": { "ar": "معتمد ومدفوع", "fr": "Autorisé et payé" },
  "Payment Pending": { "ar": "قيد الانتظار", "fr": "Paiement en attente" },
  "Our support team will contact you shortly.": { "ar": "سيتصل بك فريق الدعم لدينا قريبًا.", "fr": "Notre équipe d'assistance vous contactera sous peu." },
  "Room Allocation": { "ar": "تخصيص الغرف", "fr": "Attribution de chambre" },
  "Standard Room": { "ar": "غرفة قياسية", "fr": "Chambre standard" },
  "Registered Guests": { "ar": "الضيوف المسجلين", "fr": "Clients enregistrés" },
  "age": { "ar": "العمر", "fr": "âge" },
  "View My Trips": { "ar": "عرض رحلاتي", "fr": "Voir mes voyages" },
  "Book a Flight": { "ar": "احجز رحلة", "fr": "Réserver un vol" },

  // flights/confirmation/page.tsx
  "Invalid Booking": { "ar": "حجز غير صالح", "fr": "Réservation invalide" },
  "No booking reference provided.": { "ar": "لم يتم توفير مرجع الحجز.", "fr": "Aucune référence de réservation fournie." },
  "Return home": { "ar": "العودة إلى الصفحة الرئيسية", "fr": "Retour à l'accueil" },
  "Unable to load booking": { "ar": "غير قادر على تحميل الحجز", "fr": "Impossible de charger la réservation" },
  "Retry": { "ar": "إعادة المحاولة", "fr": "Réessayer" },
  "Flight details": { "ar": "تفاصيل الرحلة", "fr": "Détails du vol" },
  "Your itinerary is confirmed and ticketed.": { "ar": "تم تأكيد مسار رحلتك وتم إصدار التذاكر.", "fr": "Votre itinéraire est confirmé et facturé." },
  "Status": { "ar": "الحالة", "fr": "Statut" },
  "Payment": { "ar": "الدفع", "fr": "Paiement" },
  "Booked on": { "ar": "تم الحجز في", "fr": "Réservé le" },
  "What's next": { "ar": "ماذا بعد", "fr": "Et après" },
  "Download E-ticket": { "ar": "تحميل التذكرة الإلكترونية", "fr": "Télécharger l'e-billet" },
  "Add to Calendar": { "ar": "أضف إلى التقويم", "fr": "Ajouter au calendrier" },
  "Share Itinerary": { "ar": "مشاركة مسار الرحلة", "fr": "Partager l'itinéraire" },
  "Manage your booking and keep all travel details handy.": { "ar": "إدارة حجزك والاحتفاظ بجميع تفاصيل السفر في متناول اليد.", "fr": "Gérez votre réservation et gardez tous les détails de voyage à portée de main." },
  "Open": { "ar": "فتح", "fr": "Ouvrir" },
  "Book a Hotel": { "ar": "احجز فندقًا", "fr": "Réserver un hôtel" }
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
