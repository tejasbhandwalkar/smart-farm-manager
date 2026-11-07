// AI KRISHI MITRA - AGRICULTURAL INTELLIGENCE ENGINE FOR 20-ACRE FARM
// Specializing in: Sugarcane (ऊस), Wheat (गहू), Onion (कांदा), Irrigation & Farm Management

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  category?: 'crop' | 'fertilizer' | 'disease' | 'irrigation' | 'market';
  audioPlaying?: boolean;
}

// Built-in Maharashtra Agri-Science Knowledge Base (MPKV Rahuri & ICAR standards)
export const generateAgriAdvice = async (
  query: string,
  lang: 'mr' | 'hi' | 'en' = 'mr'
): Promise<string> => {
  const q = query.toLowerCase();

  // Check if user has entered an optional Gemini API key in settings
  const geminiKey = localStorage.getItem('smart_farm_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey && geminiKey.length > 20) {
    try {
      const systemPrompt = `You are "AI Krishi Mitra", an expert agricultural scientist advising a farmer who owns a 20-acre farm in Maharashtra, India.
The farm cultivates: 
- 8 acres of Sugarcane (Co 86032) in Black soil
- 6 acres of Wheat (Lokwan) in Alluvial soil
- 4 acres of Onion (Gavran Fursungi) in Loamy soil
- 2 acres Fallow / Land Preparation
- Irrigation: Neera/Krishna Canal water and Kirloskar 7.5 HP well pump.
Language requested: ${lang === 'mr' ? 'Marathi' : lang === 'hi' ? 'Hindi' : 'English'}.
Answer concisely, warmly, and practically with exact fertilizer dosages, organic/chemical solutions, irrigation timings, and actionable steps.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nFarmer's Question: ${query}` }] },
            ],
          }),
        }
      );
      if (response.ok) {
        const json = await response.json();
        const generated = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (generated) return generated;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local agro-knowledge base', err);
    }
  }

  // Built-in High-Accuracy Rural Agronomy Expert System
  if (lang === 'mr') {
    // 1. ऊस (Sugarcane)
    if (q.includes('ऊस') || q.includes('sugarcane') || q.includes('कांडी') || q.includes('खोडकिड') || q.includes('८६०३२')) {
      if (q.includes('खत') || q.includes('विद्राव्य') || q.includes('ठिबक') || q.includes('डोस')) {
        return `🎋 **८ एकर उसासाठी (को-८६०३२) खत व सिंचन सल्ला:**

1. **वाढ अवस्था (६० ते १२० दिवस):**
   - ठिबक सिंचनातून दर आठवड्याला **१९:१९:१९** विद्राव्य खत ५ किलो प्रति एकर + **युरिया** ३ किलो सोडावे.
   - सोबत **मॅग्नेशियम सल्फेट** आणि **झिंक** सूक्ष्मअन्नद्रव्ये ५०० ग्रॅम प्रति एकर दिल्यास पाने हिरवीगार व रुंद होतात.

2. **ऊस बांधणी (Earthing Up):**
   - ९० ते ११० दिवसांच्या दरम्यान मधल्या सरीत **१०:२६:२६** (२ पोती/एकर) + **युरिया** (१ पोते/एकर) टाकून रोटाव्हेटरने माती लावावी.

3. **पाणी पाळी:**
   - काळ्या कसदार जमिनीत ठिबक सिंचन दिवसाआड ४ ते ५ तास चालू ठेवावे. दुपारच्या उन्हात पाणी देणे टाळावे.`;
      }
      if (q.includes('किड') || q.includes('रोग') || q.includes('वाळ') || q.includes('पिवळे')) {
        return `🎋 **उसावरील खोडकिड व कीड नियंत्रण:**

1. **लक्षणे:** उसाचे मधले पोंगे सुकणे (Dead heart) आणि खोडावर बारीक छिद्रे दिसणे.
2. **जैविक उपाय:**
   - **ट्रायकोकार्ड्स** (Trichogramma) २ कार्ड प्रति एकर शेतात पानांवर लावावे.
   - **निंबोळी अर्क ५%** किंवा ५ मिली निमतेल प्रति लिटर पाण्यातून फवारणी करावी.
3. **रासायनिक उपाय (तीव्र प्रादुर्भाव असल्यास):**
   - **क्लोरँट्रानिलीप्रोल १८.५% SC (Coragen)** ०.४ मिली प्रति लिटर पाण्यातून पोंग्यात फवारावे, किंवा
   - **फिप्रोनिल ०.३% दाणेदार** १० किलो प्रति एकर खतात मिसळून उसाच्या बुंध्याशी देऊन पाणी द्यावे.`;
      }
      return `🎋 **उसाचे एकंदरीत व्यवस्थापन:**\nआपल्या शेतातील ८ एकर उसासाठी (को-८६०३२) ठिबक सिंचनातून नियमित विद्राव्य खते (१९:१९:१९ आणि १२:६१:००) देणे सुरू ठेवावे. उसाला दर १० ते १२ दिवसांनी पाणी पाळी आवश्यक आहे. साखर कारखान्याची सरासरी काढणी १२ ते १४ महिन्यांत अपेक्षित आहे.`;
    }

    // 2. कांदा (Onion)
    if (q.includes('कांदा') || q.includes('onion') || q.includes('करपा') || q.includes('थ्रिप्स') || q.includes('फुलकिडे')) {
      if (q.includes('करपा') || q.includes('जांभळा') || q.includes('डाग') || q.includes('बुरशी')) {
        return `🧅 **कांद्यावरील जांभळा करपा (Purple Blotch) नियंत्रण:**

1. **कारणे:** ढगाळ हवामान, रात्रीचे धुके आणि हवेतील आर्द्रतेमुळे करप्याचा प्रादुर्भाव वाढतो.
2. **फवारणी उपाय (प्रति लिटर पाण्यासाठी):**
   - **पहिली फवारणी:** **मॅन्कोझेब ७५% WP (DM-45)** २.५ ग्रॅम + **स्टीकर (Sticker)** ०.५ मिली प्रति लिटर पाणी.
   - **तीव्र करपा असल्यास:** **डिफेनोकोनॅझोल २५% EC (Score)** १ मिली किंवा **ॲझॉक्सीस्ट्रॉबिन + डायफेनोकोनाझोल (Amistar Top)** १ मिली प्रति लिटर.
3. **टीप:** कांद्याच्या पानावर मेणाचा थर असल्याने स्टीकर (डिंक) फवारणीत वापरणे अत्यंत महत्त्वाचे आहे!`;
      }
      if (q.includes('थ्रिप्स') || q.includes('किडे') || q.includes('पीळ') || q.includes('शेंडे')) {
        return `🧅 **कांद्यावरील थ्रिप्स (फुलकिडे) नियंत्रण:**

1. **लक्षणे:** कांद्याच्या पानाच्या बगलेत बारीक पिवळसर किडे दिसणे, पांढरे चट्टे पडणे व पाने पिवळी पडणे.
2. **उपाययोजना:**
   - **फिप्रोनिल ५% SC (Regent)** १.५ मिली प्रति लिटर, किंवा
   - **थियामेथॉक्झम २५% WG (Actara)** ०.५ ग्रॅम प्रति लिटर + निंबोळी तेल २ मिली.
   - शेतात एकरी २० **पिवळे व निळे चिकट सापळे (Sticky Traps)** लावावेत.`;
      }
      if (q.includes('कंद') || q.includes('खत') || q.includes('मोठा')) {
        return `🧅 **कांदा कंद फुगवणीसाठी खत नियोजन:**

- लागवडीनंतर ६० ते ७५ दिवसांच्या दरम्यान: **००:५२:३४** ५ ग्रॅम + **बोरॉन २०%** १ ग्रॅम प्रति लिटर फवारावे.
- काढणीपूर्वी १५ दिवस अगोदर: **१३:००:४५** (पोटॅशिअम नायट्रेट) ५ ग्रॅम प्रति लिटर फवारल्यास कांद्याचा रंग चकचकीत होतो व टिकवण क्षमता वाढते.
- **महत्त्वाचे:** काढणीपूर्वी १२ ते १५ दिवस पाणी पूर्ण बंद करावे.`;
      }
      return `🧅 **कांदा पीक सल्ला:**\nआपल्या ४ एकर कांद्यासाठी गादीवाफे पद्धत उत्तम असून पाणी साचू न देणे महत्त्वाचे आहे. करपा व थ्रिप्सच्या प्रतिबंधासाठी नियमित निंबोळी अर्काची फवारणी फायदेशीर ठरते.`;
    }

    // 3. गहू (Wheat)
    if (q.includes('गहू') || q.includes('wheat') || q.includes('लोकवन') || q.includes('पेरणी') || q.includes('कोंब')) {
      return `🌾 **६ एकर गव्हाचे (लोकवन) पाणी व खत व्यवस्थापन:**

1. **पहिली अतिमहत्त्वाची पाणी पाळी (CRI Stage):**
   - पेरणीनंतर **१८ ते २१ दिवसांनी** गव्हाला 'मुकुट मुळे फुटण्याची अवस्था' असते. या वेळी पाणी देणे अत्यंत अनिवार्य आहे, अन्यथा उत्पादन ३०% पर्यंत घटते!

2. **खताचा पहिला हप्ता:**
   - पहिल्या पाण्याच्या वेळी **युरिया** २५ ते ३० किलो प्रति एकर जमिनीतून द्यावा.

3. **तण नियंत्रण (Weed Management):**
   - पेरणीनंतर ३० ते ३५ दिवसांनी रुंद पानाच्या तणांसाठी **२,४-डी** किंवा **मेटसल्फ्युरॉन मिथाईल** फवारावे.

4. **पुढील पाणी पाळ्या:**
   - कांडी धरताना (४०-४५ दिवस), ओंबी बाहेर पडताना (६५-७० दिवस) आणि दाणे भरताना (८०-८५ दिवस) पाणी द्यावे. कालव्याचे पाणी या टप्प्यांवर वापरणे फायदेशीर ठरेल.`;
    }

    // 4. कालवा व पंप पाणी (Irrigation)
    if (q.includes('पाणी') || q.includes('कालवा') || q.includes('पंप') || q.includes('विहीर') || q.includes('सिंचन') || q.includes('वीज')) {
      return `💧 **२० एकर शेतीसाठी स्मार्ट पाणी नियोजन:**

1. **कालव्याचे पाणी (Canal Water):**
   - आवर्तन सुरू होताच मुख्य चारी साफ ठेवून प्रथम **६ एकर गहू** आणि **४ एकर कांद्याला** पाट पाणी द्यावे.
   - उर्वरित वेळात विहीर किंवा शेततळे पूर्ण भरून घ्यावे.

2. **विहीर पंप (Kirloskar 7.5 HP):**
   - महावितरणच्या रात्रीच्या किंवा सकाळच्या वीज सप्लाय वेळेत **८ एकर उसाचे ठिबक** टप्प्याटप्प्याने (४-४ एकर) चालवावे.
   - यामुळे पंपावर ताण येत नाही व विजेचा वापर कमी होऊन बिल नियंत्रणात राहते.`;
    }

    // 5. मजुरी व कामे (Labour & Tasks)
    if (q.includes('मजूर') || q.includes('काम') || q.includes('हजेरी') || q.includes('रोजंदारी') || q.includes('उचल')) {
      return `👥 **मजूर व शेती कामे नियोजन:**

- आपल्याकडे १२ मजूर उपलब्ध आहेत. कामाचे गट विभागून घ्यावेत:
  1. **गट १ (४ मजूर):** कांदा निंदणी, खुरपणी व फवारणी कामे.
  2. **गट २ (४ मजूर):** ऊस बांधणी, ठिबक पाईपलाईन तपासणी व चर साफसफाई.
  3. **गट ३ (४ मजूर):** गहू वाफे तयार करणे, पाणी भरणे व ट्रॅक्टर मशागत.
- मजुरांना साप्ताहिक मजुरी वाटप करताना घेतलेली उचल (Advance) वजा करून देयके पूर्ण करावीत.`;
    }

    // Default friendly Marathi agriculture advisor response
    return `🌾 **रामराम शेतकरी दादा!**\nमी आपला **AI कृषी मित्र** आहे. आपल्या २० एकर शेतातील **ऊस (८ एकर), गहू (६ एकर) आणि कांदा (४ एकर)** यांच्या खत नियोजनाबद्दल, रोगनिदानाबद्दल, फवारणीबद्दल किंवा कालवा-विहीर पाणी नियोजनाबद्दल कोणताही प्रश्न मला विचारा. मी लगेच शास्त्रीय सल्ला देईन!`;
  } else if (lang === 'hi') {
    // Hindi fallback advice
    if (q.includes('गन्ना') || q.includes('sugarcane')) {
      return `🎋 **गन्ने की फसल (८ एकड़ - को ८६०३२) के लिए वैज्ञानिक सलाह:**\n\n1. **खाद प्रबंधन:** ड्रिप से प्रति सप्ताह १९:१९:१९ विलेय खाद ५ किग्रा प्रति एकड़ + यूरिया ३ किग्रा दें।\n2. **कीट रोकथाम:** तना छेदक के लिए कोराजन (Chlorantraniliprole) ०.४ मिली प्रति लीटर या नीम तेल ५ मिली प्रति लीटर पानी में मिलाकर छिड़काव करें।\n3. **सिंचाई:** काली उपजाऊ मिट्टी में ड्रिप सिंचाई हर २-३ दिन में ४ घंटे चलाएं।`;
    }
    if (q.includes('प्याज') || q.includes('onion')) {
      return `🧅 **प्याज की फसल (४ एकड़) के लिए रोग एवं खाद सलाह:**\n\n1. **बैंगनी धब्बा (झुलसा):** मैंकोजेब (Mancozeb) २.५ ग्राम प्रति लीटर + स्टीकर मिलाकर छिड़काव करें।\n2. **थ्रिप्स कीट:** फिप्रोनिल ५% SC १.५ मिली प्रति लीटर पानी में मिलाकर छिड़कें।\n3. **कंद का आकार बढ़ाने के लिए:** ००:५२:३४ (५ ग्राम/लीटर) और बोरॉन (१ ग्राम/लीटर) का छिड़काव करें।`;
    }
    if (q.includes('गेहूं') || q.includes('wheat')) {
      return `🌾 **गेहूं (६ एकड़ - लोकवन) के लिए सलाह:**\n\n- बुवाई के १८ से २१ दिन बाद मुकुट जड़ बनते समय (CRI Stage) पहली सिंचाई अत्यंत अनिवार्य है।\n- सिंचाई के समय प्रति एकड़ २५-३० किलो यूरिया छिड़कें।\n- खरपतवार नियंत्रण ३० से ३५ दिन पर करें।`;
    }
    return `🌾 **नमस्ते किसान भाई!**\nमैं आपका **AI कृषि मित्र** हूँ। आपके २० एकड़ खेत के गन्ने, गेहूं, प्याज, खाद, सिंचाई और रोग नियंत्रण से संबंधित कोई भी सवाल आप मुझसे पूछ सकते हैं।`;
  } else {
    // English advice
    if (q.includes('sugarcane')) {
      return `🎋 **Sugarcane Management Advisory (8 Acres - Co 86032):**\n\n1. **Fertigation:** Apply 19:19:19 water-soluble fertilizer @ 5 kg/acre + Urea 3 kg/acre weekly via drip irrigation.\n2. **Shoot Borer Control:** Spray Chlorantraniliprole 18.5% SC @ 0.4 ml/L or release Trichogramma egg parasites @ 2 cards/acre.\n3. **Earthing Up:** Perform at 90-110 days with basal dose of 10:26:26 (100 kg/acre).`;
    }
    if (q.includes('onion')) {
      return `🧅 **Onion Crop Advisory (4 Acres - Gavran Fursungi):**\n\n1. **Purple Blotch (Fungus):** Spray Mancozeb 75% WP @ 2.5 g/L with non-ionic sticker, or Difenoconazole 25% EC @ 1 ml/L.\n2. **Thrips Control:** Apply Fipronil 5% SC @ 1.5 ml/L or Thiamethoxam 25% WG @ 0.5 g/L.\n3. **Bulb Enlargement:** Foliar spray of 00:52:34 @ 5 g/L + Boron 20% @ 1 g/L at 60-70 days after transplanting.`;
    }
    if (q.includes('wheat')) {
      return `🌾 **Wheat Management Advisory (6 Acres - Lokwan):**\n\n1. **Critical 1st Irrigation (CRI Stage):** Must be given at 20-22 days after sowing; delaying reduces tillering.\n2. **Top Dressing:** Apply Urea @ 30 kg/acre immediately before or after 1st irrigation.\n3. **Canal Water:** Plan canal water turns to coincide with crown root initiation and flowering stages.`;
    }
    return `🌾 **Hello Farmer!**\nI am your **AI Farm Advisor**. Ask me any question regarding your 20-acre farm, Sugarcane, Wheat, Onion, fertilizers, disease cure, or irrigation scheduling.`;
  }
};

// Text-to-Speech Helper (Speaks response aloud in browser!)
export const speakText = (text: string, lang: 'mr' | 'hi' | 'en' = 'mr') => {
  if (!('speechSynthesis' in window)) return;

  // Clean markdown asterisks
  const clean = text.replace(/[*_#`]/g, '');

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 0.95;
  utterance.pitch = 1.0;

  if (lang === 'mr') {
    utterance.lang = 'mr-IN';
  } else if (lang === 'hi') {
    utterance.lang = 'hi-IN';
  } else {
    utterance.lang = 'en-IN';
  }

  window.speechSynthesis.speak(utterance);
};

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
