const fs = require('fs');
const path = require('path');

const newTranslations = {
  "Your Stay Details": {
    ar: "تفاصيل إقامتك", tr: "Konaklama Detaylarınız", fr: "Détails de votre séjour", hi: "आपके ठहरने का विवरण",
    es: "Detalles de su estadía", et: "Teie majutuse üksikasjad", de: "Ihre Aufenthaltsdetails",
    "zh-hans": "您的住宿详情", "zh-hant": "您的住宿詳情", ur: "آپ کے قیام کی تفصیلات", tl: "Mga Detalye ng Iyong Paglagi"
  },
  "Check-in / Out": {
    ar: "تسجيل الدخول / الخروج", tr: "Giriş / Çıkış", fr: "Arrivée / Départ", hi: "चेक-इन / आउट",
    es: "Entrada / Salida", et: "Sisseregistreerimine / Väljaregistreerimine", de: "Check-in / Check-out",
    "zh-hans": "入住 / 退房", "zh-hant": "入住 / 退房", ur: "چیک ان / آؤٹ", tl: "Check-in / Out"
  },
  "Select Dates": {
    ar: "اختر التواريخ", tr: "Tarih Seçin", fr: "Sélectionner les dates", hi: "तिथियां चुनें",
    es: "Seleccionar fechas", et: "Vali kuupäevad", de: "Daten auswählen",
    "zh-hans": "选择日期", "zh-hant": "選擇日期", ur: "تاریخیں منتخب کریں", tl: "Piliin ang Petsa"
  },
  "Guests": {
    ar: "الضيوف", tr: "Misafirler", fr: "Invités", hi: "अतिथि",
    es: "Huéspedes", et: "Külalised", de: "Gäste",
    "zh-hans": "客人", "zh-hant": "客人", ur: "مہمان", tl: "Mga Bisita"
  },
  "2 Adults · 1 Room": {
    ar: "شخصان بالغان · غرفة واحدة", tr: "2 Yetişkin · 1 Oda", fr: "2 Adultes · 1 Chambre", hi: "2 वयस्क · 1 कमरा",
    es: "2 Adultos · 1 Habitación", et: "2 täiskasvanut · 1 tuba", de: "2 Erwachsene · 1 Zimmer",
    "zh-hans": "2位成人 · 1间客房", "zh-hant": "2位成人 · 1間客房", ur: "2 بالغ · 1 کمرہ", tl: "2 Matanda · 1 Kwarto"
  },
  "Times": {
    ar: "الأوقات", tr: "Zamanlar", fr: "Horaires", hi: "समय",
    es: "Horarios", et: "Ajad", de: "Zeiten",
    "zh-hans": "时间", "zh-hant": "時間", ur: "اوقات", tl: "Oras"
  },
  "In: 3:00 PM · Out: 12:00 PM": {
    ar: "الدخول: 3:00 مساءً · الخروج: 12:00 مساءً", tr: "Giriş: 15:00 · Çıkış: 12:00", fr: "Arrivée: 15:00 · Départ: 12:00", hi: "इन: 3:00 PM · आउट: 12:00 PM",
    es: "Entrada: 3:00 PM · Salida: 12:00 PM", et: "Sisse: 15:00 · Välja: 12:00", de: "Check-in: 15:00 · Check-out: 12:00",
    "zh-hans": "入住: 下午3:00 · 退房: 中午12:00", "zh-hant": "入住: 下午3:00 · 退房: 中午12:00", ur: "ان: 3:00 PM · آؤٹ: 12:00 PM", tl: "In: 3:00 PM · Out: 12:00 PM"
  },
  "Book This Property": {
    ar: "احجز هذا العقار", tr: "Bu Tesisi Ayırt", fr: "Réserver cette propriété", hi: "यह संपत्ति बुक करें",
    es: "Reservar esta propiedad", et: "Broneeri see majutus", de: "Diese Unterkunft buchen",
    "zh-hans": "预订此住宿", "zh-hant": "預訂此住宿", ur: "یہ پراپرٹی بک کریں", tl: "I-book Itong Ari-arian"
  },
  "Room availability is confirmed upon booking. Click below to reserve your stay at": {
    ar: "يتم تأكيد توفر الغرفة عند الحجز. انقر أدناه لحجز إقامتك في", tr: "Oda müsaitliği rezervasyon sırasında onaylanır. Konaklamanızı rezerve etmek için aşağıya tıklayın:", fr: "La disponibilité des chambres est confirmée lors de la réservation. Cliquez ci-dessous pour réserver votre séjour à", hi: "बुकिंग पर कमरे की उपलब्धता की पुष्टि की जाती है। अपने ठहरने को आरक्षित करने के लिए नीचे क्लिक करें",
    es: "La disponibilidad de la habitación se confirma al reservar. Haga clic a continuación para reservar su estadía en", et: "Tubade saadavus kinnitatakse broneerimisel. Klõpsake allpool, et broneerida majutus kohas", de: "Die Zimmerverfügbarkeit wird bei der Buchung bestätigt. Klicken Sie unten, um Ihren Aufenthalt zu reservieren in",
    "zh-hans": "客房的可用性在预订时确认。点击下方预订您在的住宿", "zh-hant": "客房的可用性在預訂時確認。點擊下方預訂您在的住宿", ur: "کمرے کی دستیابی بکنگ پر تصدیق کی جاتی ہے۔ اپنے قیام کو بک کرنے کے لیے نیچے کلک کریں", tl: "Ang availability ng kwarto ay kinukumpirma sa pag-book. I-click sa ibaba upang i-reserve ang iyong paglagi sa"
  },
  "Total Price": {
    ar: "السعر الإجمالي", tr: "Toplam Fiyat", fr: "Prix Total", hi: "कुल कीमत",
    es: "Precio Total", et: "Koguhind", de: "Gesamtpreis",
    "zh-hans": "总价", "zh-hant": "總價", ur: "کل قیمت", tl: "Kabuuang Presyo"
  },
  "/ night •": {
    ar: "/ ليلة •", tr: "/ gece •", fr: "/ nuit •", hi: "/ रात •",
    es: "/ noche •", et: "/ öö •", de: "/ nacht •",
    "zh-hans": "/ 晚 •", "zh-hant": "/ 晚 •", ur: "/ رات •", tl: "/ gabi •"
  },
  "night": {
    ar: "ليلة", tr: "gece", fr: "nuit", hi: "रात",
    es: "noche", et: "öö", de: "nacht",
    "zh-hans": "晚", "zh-hant": "晚", ur: "رات", tl: "gabi"
  },
  "nights": {
    ar: "ليالي", tr: "gece", fr: "nuits", hi: "रातें",
    es: "noches", et: "ööd", de: "nächte",
    "zh-hans": "晚", "zh-hant": "晚", ur: "راتیں", tl: "mga gabi"
  },
  "Continue to Guest Details": {
    ar: "المتابعة إلى تفاصيل الضيف", tr: "Misafir Detaylarına Devam Et", fr: "Continuer aux détails de l'invité", hi: "अतिथि विवरण पर जारी रखें",
    es: "Continuar a Detalles del Huésped", et: "Jätka külalise üksikasjadega", de: "Weiter zu den Gastdaten",
    "zh-hans": "继续填写客人详细信息", "zh-hant": "繼續填寫客人詳細信息", ur: "مہمان کی تفصیلات پر جاری رکھیں", tl: "Magpatuloy sa Mga Detalye ng Bisita"
  },
  "Dawn": {
    ar: "فجر", tr: "Şafak", fr: "Aube", hi: "भोर",
    es: "Madrugada", et: "Koidik", de: "Morgengrauen",
    "zh-hans": "黎明", "zh-hant": "黎明", ur: "فجر", tl: "Madaling-araw"
  },
  "Morning": {
    ar: "صباح", tr: "Sabah", fr: "Matin", hi: "सुबह",
    es: "Mañana", et: "Hommik", de: "Morgen",
    "zh-hans": "早上", "zh-hant": "早上", ur: "صبح", tl: "Umaga"
  },
  "Afternoon": {
    ar: "بعد الظهر", tr: "Öğleden Sonra", fr: "Après-midi", hi: "दोपहर",
    es: "Tarde", et: "Pärastlõuna", de: "Nachmittag",
    "zh-hans": "下午", "zh-hant": "下午", ur: "دوپہر", tl: "Hapon"
  },
  "Evening": {
    ar: "مساء", tr: "Akşam", fr: "Soir", hi: "शाम",
    es: "Noche", et: "Õhtu", de: "Abend",
    "zh-hans": "晚上", "zh-hant": "晚上", ur: "شام", tl: "Gabi"
  },
  "Unknown Airline": {
    ar: "شركة طيران غير معروفة", tr: "Bilinmeyen Havayolu", fr: "Compagnie Aérienne Inconnue", hi: "अज्ञात एयरलाइन",
    es: "Aerolínea Desconocida", et: "Tundmatu Lennufirma", de: "Unbekannte Fluggesellschaft",
    "zh-hans": "未知航空公司", "zh-hant": "未知航空公司", ur: "نامعلوم ایئرلائن", tl: "Hindi Kilalang Airline"
  },
  "Sort Results": {
    ar: "فرز النتائج", tr: "Sonuçları Sırala", fr: "Trier les Résultats", hi: "परिणाम क्रमित करें",
    es: "Ordenar Resultados", et: "Sorteeri Tulemused", de: "Ergebnisse Sortieren",
    "zh-hans": "排序结果", "zh-hant": "排序結果", ur: "نتائج کو ترتیب دیں", tl: "Ayusin ang Mga Resulta"
  },
  "Price range": {
    ar: "نطاق السعر", tr: "Fiyat aralığı", fr: "Gamme de prix", hi: "मूल्य सीमा",
    es: "Rango de precios", et: "Hinnavahemik", de: "Preisspanne",
    "zh-hans": "价格范围", "zh-hant": "價格範圍", ur: "قیمت کی حد", tl: "Saklaw ng presyo"
  },
  "Stops": {
    ar: "توقفات", tr: "Aktarmalar", fr: "Arrêts", hi: "स्टॉप",
    es: "Escalas", et: "Peatused", de: "Stopps",
    "zh-hans": "中转", "zh-hant": "中轉", ur: "اسٹاپس", tl: "Paghinto"
  },
  "Non-stop": {
    ar: "بدون توقف", tr: "Aktarmasız", fr: "Sans escale", hi: "नॉन-स्टॉप",
    es: "Directo", et: "Otselend", de: "Direktflug",
    "zh-hans": "直飞", "zh-hant": "直飛", ur: "نان اسٹاپ", tl: "Walang-tigil"
  },
  "1 Stop": {
    ar: "توقف واحد", tr: "1 Aktarma", fr: "1 Escale", hi: "1 स्टॉप",
    es: "1 Escala", et: "1 Peatus", de: "1 Stopp",
    "zh-hans": "1次中转", "zh-hant": "1次中轉", ur: "1 اسٹاپ", tl: "1 Paghinto"
  },
  "2+ Stops": {
    ar: "توقفين أو أكثر", tr: "2+ Aktarma", fr: "2+ Escales", hi: "2+ स्टॉप",
    es: "2+ Escalas", et: "2+ Peatused", de: "2+ Stopps",
    "zh-hans": "2次以上中转", "zh-hant": "2次以上中轉", ur: "2+ اسٹاپس", tl: "2+ Paghinto"
  },
  "Airlines": {
    ar: "شركات الطيران", tr: "Havayolları", fr: "Compagnies Aériennes", hi: "एयरलाइंस",
    es: "Aerolíneas", et: "Lennufirmad", de: "Fluggesellschaften",
    "zh-hans": "航空公司", "zh-hant": "航空公司", ur: "ایئرلائنز", tl: "Mga Airline"
  },
  "Show less": {
    ar: "عرض أقل", tr: "Daha az göster", fr: "Voir moins", hi: "कम दिखाएं",
    es: "Mostrar menos", et: "Näita vähem", de: "Weniger anzeigen",
    "zh-hans": "显示较少", "zh-hant": "顯示較少", ur: "کم دکھائیں", tl: "Ipakita ang kaunti"
  },
  "Show all airlines": {
    ar: "عرض جميع شركات الطيران", tr: "Tüm havayollarını göster", fr: "Afficher toutes les compagnies", hi: "सभी एयरलाइंस दिखाएं",
    es: "Mostrar todas las aerolíneas", et: "Näita kõiki lennufirmasid", de: "Alle Fluggesellschaften anzeigen",
    "zh-hans": "显示所有航空公司", "zh-hant": "顯示所有航空公司", ur: "تمام ایئرلائنز دکھائیں", tl: "Ipakita lahat ng airline"
  },
  "Departure time": {
    ar: "وقت المغادرة", tr: "Kalkış saati", fr: "Heure de départ", hi: "प्रस्थान समय",
    es: "Hora de salida", et: "Väljumisaeg", de: "Abflugzeit",
    "zh-hans": "出发时间", "zh-hant": "出發時間", ur: "روانگی کا وقت", tl: "Oras ng pag-alis"
  },
  "Arrival time": {
    ar: "وقت الوصول", tr: "Varış saati", fr: "Heure d'arrivée", hi: "आगमन समय",
    es: "Hora de llegada", et: "Saabumisaeg", de: "Ankunftszeit",
    "zh-hans": "到达时间", "zh-hant": "到達時間", ur: "پہنچنے کا وقت", tl: "Oras ng pagdating"
  },
  "Cabin class": {
    ar: "درجة المقصورة", tr: "Kabin sınıfı", fr: "Classe de cabine", hi: "केबिन क्लास",
    es: "Clase de cabina", et: "Klass", de: "Kabinenklasse",
    "zh-hans": "舱位等级", "zh-hant": "艙位等級", ur: "کیبن کلاس", tl: "Klase ng cabin"
  },
  "Economy": {
    ar: "الاقتصادية", tr: "Ekonomi", fr: "Économique", hi: "इकोनॉमी",
    es: "Económica", et: "Turistiklass", de: "Economy",
    "zh-hans": "经济舱", "zh-hant": "經濟艙", ur: "اکانومی", tl: "Economy"
  },
  "Premium Economy": {
    ar: "الاقتصادية الممتازة", tr: "Premium Ekonomi", fr: "Économie Premium", hi: "प्रीमियम इकोनॉमी",
    es: "Económica Premium", et: "Premium Turistiklass", de: "Premium Economy",
    "zh-hans": "高级经济舱", "zh-hant": "高級經濟艙", ur: "پریمیم اکانومی", tl: "Premium Economy"
  },
  "Business": {
    ar: "الأعمال", tr: "Business", fr: "Affaires", hi: "बिजनेस",
    es: "Ejecutiva", et: "Äriklass", de: "Business",
    "zh-hans": "商务舱", "zh-hant": "商務艙", ur: "بزنس", tl: "Business"
  },
  "First": {
    ar: "الأولى", tr: "First Class", fr: "Première", hi: "फर्स्ट",
    es: "Primera", et: "Esimene", de: "First",
    "zh-hans": "头等舱", "zh-hant": "頭等艙", ur: "فرسٹ", tl: "First"
  },
  "Bags": {
    ar: "الحقائب", tr: "Bagajlar", fr: "Bagages", hi: "बैग",
    es: "Equipaje", et: "Pagas", de: "Gepäck",
    "zh-hans": "行李", "zh-hant": "行李", ur: "بیگز", tl: "Mga Bagahe"
  },
  "Carry-on only": {
    ar: "حقيبة يد فقط", tr: "Sadece kabin bagajı", fr: "Bagage cabine uniquement", hi: "केवल कैरी-ऑन",
    es: "Solo equipaje de mano", et: "Ainult käsipagas", de: "Nur Handgepäck",
    "zh-hans": "仅限随身行李", "zh-hant": "僅限隨身行李", ur: "صرف کیری آن", tl: "Carry-on lamang"
  },
  "1 Checked Bag": {
    ar: "1 حقيبة مسجلة", tr: "1 Kayıtlı Bagaj", fr: "1 Bagage enregistré", hi: "1 चेक किया हुआ बैग",
    es: "1 Equipaje facturado", et: "1 äraantav pagas", de: "1 Aufgegebenes Gepäckstück",
    "zh-hans": "1件托运行李", "zh-hant": "1件托運行李", ur: "1 چیکڈ بیگ", tl: "1 Na-check na Bag"
  },
  "2 Checked Bags": {
    ar: "2 حقائب مسجلة", tr: "2 Kayıtlı Bagaj", fr: "2 Bagages enregistrés", hi: "2 चेक किए हुए बैग",
    es: "2 Equipajes facturados", et: "2 äraantavat pagasit", de: "2 Aufgegebene Gepäckstücke",
    "zh-hans": "2件托运行李", "zh-hant": "2件托運行李", ur: "2 چیکڈ بیگز", tl: "2 Na-check na Bag"
  },
  "Duration": {
    ar: "المدة", tr: "Süre", fr: "Durée", hi: "अवधि",
    es: "Duración", et: "Kestus", de: "Dauer",
    "zh-hans": "时长", "zh-hant": "時長", ur: "دورانیہ", tl: "Tagal"
  },
  "Up to": {
    ar: "ما يصل إلى", tr: "En fazla", fr: "Jusqu'à", hi: "तक",
    es: "Hasta", et: "Kuni", de: "Bis zu",
    "zh-hans": "最多", "zh-hant": "最多", ur: "تک", tl: "Hanggang"
  },
  "hours": {
    ar: "ساعات", tr: "saat", fr: "heures", hi: "घंटे",
    es: "horas", et: "tundi", de: "Stunden",
    "zh-hans": "小时", "zh-hant": "小時", ur: "گھنٹے", tl: "oras"
  },
  "results": {
    ar: "نتائج", tr: "sonuç", fr: "résultats", hi: "परिणाम",
    es: "resultados", et: "tulemust", de: "ergebnisse",
    "zh-hans": "结果", "zh-hant": "結果", ur: "نتائج", tl: "mga resulta"
  },
  "Reset all filters": {
    ar: "إعادة تعيين جميع الفلاتر", tr: "Tüm filtreleri sıfırla", fr: "Réinitialiser tous les filtres", hi: "सभी फ़िल्टर रीसेट करें",
    es: "Restablecer todos los filtros", et: "Lähtesta kõik filtrid", de: "Alle Filter zurücksetzen",
    "zh-hans": "重置所有筛选", "zh-hant": "重置所有篩選", ur: "تمام فلٹرز ری سیٹ کریں", tl: "I-reset lahat ng filter"
  },
  "from ": {
    ar: "من ", tr: "başlangıç ", fr: "à partir de ", hi: "से ",
    es: "desde ", et: "alates ", de: "ab ",
    "zh-hans": "起 ", "zh-hant": "起 ", ur: "سے ", tl: "mula sa "
  },
  "Property Type": {
    ar: "نوع العقار", tr: "Tesis Tipi", fr: "Type de Propriété", hi: "संपत्ति का प्रकार",
    es: "Tipo de Propiedad", et: "Majutuse tüüp", de: "Unterkunftsart",
    "zh-hans": "住宿类型", "zh-hant": "住宿類型", ur: "پراپرٹی کی قسم", tl: "Uri ng Ari-arian"
  },
  "Hotel": {
    ar: "فندق", tr: "Otel", fr: "Hôtel", hi: "होटल",
    es: "Hotel", et: "Hotell", de: "Hotel",
    "zh-hans": "酒店", "zh-hant": "酒店", ur: "ہوٹل", tl: "Hotel"
  },
  "Apartment": {
    ar: "شقة", tr: "Daire", fr: "Appartement", hi: "अपार्टमेंट",
    es: "Apartamento", et: "Korter", de: "Apartment",
    "zh-hans": "公寓", "zh-hant": "公寓", ur: "اپارٹمنٹ", tl: "Apartment"
  },
  "Villa": {
    ar: "فيلا", tr: "Villa", fr: "Villa", hi: "विला",
    es: "Villa", et: "Villa", de: "Villa",
    "zh-hans": "别墅", "zh-hant": "別墅", ur: "ولا", tl: "Villa"
  },
  "Resort": {
    ar: "منتجع", tr: "Tatil Köyü", fr: "Complexe hôtelier", hi: "रिसॉर्ट",
    es: "Resort", et: "Kuurort", de: "Resort",
    "zh-hans": "度假村", "zh-hant": "度假村", ur: "ریزورٹ", tl: "Resort"
  },
  "Hostel": {
    ar: "نزل", tr: "Hostel", fr: "Auberge", hi: "हॉस्टल",
    es: "Hostal", et: "Hostel", de: "Hostel",
    "zh-hans": "青年旅舍", "zh-hant": "青年旅舍", ur: "ہاسٹل", tl: "Hostel"
  },
  "Riad": {
    ar: "رياض", tr: "Riyad", fr: "Riad", hi: "रियाद",
    es: "Riad", et: "Riad", de: "Riad",
    "zh-hans": "里亚德", "zh-hant": "里亞德", ur: "ریاض", tl: "Riad"
  },
  "Boutique": {
    ar: "بوتيك", tr: "Butik", fr: "Boutique", hi: "बुटीक",
    es: "Boutique", et: "Butiik", de: "Boutique",
    "zh-hans": "精品", "zh-hant": "精品", ur: "بٹیک", tl: "Boutique"
  },
  "Star Rating": {
    ar: "تصنيف النجوم", tr: "Yıldız Derecelendirmesi", fr: "Nombre d'étoiles", hi: "स्टार रेटिंग",
    es: "Calificación de Estrellas", et: "Tärnihinnang", de: "Sternebewertung",
    "zh-hans": "星级评定", "zh-hant": "星級評定", ur: "اسٹار کی درجہ بندی", tl: "Star Rating"
  },
  "Amenities": {
    ar: "المرافق", tr: "Olanaklar", fr: "Équipements", hi: "सुविधाएं",
    es: "Servicios", et: "Mugavused", de: "Ausstattung",
    "zh-hans": "便利设施", "zh-hant": "便利設施", ur: "سہولیات", tl: "Mga Amenity"
  },
  "Free Cancellation": {
    ar: "إلغاء مجاني", tr: "Ücretsiz İptal", fr: "Annulation Gratuite", hi: "निःशुल्क रद्दीकरण",
    es: "Cancelación Gratuita", et: "Tasuta Tühistamine", de: "Kostenlose Stornierung",
    "zh-hans": "免费取消", "zh-hant": "免費取消", ur: "مفت منسوخی", tl: "Libreng Pagkansela"
  },
  "Breakfast Included": {
    ar: "الإفطار مشمول", tr: "Kahvaltı Dahil", fr: "Petit-déjeuner inclus", hi: "नाश्ता शामिल",
    es: "Desayuno Incluido", et: "Hommikusöök Hinna Sees", de: "Frühstück Inbegriffen",
    "zh-hans": "含早餐", "zh-hant": "含早餐", ur: "ناشتہ شامل ہے", tl: "Kasama ang Almusal"
  },
  "Price Range": {
    ar: "نطاق السعر", tr: "Fiyat Aralığı", fr: "Gamme de Prix", hi: "मूल्य सीमा",
    es: "Rango de Precios", et: "Hinnavahemik", de: "Preisspanne",
    "zh-hans": "价格范围", "zh-hant": "價格範圍", ur: "قیمت کی حد", tl: "Saklaw ng Presyo"
  },
  "Max AED": {
    ar: "أقصى د.إ", tr: "Maks. AED", fr: "Max AED", hi: "अधिकतम एईडी",
    es: "Máx. AED", et: "Maks. AED", de: "Max AED",
    "zh-hans": "最高AED", "zh-hant": "最高AED", ur: "زیادہ سے زیادہ AED", tl: "Max AED"
  },
  "Hide basic tickets": {
    ar: "إخفاء التذاكر الأساسية", tr: "Temel biletleri gizle", fr: "Masquer les billets basiques", hi: "बेसिक टिकट छिपाएं",
    es: "Ocultar boletos básicos", et: "Peida tühised piletid", de: "Basic-Tickets ausblenden",
    "zh-hans": "隐藏基础机票", "zh-hant": "隱藏基礎機票", ur: "بنیادی ٹکٹیں چھپائیں", tl: "Itago ang mga basic ticket"
  },
  "Options with seat & carry-on bag.": {
    ar: "خيارات مع مقعد وحقيبة يد.", tr: "Koltuk ve el bagajı olan seçenekler.", fr: "Options avec siège et bagage cabine.", hi: "सीट और कैरी-ऑन बैग के साथ विकल्प।",
    es: "Opciones con asiento y equipaje de mano.", et: "Istekoha ja käsipagasiga valikud.", de: "Optionen mit Sitzplatz und Handgepäck.",
    "zh-hans": "包含座位和随身行李的选项。", "zh-hant": "包含座位和隨身行李的選項。", ur: "سیٹ اور کیری آن بیگ کے ساتھ اختیارات۔", tl: "Mga opsyon na may upuan at carry-on bag."
  },
  "Book on KAYAK": {
    ar: "احجز على كاياك", tr: "KAYAK üzerinden ayırt", fr: "Réserver sur KAYAK", hi: "KAYAK पर बुक करें",
    es: "Reservar en KAYAK", et: "Broneeri KAYAK-is", de: "Auf KAYAK buchen",
    "zh-hans": "在KAYAK上预订", "zh-hant": "在KAYAK上預訂", ur: "KAYAK پر بک کریں", tl: "Mag-book sa KAYAK"
  },
  "Instantly bookable on website.": {
    ar: "قابل للحجز الفوري على الموقع.", tr: "Web sitesinde anında rezerve edilebilir.", fr: "Réservable instantanément sur le site web.", hi: "वेबसाइट पर तुरंत बुक करने योग्य।",
    es: "Se puede reservar al instante en el sitio web.", et: "Koheselt broneeritav veebisaidil.", de: "Sofort buchbar auf der Website.",
    "zh-hans": "可在网站上即时预订。", "zh-hant": "可在網站上即時預訂。", ur: "ویب سائٹ پر فوری طور پر بک کرنے کے قابل۔", tl: "Maaaring i-book kaagad sa website."
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
