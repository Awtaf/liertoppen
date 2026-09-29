import type { Tone } from "./theme";

// ─────────────────────────────────────────────────────────────────────────────
// All on-screen Arabic copy (Levantine / Syrian colloquial).
// Wrap words in [brackets] to emphasize them: they pop briefly larger, then
// settle slightly bigger and in the scene's accent colour.
// Markers can span several words: "[خطوتك الجاية]".
// ─────────────────────────────────────────────────────────────────────────────

export type Phrase = {
  text: string;
  tone: Tone;
};

const phrase = (text: string, tone: Tone = "neutral"): Phrase => ({ text, tone });

export const COPY = {
  hook: {
    thoughts: ["شو رح يصير؟", "وإذا فشلت؟", "المصاري؟", "الشغل؟", "بعد سنة؟", "بعد خمس سنين؟"],
    trick: phrase("[القلق] عنده خدعة.", "tense"),
    demand: phrase("بيطلب منك تحل [بكرا]… [اليوم].", "tense"),
  },
  problem: {
    line1: phrase("بتقعد تفكر بشغلة لسا ما صارت…", "neutral"),
    line2: phrase("وبتحاول تلاقي جواب لشي ما إلو جواب هلأ.", "neutral"),
    flashes: [
      phrase("مضمون؟", "neutral"),
      phrase("[أكيد]؟", "tense"),
      phrase("شو بعدين؟", "neutral"),
    ],
    echoWord: "أكيد",
    loaderLabel: "عم دوّر على جواب",
    // Dates rushing into the distance of the mental timeline.
    timeline: [
      "بكرا",
      "آذار ٢٠٢٧",
      "بعد سنة",
      "٢٠٢٨",
      "أيلول",
      "بعد خمس سنين",
      "٢٠٣٠",
      "تشرين الأول",
      "كانون الثاني ٢٠٢٩",
      "الشهر الجاي",
      "٢٠٣١",
      "نيسان",
      "بعد عشر سنين",
      "حزيران ٢٠٢٧",
      "٢٠٣٥",
      "آب",
      "السنة الجاية",
      "شباط ٢٠٣٢",
    ],
  },
  turn: {
    question: phrase("بس اسأل حالك سؤال واحد…", "neutral"),
    bigQuestion: phrase("شو الشي يلي [بإيدي] هلأ؟", "calm"),
  },
  solution: {
    steps: [
      phrase("إذا في شي [بإيدك]… اعمله.", "calm"),
      phrase("وإذا مافي شي [بإيدك]… لا تحاول تحلّه براسك.", "calm"),
      phrase("ارجع [لليوم].", "calm"),
    ],
    task: "ردّ على الرسالة يلي مأجّلها",
    today: phrase("[اليوم].", "calm"),
  },
  payoff: {
    line1: phrase("مو مطلوب منك تعرف كيف رح تكون حياتك بعد سنة.", "neutral"),
    line2: phrase("مطلوب منك تعرف شو [خطوتك الجاية].", "calm"),
  },
  final: {
    line1: phrase("[اليوم] إلو شغله.", "calm"),
    line2: phrase("و[بكرا]… منستقبله [بكرا].", "calm"),
    sub: phrase("خذ نفس. وارجع للي بإيدك.", "neutral"),
  },
};

// Exact voiceover script, for the voice artist and for syncing an MP3 later.
export const VOICEOVER_SCRIPT = `القلق عنده خدعة…
بيطلب منك تحل بكرا، اليوم.

بتقعد تفكر بشغلة لسا ما صارت،
وبتحاول تلاقي جواب لشي ما إلو جواب هلأ.

بس اسأل حالك سؤال واحد:
شو الشي يلي بإيدي هلأ؟

إذا في شي بإيدك… اعمله.
وإذا مافي شي بإيدك…
لا تحاول تحلّه براسك.

ارجع لليوم.

مو مطلوب منك تعرف كيف رح تكون حياتك بعد سنة.
مطلوب منك تعرف شو خطوتك الجاية.

اليوم إلو شغله…
وبكرا، منستقبله بكرا.`;
