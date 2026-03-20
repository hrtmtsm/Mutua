-- Seed prompts for Mutua session prompt library.
-- Run this after schema.sql in your Supabase SQL editor.

INSERT INTO prompts (phase, level, tags, hint, translations) VALUES

-- ── Ice (warm-up) ─────────────────────────────────────────────────────────────

('ice', 1, '{}', 'Ask what they miss most about it.', '{
  "English":    "Where did you grow up?",
  "Japanese":   "どこで育ちましたか？",
  "Korean":     "어디서 자랐나요?",
  "Mandarin":   "你在哪里长大的？",
  "Spanish":    "¿Dónde creciste?",
  "French":     "Où avez-vous grandi ?",
  "Portuguese": "Onde você cresceu?",
  "German":     "Wo bist du aufgewachsen?",
  "Italian":    "Dove sei cresciuto?",
  "Arabic":     "أين نشأت؟"
}'),

('ice', 1, '{"Making friends","Casual conversation"}', 'Ask what made that moment stand out.', '{
  "English":    "What''s something small that made you smile this week?",
  "Japanese":   "今週、ちょっと嬉しかったことはありますか？",
  "Korean":     "이번 주에 기분 좋았던 작은 일이 있나요?",
  "Mandarin":   "这周有什么小事让你开心吗？",
  "Spanish":    "¿Qué pequeña cosa te alegró esta semana?",
  "French":     "Quelle petite chose vous a fait sourire cette semaine ?",
  "Portuguese": "O que de pequeno te fez sorrir essa semana?",
  "German":     "Was Kleines hat dich diese Woche zum Lächeln gebracht?",
  "Italian":    "Cosa di piccolo ti ha fatto sorridere questa settimana?",
  "Arabic":     "ما الشيء الصغير الذي أسعدك هذا الأسبوع؟"
}'),

('ice', 1, '{}', NULL, '{
  "English":    "What does a perfect weekend look like for you?",
  "Japanese":   "理想の週末はどんな感じですか？",
  "Korean":     "완벽한 주말은 어떤 모습인가요?",
  "Mandarin":   "你理想中的周末是什么样的？",
  "Spanish":    "¿Cómo es tu fin de semana perfecto?",
  "French":     "À quoi ressemble votre week-end idéal ?",
  "Portuguese": "Como é o seu fim de semana perfeito?",
  "German":     "Wie sieht dein perfektes Wochenende aus?",
  "Italian":    "Com''è il tuo weekend perfetto?",
  "Arabic":     "كيف يبدو عطلة نهاية الأسبوع المثالية بالنسبة لك؟"
}'),

('ice', 2, '{}', NULL, '{
  "English":    "What''s one word you''ve been trying to use more lately?",
  "Japanese":   "最近、よく使おうとしている言葉はありますか？",
  "Korean":     "요즘 더 많이 쓰려고 노력하는 표현이 있나요?",
  "Mandarin":   "你最近在努力多用的词是什么？",
  "Spanish":    "¿Hay alguna palabra que estés intentando usar más?",
  "French":     "Y a-t-il un mot que vous essayez d''utiliser plus souvent ?",
  "Portuguese": "Tem alguma palavra que você está tentando usar mais?",
  "German":     "Gibt es ein Wort, das du öfter benutzen möchtest?",
  "Italian":    "C''è una parola che stai cercando di usare di più?",
  "Arabic":     "هل هناك كلمة تحاول استخدامها أكثر؟"
}'),

('ice', 2, '{}', NULL, '{
  "English":    "What''s a phrase you learned recently that surprised you?",
  "Japanese":   "最近覚えた表現で、驚いたものはありますか？",
  "Korean":     "최근에 배운 표현 중 놀라웠던 게 있나요?",
  "Mandarin":   "你最近学到了什么让你惊喜的表达？",
  "Spanish":    "¿Qué expresión aprendiste recientemente que te sorprendió?",
  "French":     "Quelle expression avez-vous apprise récemment qui vous a surpris ?",
  "Portuguese": "Que expressão você aprendeu recentemente que te surpreendeu?",
  "German":     "Welchen Ausdruck hast du kürzlich gelernt, der dich überrascht hat?",
  "Italian":    "Qual è una frase che hai imparato di recente che ti ha sorpreso?",
  "Arabic":     "ما العبارة التي تعلمتها مؤخرًا وفاجأتك؟"
}'),

-- ── Conversation ──────────────────────────────────────────────────────────────

('conv', 2, '{}', 'Ask what made it feel that way.', '{
  "English":    "Tell me about a place that felt like home.",
  "Japanese":   "「ふるさと」のように感じる場所を教えてください。",
  "Korean":     "집처럼 느껴지는 장소에 대해 이야기해 주세요.",
  "Mandarin":   "告诉我一个让你感觉像家一样的地方。",
  "Spanish":    "Cuéntame sobre un lugar que sentiste como hogar.",
  "French":     "Parlez-moi d''un endroit qui vous a semblé comme chez vous.",
  "Portuguese": "Me fala sobre um lugar que pareceu um lar para você.",
  "German":     "Erzähl mir von einem Ort, der sich wie Zuhause angefühlt hat.",
  "Italian":    "Parlami di un posto che ti è sembrato come casa.",
  "Arabic":     "أخبرني عن مكان شعرت فيه بأنه مثل البيت."
}'),

('conv', 3, '{"Cultural exchange"}', NULL, '{
  "English":    "What''s something you changed your mind about recently?",
  "Japanese":   "最近、考えが変わったことはありますか？",
  "Korean":     "최근에 생각이 바뀐 게 있나요?",
  "Mandarin":   "最近有什么事让你改变了想法？",
  "Spanish":    "¿Sobre qué cambiaste de opinión recientemente?",
  "French":     "Sur quoi avez-vous changé d''avis récemment ?",
  "Portuguese": "Sobre o que você mudou de ideia recentemente?",
  "German":     "Worüber hast du kürzlich deine Meinung geändert?",
  "Italian":    "Su cosa hai cambiato idea di recente?",
  "Arabic":     "ما الذي غيّرت رأيك فيه مؤخرًا؟"
}'),

('conv', 2, '{"Travel"}', NULL, '{
  "English":    "Describe your city to someone who''s never been.",
  "Japanese":   "あなたの街を初めて来た人に紹介するとしたら？",
  "Korean":     "처음 오는 사람에게 당신의 도시를 소개한다면?",
  "Mandarin":   "向从没去过的人介绍你的城市。",
  "Spanish":    "Describe tu ciudad a alguien que nunca ha estado allí.",
  "French":     "Décrivez votre ville à quelqu''un qui n''y est jamais allé.",
  "Portuguese": "Descreva sua cidade para alguém que nunca foi.",
  "German":     "Beschreib deine Stadt jemandem, der noch nie da war.",
  "Italian":    "Descrivi la tua città a qualcuno che non c''è mai stato.",
  "Arabic":     "صف مدينتك لشخص لم يزرها قط."
}'),

('conv', 2, '{"Cultural exchange"}', NULL, '{
  "English":    "What''s a habit you''ve picked up from another culture?",
  "Japanese":   "他の文化から取り入れた習慣はありますか？",
  "Korean":     "다른 문화에서 받아들인 습관이 있나요?",
  "Mandarin":   "你从其他文化中养成了什么习惯？",
  "Spanish":    "¿Qué hábito adoptaste de otra cultura?",
  "French":     "Quelle habitude avez-vous adoptée d''une autre culture ?",
  "Portuguese": "Que hábito você adotou de outra cultura?",
  "German":     "Welche Gewohnheit hast du von einer anderen Kultur übernommen?",
  "Italian":    "Che abitudine hai preso da un''altra cultura?",
  "Arabic":     "ما العادة التي أخذتها من ثقافة أخرى؟"
}'),

('conv', 2, '{"Casual conversation","Cultural exchange"}', 'Ask if they still make it today.', '{
  "English":    "Tell me about a meal that has a story behind it.",
  "Japanese":   "思い出のある食べ物の話を聞かせてください。",
  "Korean":     "추억이 담긴 음식 이야기를 들려주세요.",
  "Mandarin":   "聊聊一道有故事的菜吧。",
  "Spanish":    "Cuéntame sobre una comida que tiene una historia.",
  "French":     "Parlez-moi d''un repas qui a une histoire.",
  "Portuguese": "Me conta sobre uma refeição que tem uma história.",
  "German":     "Erzähl mir von einer Mahlzeit mit einer Geschichte dahinter.",
  "Italian":    "Raccontami di un pasto che ha una storia.",
  "Arabic":     "أخبرني عن وجبة لها قصة."
}'),

('conv', 3, '{"Work / professional"}', NULL, '{
  "English":    "What''s the hardest part of your job to explain to someone outside it?",
  "Japanese":   "仕事の中で一番説明しにくいことは何ですか？",
  "Korean":     "일 중에서 설명하기 가장 어려운 부분은 무엇인가요?",
  "Mandarin":   "你工作中最难解释的是什么？",
  "Spanish":    "¿Qué parte de tu trabajo es más difícil de explicar?",
  "French":     "Quelle partie de votre travail est la plus difficile à expliquer ?",
  "Portuguese": "Qual parte do seu trabalho é mais difícil de explicar?",
  "German":     "Was ist der schwierigste Teil deines Jobs zu erklären?",
  "Italian":    "Qual è la parte del tuo lavoro più difficile da spiegare?",
  "Arabic":     "ما الجزء الأصعب في عملك لشرحه؟"
}'),

('conv', 2, '{}', 'Try to use it together in a sentence.', '{
  "English":    "What''s a word in your language that''s hard to translate?",
  "Japanese":   "翻訳しにくい言葉や表現はありますか？",
  "Korean":     "번역하기 어려운 표현이 있나요?",
  "Mandarin":   "你的语言中有什么难以翻译的词吗？",
  "Spanish":    "¿Hay alguna palabra en tu idioma difícil de traducir?",
  "French":     "Y a-t-il un mot dans votre langue difficile à traduire ?",
  "Portuguese": "Tem alguma palavra no seu idioma difícil de traduzir?",
  "German":     "Gibt es ein Wort in deiner Sprache, das schwer zu übersetzen ist?",
  "Italian":    "C''è una parola nella tua lingua difficile da tradurre?",
  "Arabic":     "هل هناك كلمة في لغتك يصعب ترجمتها؟"
}'),

('conv', 3, '{}', NULL, '{
  "English":    "What''s something most people get wrong about your country?",
  "Japanese":   "自分の国について、よく誤解されることは何ですか？",
  "Korean":     "당신 나라에 대해 많이 오해받는 게 있나요?",
  "Mandarin":   "大家对你的国家最常有什么误解？",
  "Spanish":    "¿Qué malentendido hay sobre tu país?",
  "French":     "Quelle idée reçue existe sur votre pays ?",
  "Portuguese": "O que as pessoas costumam entender errado sobre seu país?",
  "German":     "Was missverstehen die Leute oft über dein Land?",
  "Italian":    "Cosa fraintendono spesso sul tuo paese?",
  "Arabic":     "ما الشيء الذي يسيء فهمه الناس عن بلدك؟"
}'),

('conv', 3, '{"Making friends"}', NULL, '{
  "English":    "What''s something you''ve never told anyone about where you grew up?",
  "Japanese":   "育った場所について、あまり話したことがないことはありますか？",
  "Korean":     "자란 곳에 대해 별로 얘기한 적 없는 게 있나요?",
  "Mandarin":   "关于你成长的地方，有什么你很少提起的事？",
  "Spanish":    "¿Hay algo sobre donde creciste que no hayas contado?",
  "French":     "Y a-t-il quelque chose sur l''endroit où vous avez grandi que vous n''avez jamais dit ?",
  "Portuguese": "Tem algo sobre onde você cresceu que nunca contou?",
  "German":     "Was hast du noch niemandem über deinen Aufwachsort erzählt?",
  "Italian":    "C''è qualcosa su dove sei cresciuto che non hai mai detto?",
  "Arabic":     "هل هناك شيء عن مكان نشأتك لم تخبر به أحدًا؟"
}'),

-- ── Reflect (wrap-up) ─────────────────────────────────────────────────────────

('reflect', 1, '{}', 'Write it down before you forget.', '{
  "English":    "What''s one word or phrase you want to remember from today?",
  "Japanese":   "今日覚えておきたい言葉や表現は何ですか？",
  "Korean":     "오늘 기억하고 싶은 표현이 있나요?",
  "Mandarin":   "今天有什么词或表达你想记住？",
  "Spanish":    "¿Qué palabra o expresión quieres recordar de hoy?",
  "French":     "Quel mot ou expression voulez-vous retenir d''aujourd''hui ?",
  "Portuguese": "Que palavra ou expressão você quer lembrar de hoje?",
  "German":     "Welches Wort oder welche Phrase möchtest du dir von heute merken?",
  "Italian":    "Quale parola o frase vuoi ricordare di oggi?",
  "Arabic":     "ما الكلمة أو العبارة التي تريد تذكرها من اليوم؟"
}'),

('reflect', 2, '{}', NULL, '{
  "English":    "Was there a moment in this conversation where something clicked?",
  "Japanese":   "会話の中で「あ、わかった」と感じた瞬間はありましたか？",
  "Korean":     "대화 중 뭔가 이해된 순간이 있었나요?",
  "Mandarin":   "交流中有没有某个瞬间让你突然明白了什么？",
  "Spanish":    "¿Hubo un momento en que algo se aclaró?",
  "French":     "Y a-t-il eu un moment où quelque chose s''est éclairé ?",
  "Portuguese": "Teve um momento em que algo ficou claro?",
  "German":     "Gab es einen Moment, in dem etwas klick gemacht hat?",
  "Italian":    "C''è stato un momento in cui qualcosa ha fatto click?",
  "Arabic":     "هل كان هناك لحظة شعرت فيها بأن شيئًا ما وضح لك؟"
}'),

('reflect', 1, '{}', NULL, '{
  "English":    "What do you want to talk about next time?",
  "Japanese":   "次回は何について話したいですか？",
  "Korean":     "다음엔 어떤 주제로 얘기하고 싶으세요?",
  "Mandarin":   "下次你想聊什么？",
  "Spanish":    "¿De qué quieres hablar la próxima vez?",
  "French":     "De quoi voulez-vous parler la prochaine fois ?",
  "Portuguese": "Sobre o que você quer falar da próxima vez?",
  "German":     "Worüber möchtest du nächstes Mal reden?",
  "Italian":    "Di cosa vuoi parlare la prossima volta?",
  "Arabic":     "عمَّ تريد التحدث في المرة القادمة؟"
}'),

('reflect', 2, '{}', NULL, '{
  "English":    "What''s one thing that surprised you about this conversation?",
  "Japanese":   "この会話で意外だったことはありますか？",
  "Korean":     "이번 대화에서 의외였던 게 있나요?",
  "Mandarin":   "这次对话中有什么让你意外的吗？",
  "Spanish":    "¿Qué te sorprendió de esta conversación?",
  "French":     "Qu''est-ce qui vous a surpris dans cette conversation ?",
  "Portuguese": "O que te surpreendeu nessa conversa?",
  "German":     "Was hat dich an diesem Gespräch überrascht?",
  "Italian":    "Cosa ti ha sorpreso di questa conversazione?",
  "Arabic":     "ما الذي فاجأك في هذه المحادثة؟"
}');
