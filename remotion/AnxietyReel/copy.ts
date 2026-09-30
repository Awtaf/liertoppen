import type { Tone } from "./theme";

// ─────────────────────────────────────────────────────────────────────────────
// All on-screen Arabic copy (Modern Standard Arabic, neutral).
// Wrap words in [brackets] to emphasize them: they pop briefly larger, then
// settle slightly bigger and in the scene's accent colour.
// Markers can span several words: "[خطوتك التالية]".
// The spoken version of each line (with tashkeel for pronunciation) lives in
// voiceover.json.
// ─────────────────────────────────────────────────────────────────────────────

export type Phrase = {
  text: string;
  tone: Tone;
};

const phrase = (text: string, tone: Tone = "neutral"): Phrase => ({ text, tone });

export const COPY = {
  // Chapter marks shown at the top of each scene.
  chapters: {
    hook: { number: "٠١", title: "الخدعة" },
    problem: { number: "٠٢", title: "الدوّامة" },
    turn: { number: "٠٣", title: "توقّف" },
    solution: { number: "٠٤", title: "ما بين يديك" },
    payoff: { number: "٠٥", title: "الخطوة التالية" },
    final: { number: "٠٦", title: "اليوم" },
  },
  hook: {
    thoughts: ["ماذا سيحدث؟", "وإن فشلت؟", "المال؟", "العمل؟", "بعد عام؟", "بعد خمس سنوات؟"],
    trick: phrase("[للقلق] خدعةٌ واحدة.", "tense"),
    demand: phrase("يطلب منك أن تحلّ [الغد]… [اليوم].", "tense"),
  },
  problem: {
    line1: phrase("فتجلس تفكّر في أمرٍ لم يحدث بعد…", "neutral"),
    line2: phrase("وتبحث عن جوابٍ لسؤالٍ لا جواب له الآن.", "neutral"),
    line3: phrase("وكلّما بحثتَ أكثر… ازداد [الضجيج].", "tense"),
    flashes: [phrase("مضمون؟", "neutral"), phrase("[أكيد]؟", "tense"), phrase("ثم ماذا؟", "neutral")],
    echoWord: "أكيد",
    loaderLabel: "جارٍ البحث عن إجابة",
    // Dates rushing into the distance of the mental timeline.
    timeline: [
      "غدًا",
      "مارس ٢٠٢٧",
      "بعد عام",
      "٢٠٢٨",
      "سبتمبر",
      "بعد خمس سنوات",
      "٢٠٣٠",
      "أكتوبر",
      "يناير ٢٠٢٩",
      "الشهر القادم",
      "٢٠٣١",
      "أبريل",
      "بعد عشر سنوات",
      "يونيو ٢٠٢٧",
      "٢٠٣٥",
      "أغسطس",
      "العام القادم",
      "فبراير ٢٠٣٢",
    ],
  },
  turn: {
    stop: phrase("لكن… [توقّف] لحظة.", "neutral"),
    question: phrase("واسأل نفسك سؤالًا واحدًا…", "neutral"),
    bigQuestion: phrase("ما الذي [بين يديّ] الآن؟", "calm"),
  },
  solution: {
    steps: [
      phrase("إن كان [بيدك] شيءٌ… فافعله.", "calm"),
      phrase("وإن لم يكن [بيدك] شيء… فلا تحاول حلّه في رأسك.", "calm"),
      phrase("عُد إلى [اليوم].", "calm"),
    ],
    task: "الردّ على الرسالة المؤجّلة",
    today: phrase("[اليوم].", "calm"),
  },
  payoff: {
    line1: phrase("ليس مطلوبًا منك أن تعرف كيف ستكون حياتك بعد عام.", "neutral"),
    line2: phrase("المطلوب فقط… أن تعرف [خطوتك التالية].", "calm"),
  },
  final: {
    line1: phrase("[لليوم] ما يكفيه.", "calm"),
    line2: phrase("و[الغد]… نستقبله [غدًا].", "calm"),
    sub: phrase("خذ نفسًا عميقًا… وعُد إلى ما بين يديك.", "neutral"),
  },
};

// Voiceover script (MSA), for a human voice artist.
export const VOICEOVER_SCRIPT = `للقلقِ خدعةٌ واحدة…
يطلبُ منكَ أن تحلَّ الغدَ… اليوم.

فتجلسُ تفكّرُ في أمرٍ لم يحدثْ بعد،
وتبحثُ عن جوابٍ لسؤالٍ لا جوابَ له الآن.
وكلّما بحثتَ أكثر… ازدادَ الضجيج.

لكن… توقّفْ لحظة.
واسألْ نفسكَ سؤالًا واحدًا:
ما الذي بين يديَّ الآن؟

إن كان بيدِكَ شيءٌ… فافعلْه.
وإن لم يكنْ بيدِكَ شيء…
فلا تحاولْ أن تحلَّه في رأسِك.

عُدْ إلى اليوم.

ليس مطلوبًا منكَ أن تعرفَ كيف ستكونُ حياتُكَ بعد عام.
المطلوبُ فقط… أن تعرفَ خطوتَكَ التالية.

لليومِ ما يكفيه…
والغدُ… نستقبلُه غدًا.`;
