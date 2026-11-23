import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  en: {
    // Nav & Common
    app_title: 'QuizArena',
    tagline: 'AI-Powered Live Quiz & Learning Platform',
    join_quiz: 'Join Quiz',
    host_quiz: 'Host Quiz',
    create_quiz: 'Create Quiz',
    dashboard: 'Dashboard',
    tournaments: 'Tournaments',
    question_bank: 'Question Bank',
    analytics: 'Analytics',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile & Settings',
    enter_pin: 'Enter 6-digit Game PIN',
    pin_placeholder: 'e.g. QA8821',
    player_name: 'Player Name / Nickname',
    join_button: 'Enter Arena',
    guest_play: 'Join as Guest',
    dark_mode: 'Dark Mode',
    light_mode: 'Light Mode',
    language: 'Language',
    sound_effects: 'Sound FX',

    // Hero
    hero_title: 'Transform Learning into Epic Live Arenas',
    hero_subtitle: 'The modern, AI-powered real-time multiplayer quiz platform. Host live battles, engage students, and accelerate learning with deep analytics.',
    get_started_free: 'Get Started Free',
    explore_tournaments: 'Explore Tournaments',

    // Roles
    role_teacher: 'Teacher / Host',
    role_student: 'Student / Player',
    role_admin: 'Admin',

    // Game
    waiting_for_host: 'Waiting for host to start...',
    players_joined: 'Players in Arena',
    start_quiz_btn: 'Start Live Arena',
    question: 'Question',
    time_left: 'Time Left',
    streak: 'Streak',
    score: 'Score',
    rank: 'Rank',
    submit_answer: 'Submit Answer',
    answer_locked: 'Answer Submitted! Waiting for timer...',
    correct: 'CORRECT!',
    wrong: 'INCORRECT',
    leaderboard_title: 'Live Leaderboard',
    next_question: 'Next Question',
    skip_question: 'Skip Question',
    final_podium: 'Champion Podium',
    game_over: 'Arena Concluded!',
    view_review: 'Review Answers',
    return_dashboard: 'Back to Dashboard',

    // AI & Builder
    ai_generator: 'AI Quiz Generator',
    ai_prompt_topic: 'Topic (e.g. React Hooks, Organic Chemistry, World History)',
    ai_subject: 'Subject',
    ai_difficulty: 'Difficulty',
    ai_num_questions: 'Number of Questions',
    ai_generate_btn: 'Generate with AI',
    ai_paste_notes: 'Or paste lecture notes / textbook chapter'
  },
  hi: {
    // Nav & Common
    app_title: 'क्विजएरीना (QuizArena)',
    tagline: 'एआई-संचालित लाइव क्विज और लर्निंग प्लेटफॉर्म',
    join_quiz: 'क्विज में शामिल हों',
    host_quiz: 'क्विज होस्ट करें',
    create_quiz: 'क्विज बनाएं',
    dashboard: 'डैशबोर्ड',
    tournaments: 'टूर्नामेंट',
    question_bank: 'प्रश्न बैंक',
    analytics: 'एनालिटिक्स',
    login: 'लॉग इन करें',
    register: 'पंजीकरण करें',
    logout: 'लॉग आउट',
    profile: 'प्रोफ़ाइल और सेटिंग्स',
    enter_pin: '६-अंकीय गेम पिन दर्ज करें',
    pin_placeholder: 'जैसे: QA8821',
    player_name: 'खिलाड़ी का नाम / उपनाम',
    join_button: 'एरीना में प्रवेश करें',
    guest_play: 'अतिथि के रूप में खेलें',
    dark_mode: 'डार्क मोड',
    light_mode: 'लाइट मोड',
    language: 'भाषा',
    sound_effects: 'ध्वनि प्रभाव',

    // Hero
    hero_title: 'सीखने को बनाएं रोमांचक लाइव एरीना',
    hero_subtitle: 'आधुनिक, एआई-संचालित रीयल-टाइम मल्टीप्लेयर क्विज प्लेटफॉर्म। लाइव लड़ाइयों की मेजबानी करें, छात्रों को जोड़े रखें और गहरी एनालिटिक्स के साथ विकास करें।',
    get_started_free: 'मुफ़्त शुरू करें',
    explore_tournaments: 'टूर्नामेंट देखें',

    // Roles
    role_teacher: 'शिक्षक / होस्ट',
    role_student: 'छात्र / खिलाड़ी',
    role_admin: 'एडमिन',

    // Game
    waiting_for_host: 'होस्ट के शुरू करने की प्रतीक्षा है...',
    players_joined: 'एरीना में जुड़े खिलाड़ी',
    start_quiz_btn: 'लाइव क्विज शुरू करें',
    question: 'प्रश्न',
    time_left: 'शेष समय',
    streak: 'लगातार सही',
    score: 'अंक',
    rank: 'रैंक',
    submit_answer: 'उत्तर जमा करें',
    answer_locked: 'उत्तर जमा हो गया! समय समाप्त होने की प्रतीक्षा...',
    correct: 'बधाई! सही उत्तर',
    wrong: 'ग़लत उत्तर',
    leaderboard_title: 'लाइव लीडरबोर्ड',
    next_question: 'अगला प्रश्न',
    skip_question: 'प्रश्न छोड़ें',
    final_podium: 'विजेता मंच (पोडियम)',
    game_over: 'क्विज समाप्त हुआ!',
    view_review: 'उत्तरों की समीक्षा करें',
    return_dashboard: 'डैशबोर्ड पर वापस जाएं',

    // AI & Builder
    ai_generator: 'एआई क्विज जनरेटर',
    ai_prompt_topic: 'विषय (जैसे रिएक्ट हुक्स, कार्बनिक रसायन, विश्व इतिहास)',
    ai_subject: 'विषय श्रेणी',
    ai_difficulty: 'कठिनाई स्तर',
    ai_num_questions: 'प्रश्नों की संख्या',
    ai_generate_btn: 'एआई के साथ बनाएं',
    ai_paste_notes: 'या क्लास नोट्स / अध्याय पेस्ट करें'
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      return localStorage.getItem('quizarena_lang') || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
    try {
      localStorage.setItem('quizarena_lang', nextLang);
    } catch (e) {}
  };

  const t = (key) => {
    if (!key) return '';
    return translations[language]?.[key] || translations.en?.[key] || key || '';
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
