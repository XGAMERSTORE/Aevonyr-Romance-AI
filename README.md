# Aevonyr Romance AI 💗

Česká mobilní webová romantická příběhová hra s vlastními dospělými AI postavami, ukazateli vztahů, historií, generováním portrétů a lokálním demo režimem.

## Spuštění

Vyžaduje Node.js 20+.

```bash
git clone https://github.com/XGAMERSTORE/Aevonyr-Romance-AI.git
cd Aevonyr-Romance-AI
npm start
```

Otevři http://localhost:3000. Bez API klíče běží ukázkové odpovědi, tvorba postav a ukládání historie.

## Zapnutí skutečné AI

Na serveru nastav proměnnou prostředí `OPENAI_API_KEY` (nikdy ji nevkládej do kódu ani veřejného GitHubu).

Linux/macOS:
```bash
export OPENAI_API_KEY="tvuj-klic"
npm start
```

PowerShell:
```powershell
$env:OPENAI_API_KEY="tvuj-klic"
npm start
```

Backend poskytuje `POST /api/chat` a `POST /api/image`. Ve webové aplikaci v Knihovně nech adresu backendu prázdnou pro stejný server nebo nastav veřejnou HTTPS adresu. Pro generování obrázků musí mít API projekt příslušné oprávnění. Modely lze konfigurovat pomocí `OPENAI_MODEL` a `OPENAI_IMAGE_MODEL` na serveru.

## Funkce

- responzivní české rozhraní, Objevovat / Příběh / Knihovna
- tvorba a mazání postav 18+, vlastní osobnost a úvodní scéna
- ukazatele náklonnosti, důvěry, respektu, zájmu a napětí
- chat s historií uloženou lokálně v prohlížeči
- generování obrázků postav přes serverové AI API
- romantický a smyslný obsah bez graficky explicitních sexuálních scén

## Omezení první verze

Ukazatele vztahů se zatím mění jednoduchými pravidly, nikoli hlubokou analýzou konverzace. Obrázky mohou spotřebovávat značné množství místa v localStorage a velké obrázky se nemusí uložit. Není implementována autentizace, účtování, databáze ani APK. Pro veřejné nasazení přidej přihlášení, limity požadavků, moderaci, správu nákladů, ochranu soukromí a HTTPS. API klíč musí zůstat pouze na serveru. Projekt není připraven k veřejnému produkčnímu provozu.

## Kontrola syntaxe

```bash
npm run check
```

## Lokální generativní AI bez API klíče (experimentální)

Android APK nyní obsahuje MediaPipe LLM Inference runtime. V Knihovně zvol **Nahrát .task model**, vyber kompatibilní MediaPipe LLM soubor ve formátu `.task` (například vhodně zabalenou Gemma 3 1B) a zapni **Používat lokální AI**. Model se zkopíruje do interního úložiště aplikace. Poté se text generuje přímo v telefonu, bez internetu a API klíče.

Důležité: **model není součástí APK**, má stovky MB až jednotky GB; běh může být pomalý, náročný na RAM a na některých telefonech nepodporovaný. Obyčejný `.gguf` nebo `.tflite` soubor není kompatibilní s tímto importem. Při selhání vypni lokální AI a používej offline příběhový engine. API knihovna MediaPipe je v režimu údržby; do budoucna je vhodný přechod na LiteRT-LM.

V aplikaci lze nadále používat serverovou AI, ale není nutná pro offline engine ani pro lokální model. Generování obrázků zatím vyžaduje backend. Lokální inference nebyla ověřena na fyzickém telefonu.

Dokumentace: https://developers.google.com/edge/mediapipe/solutions/genai/llm_inference/android
